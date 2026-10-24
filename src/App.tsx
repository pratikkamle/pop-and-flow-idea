/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, GameSettings, GameStats, DailyChallenge, Achievement } from './game/types';
import { PhoneFrame } from './components/PhoneFrame';
import { HomeScreen } from './components/HomeScreen';
import { BubbleCanvas } from './game/BubbleCanvas';
import { GameHud } from './components/GameHud';
import { PauseModal } from './components/PauseModal';
import { SummaryModal } from './components/SummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { loadDailyChallenge, recordScoreForDailyChallenge } from './game/dailyChallenge';
import { loadAchievements, checkAndUnlockAchievements } from './game/achievements';
import { soundEngine } from './game/audio';
import confetti from 'canvas-confetti';
import { Gamepad2, Code2, Trophy } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  soundVolume: 0.8,
  ambientSound: false,
  hapticEnabled: true,
  reducedMotion: false,
  bubbleDensity: 'normal',
  bubbleSpeed: 'balanced',
  theme: 'spring',
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
  const [screen, setScreen] = useState<'home' | 'game' | 'settings' | 'achievements'>('home');
  const [mode, setMode] = useState<GameMode>('flow');
  const [flowPace, setFlowPace] = useState<number>(1.0);

  // Daily Challenge state
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(() => loadDailyChallenge());

  // Achievements state
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);

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
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const baseDefaults: GameSettings = {
      ...DEFAULT_SETTINGS,
      reducedMotion: prefersReduced,
    };

    try {
      const saved = localStorage.getItem('pop_flow_settings');
      return saved ? { ...baseDefaults, ...JSON.parse(saved) } : baseDefaults;
    } catch {
      return baseDefaults;
    }
  });

  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  // Sync volume on change
  useEffect(() => {
    soundEngine.setVolume(settings.soundVolume ?? 0.8);
  }, [settings.soundVolume]);

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
    localStorage.removeItem('pop_flow_achievements');
    setAchievements(loadAchievements());
  };

  // Start a new game mode
  const handleStartMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setFlowPace(1.0);
    setStats({
      ...DEFAULT_STATS,
      remainingTime: selectedMode === 'combo_rush' ? 30 : 0,
    });
    setScreen('game');
  };

  const handleRestart = () => {
    setFlowPace(1.0);
    setStats({
      ...DEFAULT_STATS,
      remainingTime: mode === 'combo_rush' ? 30 : 0,
    });
  };

  const handleReturnHome = () => {
    setStats((prev) => ({ ...prev, isPaused: false }));
    setScreen('home');
  };

  // Safe backgrounding: Auto-pause when page/tab loses visibility or window loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && screen === 'game' && !stats.isGameOver) {
        setStats((prev) => ({ ...prev, isPaused: true }));
      }
    };

    const handleBlur = () => {
      if (screen === 'game' && !stats.isGameOver) {
        setStats((prev) => ({ ...prev, isPaused: true }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screen, stats.isGameOver]);

  // Track Daily Challenge progress as score accumulates
  useEffect(() => {
    if (stats.score > 0) {
      const { challenge, justCompleted } = recordScoreForDailyChallenge(stats.score);
      setDailyChallenge(challenge);

      if (justCompleted) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.35 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
        });
      }
    }
  }, [stats.score]);

  // Check and unlock Achievements dynamically
  useEffect(() => {
    const { updatedList, newlyUnlocked } = checkAndUnlockAchievements(achievements, {
      lifetimePops: lifetimePops + stats.totalPops,
      maxCombo: stats.maxCombo,
      flowScore: mode === 'flow' ? stats.score : bestFlowScore,
      rushScore: mode === 'combo_rush' ? stats.score : bestRushScore,
      bonusPops: stats.bonusPops,
      dailyStreak: dailyChallenge.streak,
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedList);
      const first = newlyUnlocked[0];
      setUnlockedToast(first);
      soundEngine.playBonus(settings.soundEnabled, settings.hapticEnabled, settings.soundVolume);
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.2 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });
      setTimeout(() => {
        setUnlockedToast(null);
      }, 3500);
    }
  }, [
    lifetimePops,
    stats.totalPops,
    stats.maxCombo,
    stats.score,
    stats.bonusPops,
    dailyChallenge.streak,
    mode,
    bestFlowScore,
    bestRushScore,
    settings.soundEnabled,
    settings.hapticEnabled,
    settings.soundVolume,
    achievements,
  ]);

  // Combo Rush countdown timer: counts down 30s of ACTIVE gameplay only
  useEffect(() => {
    if (screen !== 'game' || mode !== 'combo_rush' || stats.isPaused || stats.isGameOver) {
      return;
    }

    const timer = setInterval(() => {
      setStats((prev) => {
        const nextTime = Math.max(0, prev.remainingTime - 0.2);
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
          const updatedLifetime =
            parseInt(localStorage.getItem('pop_flow_lifetime_pops') || '0', 10) + prev.totalPops;
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

  // In Flow Mode, record high score and lifetime pops continuously
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
          <PhoneFrame activeScreenTitle={screen} theme={settings.theme || 'spring'}>
            {/* Real-time Achievement Unlocked Toast Banner */}
            {unlockedToast && (
              <div className="absolute top-12 inset-x-4 z-50 flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-amber-200/80 animate-in slide-in-from-top-4 duration-300">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Achievement Unlocked!
                  </p>
                  <p className="text-xs font-bold text-slate-800 truncate">{unlockedToast.title}</p>
                </div>
              </div>
            )}

            {/* View 1: Home Screen */}
            {screen === 'home' && (
              <HomeScreen
                bestFlowScore={bestFlowScore}
                bestRushScore={bestRushScore}
                lifetimePops={lifetimePops}
                dailyChallenge={dailyChallenge}
                unlockedAchievementsCount={achievements.filter((a) => a.unlocked).length}
                totalAchievementsCount={achievements.length}
                onStartMode={handleStartMode}
                onOpenSettings={() => setScreen('settings')}
                onOpenAchievements={() => setScreen('achievements')}
              />
            )}

            {/* View 2: Gameplay Screen */}
            {screen === 'game' && (
              <div className="relative w-full h-full overflow-hidden select-none">
                {/* 60fps Canvas engine with dynamic difficulty & theme colors */}
                <BubbleCanvas
                  mode={mode}
                  settings={settings}
                  stats={stats}
                  onUpdateStats={setStats}
                  isPaused={stats.isPaused}
                  isGameOver={stats.isGameOver}
                  onFlowPaceChange={setFlowPace}
                />

                {/* Game HUD Overlay */}
                <GameHud
                  mode={mode}
                  stats={stats}
                  onPause={() => setStats((prev) => ({ ...prev, isPaused: true }))}
                  flowPaceMultiplier={flowPace}
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

            {/* View 4: Achievements Screen */}
            {screen === 'achievements' && (
              <AchievementsModal
                achievements={achievements}
                onClose={() => setScreen('home')}
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
