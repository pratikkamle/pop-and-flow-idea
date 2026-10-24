import React from 'react';
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Award,
  Crown,
  Timer,
  Heart,
  Palette,
  CalendarCheck,
  Flame,
  CircleDot,
  Activity,
} from 'lucide-react';
import { Achievement } from '../game/types';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  CircleDot,
  Flame,
  Award,
  Zap,
  Activity,
  Crown,
  Timer,
  Heart,
  Palette,
  CalendarCheck,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ achievements, onClose }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="absolute inset-0 z-50 bg-[#FAF5FF] flex flex-col p-5 sm:p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200/60 flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-extrabold text-slate-800 font-['Quicksand']">
          Achievements
        </h2>
        <div className="w-10" />
      </div>

      {/* Overview Card */}
      <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col gap-2.5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Milestone Progress</p>
              <p className="text-[11px] text-slate-500">
                {unlockedCount} of {totalCount} completed
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Achievement Items List */}
      <div className="flex flex-col gap-2.5">
        {achievements.map((item) => {
          const IconComp = ICON_MAP[item.iconName] || Trophy;
          const currentValClamped = Math.min(item.currentValue, item.targetValue);
          const itemProgress = Math.min(100, Math.round((currentValClamped / item.targetValue) * 100));

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.unlocked
                  ? 'bg-white shadow-xs border-emerald-100/80'
                  : 'bg-white/80 border-slate-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.unlocked
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        item.unlocked ? 'text-slate-800' : 'text-slate-600'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {item.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {item.description}
                  </p>

                  {/* Progress info */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.unlocked ? 'bg-emerald-500' : 'bg-teal-500/80'
                        }`}
                        style={{ width: `${itemProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {currentValClamped.toLocaleString()} / {item.targetValue.toLocaleString()}
                    </span>
                  </div>

                  {item.unlocked && item.unlockedAt && (
                    <span className="text-[9px] text-emerald-600/80 font-medium mt-1 block">
                      Unlocked on {item.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
