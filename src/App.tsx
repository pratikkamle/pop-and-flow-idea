/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameMode, GameSettings, GameStats } from './game/types';
import { PhoneFrame } from './components/PhoneFrame';
import { HomeScreen } from './components/HomeScreen';
import { BubbleCanvas } from './game/BubbleCanvas';
import { GameHud } from './components/GameHud';
import { PauseModal } from './components/PauseModal';
import { SummaryModal } from './components/SummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { Gamepad2, Code2 } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  ambientSound: false,
  hapticEnabled: true,
  reducedMotion: false,
  bubbleDensity: 'normal',
  bubbleSpeed: 'balanced',
};

const DEFAULT_STATS: GameStats = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  totalPops: 0,
  bonusPops: 0,
  remainingTime: 30,
  isPaused: false,
  isGameOver: false,
  isNewPersonalBest: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'android_project'>('game');
  const [screen, setScreen] = useState<'home' | 'game' | 'settings'>('home');
  const [mode, setMode] = useState<GameMode>('flow');

  // Persistence state
  const [bestFlowScore, setBestFlowScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('pop_flow_best_flow') || '0', 10);
  });
  const [bestRushScore, setBestRushScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('pop_flow_best_rush') || '0', 10);
  });
  const [lifetimePops, setLifetimePops] = useState<number>(() => {
    return parseInt(localStorage.getItem('pop_flow_lifetime_pops') || '0', 10);
  });
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('pop_flow_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  // Sync settings to localStorage
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pop_flow_settings', JSON.stringify(newSettings));
  };

  const handleResetScores = () => {
    setBestFlowScore(0);
    setBestRushScore(0);
    setLifetimePops(0);
    localStorage.removeItem('pop_flow_best_flow');
    localStorage.removeItem('pop_flow_best_rush');
    localStorage.removeItem('pop_flow_lifetime_pops');
  };

  // Start a new game mode
  const handleStartMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setStats({
      ...DEFAULT_STATS,
      remainingTime: selectedMode === 'combo_rush' ? 30 : 0,
    });
    setScreen('game');
  };

  const handleRestart = () => {
    setStats({
      ...DEFAULT_STATS,
      remainingTime: mode === 'combo_rush' ? 30 : 0,
    });
  };

  const handleReturnHome = () => {
    setStats((prev) => ({ ...prev, isPaused: false }));
    setScreen('home');
  };

  // Safe backgrounding: Auto-pause when page/tab loses visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && screen === 'game' && !stats.isGameOver) {
        setStats((prev) => ({ ...prev, isPaused: true }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [screen, stats.isGameOver]);

  // Combo Rush countdown timer
  useEffect(() => {
    if (screen !== 'game' || mode !== 'combo_rush' || stats.isPaused || stats.isGameOver) {
      return;
    }

    const timer = setInterval(() => {
      setStats((prev) => {
        const nextTime = prev.remainingTime - 0.2;
        if (nextTime <= 0) {
          clearInterval(timer);

          // Check personal best
          const currentBest = parseInt(localStorage.getItem('pop_flow_best_rush') || '0', 10);
          const isBest = prev.score > currentBest;
          if (isBest) {
            localStorage.setItem('pop_flow_best_rush', prev.score.toString());
            setBestRushScore(prev.score);
          }

          // Accumulate lifetime pops
          const updatedLifetime = (parseInt(localStorage.getItem('pop_flow_lifetime_pops') || '0', 10)) + prev.totalPops;
          localStorage.setItem('pop_flow_lifetime_pops', updatedLifetime.toString());
          setLifetimePops(updatedLifetime);

          return {
            ...prev,
            remainingTime: 0,
            isGameOver: true,
            isNewPersonalBest: isBest,
          };
        }
        return {
          ...prev,
          remainingTime: nextTime,
        };
      });
    }, 200);

    return () => clearInterval(timer);
  }, [screen, mode, stats.isPaused, stats.isGameOver]);

  // In Flow Mode, record high score when returning or continuously
  useEffect(() => {
    if (mode === 'flow' && stats.score > bestFlowScore) {
      setBestFlowScore(stats.score);
      localStorage.setItem('pop_flow_best_flow', stats.score.toString());
    }
  }, [mode, stats.score, bestFlowScore]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Application Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A8E6CF] to-[#BAE1FF] flex items-center justify-center font-bold text-slate-800 text-sm shadow-xs">
            P&amp;F
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-800 tracking-tight">
              Pop &amp; Flow
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Native Android Casual Game (Kotlin &amp; Jetpack Compose)
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'game'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-teal-600" />
            <span>Play Game</span>
          </button>
          <button
            onClick={() => setActiveTab('android_project')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'android_project'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>Android Project &amp; APK Studio</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {activeTab === 'game' ? (
          <PhoneFrame activeScreenTitle={screen}>
            {/* View 1: Home Screen */}
            {screen === 'home' && (
              <HomeScreen
                bestFlowScore={bestFlowScore}
                bestRushScore={bestRushScore}
                lifetimePops={lifetimePops}
                onStartMode={handleStartMode}
                onOpenSettings={() => setScreen('settings')}
              />
            )}

            {/* View 2: Gameplay Screen */}
            {screen === 'game' && (
              <div className="relative w-full h-full overflow-hidden select-none">
                {/* 60fps Canvas engine */}
                <BubbleCanvas
                  mode={mode}
                  settings={settings}
                  stats={stats}
                  onUpdateStats={setStats}
                  isPaused={stats.isPaused}
                  isGameOver={stats.isGameOver}
                />

                {/* Game HUD Overlay */}
                <GameHud
                  mode={mode}
                  stats={stats}
                  onPause={() => setStats((prev) => ({ ...prev, isPaused: true }))}
                />

                {/* Pause Modal Overlay */}
                {stats.isPaused && (
                  <PauseModal
                    onResume={() => setStats((prev) => ({ ...prev, isPaused: false }))}
                    onRestart={handleRestart}
                    onHome={handleReturnHome}
                  />
                )}

                {/* Round Summary Modal */}
                {stats.isGameOver && (
                  <SummaryModal
                    stats={stats}
                    bestScore={mode === 'combo_rush' ? bestRushScore : bestFlowScore}
                    onReplay={handleRestart}
                    onHome={handleReturnHome}
                  />
                )}
              </div>
            )}

            {/* View 3: Settings Screen */}
            {screen === 'settings' && (
              <SettingsModal
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClose={() => setScreen('home')}
                onResetScores={handleResetScores}
              />
            )}
          </PhoneFrame>
        ) : (
          <AndroidProjectHub />
        )}
      </main>
    </div>
  );
}
