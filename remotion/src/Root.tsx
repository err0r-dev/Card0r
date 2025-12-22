import { Composition, registerRoot } from 'remotion';
import { HolidayTheme, VideoFormat } from '@card0r/shared';
import { CardComposition, calculateTotalFrames } from './CardComposition';
import { CardCompositionProps, FORMAT_CONFIGS, FPS } from './types';

const DEFAULT_PROPS: CardCompositionProps = {
  recipientName: 'Preview User',
  message: 'This is a preview message for testing the video composition. It should display nicely with appropriate timing based on the word count.',
  senderName: 'Card0r',
  theme: HolidayTheme.CHRISTMAS,
  format: VideoFormat.HD_1080P,
};

export const RemotionRoot: React.FC = () => {
  const defaultDuration = calculateTotalFrames(DEFAULT_PROPS.message, FPS);
  const defaultFormat = FORMAT_CONFIGS[DEFAULT_PROPS.format];

  return (
    <>
      <Composition
        id="HolidayCard"
        component={CardComposition}
        durationInFrames={defaultDuration}
        fps={FPS}
        width={defaultFormat.width}
        height={defaultFormat.height}
        defaultProps={DEFAULT_PROPS}
      />
    </>
  );
};

registerRoot(RemotionRoot);
