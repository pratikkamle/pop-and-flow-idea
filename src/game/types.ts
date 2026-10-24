export type GameMode = 'flow' | 'combo_rush';

export type BubbleType =
  | 'mint'
  | 'sky'
  | 'peach'
  | 'lavender'
  | 'lemon'
  | 'rose'
  | 'rainbow_bonus'
  | 'time_bonus'
  | 'multiplier_star';

export interface BubbleStyle {
  baseColor: string;
  lightColor: string;
  glowColor: string;
  ringColor: string;
  base?: string;
  light?: string;
  glow?: string;
  ring?: string;
}

export interface Bubble {
  id: number;
  type: BubbleType;
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  wobblePhase: number;
  wobbleSpeed: number;
  scaleX: number;
  scaleY: number;
  wallSquish: number;
  style: BubbleStyle;
  points: number;
  isPopped: boolean;
  popProgress: number;
  scored?: boolean;
}

export interface PopParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  rotation: number;
  rotSpeed: number;
  isSparkle: boolean;
}

export interface PopRipple {
  id: number;
  x: number;
  y: number;
  maxRadius: number;
  currentRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export type BubbleDensity = 'cozy' | 'normal' | 'dense';
export type BubbleSpeed = 'gentle' | 'balanced' | 'lively';
export type ThemeId = 'spring' | 'sunset' | 'forest' | 'ocean' | 'twilight';

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  ambientSound: boolean;
  hapticEnabled: boolean;
  reducedMotion: boolean;
  bubbleDensity: BubbleDensity;
  bubbleSpeed: BubbleSpeed;
  theme: ThemeId;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  totalPops: number;
  bonusPops: number;
  remainingTime: number; // in seconds for Combo Rush
  isPaused: boolean;
  isGameOver: boolean;
  isNewPersonalBest: boolean;
}

export interface FloatingScore {
  id: number;
  x: number;
  y: number;
  text: string;
  subtext?: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  isBonus?: boolean;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  targetScore: number;
  currentScore: number;
  isCompleted: boolean;
  streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'pops' | 'combos' | 'score' | 'bonus' | 'daily';
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: string;
}



