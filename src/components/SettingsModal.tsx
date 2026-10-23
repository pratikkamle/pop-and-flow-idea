import React, { useState } from 'react';
import { ArrowLeft, Volume2, Sparkles, Smartphone, Eye, Sliders, Trash2 } from 'lucide-react';
import { BubbleDensity, BubbleSpeed, GameSettings } from '../game/types';
import { soundEngine } from '../game/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onResetScores: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetScores,
}) => {
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleToggleSound = (enabled: boolean) => {
    onUpdateSettings({ ...settings, soundEnabled: enabled });
  };

  const handleToggleAmbient = (enabled: boolean) => {
    onUpdateSettings({ ...settings, ambientSound: enabled });
    soundEngine.setAmbientDrone(enabled);
  };

  const handleToggleHaptic = (enabled: boolean) => {
    onUpdateSettings({ ...settings, hapticEnabled: enabled });
  };

  const handleToggleReducedMotion = (enabled: boolean) => {
    onUpdateSettings({ ...settings, reducedMotion: enabled });
  };

  const handleDensity = (density: BubbleDensity) => {
    onUpdateSettings({ ...settings, bubbleDensity: density });
  };

  const handleSpeed = (speed: BubbleSpeed) => {
    onUpdateSettings({ ...settings, bubbleSpeed: speed });
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#FAF5FF] flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200/60 flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-extrabold text-slate-800 font-['Quicksand']">
          Settings
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Sensory Card */}
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Audio &amp; Tactile
          </span>

          {/* Sound FX */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Pop Chimes</p>
                <p className="text-[11px] text-slate-500">Procedural pentatonic tones</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleToggleSound(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* Ambient Zen Drone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Zen Background Drone</p>
                <p className="text-[11px] text-slate-500">Gentle calming ambient harmony</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.ambientSound}
              onChange={(e) => handleToggleAmbient(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* Haptic Feedback */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Haptic Vibration</p>
                <p className="text-[11px] text-slate-500">Android device vibration pulse</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticEnabled}
              onChange={(e) => handleToggleHaptic(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          <div className="h-px bg-slate-100" />

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Reduced Motion</p>
                <p className="text-[11px] text-slate-500">Mutes wobble physics &amp; bursts</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => handleToggleReducedMotion(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Pacing & Physics Card */}
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Bubble Pacing
          </span>

          {/* Density */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1.5">Bubble Density</p>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl">
              {(['cozy', 'normal', 'dense'] as BubbleDensity[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDensity(d)}
                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    settings.bubbleDensity === d
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1.5">Float Speed</p>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl">
              {(['gentle', 'balanced', 'lively'] as BubbleSpeed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeed(s)}
                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    settings.bubbleSpeed === s
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Scores Card */}
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Reset High Scores</p>
            <p className="text-[11px] text-slate-500">Clears saved local records</p>
          </div>

          {resetConfirmed ? (
            <button
              onClick={() => {
                onResetScores();
                setResetConfirmed(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs"
            >
              Confirm Clear
            </button>
          ) : (
            <button
              onClick={() => setResetConfirmed(true)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium"
              title="Reset scores"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
