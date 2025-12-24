import { useState, useEffect, useRef } from 'react';
import { Wand2, Loader2, CheckCircle, XCircle, Edit2, Save, X, ChevronDown, ChevronUp, Settings, MessageSquare, Video, Ban, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecipientsStore } from '../stores/recipientsStore';
import { useVideoStore } from '../stores/videoStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function VideoGenerator() {
  const { recipients, recipientsWithMessages, setRecipientsWithMessages, updateRecipientMessage, messagesConfirmed, setMessagesConfirmed, senderName } = useRecipientsStore();
  const { selectedTheme, selectedFormat, selectedMusicUrl, currentJobId, jobs, setCurrentJobId, setJobs } = useVideoStore();
  const { openaiKey } = useSettingsStore();
  const { setCurrentStep } = useUIStore();

  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [targetWordCount, setTargetWordCount] = useState(50);
  const [creativity, setCreativity] = useState(0.5);

  // Accordion state - flexible navigation (multiple can be open)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));
  const [step1Confirmed, setStep1Confirmed] = useState(false);

  // Ref to track auto-video generation
  const hasAutoTriggeredVideos = useRef(false);

  const toggleStep = (step: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) {
        next.delete(step);
      } else {
        next.add(step);
      }
      return next;
    });
  };

  // Handler functions
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
        {
          recipients,
          theme: selectedTheme,
          senderName: senderName || undefined,
          targetWordCount,
          creativity,
        },
        openaiKey
      );

      setRecipientsWithMessages(result.recipients);
      setStep1Confirmed(true);
      toast.success('Messages enhanced successfully!');

      // Auto-expand Step 2 after messages are generated
      setExpandedSteps(prev => new Set([...prev, 2]));
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

  // Auto-trigger video generation once messages are confirmed
  useEffect(() => {
    const canAutoGenerate =
      recipientsWithMessages.length > 0 &&
      messagesConfirmed &&
      selectedTheme &&
      selectedFormat &&
      !currentJobId &&
      !isGeneratingVideos &&
      !hasAutoTriggeredVideos.current;

    if (canAutoGenerate) {
      hasAutoTriggeredVideos.current = true;
      handleGenerateVideos();
    }
  }, [recipientsWithMessages.length, messagesConfirmed, selectedTheme, selectedFormat, currentJobId, isGeneratingVideos]);

  // Message editing handlers
  const handleStartEdit = (id: string, message: string) => {
    setEditingId(id);
    setEditingMessage(message);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateRecipientMessage(editingId, editingMessage);
      setEditingId(null);
      setEditingMessage('');
      toast.success('Message updated');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingMessage('');
  };

  const handleConfirmMessages = () => {
    setMessagesConfirmed(true);
    toast.success('Messages confirmed! Starting video generation...');
    // Auto-expand Step 3
    setExpandedSteps(prev => new Set([...prev, 3]));
  };

  // Cancel handlers
  const handleCancelVideo = async (videoJobId: string) => {
    if (!currentJobId) return;
    try {
      await apiClient.cancelVideoJob(currentJobId, videoJobId);
      toast.success('Video cancelled');
      // Refresh job status
      const status = await apiClient.getJobStatus(currentJobId);
      setJobs(status.jobs);
    } catch (error) {
      toast.error('Failed to cancel video');
      console.error(error);
    }
  };

  const handleCancelAllVideos = async () => {
    if (!currentJobId) return;
    try {
      await apiClient.cancelVideoJob(currentJobId);
      toast.success('All pending videos cancelled');
      // Refresh job status
      const status = await apiClient.getJobStatus(currentJobId);
      setJobs(status.jobs);
    } catch (error) {
      toast.error('Failed to cancel videos');
      console.error(error);
    }
  };

  // Poll job status
  useEffect(() => {
    if (!currentJobId || !isGeneratingVideos) return;

    const interval = setInterval(async () => {
      try {
        const status = await apiClient.getJobStatus(currentJobId);
        setJobs(status.jobs);

        // Check if all jobs are complete, failed, or cancelled
        const allDone = status.jobs.every(
          (job) => job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled'
        );

        if (allDone) {
          setIsGeneratingVideos(false);
          const successCount = status.jobs.filter((j) => j.status === 'completed').length;
          const failCount = status.jobs.filter((j) => j.status === 'failed').length;
          const cancelledCount = status.jobs.filter((j) => j.status === 'cancelled').length;

          // Auto-navigate to download step (step 4) only if there are completed videos
          if (successCount > 0) {
            setCurrentStep(4);
          }

          if (cancelledCount > 0 && successCount === 0) {
            toast.info('All videos were cancelled');
          } else if (failCount > 0 || cancelledCount > 0) {
            const issues = [];
            if (failCount > 0) issues.push(`${failCount} failed`);
            if (cancelledCount > 0) issues.push(`${cancelledCount} cancelled`);
            toast.warning(`Generated ${successCount} videos, ${issues.join(', ')}. ${successCount > 0 ? 'Scroll down to download.' : ''}`);
          } else {
            toast.success(`All ${successCount} videos generated successfully! Scroll down to download.`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch job status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentJobId, isGeneratingVideos]);

  const messagesReady = recipientsWithMessages.length > 0;
  const videosGenerating = isGeneratingVideos;
  const hasJobs = jobs.length > 0;

  // Step header component
  const StepHeader = ({
    stepNumber,
    title,
    icon: Icon,
    isCompleted,
    isActive,
    isDisabled,
  }: {
    stepNumber: number;
    title: string;
    icon: React.ElementType;
    isCompleted: boolean;
    isActive: boolean;
    isDisabled?: boolean;
  }) => {
    const isExpanded = expandedSteps.has(stepNumber);

    return (
      <Button
        variant="ghost"
        onClick={() => !isDisabled && toggleStep(stepNumber)}
        className={`w-full justify-between h-14 text-left px-4 hover:bg-muted/50 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isDisabled}
      >
        <span className="flex items-center gap-3">
          <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            isCompleted
              ? 'bg-green-500 text-white'
              : isActive
              ? 'bg-amber-500 dark:bg-amber-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
          </span>
          <span className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span className="font-medium">{title}</span>
          </span>
          {isActive && isGeneratingMessages && stepNumber === 1 && (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500 dark:text-amber-400" />
          )}
          {isActive && videosGenerating && stepNumber === 3 && (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500 dark:text-amber-400" />
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Step 1: Configure AI Settings */}
      <Card className="overflow-hidden">
        <StepHeader
          stepNumber={1}
          title="Configure AI Settings"
          icon={Settings}
          isCompleted={step1Confirmed}
          isActive={!step1Confirmed}
        />
        <AnimatePresence>
          {expandedSteps.has(1) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 pb-4">
                <Separator className="mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Adjust how AI enhances your greeting messages.
                </p>

                {/* Message Length Slider */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm">Message Length</Label>
                      <span className="text-sm text-muted-foreground">~{targetWordCount} words</span>
                    </div>
                    <Slider
                      value={[targetWordCount]}
                      onValueChange={(value) => setTargetWordCount(value[0])}
                      min={5}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Short</span>
                      <span>Long</span>
                    </div>
                  </div>

                  {/* Originality Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm">Originality</Label>
                      <span className="text-sm text-muted-foreground">
                        {creativity < 0.33 ? 'Closer' : creativity > 0.66 ? 'Imaginative' : 'Balanced'}
                      </span>
                    </div>
                    <Slider
                      value={[creativity]}
                      onValueChange={(value) => setCreativity(value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Closer to original</span>
                      <span>More imaginative</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateMessages}
                  disabled={recipients.length === 0 || isGeneratingMessages || !selectedTheme}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isGeneratingMessages ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enhancing Messages...
                    </>
                  ) : step1Confirmed ? (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Re-enhance with New Settings
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Enhance Messages with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Step 2: Review & Edit Messages */}
      <Card className={`overflow-hidden ${!messagesReady ? 'opacity-50' : ''}`}>
        <StepHeader
          stepNumber={2}
          title="Review & Edit Messages"
          icon={MessageSquare}
          isCompleted={messagesConfirmed}
          isActive={messagesReady && !messagesConfirmed}
          isDisabled={!messagesReady}
        />
        <AnimatePresence>
          {expandedSteps.has(2) && messagesReady && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 pb-4">
                <Separator className="mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Review the AI-enhanced messages below. Click edit to make changes.
                </p>

                <div className="space-y-3">
                  {(showAllMessages ? recipientsWithMessages : recipientsWithMessages.slice(0, 3)).map((recipient) => (
                    <div
                      key={recipient.id}
                      className="border rounded-lg p-4 bg-muted/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">{recipient.name}</span>
                        {editingId !== recipient.id && !messagesConfirmed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(recipient.id, recipient.generatedMessage)}
                            className="h-7 px-2"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      {editingId === recipient.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingMessage}
                            onChange={(e) => setEditingMessage(e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              <Save className="h-3.5 w-3.5 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              <X className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {recipient.generatedMessage}
                        </p>
                      )}
                    </div>
                  ))}

                  {recipientsWithMessages.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllMessages(!showAllMessages)}
                      className="w-full"
                    >
                      {showAllMessages ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show All {recipientsWithMessages.length} Messages
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {!messagesConfirmed && (
                  <Button
                    onClick={handleConfirmMessages}
                    disabled={editingId !== null}
                    className="w-full mt-4"
                    size="lg"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirm Messages & Generate Videos
                  </Button>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Step 3: Generate Videos */}
      <Card className={`overflow-hidden ${!messagesConfirmed ? 'opacity-50' : ''}`}>
        <StepHeader
          stepNumber={3}
          title="Generate Videos"
          icon={Video}
          isCompleted={hasJobs && !videosGenerating}
          isActive={messagesConfirmed && (!hasJobs || videosGenerating)}
          isDisabled={!messagesConfirmed}
        />
        <AnimatePresence>
          {expandedSteps.has(3) && messagesConfirmed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 pb-4">
                <Separator className="mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Creating personalised video cards with animations, music, and your messages.
                </p>

                {!hasJobs && (
                  <Button
                    onClick={handleGenerateVideos}
                    disabled={videosGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {videosGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Videos...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Generate Videos for {recipients.length} {recipients.length === 1 ? 'Person' : 'People'}
                      </>
                    )}
                  </Button>
                )}

                {/* Progress Display - inline within Step 3 */}
                {hasJobs && (
                  <div className="space-y-4" role="status" aria-live="polite" aria-label="Video generation progress">
                    {/* Cancel All button when generating */}
                    {videosGenerating && jobs.some(j => j.status === 'pending' || j.status === 'processing') && (
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCancelAllVideos}
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Cancel All
                        </Button>
                      </div>
                    )}

                    {jobs.map((job, index) => (
                      <div key={job.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{job.recipientName}</span>
                            {job.status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-green-500" aria-label="Completed" />
                            )}
                            {job.status === 'failed' && (
                              <XCircle className="h-4 w-4 text-red-500" aria-label="Failed" />
                            )}
                            {job.status === 'cancelled' && (
                              <Ban className="h-4 w-4 text-gray-500" aria-label="Cancelled" />
                            )}
                            {job.status === 'processing' && (
                              <Loader2 className="h-4 w-4 animate-spin text-amber-500 dark:text-amber-400" aria-label="Processing" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {job.status === 'cancelled' ? 'Cancelled' : `${job.progress}%`}
                            </span>
                            {/* Individual cancel button for pending/processing jobs */}
                            {(job.status === 'pending' || job.status === 'processing') && videosGenerating && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleCancelVideo(job.id)}
                                aria-label={`Cancel video for ${job.recipientName}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Progress
                          value={job.status === 'cancelled' ? 0 : job.progress}
                          className={`h-2 ${job.status === 'cancelled' ? 'opacity-50' : ''}`}
                        />
                        {job.error && (
                          <p className="text-xs text-destructive mt-1">{job.error}</p>
                        )}
                        {index < jobs.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
