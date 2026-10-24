import { ThemeId, BubbleType, BubbleStyle, TargetColor } from './types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  swatches: string[];
  bgGradient: string;
  phoneBgClass: string;
}

export const TARGET_COLORS: TargetColor[] = ['mint', 'sky', 'peach', 'lavender', 'lemon', 'rose'];

export interface TargetColorConfig {
  id: TargetColor;
  name: string;
  badgeHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
}

export const TARGET_COLOR_CONFIGS: Record<TargetColor, TargetColorConfig> = {
  mint: {
    id: 'mint',
    name: 'Mint Green',
    badgeHex: '#10B981',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-950',
    borderClass: 'border-emerald-300',
    ringClass: 'ring-emerald-400',
  },
  sky: {
    id: 'sky',
    name: 'Sky Blue',
    badgeHex: '#0EA5E9',
    bgClass: 'bg-sky-500',
    textClass: 'text-sky-950',
    borderClass: 'border-sky-300',
    ringClass: 'ring-sky-400',
  },
  peach: {
    id: 'peach',
    name: 'Peach Orange',
    badgeHex: '#F97316',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-950',
    borderClass: 'border-orange-300',
    ringClass: 'ring-orange-400',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Purple',
    badgeHex: '#8B5CF6',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-950',
    borderClass: 'border-purple-300',
    ringClass: 'ring-purple-400',
  },
  lemon: {
    id: 'lemon',
    name: 'Lemon Yellow',
    badgeHex: '#EAB308',
    bgClass: 'bg-amber-400',
    textClass: 'text-amber-950',
    borderClass: 'border-amber-300',
    ringClass: 'ring-amber-400',
  },
  rose: {
    id: 'rose',
    name: 'Rose Pink',
    badgeHex: '#F43F5E',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-950',
    borderClass: 'border-rose-300',
    ringClass: 'ring-rose-400',
  },
};

export const DANGER_BUBBLE_STYLE: BubbleStyle = {
  baseColor: '#DC2626',
  lightColor: '#FFE4E6',
  glowColor: 'rgba(239, 68, 68, 0.75)',
  ringColor: 'rgba(185, 28, 28, 0.95)',
  base: '#DC2626',
  light: '#FFE4E6',
  glow: 'rgba(239, 68, 68, 0.75)',
  ring: 'rgba(185, 28, 28, 0.95)',
};

export const THEMES: Record<ThemeId, ThemeConfig> = {
  spring: {
    id: 'spring',
    name: 'Spring Meadow',
    subtitle: 'Mint, sky blue, and fresh peach',
    swatches: ['#A8E6CF', '#BAE1FF', '#FFDFBA', '#DED2F9'],
    bgGradient: 'from-[#FAF5FF] via-[#F0F7FA] to-[#E6F3F7]',
    phoneBgClass: 'bg-gradient-to-b from-[#FAF5FF] via-[#F0F7FA] to-[#E6F3F7]',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    subtitle: 'Warm apricot, coral rose, and golden amber',
    swatches: ['#FFDFBA', '#FFB3BA', '#FFE57F', '#FFAAA6'],
    bgGradient: 'from-[#FFF7F2] via-[#FFF0E8] to-[#FDE8DF]',
    phoneBgClass: 'bg-gradient-to-b from-[#FFF7F2] via-[#FFF0E8] to-[#FDE8DF]',
  },
  forest: {
    id: 'forest',
    name: 'Enchanted Forest',
    subtitle: 'Sage, emerald frost, and lemon dew',
    swatches: ['#A8E6CF', '#BCE8D1', '#D4EDDA', '#E2F0CB'],
    bgGradient: 'from-[#F3F9F5] via-[#EAF5EE] to-[#E2F0E7]',
    phoneBgClass: 'bg-gradient-to-b from-[#F3F9F5] via-[#EAF5EE] to-[#E2F0E7]',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    subtitle: 'Aqua marine, seafoam, and sky blue',
    swatches: ['#BAE1FF', '#B2EBF2', '#80DEEA', '#C5CAE9'],
    bgGradient: 'from-[#F0F8FF] via-[#E6F4FA] to-[#DCF0F8]',
    phoneBgClass: 'bg-gradient-to-b from-[#F0F8FF] via-[#E6F4FA] to-[#DCF0F8]',
  },
  twilight: {
    id: 'twilight',
    name: 'Twilight Dream',
    subtitle: 'Starlight lavender, soft amethyst, and lilac',
    swatches: ['#DED2F9', '#D1C4E9', '#E1BEE7', '#FFCDD2'],
    bgGradient: 'from-[#F8F5FF] via-[#F3EDFA] to-[#ECE4F5]',
    phoneBgClass: 'bg-gradient-to-b from-[#F8F5FF] via-[#F3EDFA] to-[#ECE4F5]',
  },
};

interface RawPaletteStyle {
  base: string;
  light: string;
  glow: string;
  ring: string;
}

const toBubbleStyles = (palette: Partial<Record<BubbleType, RawPaletteStyle>>): Record<BubbleType, BubbleStyle> => {
  const result: Partial<Record<BubbleType, BubbleStyle>> = {};
  for (const key of Object.keys(palette) as BubbleType[]) {
    const s = palette[key];
    if (s) {
      result[key] = {
        baseColor: s.base,
        lightColor: s.light,
        glowColor: s.glow,
        ringColor: s.ring,
        base: s.base,
        light: s.light,
        glow: s.glow,
        ring: s.ring,
      };
    }
  }
  // Ensure danger style is always reliably available
  result.danger = DANGER_BUBBLE_STYLE;
  return result as Record<BubbleType, BubbleStyle>;
};

export function getBubbleStyles(theme: ThemeId): Record<BubbleType, BubbleStyle> {
  switch (theme) {
    case 'sunset':
      return toBubbleStyles({
        mint: {
          base: '#FFDFBA',
          light: '#FFF9F2',
          glow: 'rgba(255, 223, 186, 0.45)',
          ring: 'rgba(245, 185, 130, 0.75)',
        },
        sky: {
          base: '#FFB3BA',
          light: '#FFF3F5',
          glow: 'rgba(255, 179, 186, 0.45)',
          ring: 'rgba(240, 139, 150, 0.75)',
        },
        peach: {
          base: '#FFAAA6',
          light: '#FFF0EF',
          glow: 'rgba(255, 170, 166, 0.45)',
          ring: 'rgba(245, 135, 130, 0.75)',
        },
        lavender: {
          base: '#FFD3B6',
          light: '#FFF6F0',
          glow: 'rgba(255, 211, 182, 0.45)',
          ring: 'rgba(245, 180, 140, 0.75)',
        },
        lemon: {
          base: '#FFE57F',
          light: '#FFFDE7',
          glow: 'rgba(255, 229, 127, 0.45)',
          ring: 'rgba(235, 195, 80, 0.75)',
        },
        rose: {
          base: '#FF8A80',
          light: '#FFEBEE',
          glow: 'rgba(255, 138, 128, 0.45)',
          ring: 'rgba(235, 105, 95, 0.75)',
        },
        rainbow_bonus: {
          base: '#FF80AB',
          light: '#FFE082',
          glow: 'rgba(255, 128, 171, 0.65)',
          ring: 'rgba(255, 64, 129, 0.85)',
        },
        time_bonus: {
          base: '#FFD54F',
          light: '#FFF9C4',
          glow: 'rgba(255, 213, 79, 0.65)',
          ring: 'rgba(255, 160, 0, 0.85)',
        },
        multiplier_star: {
          base: '#FF4081',
          light: '#F8BBD0',
          glow: 'rgba(255, 64, 129, 0.65)',
          ring: 'rgba(197, 17, 98, 0.85)',
        },
      });

    case 'forest':
      return toBubbleStyles({
        mint: {
          base: '#A8E6CF',
          light: '#F4FCF8',
          glow: 'rgba(168, 230, 207, 0.45)',
          ring: 'rgba(121, 199, 170, 0.75)',
        },
        sky: {
          base: '#BCE8D1',
          light: '#F2FAF6',
          glow: 'rgba(188, 232, 209, 0.45)',
          ring: 'rgba(140, 205, 175, 0.75)',
        },
        peach: {
          base: '#E2F0CB',
          light: '#F8FCF2',
          glow: 'rgba(226, 240, 203, 0.45)',
          ring: 'rgba(190, 215, 155, 0.75)',
        },
        lavender: {
          base: '#C7E9C0',
          light: '#F3FAF0',
          glow: 'rgba(199, 233, 192, 0.45)',
          ring: 'rgba(155, 205, 145, 0.75)',
        },
        lemon: {
          base: '#FFF3B0',
          light: '#FFFDF0',
          glow: 'rgba(255, 243, 176, 0.45)',
          ring: 'rgba(225, 210, 125, 0.75)',
        },
        rose: {
          base: '#A1DE93',
          light: '#F0F9ED',
          glow: 'rgba(161, 222, 147, 0.45)',
          ring: 'rgba(125, 195, 110, 0.75)',
        },
        rainbow_bonus: {
          base: '#80E27E',
          light: '#DCEDC8',
          glow: 'rgba(128, 226, 126, 0.65)',
          ring: 'rgba(56, 142, 60, 0.85)',
        },
        time_bonus: {
          base: '#FFE082',
          light: '#FFFDE7',
          glow: 'rgba(255, 224, 130, 0.65)',
          ring: 'rgba(255, 179, 0, 0.85)',
        },
        multiplier_star: {
          base: '#FF80AB',
          light: '#FCE4EC',
          glow: 'rgba(255, 128, 171, 0.65)',
          ring: 'rgba(245, 0, 87, 0.85)',
        },
      });

    case 'ocean':
      return toBubbleStyles({
        mint: {
          base: '#80DEEA',
          light: '#E0F7FA',
          glow: 'rgba(128, 222, 234, 0.45)',
          ring: 'rgba(77, 182, 172, 0.75)',
        },
        sky: {
          base: '#BAE1FF',
          light: '#F5FAFF',
          glow: 'rgba(186, 225, 255, 0.45)',
          ring: 'rgba(136, 194, 242, 0.75)',
        },
        peach: {
          base: '#B2EBF2',
          light: '#E8F8FA',
          glow: 'rgba(178, 235, 242, 0.45)',
          ring: 'rgba(128, 203, 196, 0.75)',
        },
        lavender: {
          base: '#C5CAE9',
          light: '#F3F4FB',
          glow: 'rgba(197, 202, 233, 0.45)',
          ring: 'rgba(159, 168, 218, 0.75)',
        },
        lemon: {
          base: '#B3E5FC',
          light: '#E1F5FE',
          glow: 'rgba(179, 229, 252, 0.45)',
          ring: 'rgba(129, 212, 250, 0.75)',
        },
        rose: {
          base: '#90CAF9',
          light: '#E3F2FD',
          glow: 'rgba(144, 202, 249, 0.45)',
          ring: 'rgba(100, 181, 246, 0.75)',
        },
        rainbow_bonus: {
          base: '#4DD0E1',
          light: '#E0F2F1',
          glow: 'rgba(77, 208, 225, 0.65)',
          ring: 'rgba(0, 150, 136, 0.85)',
        },
        time_bonus: {
          base: '#FFE082',
          light: '#FFFDE7',
          glow: 'rgba(255, 224, 130, 0.65)',
          ring: 'rgba(255, 179, 0, 0.85)',
        },
        multiplier_star: {
          base: '#80D8FF',
          light: '#E1F5FE',
          glow: 'rgba(128, 216, 255, 0.65)',
          ring: 'rgba(0, 145, 234, 0.85)',
        },
      });

    case 'twilight':
      return toBubbleStyles({
        mint: {
          base: '#DED2F9',
          light: '#FAF7FF',
          glow: 'rgba(222, 210, 249, 0.45)',
          ring: 'rgba(190, 170, 235, 0.75)',
        },
        sky: {
          base: '#D1C4E9',
          light: '#F3E5F5',
          glow: 'rgba(209, 196, 233, 0.45)',
          ring: 'rgba(179, 157, 219, 0.75)',
        },
        peach: {
          base: '#E1BEE7',
          light: '#FCE4EC',
          glow: 'rgba(225, 190, 231, 0.45)',
          ring: 'rgba(206, 147, 216, 0.75)',
        },
        lavender: {
          base: '#B39DDB',
          light: '#EDE7F6',
          glow: 'rgba(179, 157, 219, 0.45)',
          ring: 'rgba(149, 117, 205, 0.75)',
        },
        lemon: {
          base: '#CE93D8',
          light: '#F3E5F5',
          glow: 'rgba(206, 147, 216, 0.45)',
          ring: 'rgba(186, 104, 200, 0.75)',
        },
        rose: {
          base: '#F48FB1',
          light: '#FCE4EC',
          glow: 'rgba(244, 143, 177, 0.45)',
          ring: 'rgba(240, 98, 146, 0.75)',
        },
        rainbow_bonus: {
          base: '#BA68C8',
          light: '#E1BEE7',
          glow: 'rgba(186, 104, 200, 0.65)',
          ring: 'rgba(142, 36, 170, 0.85)',
        },
        time_bonus: {
          base: '#FFE082',
          light: '#FFFDE7',
          glow: 'rgba(255, 224, 130, 0.65)',
          ring: 'rgba(255, 179, 0, 0.85)',
        },
        multiplier_star: {
          base: '#EA80FC',
          light: '#F8BBD0',
          glow: 'rgba(234, 128, 252, 0.65)',
          ring: 'rgba(170, 0, 255, 0.85)',
        },
      });

    case 'spring':
    default:
      return toBubbleStyles({
        mint: {
          base: '#A8E6CF',
          light: '#F4FCF8',
          glow: 'rgba(168, 230, 207, 0.45)',
          ring: 'rgba(121, 199, 170, 0.75)',
        },
        sky: {
          base: '#BAE1FF',
          light: '#F5FAFF',
          glow: 'rgba(186, 225, 255, 0.45)',
          ring: 'rgba(136, 194, 242, 0.75)',
        },
        peach: {
          base: '#FFDFBA',
          light: '#FFF9F2',
          glow: 'rgba(255, 223, 186, 0.45)',
          ring: 'rgba(245, 185, 130, 0.75)',
        },
        lavender: {
          base: '#DED2F9',
          light: '#FAF7FF',
          glow: 'rgba(222, 210, 249, 0.45)',
          ring: 'rgba(190, 170, 235, 0.75)',
        },
        lemon: {
          base: '#FFFFBA',
          light: '#FFFFF4',
          glow: 'rgba(255, 255, 186, 0.45)',
          ring: 'rgba(226, 226, 120, 0.75)',
        },
        rose: {
          base: '#FFB3BA',
          light: '#FFF3F5',
          glow: 'rgba(255, 179, 186, 0.45)',
          ring: 'rgba(240, 139, 150, 0.75)',
        },
        rainbow_bonus: {
          base: '#E0C3FC',
          light: '#8EC5FC',
          glow: 'rgba(255, 209, 255, 0.65)',
          ring: 'rgba(179, 136, 255, 0.85)',
        },
        time_bonus: {
          base: '#FFE57F',
          light: '#FFFDE7',
          glow: 'rgba(255, 213, 79, 0.65)',
          ring: 'rgba(255, 179, 0, 0.85)',
        },
        multiplier_star: {
          base: '#FF80AB',
          light: '#FFF0F5',
          glow: 'rgba(255, 64, 129, 0.65)',
          ring: 'rgba(245, 0, 87, 0.85)',
        },
      });
  }
}
