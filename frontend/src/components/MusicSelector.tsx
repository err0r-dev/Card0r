import { useState, useEffect } from 'react';
import { Music, Loader2, Play, Check } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useSettingsStore } from '../stores/settingsStore';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import type { MusicTrack } from '@card0r/shared';

export function MusicSelector() {
  const { selectedTheme, selectedMusicUrl, setSelectedMusicUrl } = useVideoStore();
  const { jamendoKey } = useSettingsStore();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTheme && jamendoKey) {
      searchMusic();
    }
  }, [selectedTheme, jamendoKey]);

  const searchMusic = async () => {
    if (!selectedTheme || !jamendoKey) return;

    setIsLoading(true);
    try {
      const result = await apiClient.fetchMusic(selectedTheme, jamendoKey);
      setTracks(result.tracks.slice(0, 6)); // Show top 6 results

      // Auto-select first track if none selected
      if (result.tracks.length > 0 && !selectedMusicUrl) {
        setSelectedMusicUrl(result.tracks[0].downloadUrl);
      }
    } catch (error) {
      console.error('Failed to search music:', error);
      toast.error('Failed to load music options');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (url: string) => {
    if (previewUrl === url) {
      setPreviewUrl(null);
    } else {
      setPreviewUrl(url);
    }
  };

  if (!jamendoKey) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Please add your Jamendo API key in Settings to enable background music</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center" role="status" aria-live="polite">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <p>Searching for music...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tracks.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No music found. Videos will be generated without background music.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Select Background Music
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Choose music that matches your selected theme
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => {
            const isSelected = selectedMusicUrl === track.downloadUrl;
            const isPreviewing = previewUrl === track.previewUrl;

            return (
              <div
                key={track.id}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-amber-500
                  ${isSelected
                    ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
                  }
                `}
                onClick={() => setSelectedMusicUrl(track.downloadUrl)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedMusicUrl(track.downloadUrl);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${track.name}${isSelected ? ' (currently selected)' : ''}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {isSelected && (
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {!isSelected && (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Music className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className={`flex-1 min-w-0 ${isSelected ? 'pr-16' : ''}`}>
                    <h4 className={`font-medium truncate ${isSelected ? 'text-amber-900 dark:text-amber-100' : ''}`}>
                      {track.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {track.duration}s • {track.tags.slice(0, 2).join(', ')}
                    </p>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(track.previewUrl);
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {isPreviewing ? 'Stop Preview' : 'Preview'}
                    </Button>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs font-medium bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hidden audio player for preview */}
        {previewUrl && (
          <audio
            src={previewUrl}
            autoPlay
            onEnded={() => setPreviewUrl(null)}
            className="hidden"
          />
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p>
            💡 Music will be automatically added to all generated videos.
            {selectedMusicUrl && ' The selected track is highlighted in yellow.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
