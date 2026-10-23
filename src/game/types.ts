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
  style: BubbleStyle;
  points: number;
  isPopped: boolean;
  popProgress: number;
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
}

export interface PopRipple {
  id: number;
  x: number;
  y: number;
  maxRadius: number;
  currentRadius: number;
  color: string;
  alpha: number;
}

export type BubbleDensity = 'cozy' | 'normal' | 'dense';
export type BubbleSpeed = 'gentle' | 'balanced' | 'lively';

export interface GameSettings {
  soundEnabled: boolean;
  ambientSound: boolean;
  hapticEnabled: boolean;
  reducedMotion: boolean;
  bubbleDensity: BubbleDensity;
  bubbleSpeed: BubbleSpeed;
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
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}
