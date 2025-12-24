import { VideoFormat } from '@card0r/shared';
import { useVideoStore } from '../stores/videoStore';
import { Card, CardContent } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Monitor, Smartphone, Square, Maximize } from 'lucide-react';

interface FormatOption {
  id: VideoFormat;
  name: string;
  dimensions: string;
  description: string;
  icon: React.ReactNode;
}

const FORMATS: FormatOption[] = [
  {
    id: VideoFormat.HD_1080P,
    name: '1080p HD',
    dimensions: '1920 × 1080',
    description: 'Standard HD video, perfect for most uses',
    icon: <Monitor className="h-5 w-5" />,
  },
  {
    id: VideoFormat.UHD_4K,
    name: '4K Ultra HD',
    dimensions: '3840 × 2160',
    description: 'Highest quality, larger file size',
    icon: <Maximize className="h-5 w-5" />,
  },
  {
    id: VideoFormat.SQUARE,
    name: 'Square',
    dimensions: '1080 × 1080',
    description: 'Perfect for Instagram posts',
    icon: <Square className="h-5 w-5" />,
  },
  {
    id: VideoFormat.SOCIAL,
    name: 'Social Stories',
    dimensions: '1080 × 1920',
    description: 'Optimized for Instagram/TikTok stories',
    icon: <Smartphone className="h-5 w-5" />,
  },
];

export function FormatPicker() {
  const { selectedFormat, setSelectedFormat } = useVideoStore();

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Export Format</h3>
        <RadioGroup
          value={selectedFormat}
          onValueChange={(value) => setSelectedFormat(value as VideoFormat)}
        >
          <div className="grid gap-4">
            {FORMATS.map((format) => (
              <div key={format.id}>
                <Label
                  htmlFor={format.id}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      selectedFormat === format.id
                        ? 'border-amber-500 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-400/20 ring-2 ring-amber-500/30 dark:ring-amber-400/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-amber-500/50 dark:hover:border-amber-400/50'
                    }
                  `}
                >
                  <RadioGroupItem value={format.id} id={format.id} className="mt-1" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {format.icon}
                      <span className="font-medium">{format.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({format.dimensions})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format.description}
                    </p>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
