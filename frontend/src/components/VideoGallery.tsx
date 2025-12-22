import { useState } from 'react';
import { Download, Play, Video, X, CheckCircle2 } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function VideoGallery() {
  const { jobs } = useVideoStore();
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [previewVideo, setPreviewVideo] = useState<{ url: string; name: string } | null>(null);

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

  const handleDownloadAll = () => {
    completedJobs.forEach((job, index) => {
      // Stagger downloads to avoid browser blocking
      setTimeout(() => {
        handleDownload(job.videoUrl!, job.recipientName, job.id);
      }, index * 500);
    });
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
              <Button
                size="lg"
                onClick={handleDownloadAll}
                className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-6 text-lg shadow-lg"
              >
                <Download className="mr-2 h-6 w-6" />
                Download {completedJobs.length === 1 ? 'Video' : `All ${completedJobs.length} Videos`}
              </Button>
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
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                  </button>
                </div>

                {/* Info and Actions */}
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg mb-3 truncate">{job.recipientName}</h4>

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
                          : 'bg-primary hover:bg-primary/90'
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
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90" />

          {/* Close button */}
          <button
            onClick={() => setPreviewVideo(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
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
