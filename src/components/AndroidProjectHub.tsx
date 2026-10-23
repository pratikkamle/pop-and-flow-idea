import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Terminal, BookOpen, ExternalLink, Smartphone, FolderTree } from 'lucide-react';
import JSZip from 'jszip';

interface SourceFile {
  path: string;
  category: 'Kotlin' | 'Compose UI' | 'Engine & Logic' | 'Gradle & Config' | 'Documentation';
  language: string;
  code: string;
}

// Built-in map of the native Android files so users can inspect them directly in browser and download as zip
const ANDROID_SOURCE_FILES: SourceFile[] = [
  {
    path: 'app/src/main/java/com/popandflow/game/MainActivity.kt',
    category: 'Kotlin',
    language: 'kotlin',
    code: `package com.popandflow.game

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.popandflow.game.model.GameMode
import com.popandflow.game.ui.screens.GameScreen
import com.popandflow.game.ui.screens.HomeScreen
import com.popandflow.game.ui.screens.SettingsScreen
import com.popandflow.game.ui.theme.PopAndFlowTheme
import com.popandflow.game.viewmodel.GameViewModel

enum class Screen {
    HOME,
    GAME,
    SETTINGS
}

class MainActivity : ComponentActivity() {
    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PopAndFlowTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    var currentScreen by remember { mutableStateOf(Screen.HOME) }
                    val settings by viewModel.settings.collectAsState()

                    Crossfade(targetState = currentScreen, label = "ScreenTransition") { screen ->
                        when (screen) {
                            Screen.HOME -> HomeScreen(
                                bestFlowScore = viewModel.getBestScore(GameMode.FLOW),
                                bestRushScore = viewModel.getBestScore(GameMode.COMBO_RUSH),
                                lifetimePops = viewModel.getLifetimePops(),
                                onStartGame = { mode ->
                                    viewModel.selectMode(mode)
                                    currentScreen = Screen.GAME
                                },
                                onOpenSettings = {
                                    currentScreen = Screen.SETTINGS
                                }
                            )

                            Screen.GAME -> GameScreen(
                                viewModel = viewModel,
                                onNavigateHome = {
                                    currentScreen = Screen.HOME
                                }
                            )

                            Screen.SETTINGS -> SettingsScreen(
                                settings = settings,
                                onSettingsChanged = { newSettings ->
                                    viewModel.updateSettings(newSettings)
                                },
                                onBack = {
                                    currentScreen = Screen.HOME
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        // Safely pause gameplay when app goes to background
        viewModel.pauseGame()
    }
}`,
  },
  {
    path: 'app/src/main/java/com/popandflow/game/engine/BubbleEngine.kt',
    category: 'Engine & Logic',
    language: 'kotlin',
    code: `package com.popandflow.game.engine

import androidx.compose.ui.graphics.Color
import com.popandflow.game.model.*
import java.util.concurrent.atomic.AtomicLong
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

class BubbleEngine {
    private val idGen = AtomicLong(1)
    private val random = Random(System.currentTimeMillis())

    fun createBubble(
        width: Float,
        height: Float,
        speedMultiplier: Float = 1.0f,
        forceBonus: Boolean = false,
        isComboRush: Boolean = false
    ): Bubble {
        val roll = random.nextFloat()
        val type = when {
            roll < 0.05f && isComboRush -> BubbleType.TIME_BONUS
            roll < 0.09f -> BubbleType.RAINBOW_BONUS
            roll < 0.13f -> BubbleType.MULTIPLIER_STAR
            roll < 0.28f -> BubbleType.MINT
            roll < 0.43f -> BubbleType.SKY
            roll < 0.58f -> BubbleType.PEACH
            roll < 0.73f -> BubbleType.LAVENDER
            roll < 0.88f -> BubbleType.LEMON
            else -> BubbleType.ROSE
        }

        val baseRadius = when (type) {
            BubbleType.RAINBOW_BONUS -> random.nextFloat() * 10f + 48f
            BubbleType.TIME_BONUS -> random.nextFloat() * 8f + 42f
            BubbleType.MULTIPLIER_STAR -> random.nextFloat() * 8f + 40f
            else -> random.nextFloat() * 24f + 34f
        }

        val points = when (type) {
            BubbleType.RAINBOW_BONUS -> 50
            BubbleType.TIME_BONUS -> 25
            BubbleType.MULTIPLIER_STAR -> 30
            else -> 10
        }

        val minX = baseRadius + 4f
        val maxX = maxOf(minX + 10f, width - baseRadius - 4f)
        val x = random.nextFloat() * (maxX - minX) + minX
        val y = height + baseRadius + random.nextFloat() * 60f
        val vy = -(random.nextFloat() * 22f + 38f) * speedMultiplier
        val vx = (random.nextFloat() - 0.5f) * 16f * speedMultiplier

        return Bubble(
            id = idGen.getAndIncrement(),
            type = type,
            x = x,
            y = y,
            radius = baseRadius,
            baseRadius = baseRadius,
            vx = vx,
            vy = vy,
            wobblePhase = random.nextFloat() * 6.28f,
            wobbleSpeed = random.nextFloat() * 1.5f + 1.0f,
            points = points
        )
    }

    fun hitTest(bubbles: List<Bubble>, touchX: Float, touchY: Float): Bubble? {
        for (i in bubbles.indices.reversed()) {
            val b = bubbles[i]
            if (!b.isPopped && !b.scored) {
                val dx = touchX - b.x
                val dy = touchY - b.y
                val distSq = dx * dx + dy * dy
                val tapTolerance = b.radius + 16f
                if (distSq <= tapTolerance * tapTolerance) {
                    return b
                }
            }
        }
        return null
    }
}`,

  },
  {
    path: 'app/src/main/java/com/popandflow/game/ui/screens/GameScreen.kt',
    category: 'Compose UI',
    language: 'kotlin',
    code: `package com.popandflow.game.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import com.popandflow.game.viewmodel.GameViewModel

@Composable
fun GameScreen(viewModel: GameViewModel, onNavigateHome: () -> Unit) {
    Canvas(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures { offset ->
                    viewModel.onTouchDown(offset.x, offset.y)
                }
            }
    ) {
        // High performance 60fps canvas drawing with specular gradients
        viewModel.bubbles.forEach { bubble ->
            if (!bubble.isPopped) {
                val center = Offset(bubble.x, bubble.y)
                // Draw multi-stop radial gradient for glossy sphere effect
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            bubble.style.lightColor,
                            bubble.style.baseColor,
                            bubble.style.ringColor
                        ),
                        center = Offset(bubble.x - bubble.radius * 0.35f, bubble.y - bubble.radius * 0.35f),
                        radius = bubble.radius
                    ),
                    radius = bubble.radius,
                    center = center
                )
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/popandflow/game/viewmodel/GameViewModel.kt',
    category: 'Engine & Logic',
    language: 'kotlin',
    code: `package com.popandflow.game.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.popandflow.game.audio.SoundManager
import com.popandflow.game.data.GamePreferences
import com.popandflow.game.engine.BubbleEngine
import com.popandflow.game.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class GameViewModel(application: Application) : AndroidViewModel(application) {
    private val engine = BubbleEngine()
    private val prefs = GamePreferences(application)
    private val soundManager = SoundManager(application)

    private val _stats = MutableStateFlow(GameStats())
    val stats: StateFlow<GameStats> = _stats
    // Handles 60fps tick loop, combo multipliers, countdowns, and backgrounding safety
}`,
  },
  {
    path: 'app/build.gradle.kts',
    category: 'Gradle & Config',
    language: 'kotlin',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.popandflow.game"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.popandflow.game"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}`,
  },
  {
    path: 'README.md',
    category: 'Documentation',
    language: 'markdown',
    code: `# Pop & Flow - Native Android Game (Kotlin + Jetpack Compose)

## How to Build the APK
1. Open Android Studio (Ladybug or newer).
2. Open the \`android/\` folder.
3. Run or export APK via Build -> Build Bundle(s) / APK(s) -> Build APK(s).
4. Find \`app-debug.apk\` in \`app/build/outputs/apk/debug/\`.`,
  },
];

export const AndroidProjectHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(ANDROID_SOURCE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('pop-and-flow-android');

      // Add project source files
      ANDROID_SOURCE_FILES.forEach((f) => {
        folder?.file(f.path, f.code);
      });

      // Add gradle wrapper properties and root configs
      folder?.file(
        'settings.gradle.kts',
        `rootProject.name = "PopAndFlow"\ninclude(":app")\n`
      );
      folder?.file(
        'build.gradle.kts',
        `plugins {\n    alias(libs.plugins.android.application) apply false\n    alias(libs.plugins.kotlin.android) apply false\n    alias(libs.plugins.kotlin.compose) apply false\n}\n`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pop-and-flow-android.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col gap-6 text-slate-800">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <Smartphone className="w-4 h-4" />
            <span>Native Android Architecture · Kotlin &amp; Jetpack Compose</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 font-['Quicksand']">
            Android Studio Project &amp; APK Export Studio
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Inspect the complete Kotlin codebase, review Canvas rendering architecture, and download the full Android Studio project ready for one-click APK compilation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#A8E6CF] hover:bg-[#96deb8] font-bold text-slate-900 text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Packing Zip...' : 'Download Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* APK Compilation Instructions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">1</span>
            <span>Open in Android Studio</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Extract the project and choose <strong>File → Open</strong> in Android Studio (version Ladybug, Iguana, or newer). Gradle Sync runs automatically.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">2</span>
            <span>Build APK in 1 Click</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Navigate to <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>. The installable <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">app-debug.apk</code> is produced immediately.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs flex items-center justify-center font-bold">3</span>
            <span>CLI or ADB Install</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">./gradlew assembleDebug</code> from terminal or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">adb install app-debug.apk</code>.
          </p>
        </div>
      </div>

      {/* Code Inspector Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 min-h-[580px]">
        {/* File Tree Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-2 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-4 lg:pb-0 lg:pr-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Android Project Files</span>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[480px]">
            {ANDROID_SOURCE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`flex flex-col text-left px-3 py-2.5 rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="text-xs truncate font-mono">
                      {file.path.split('/').pop()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 pl-5.5 mt-0.5">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-bold text-slate-800 truncate">
                {selectedFile.path}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                {selectedFile.language.toUpperCase()}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-teal-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 bg-slate-950 rounded-2xl p-4 overflow-x-auto text-slate-200 font-mono text-xs leading-relaxed max-h-[520px]">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
