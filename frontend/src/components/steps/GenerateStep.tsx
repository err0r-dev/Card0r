import { useRecipientsStore } from '../../stores/recipientsStore';
import { useVideoStore } from '../../stores/videoStore';
import { VideoGenerator } from '../VideoGenerator';
import { Card, CardContent } from '../ui/card';

// Helper to get theme display name
function getThemeDisplayName(theme: string): string {
  return theme
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to get format display name
function getFormatDisplayName(format: string): string {
  const formatNames: Record<string, string> = {
    '1080p': '1080p HD',
    '4k': '4K Ultra HD',
    'square': 'Square',
    'social': 'Social Stories',
  };
  return formatNames[format] || format;
}

export function GenerateStep() {
  const { recipients, senderName } = useRecipientsStore();
  const { selectedTheme, selectedFormat, selectedMusicUrl } = useVideoStore();

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Summary</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-muted-foreground">From:</div>
            <div className="font-medium">{senderName || 'Not specified'}</div>

            <div className="text-muted-foreground">Recipients:</div>
            <div className="font-medium">{recipients.length} people</div>

            <div className="text-muted-foreground">Theme:</div>
            <div className="font-medium">
              {selectedTheme ? getThemeDisplayName(selectedTheme) : 'Not selected'}
            </div>

            <div className="text-muted-foreground">Format:</div>
            <div className="font-medium">
              {selectedFormat ? getFormatDisplayName(selectedFormat) : 'Not selected'}
            </div>

            <div className="text-muted-foreground">Music:</div>
            <div className="font-medium">
              {selectedMusicUrl ? 'Selected' : 'None'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Generator */}
      <VideoGenerator />
    </div>
  );
}
