import React from 'react';
import { Pause, Flame } from 'lucide-react';
import { GameMode, GameStats } from '../game/types';

interface GameHudProps {
  mode: GameMode;
  stats: GameStats;
  onPause: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({ mode, stats, onPause }) => {
  const isRush = mode === 'combo_rush';
  const timeInt = Math.ceil(stats.remainingTime);
  const isUrgent = isRush && timeInt <= 5;

  const multiplier =
    stats.combo >= 15 ? 4 : stats.combo >= 10 ? 3 : stats.combo >= 5 ? 2 : 1;

  return (
    <div className="absolute inset-x-0 top-0 z-20 pointer-events-none p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Pause Button */}
        <button
          onClick={onPause}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm border border-slate-200/60 flex items-center justify-center transition-transform active:scale-95 text-slate-700"
          title="Pause game"
          aria-label="Pause"
        >
          <Pause className="w-4 h-4 fill-slate-700" />
        </button>

        {/* Center: Mode Indicator or Timer */}
        {isRush ? (
          <div
            className={`px-3.5 py-1 rounded-full shadow-sm font-bold text-sm tracking-tight transition-colors ${
              isUrgent
                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                : 'bg-white/90 text-slate-800 border border-slate-200/60'
            }`}
          >
            <span className="font-mono tabular-nums">{timeInt}s</span>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs text-xs font-semibold text-slate-600 border border-slate-200/40">
            Flow · <span className="tabular-nums font-mono">{stats.totalPops}</span> popped
          </div>
        )}

        {/* Score Readout */}
        <div className="px-3.5 py-1 rounded-full bg-white/90 shadow-sm border border-slate-200/60 text-slate-800">
          <span className="font-mono font-bold text-sm tabular-nums">{stats.score.toLocaleString()}</span>
        </div>
      </div>

      {/* Dynamic Combo Toast */}
      {stats.combo >= 2 && (
        <div className="flex justify-center pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFDFBA] to-[#FFE57F] text-slate-900 border border-amber-200 shadow-sm text-xs font-bold tracking-tight">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-bounce [animation-duration:1s]" />
            <span>{stats.combo} COMBO</span>
            <span className="bg-white/80 text-slate-900 px-1.5 py-0.2 rounded-md font-extrabold text-[11px]">
              {multiplier}x
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

