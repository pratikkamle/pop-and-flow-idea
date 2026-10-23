import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameStats } from '../game/types';

interface SummaryModalProps {
  stats: GameStats;
  bestScore: number;
  onReplay: () => void;
  onHome: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ stats, bestScore, onReplay, onHome }) => {
  useEffect(() => {
    if (stats.isNewPersonalBest) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#A8E6CF', '#BAE1FF', '#FFDFBA', '#DED2F9', '#FFFFBA'],
      });
    }
  }, [stats.isNewPersonalBest]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        {/* Banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF7FF] text-[#2563EB] text-xs font-bold mb-3 border border-blue-100">
          {stats.isNewPersonalBest ? (
            <>
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>New Personal Best!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Round Complete</span>
            </>
          )}
        </div>

        {/* Big Score Readout */}
        <div className="text-4xl font-extrabold text-slate-800 font-mono tracking-tight my-1">
          {stats.score.toLocaleString()}
        </div>
        <p className="text-xs font-medium text-slate-500 mb-5">
          Points Earned
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 w-full p-3 rounded-2xl bg-slate-50 border border-slate-100/80 mb-6">
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-slate-800 text-sm">{stats.totalPops}</span>
            <span className="text-[10px] text-slate-500 font-medium">Pops</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-200/60">
            <span className="font-mono font-bold text-slate-800 text-sm">{stats.maxCombo}x</span>
            <span className="text-[10px] text-slate-500 font-medium">Max Combo</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-slate-800 text-sm">{stats.bonusPops}</span>
            <span className="text-[10px] text-slate-500 font-medium">Bonus</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onReplay}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#A8E6CF] hover:bg-[#94dcb8] font-bold text-slate-900 text-sm transition-transform active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
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
