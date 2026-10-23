import React from 'react';
import { Play, Timer, Settings as SettingsIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { GameMode } from '../game/types';

interface HomeScreenProps {
  bestFlowScore: number;
  bestRushScore: number;
  lifetimePops: number;
  onStartMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  bestFlowScore,
  bestRushScore,
  lifetimePops,
  onStartMode,
  onOpenSettings,
}) => {
  return (
    <div className="relative flex flex-col justify-between w-full h-full p-6 text-slate-800">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wide uppercase">
          <span>Native Compose UI</span>
          <span>·</span>
          <span>Offline</span>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm border border-slate-200/60 flex items-center justify-center transition-transform active:scale-95 text-slate-700"
          title="Game Settings"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Branding */}
      <div className="flex flex-col items-center text-center my-auto py-4">
        {/* Playful Floating Bubble Trio */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#A8E6CF] shadow-inner shadow-white/40 ring-2 ring-white/80 animate-bounce [animation-duration:2.5s]" />
          <div className="w-10 h-10 rounded-full bg-[#BAE1FF] shadow-inner shadow-white/50 ring-2 ring-white/80 animate-bounce [animation-duration:2s]" />
          <div className="w-7 h-7 rounded-full bg-[#FFDFBA] shadow-inner shadow-white/40 ring-2 ring-white/80 animate-bounce [animation-duration:3s]" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 font-['Quicksand'] mb-1">
          Pop &amp; Flow
        </h1>
        <p className="text-sm font-medium text-slate-600 max-w-[240px]">
          Satisfying pastel bubble popping for quick, mindful breaks
        </p>
      </div>

      {/* Mode Action Cards */}
      <div className="flex flex-col gap-3.5 w-full">
        {/* Flow Mode */}
        <button
          onClick={() => onStartMode('flow')}
          className="group relative flex items-center gap-4 w-full p-4 rounded-2xl bg-white/95 hover:bg-white shadow-md border border-slate-100 transition-all active:scale-[0.98] text-left"
        >
          <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-[#A8E6CF] to-[#E8FBF4] flex items-center justify-center shrink-0 shadow-sm border border-[#A8E6CF]/30">
            <Play className="w-6 h-6 text-slate-800 fill-slate-800 ml-0.5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-base">Flow Mode</span>
              {bestFlowScore > 0 && (
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Best {bestFlowScore}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Endless serene play · No timer · Zero stress
            </p>
          </div>
        </button>

        {/* Combo Rush Mode */}
        <button
          onClick={() => onStartMode('combo_rush')}
          className="group relative flex items-center gap-4 w-full p-4 rounded-2xl bg-white/95 hover:bg-white shadow-md border border-slate-100 transition-all active:scale-[0.98] text-left"
        >
          <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-[#BAE1FF] to-[#EFF7FF] flex items-center justify-center shrink-0 shadow-sm border border-[#BAE1FF]/30">
            <Timer className="w-6 h-6 text-slate-800" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-base">Combo Rush</span>
              {bestRushScore > 0 && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Best {bestRushScore}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              30-second challenge · Multipliers &amp; +time bubbles
            </p>
          </div>
        </button>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-center gap-2 pt-4 text-xs text-slate-400 font-medium text-center">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>{lifetimePops.toLocaleString()} bubbles popped all-time</span>
      </div>
    </div>
  );
};
