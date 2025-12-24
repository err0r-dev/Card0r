import { useState } from 'react';
import { Download, Play, Video, X, CheckCircle2, Loader2, Archive, Trash2 } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { apiClient } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function VideoGallery() {
  const { jobs, currentJobId, removeJob } = useVideoStore();
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [previewVideo, setPreviewVideo] = useState<{ url: string; name: string } | null>(null);
  const [zipState, setZipState] = useState<{
    isGenerating: boolean;
    progress: number;
  }>({ isGenerating: false, progress: 0 });

  const completedJobs = jobs.filter((job) => job.status === 'completed' && job.videoUrl);

  const handleDownload = (url: string, name: string, jobId: string) => {
    const link = document.createElement('a');
    link.href = `${API_BASE}${url}`;
    link.download = `${name.replace(/\s+/g, '_')}_card.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mark as downloaded
    setDownloadedIds(prev => new Set([...prev, jobId]));
    toast.success(`Downloaded video for ${name}!`);
  };

  const handleDelete = async (jobId: string, name: string, videoUrl: string | undefined) => {
    // Delete from server if we have a URL
    if (videoUrl) {
      try {
        await apiClient.deleteVideo(videoUrl);
      } catch (error) {
        console.error('Failed to delete video from server:', error);
        // Continue with UI removal even if server delete fails
      }
    }

    // Remove from UI state
    removeJob(jobId);
    // Also remove from downloaded tracking
    setDownloadedIds(prev => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
    toast.success(`Removed video for ${name}`);
  };

  const handleDownloadAllAsZip = async () => {
    if (!currentJobId) {
      toast.error('No active job found');
      return;
    }

    setZipState({ isGenerating: true, progress: 0 });

    try {
      // Start ZIP generation
      await apiClient.startZipGeneration(currentJobId);

      // Poll for progress
      const pollInterval = setInterval(async () => {
        try {
          const progress = await apiClient.getZipProgress(currentJobId);

          setZipState({ isGenerating: true, progress: progress.progress });

          if (progress.status === 'completed' && progress.zipPath) {
            clearInterval(pollInterval);
            setZipState({ isGenerating: false, progress: 100 });

            // Download the ZIP file
            const link = document.createElement('a');
            link.href = `${API_BASE}${progress.zipPath}`;
            link.download = `card0r_videos_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Downloaded ${completedJobs.length} videos as ZIP!`);

            // Mark all as downloaded
            setDownloadedIds(new Set(completedJobs.map(j => j.id)));
          } else if (progress.status === 'failed') {
            clearInterval(pollInterval);
            setZipState({ isGenerating: false, progress: 0 });
            toast.error(`ZIP generation failed: ${progress.error}`);
          }
        } catch {
          clearInterval(pollInterval);
          setZipState({ isGenerating: false, progress: 0 });
          toast.error('Failed to check ZIP progress');
        }
      }, 500);

    } catch (error) {
      setZipState({ isGenerating: false, progress: 0 });
      toast.error('Failed to start ZIP generation');
      console.error(error);
    }
  };

  if (completedJobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No videos generated yet</p>
            <p className="text-sm mt-2">Generated videos will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Download All - Prominent at top */}
        {completedJobs.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold">
                  {completedJobs.length} Video{completedJobs.length !== 1 ? 's' : ''} Ready!
                </h3>
                <p className="text-green-100 text-sm">
                  Click below to download {completedJobs.length === 1 ? 'your video' : 'all videos'}
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-2">
                <Button
                  size="lg"
                  onClick={handleDownloadAllAsZip}
                  disabled={zipState.isGenerating}
                  className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-6 text-lg shadow-lg disabled:opacity-70"
                >
                  {zipState.isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Creating ZIP... {zipState.progress}%
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-6 w-6" />
                      Download {completedJobs.length === 1 ? 'Video' : 'All as ZIP'}
                    </>
                  )}
                </Button>
                {zipState.isGenerating && (
                  <Progress value={zipState.progress} className="w-full sm:w-48 h-2 bg-white/30" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedJobs.map((job) => {
            const isDownloaded = downloadedIds.has(job.id);

            return (
              <Card
                key={job.id}
                className={`overflow-hidden transition-all hover:shadow-xl ${
                  isDownloaded ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {/* Video Preview */}
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative group">
                  <video
                    src={`${API_BASE}${job.videoUrl}`}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />

                  {/* Downloaded badge */}
                  {isDownloaded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Downloaded
                    </div>
                  )}

                  {/* Play overlay */}
                  <button
                    onClick={() => setPreviewVideo({ url: `${API_BASE}${job.videoUrl}`, name: job.recipientName })}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    aria-label={`Play video for ${job.recipientName}`}
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                  </button>
                </div>

                {/* Info and Actions */}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg truncate">{job.recipientName}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(job.id, job.recipientName, job.videoUrl)}
                      aria-label={`Delete video for ${job.recipientName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreviewVideo({ url: `${API_BASE}${job.videoUrl}`, name: job.recipientName })}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Preview
                    </Button>

                    <Button
                      className={`flex-1 font-semibold ${
                        isDownloaded
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400'
                      }`}
                      onClick={() => handleDownload(job.videoUrl!, job.recipientName, job.id)}
                    >
                      {isDownloaded ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setPreviewVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Video preview for ${previewVideo.name}`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90" aria-hidden="true" />

          {/* Close button */}
          <button
            onClick={() => setPreviewVideo(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
            aria-label="Close video preview"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Video title */}
          <div className="absolute top-4 left-4 z-10 text-white">
            <h3 className="text-lg font-semibold">{previewVideo.name}</h3>
            <p className="text-sm text-white/70">Click outside or press X to close</p>
          </div>

          {/* Video player */}
          <video
            src={previewVideo.url}
            controls
            autoPlay
            className="relative z-10 max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
