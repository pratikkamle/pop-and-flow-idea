import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onHome }) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <h2 className="text-2xl font-extrabold text-slate-800 font-['Quicksand'] mb-1">
          Paused
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Take a deep breath. Ready to flow again?
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#A8E6CF] hover:bg-[#96deb8] font-bold text-slate-900 text-sm transition-transform active:scale-95 shadow-sm"
          >
            <Play className="w-4 h-4 fill-slate-900" />
            <span>Resume</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 font-bold text-slate-700 text-sm transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
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
