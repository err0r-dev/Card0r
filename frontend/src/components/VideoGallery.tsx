import { useEffect, useRef } from 'react';
import { Download, Play, Video } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function VideoGallery() {
  const { jobs } = useVideoStore();
  const downloadedJobsRef = useRef<Set<string>>(new Set());

  const completedJobs = jobs.filter((job) => job.status === 'completed' && job.videoUrl);

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = `${API_BASE}${url}`;
    link.download = `${name.replace(/\s+/g, '_')}_card.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-download new completed videos
  useEffect(() => {
    completedJobs.forEach((job) => {
      if (!downloadedJobsRef.current.has(job.id)) {
        // Mark as downloaded first to prevent duplicate downloads
        downloadedJobsRef.current.add(job.id);

        // Trigger automatic download
        setTimeout(() => {
          handleDownload(job.videoUrl!, job.recipientName);
          toast.success(`Downloading video for ${job.recipientName}`, {
            duration: 2000
          });
        }, 300); // Small delay to stagger multiple downloads
      }
    });
  }, [completedJobs]);

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
    <Card>
      <CardHeader>
        <CardTitle>Generated Videos ({completedJobs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedJobs.map((job) => (
            <div
              key={job.id}
              className="group relative rounded-lg overflow-hidden border bg-card hover:shadow-lg transition-all"
            >
              {/* Video Preview */}
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center relative">
                <video
                  src={`${API_BASE}${job.videoUrl}`}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Info and Actions */}
              <div className="p-4">
                <h4 className="font-medium mb-2 truncate">{job.recipientName}</h4>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const video = document.createElement('video');
                      video.src = `${API_BASE}${job.videoUrl}`;
                      video.controls = true;
                      video.style.position = 'fixed';
                      video.style.top = '50%';
                      video.style.left = '50%';
                      video.style.transform = 'translate(-50%, -50%)';
                      video.style.zIndex = '9999';
                      video.style.maxWidth = '90vw';
                      video.style.maxHeight = '90vh';
                      video.style.boxShadow = '0 0 50px rgba(0,0,0,0.8)';

                      const overlay = document.createElement('div');
                      overlay.style.position = 'fixed';
                      overlay.style.inset = '0';
                      overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
                      overlay.style.zIndex = '9998';
                      overlay.onclick = () => {
                        document.body.removeChild(video);
                        document.body.removeChild(overlay);
                      };

                      document.body.appendChild(overlay);
                      document.body.appendChild(video);
                      video.play();
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Preview
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(job.videoUrl!, job.recipientName)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {completedJobs.length > 1 && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                completedJobs.forEach((job) => {
                  handleDownload(job.videoUrl!, job.recipientName);
                });
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download All Videos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
