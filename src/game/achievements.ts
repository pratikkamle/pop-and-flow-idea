import { Achievement } from './types';

const ACHIEVEMENTS_STORAGE_KEY = 'pop_flow_achievements';

export const INITIAL_ACHIEVEMENTS: Omit<Achievement, 'currentValue' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_pop',
    title: 'First Bubble',
    description: 'Pop your very first bubble in Pop & Flow',
    iconName: 'Sparkles',
    category: 'pops',
    targetValue: 1,
  },
  {
    id: 'pop_50',
    title: 'Warm Up',
    description: 'Pop 50 bubbles total',
    iconName: 'CircleDot',
    category: 'pops',
    targetValue: 50,
  },
  {
    id: 'pop_250',
    title: 'Bubble Enthusiast',
    description: 'Pop 250 bubbles total across sessions',
    iconName: 'Flame',
    category: 'pops',
    targetValue: 250,
  },
  {
    id: 'pop_1000',
    title: 'Master Popper',
    description: 'Pop 1,000 bubbles total',
    iconName: 'Award',
    category: 'pops',
    targetValue: 1000,
  },
  {
    id: 'combo_5',
    title: 'Combo Starter',
    description: 'Build a 5x combo streak without dropping',
    iconName: 'Zap',
    category: 'combos',
    targetValue: 5,
  },
  {
    id: 'combo_15',
    title: 'Rhythm Master',
    description: 'Build a 15x combo streak',
    iconName: 'Activity',
    category: 'combos',
    targetValue: 15,
  },
  {
    id: 'combo_50',
    title: 'Flow Legend',
    description: 'Reach an incredible 50x combo streak',
    iconName: 'Crown',
    category: 'combos',
    targetValue: 50,
  },
  {
    id: 'rush_500',
    title: 'Speed Sprinter',
    description: 'Score 500+ points in a single Combo Rush round',
    iconName: 'Timer',
    category: 'score',
    targetValue: 500,
  },
  {
    id: 'flow_1000',
    title: 'Zen Master',
    description: 'Score 1,000+ points in a continuous Flow session',
    iconName: 'Heart',
    category: 'score',
    targetValue: 1000,
  },
  {
    id: 'rainbow_collector',
    title: 'Prismatic Sparkle',
    description: 'Pop 5 Rainbow bonus bubbles',
    iconName: 'Palette',
    category: 'bonus',
    targetValue: 5,
  },
  {
    id: 'daily_hero',
    title: 'Daily Devotee',
    description: 'Achieve a 3-day Daily Challenge streak',
    iconName: 'CalendarCheck',
    category: 'daily',
    targetValue: 3,
  },
];

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const saved: Record<string, { currentValue: number; unlocked: boolean; unlockedAt?: string }> = raw
      ? JSON.parse(raw)
      : {};

    return INITIAL_ACHIEVEMENTS.map((item) => {
      const s = saved[item.id] || { currentValue: 0, unlocked: false };
      return {
        ...item,
        currentValue: s.currentValue,
        unlocked: s.unlocked,
        unlockedAt: s.unlockedAt,
      };
    });
  } catch {
    return INITIAL_ACHIEVEMENTS.map((item) => ({
      ...item,
      currentValue: 0,
      unlocked: false,
    }));
  }
}

export function saveAchievements(list: Achievement[]) {
  const toSave: Record<string, { currentValue: number; unlocked: boolean; unlockedAt?: string }> = {};
  list.forEach((a) => {
    toSave[a.id] = {
      currentValue: a.currentValue,
      unlocked: a.unlocked,
      unlockedAt: a.unlockedAt,
    };
  });
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(toSave));
}

export interface ProgressCheckParams {
  lifetimePops: number;
  maxCombo: number;
  flowScore: number;
  rushScore: number;
  bonusPops: number;
  dailyStreak: number;
}

export function checkAndUnlockAchievements(
  currentList: Achievement[],
  params: ProgressCheckParams
): { updatedList: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  const nowStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const updatedList = currentList.map((a) => {
    let currentVal = a.currentValue;

    switch (a.id) {
      case 'first_pop':
      case 'pop_50':
      case 'pop_250':
      case 'pop_1000':
        currentVal = Math.max(currentVal, params.lifetimePops);
        break;
      case 'combo_5':
      case 'combo_15':
      case 'combo_50':
        currentVal = Math.max(currentVal, params.maxCombo);
        break;
      case 'rush_500':
        currentVal = Math.max(currentVal, params.rushScore);
        break;
      case 'flow_1000':
        currentVal = Math.max(currentVal, params.flowScore);
        break;
      case 'rainbow_collector':
        currentVal = Math.max(currentVal, params.bonusPops);
        break;
      case 'daily_hero':
        currentVal = Math.max(currentVal, params.dailyStreak);
        break;
    }

    const shouldUnlock = !a.unlocked && currentVal >= a.targetValue;
    if (shouldUnlock) {
      const unlockedAch: Achievement = {
        ...a,
        currentValue: currentVal,
        unlocked: true,
        unlockedAt: nowStr,
      };
      newlyUnlocked.push(unlockedAch);
      return unlockedAch;
    }

    return {
      ...a,
      currentValue: currentVal,
    };
  });

  if (newlyUnlocked.length > 0) {
    saveAchievements(updatedList);
  }

  return { updatedList, newlyUnlocked };
}
