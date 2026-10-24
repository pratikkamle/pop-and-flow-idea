import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Sparkles, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameMode, GameStats } from '../game/types';

interface SummaryModalProps {
  stats: GameStats;
  mode?: GameMode;
  bestScore: number;
  onReplay: () => void;
  onHome: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ stats, mode, bestScore, onReplay, onHome }) => {
  const isReflex = mode === 'reflex';
  const survivedSecs = Math.min(60, Math.max(0, stats.elapsedTime ?? (60 - stats.remainingTime)));
  const survivalPercent = Math.min(100, Math.max(0, Math.round((survivedSecs / 60) * 100)));

  useEffect(() => {
    if ((stats.isNewPersonalBest && !stats.isFailed) || (isReflex && !stats.isFailed)) {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#A8E6CF', '#BAE1FF', '#FFDFBA', '#DED2F9', '#FFFFBA'],
      });
    }
  }, [stats.isNewPersonalBest, stats.isFailed, isReflex]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        {/* Status Header Badge */}
        {isReflex && stats.isFailed ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2 border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Protocol Terminated</span>
          </div>
        ) : isReflex ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>60s Protocol Complete!</span>
          </div>
        ) : stats.isNewPersonalBest ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF7FF] text-[#2563EB] text-xs font-bold mb-3 border border-blue-100">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>New Personal Best!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF7FF] text-[#2563EB] text-xs font-bold mb-3 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Round Complete</span>
          </div>
        )}

        {/* Detailed Protocol Failure Diagnosis or Victory Card */}
        {isReflex && (
          <div
            className={`w-full p-3 rounded-2xl text-left mb-3.5 border ${
              stats.isFailed
                ? 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              {stats.isFailed ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold leading-snug">
                  {stats.failureMessage || (stats.isFailed ? 'Protocol failed' : 'Reflex Master: 60s completed!')}
                </p>
              </div>
            </div>

            {/* Survival Time Progress Meter */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/40">
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600">
                <span>Survival</span>
                <span className="font-mono tabular-nums font-bold">
                  {survivedSecs.toFixed(1)}s / 60.0s ({survivalPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.isFailed ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${survivalPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Big Score Readout */}
        <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight my-1">
          {stats.score.toLocaleString()}
        </div>
        <p className="text-xs font-medium text-slate-500 mb-4">
          Points Earned {bestScore > 0 && `· Best: ${bestScore.toLocaleString()}`}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 w-full p-3 rounded-2xl bg-slate-50 border border-slate-100/90 mb-5">
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">{stats.totalPops}</span>
            <span className="text-[10px] text-slate-500 font-medium">Pops</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-200/70">
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">{stats.maxCombo}x</span>
            <span className="text-[10px] text-slate-500 font-medium">Max Combo</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {isReflex ? `${survivalPercent}%` : stats.bonusPops}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {isReflex ? 'Completed' : 'Bonus'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onReplay}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#A8E6CF] hover:bg-[#94dcb8] font-bold text-slate-900 text-sm transition-transform active:scale-95 shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isReflex ? 'Retry Protocol' : 'Play Again'}</span>
          </button>

          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 font-semibold text-slate-500 hover:text-slate-800 text-xs transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
