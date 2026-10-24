import React from 'react';
import { Play, Timer, Settings as SettingsIcon, Sparkles, CheckCircle2, Trophy, Flame, Zap } from 'lucide-react';
import { GameMode, DailyChallenge } from '../game/types';

interface HomeScreenProps {
  bestFlowScore: number;
  bestRushScore: number;
  bestReflexScore?: number;
  lifetimePops: number;
  dailyChallenge: DailyChallenge;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  onStartMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  bestFlowScore,
  bestRushScore,
  bestReflexScore = 0,
  lifetimePops,
  dailyChallenge,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 11,
  onStartMode,
  onOpenSettings,
  onOpenAchievements,
}) => {
  const challengeProgress = Math.min(100, Math.round((dailyChallenge.currentScore / dailyChallenge.targetScore) * 100));

  return (
    <div className="relative flex flex-col justify-between w-full h-full p-5 sm:p-6 text-slate-800 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wide uppercase">
          <span>Native Compose UI</span>
          <span>·</span>
          <span>Offline</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Achievements Trigger */}
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 h-10 px-3 rounded-full bg-white/80 hover:bg-white shadow-sm border border-slate-200/60 transition-transform active:scale-95 text-slate-700"
            title="Achievements"
            aria-label="Achievements"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-slate-700">
              {unlockedAchievementsCount}/{totalAchievementsCount}
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm border border-slate-200/60 flex items-center justify-center transition-transform active:scale-95 text-slate-700"
            title="Game Settings"
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>


      {/* Hero Branding */}
      <div className="flex flex-col items-center text-center my-auto py-3">
        {/* Playful Floating Bubble Trio */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#A8E6CF] shadow-inner shadow-white/40 ring-2 ring-white/80 animate-bounce [animation-duration:2.5s]" />
          <div className="w-10 h-10 rounded-full bg-[#BAE1FF] shadow-inner shadow-white/50 ring-2 ring-white/80 animate-bounce [animation-duration:2s]" />
          <div className="w-7 h-7 rounded-full bg-[#FFDFBA] shadow-inner shadow-white/40 ring-2 ring-white/80 animate-bounce [animation-duration:3s]" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 font-['Quicksand'] mb-1">
          Pop &amp; Flow
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-[250px]">
          Satisfying pastel bubble popping for quick, mindful breaks
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {/* Daily Challenge Card */}
        <div className="w-full p-3.5 rounded-2xl bg-white/95 shadow-sm border border-slate-200/70 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Daily Challenge</span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Reach {dailyChallenge.targetScore} points today
                </span>
              </div>
            </div>

            {dailyChallenge.isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Done!
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {dailyChallenge.currentScore}/{dailyChallenge.targetScore}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                dailyChallenge.isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-400 to-teal-400'
              }`}
              style={{ width: `${challengeProgress}%` }}
            />
          </div>

          {dailyChallenge.streak > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold pt-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{dailyChallenge.streak} Day Streak!</span>
            </div>
          )}
        </div>

        {/* Mode 1: Flow Mode */}
        <button
          onClick={() => onStartMode('flow')}
          className="group relative flex items-center gap-3.5 w-full p-3.5 rounded-2xl bg-white/95 hover:bg-white shadow-sm border border-slate-100 transition-all active:scale-[0.98] text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#A8E6CF] to-[#E8FBF4] flex items-center justify-center shrink-0 shadow-sm border border-[#A8E6CF]/30">
            <Play className="w-5 h-5 text-slate-800 fill-slate-800 ml-0.5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm sm:text-base">Flow Mode</span>
              {bestFlowScore > 0 && (
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Best {bestFlowScore}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Endless serene play · Dynamic pacing · No timer
            </p>
          </div>
        </button>

        {/* Mode 2: Combo Rush */}
        <button
          onClick={() => onStartMode('combo_rush')}
          className="group relative flex items-center gap-3.5 w-full p-3.5 rounded-2xl bg-white/95 hover:bg-white shadow-sm border border-slate-100 transition-all active:scale-[0.98] text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#BAE1FF] to-[#EFF7FF] flex items-center justify-center shrink-0 shadow-sm border border-[#BAE1FF]/30">
            <Timer className="w-5 h-5 text-slate-800" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm sm:text-base">Combo Rush</span>
              {bestRushScore > 0 && (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Best {bestRushScore}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              30-second challenge · Multipliers &amp; +time bubbles
            </p>
          </div>
        </button>

        {/* Mode 3: Reflex Protocol */}
        <button
          onClick={() => onStartMode('reflex')}
          className="group relative flex items-center gap-3.5 w-full p-3.5 rounded-2xl bg-white/95 hover:bg-white shadow-sm border border-rose-100/60 transition-all active:scale-[0.98] text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FFAAA6] to-[#FFE5E8] flex items-center justify-center shrink-0 shadow-sm border border-[#FFAAA6]/40">
            <Zap className="w-5 h-5 text-rose-600 fill-rose-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-sm sm:text-base">Reflex Protocol</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 tracking-wide">
                  60s
                </span>
              </div>
              {bestReflexScore > 0 && (
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                  Best {bestReflexScore}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Target color shifts every 10s · Avoid hazard bubbles
            </p>
          </div>
        </button>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-center gap-1.5 pt-3 text-[11px] text-slate-400 font-medium text-center">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>{lifetimePops.toLocaleString()} bubbles popped all-time</span>
      </div>
    </div>
  );
};
