import React, { useState } from 'react';
import { Maximize2, Minimize2, Wifi, Battery } from 'lucide-react';
import { ThemeId } from '../game/types';
import { THEMES } from '../game/themes';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  theme?: ThemeId;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, activeScreenTitle, theme = 'spring' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const themeConfig = THEMES[theme] || THEMES.spring;


  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen p-2 sm:p-6 bg-slate-900/5 select-none overflow-hidden">
      {/* Viewport Mode Switcher in corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-md rounded-full px-3 py-1.5 border border-slate-200/80 text-xs text-slate-700">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 font-medium hover:text-slate-900 transition-colors"
          title={isFullscreen ? 'Switch to Android Frame view' : 'Switch to Fullscreen view'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Phone Frame View</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Fullscreen Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Frame Container */}
      <div
        className={`relative transition-all duration-300 ease-out flex flex-col overflow-hidden ${
          isFullscreen
            ? 'w-full h-screen rounded-none max-w-none shadow-none border-none'
            : 'w-full max-w-[412px] h-[860px] max-h-[92vh] rounded-[44px] shadow-2xl border-[10px] border-slate-800 bg-slate-950'
        }`}
      >
        {/* Android Punch Hole & Status Bar */}
        <div
          className={`relative z-30 flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold text-slate-700 select-none ${
            isFullscreen ? 'bg-transparent' : 'bg-transparent'
          }`}
        >
          {/* Status bar Clock */}
          <span className="font-mono text-[13px] tracking-tight">{currentTime}</span>

          {/* Camera Punch Hole (in phone frame mode) */}
          {!isFullscreen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-4 h-4 bg-slate-900 rounded-full border-2 border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
            </div>
          )}

          {/* System Icons (Cellular, Wifi, Battery) */}
          <div className="flex items-center gap-2 text-slate-600">
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">98%</span>
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Screen Viewport with smooth pastel gradient */}
        <div className={`relative flex-1 w-full h-full overflow-hidden transition-colors duration-500 ${themeConfig.phoneBgClass}`}>
          {children}
        </div>


        {/* Android Bottom Gesture Navigation Pill */}
        {!isFullscreen && (
          <div className="relative z-30 flex items-center justify-center h-5 w-full bg-transparent pb-1">
            <div className="w-32 h-1 bg-slate-400/60 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
