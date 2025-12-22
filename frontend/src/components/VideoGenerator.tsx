import { useState, useEffect, useRef } from 'react';
import { Wand2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useRecipientsStore } from '../stores/recipientsStore';
import { useVideoStore } from '../stores/videoStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

export function VideoGenerator() {
  const { recipients, recipientsWithMessages, setRecipientsWithMessages, senderName } = useRecipientsStore();
  const { selectedTheme, selectedFormat, selectedMusicUrl, currentJobId, jobs, setCurrentJobId, setJobs } = useVideoStore();
  const { openaiKey } = useSettingsStore();
  const { setCurrentStep } = useUIStore();

  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);

  // Refs to track if auto-generation has been triggered (prevent re-triggering)
  const hasAutoTriggeredMessages = useRef(false);
  const hasAutoTriggeredVideos = useRef(false);

  // Handler functions (defined before useEffects that reference them)
  const handleGenerateMessages = async () => {
    if (!openaiKey) {
      toast.error('Please add your OpenAI API key in settings');
      return;
    }

    if (!selectedTheme) {
      toast.error('Please select a holiday theme');
      return;
    }

    setIsGeneratingMessages(true);
    try {
      const result = await apiClient.generateMessages(
        { recipients, theme: selectedTheme, senderName: senderName || undefined },
        openaiKey
      );

      setRecipientsWithMessages(result.recipients);
      toast.success('Messages generated successfully!');
    } catch (error) {
      toast.error('Failed to generate messages');
      console.error(error);
    } finally {
      setIsGeneratingMessages(false);
    }
  };

  const handleGenerateVideos = async () => {
    if (recipientsWithMessages.length === 0) {
      toast.error('Please generate messages first');
      return;
    }

    if (!selectedTheme || !selectedFormat) {
      toast.error('Please select theme and format');
      return;
    }

    setIsGeneratingVideos(true);
    try {
      const result = await apiClient.generateVideos({
        recipients: recipientsWithMessages,
        theme: selectedTheme,
        format: selectedFormat,
        musicUrl: selectedMusicUrl || undefined,
        senderName: senderName || undefined,
      });

      setCurrentJobId(result.jobId);
      setJobs(result.jobs);
      toast.success('Video generation started!');
    } catch (error) {
      toast.error('Failed to start video generation');
      console.error(error);
      setIsGeneratingVideos(false);
    }
  };

  // Auto-trigger message generation when component mounts with valid prerequisites
  useEffect(() => {
    const canAutoGenerate =
      recipients.length > 0 &&
      selectedTheme &&
      openaiKey &&
      recipientsWithMessages.length === 0 &&
      !isGeneratingMessages &&
      !hasAutoTriggeredMessages.current;

    if (canAutoGenerate) {
      hasAutoTriggeredMessages.current = true;
      handleGenerateMessages();
    }
  }, [recipients.length, selectedTheme, openaiKey, recipientsWithMessages.length, isGeneratingMessages]);

  // Auto-trigger video generation once messages are ready
  useEffect(() => {
    const canAutoGenerate =
      recipientsWithMessages.length > 0 &&
      selectedTheme &&
      selectedFormat &&
      !currentJobId &&
      !isGeneratingVideos &&
      !hasAutoTriggeredVideos.current;

    if (canAutoGenerate) {
      hasAutoTriggeredVideos.current = true;
      handleGenerateVideos();
    }
  }, [recipientsWithMessages.length, selectedTheme, selectedFormat, currentJobId, isGeneratingVideos]);

  // Poll job status
  useEffect(() => {
    if (!currentJobId || !isGeneratingVideos) return;

    const interval = setInterval(async () => {
      try {
        const status = await apiClient.getJobStatus(currentJobId);
        setJobs(status.jobs);

        // Check if all jobs are complete or failed
        const allDone = status.jobs.every(
          (job) => job.status === 'completed' || job.status === 'failed'
        );

        if (allDone) {
          setIsGeneratingVideos(false);
          const successCount = status.jobs.filter((j) => j.status === 'completed').length;
          const failCount = status.jobs.filter((j) => j.status === 'failed').length;

          // Auto-navigate to download step (step 4)
          setCurrentStep(4);

          if (failCount > 0) {
            toast.warning(`Generated ${successCount} videos, ${failCount} failed. Scroll down to download.`);
          } else {
            toast.success(`All ${successCount} videos generated successfully! Scroll down to download.`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch job status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [currentJobId, isGeneratingVideos]);

  const messagesReady = recipientsWithMessages.length > 0;
  const videosGenerating = isGeneratingVideos;
  const hasJobs = jobs.length > 0;

  return (
    <div className="space-y-6">
      {/* Step 1: Generate Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </span>
            Generate Personalized Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use AI to create personalized greeting messages for each recipient based on your guidance.
          </p>
          <Button
            onClick={handleGenerateMessages}
            disabled={recipients.length === 0 || isGeneratingMessages || !selectedTheme}
            className="w-full"
            size="lg"
          >
            {isGeneratingMessages ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Messages...
              </>
            ) : messagesReady ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Messages Ready - Regenerate?
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Messages with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Generate Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </span>
            Generate Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Create personalized video cards with animations, music, and AI-generated messages.
          </p>
          <Button
            onClick={handleGenerateVideos}
            disabled={!messagesReady || videosGenerating}
            className="w-full"
            size="lg"
            variant={messagesReady ? 'default' : 'secondary'}
          >
            {videosGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Videos...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate {recipients.length} Video{recipients.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {hasJobs && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <div key={job.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{job.recipientName}</span>
                      {job.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {job.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {job.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {job.progress}%
                    </span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                  {job.error && (
                    <p className="text-xs text-destructive mt-1">{job.error}</p>
                  )}
                  {index < jobs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
