import { DailyChallenge } from './types';

const STORAGE_KEY = 'pop_flow_daily_challenge';
const STREAK_KEY = 'pop_flow_daily_streak';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministically generates today's target score based on the calendar date
 * Targets range smoothly between 650 and 1100 points
 */
export function calculateTodayTarget(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  // Returns targets such as 650, 750, 850, 950, 1050, 1150
  const step = positiveHash % 6;
  return 650 + step * 100;
}

export function loadDailyChallenge(): DailyChallenge {
  const today = getTodayDateString();
  const target = calculateTodayTarget(today);
  const savedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyChallenge = JSON.parse(raw);
      if (parsed.date === today) {
        return parsed;
      } else {
        // Check if yesterday was completed to preserve or reset streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        const newStreak = parsed.date === yStr && parsed.isCompleted ? savedStreak : 0;
        localStorage.setItem(STREAK_KEY, newStreak.toString());

        const fresh: DailyChallenge = {
          date: today,
          targetScore: target,
          currentScore: 0,
          isCompleted: false,
          streak: newStreak,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
    }
  } catch {}

  const fresh: DailyChallenge = {
    date: today,
    targetScore: target,
    currentScore: 0,
    isCompleted: false,
    streak: savedStreak,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function recordScoreForDailyChallenge(score: number): {
  challenge: DailyChallenge;
  justCompleted: boolean;
} {
  const challenge = loadDailyChallenge();
  let justCompleted = false;

  // Track the highest session score achieved today
  if (score > challenge.currentScore) {
    challenge.currentScore = score;
    if (!challenge.isCompleted && challenge.currentScore >= challenge.targetScore) {
      challenge.isCompleted = true;
      justCompleted = true;
      challenge.streak += 1;
      localStorage.setItem(STREAK_KEY, challenge.streak.toString());
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  }

  return { challenge, justCompleted };
}
