import type { HolidayTheme } from '@card0r/shared';
import { ChristmasDecoration } from './ChristmasDecoration';
import { NewYearDecoration } from './NewYearDecoration';
import { ValentinesDecoration } from './ValentinesDecoration';
import { EasterDecoration } from './EasterDecoration';
import { HalloweenDecoration } from './HalloweenDecoration';
import { ThanksgivingDecoration } from './ThanksgivingDecoration';
import { HanukkahDecoration } from './HanukkahDecoration';
import { DiwaliDecoration } from './DiwaliDecoration';
import { ChineseNewYearDecoration } from './ChineseNewYearDecoration';
import { EidDecoration, RamadanDecoration } from './IslamicDecoration';
import { ParticleDecoration } from './ParticleDecoration';

export interface DecorationProps {
  width: number;
  height: number;
}

// Map themes to their specific decoration components
export function getDecorationComponent(theme: HolidayTheme): React.FC<DecorationProps> | null {
  switch (theme) {
    case 'christmas':
      return ChristmasDecoration;
    case 'new_year':
      return NewYearDecoration;
    case 'valentines':
      return ValentinesDecoration;
    case 'easter':
      return EasterDecoration;
    case 'halloween':
      return HalloweenDecoration;
    case 'thanksgiving':
      return ThanksgivingDecoration;
    case 'hanukkah':
      return HanukkahDecoration;
    case 'diwali':
      return DiwaliDecoration;
    case 'chinese_new_year':
    case 'lunar_new_year':
      return ChineseNewYearDecoration;
    case 'eid_al_fitr':
    case 'eid_al_adha':
      return EidDecoration;
    case 'ramadan':
      return RamadanDecoration;
    // Themes without specific decorations use enhanced particles
    case 'rosh_hashanah':
    case 'passover':
    case 'yom_kippur':
    default:
      return null; // Will use ParticleDecoration as fallback
  }
}

// Export all decorations for direct access if needed
export {
  ChristmasDecoration,
  NewYearDecoration,
  ValentinesDecoration,
  EasterDecoration,
  HalloweenDecoration,
  ThanksgivingDecoration,
  HanukkahDecoration,
  DiwaliDecoration,
  ChineseNewYearDecoration,
  EidDecoration,
  RamadanDecoration,
  ParticleDecoration,
};
