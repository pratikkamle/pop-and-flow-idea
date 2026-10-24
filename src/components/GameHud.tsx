import React, { useState, useEffect } from 'react';
import { Pause, Flame, Timer, AlertTriangle, Zap } from 'lucide-react';
import { GameMode, GameStats, TargetColor } from '../game/types';
import { TARGET_COLOR_CONFIGS } from '../game/themes';

interface GameHudProps {
  mode: GameMode;
  stats: GameStats;
  onPause: () => void;
  flowPaceMultiplier?: number;
}

export const GameHud: React.FC<GameHudProps> = ({ mode, stats, onPause, flowPaceMultiplier = 1.0 }) => {
  const isRush = mode === 'combo_rush';
  const isReflex = mode === 'reflex';
  const timeInt = Math.ceil(stats.remainingTime);
  const isUrgent = (isRush && timeInt <= 5) || (isReflex && timeInt <= 10);

  const multiplier =
    stats.combo >= 15 ? 4 : stats.combo >= 10 ? 3 : stats.combo >= 5 ? 2 : 1;

  const currentTarget = (stats.targetColor as TargetColor) || 'mint';
  const targetConfig = TARGET_COLOR_CONFIGS[currentTarget];
  const targetShiftSecs = Math.max(1, Math.ceil(stats.targetColorTimeRemaining ?? 10));
  const shiftProgress = Math.min(100, Math.max(0, ((stats.targetColorTimeRemaining ?? 10) / 10) * 100));

  // Animated Target Shift Banner Overlay
  const [shiftBanner, setShiftBanner] = useState<{
    name: string;
    badgeHex: string;
    id: number;
  } | null>(null);

  useEffect(() => {
    if (isReflex && stats.targetShiftNotification) {
      const config = TARGET_COLOR_CONFIGS[stats.targetShiftNotification.color];
      setShiftBanner({
        name: stats.targetShiftNotification.name,
        badgeHex: config?.badgeHex || '#10B981',
        id: stats.targetShiftNotification.id,
      });
      const timer = setTimeout(() => {
        setShiftBanner(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isReflex, stats.targetShiftNotification?.id]);

  return (
    <div className="absolute inset-x-0 top-0 z-20 pointer-events-none p-3.5 flex flex-col gap-2">
      {/* Top Bar with Controls and High-Contrast Indicators */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Pause Button */}
        <button
          onClick={onPause}
          className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-sm border border-slate-200/80 flex items-center justify-center transition-transform active:scale-95 text-slate-700"
          title="Pause game"
          aria-label="Pause"
        >
          <Pause className="w-4 h-4 fill-slate-700" />
        </button>

        {/* Center: Mode Indicator or Timer */}
        {isReflex ? (
          <div
            className={`px-3.5 py-1.5 rounded-full shadow-sm font-bold text-xs tracking-tight transition-all flex items-center gap-1.5 ${
              isUrgent
                ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse scale-105'
                : 'bg-white/95 text-slate-800 border border-slate-200/80'
            }`}
          >
            <Timer className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`} />
            <span className="font-mono tabular-nums text-sm font-extrabold">{timeInt}s</span>
          </div>
        ) : isRush ? (
          <div
            className={`px-3.5 py-1.5 rounded-full shadow-sm font-bold text-sm tracking-tight transition-colors ${
              isUrgent
                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                : 'bg-white/90 text-slate-800 border border-slate-200/60'
            }`}
          >
            <span className="font-mono tabular-nums">{timeInt}s</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-slate-700 border border-slate-200/60 shadow-2xs">
            <span>Flow</span>
            <span className="text-slate-300">·</span>
            <span className="tabular-nums font-mono font-bold text-slate-900">{stats.totalPops}</span>
            <span className="text-slate-500 font-normal">popped</span>
            {flowPaceMultiplier > 1.0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-teal-700 font-bold">{flowPaceMultiplier.toFixed(2)}x</span>
              </>
            )}
          </div>
        )}

        {/* Score Readout */}
        <div className="px-3.5 py-1.5 rounded-full bg-white/95 shadow-sm border border-slate-200/80 text-slate-800">
          <span className="font-mono font-bold text-sm tabular-nums">{stats.score.toLocaleString()}</span>
        </div>
      </div>

      {/* Reflex Protocol Target Color Monitor */}
      {isReflex && targetConfig && (
        <div className="flex flex-col items-center pointer-events-none animate-in fade-in duration-200">
          <div className="flex flex-col gap-1 w-full max-w-[250px] px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs transition-colors duration-300"
                  style={{ backgroundColor: targetConfig.badgeHex }}
                />
                <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight">
                  Target: {targetConfig.name}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                {targetShiftSecs}s
              </span>
            </div>

            {/* 10-second change timer bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${shiftProgress}%`,
                  backgroundColor: targetConfig.badgeHex,
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-1 text-[9px] text-rose-600 font-bold pt-0.5">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>Tap matching only · Avoid danger bubbles</span>
            </div>
          </div>
        </div>
      )}

      {/* Target Color Transition Banner - Non-intrusive animated notification */}
      {shiftBanner && (
        <div
          key={shiftBanner.id}
          className="flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md shadow-xl border border-white/20">
            <span
              className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm animate-pulse shrink-0"
              style={{ backgroundColor: shiftBanner.badgeHex }}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Shift:
              </span>
              <span className="text-xs font-black tracking-tight text-white">
                {shiftBanner.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Combo Toast with Tiered Visual Feedback */}
      {stats.combo >= 2 && (
        <div className="flex justify-center pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm text-xs font-bold tracking-tight border ${
              multiplier >= 4
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white border-rose-300 shadow-rose-200'
                : multiplier >= 3
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-300 shadow-amber-200'
                : multiplier >= 2
                ? 'bg-gradient-to-r from-[#FFDFBA] to-[#FFE57F] text-slate-900 border-amber-200'
                : 'bg-white/90 text-slate-800 border-slate-200'
            }`}
          >
            {multiplier >= 3 ? (
              <Zap className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-bounce [animation-duration:1s]" />
            )}
            <span>{stats.combo} COMBO</span>
            <span
              className={`px-1.5 py-0.2 rounded-md font-extrabold text-[11px] ${
                multiplier >= 3 ? 'bg-white/25 text-white' : 'bg-white/80 text-slate-900'
              }`}
            >
              {multiplier}x
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
