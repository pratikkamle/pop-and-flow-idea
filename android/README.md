# Pop & Flow - Native Android Game (Kotlin + Jetpack Compose)

A relaxing, colorful casual bubble-popping game built with **Kotlin** and **Jetpack Compose**. Players tap floating pastel bubbles to pop them, earn points, and build combos in a serene, cheerful environment.

---

## 📱 Features

- **Jetpack Compose Canvas Graphics**: High-performance rendering of multi-layered glossy bubbles with specular radial gradients, outer aura glows, inner 3D reflection highlights, dynamic wobble physics, expanding shockwave ripples, and particle bursts.
- **Two Game Modes**:
  - **Flow Mode**: Endless zen popping session with no timer, no game-over state, and calm ambient counters.
  - **Combo Rush**: 30-second rapid challenge with combo multiplier tiering (2x, 3x, 4x), bonus time bubbles (+3s), rainbow bubbles, and personal best tracking.
- **Dynamic Bubble Types**:
  - Regular pastel bubbles (Mint, Sky Blue, Peach, Lavender, Lemon, Rose)
  - 🌈 **Rainbow Bonus**: High-point iridescent bubble triggering festive particle cascades.
  - ⏱️ **Time Bonus**: Extends Combo Rush clock by +3 seconds.
  - ⭐ **Multiplier Star**: Instantly boosts combo multiplier rate.
- **Synthesized Audio & Haptics**: Procedural pentatonic bubble pop tones generated at runtime with zero external audio assets; authentic Android haptic vibration feedback with combo-scaled intensity.
- **Local Persistence**: Stores high scores, lifetime pops, and custom preferences in `SharedPreferences`.
- **Sensory Settings**: Toggle sound, haptics, reduced motion, bubble density, and float velocity.
- **Safe Lifecycle Management**: Automatically pauses gameplay when backgrounded (`onPause`).
- **Offline & Private**: No ads, no tracking, no backend dependencies, 100% offline.

---

## 🛠️ Project Structure

```
android/
├── app/
│   ├── build.gradle.kts                   # Module dependencies & SDK config (Compile SDK 35, Min SDK 26)
│   └── src/main/
│       ├── AndroidManifest.xml            # Portrait lock & vibrate permissions
│       ├── res/values/                    # Strings, colors, and theme styling
│       └── java/com/popandflow/game/
│           ├── MainActivity.kt            # App navigation & lifecycle pause/resume
│           ├── model/
│           │   ├── Bubble.kt              # Bubble data class, particle entities & color styles
│           │   ├── GameMode.kt            # Game modes (Flow, Combo Rush) & stats snapshot
│           │   └── GameSettings.kt        # Sensory & pacing settings
│           ├── engine/
│           │   └── BubbleEngine.kt        # Spawning, floating buoyancy, bounce & hit detection
│           ├── audio/
│           │   └── SoundManager.kt        # Procedural tone synthesis & haptic vibration
│           ├── data/
│           │   └── GamePreferences.kt     # SharedPreferences persistence
│           ├── viewmodel/
│           │   └── GameViewModel.kt       # 60fps game loop, timer, and StateFlow
│           └── ui/
│               ├── theme/                 # Pastel palette & typography
│               ├── screens/
│               │   ├── HomeScreen.kt      # Title lockup & mode selection
│               │   ├── GameScreen.kt      # Jetpack Compose Canvas gameplay & HUD
│               │   └── SettingsScreen.kt  # Sensory feedback toggles
│               └── components/
│                   └── RoundSummaryDialog.kt # End-of-round scores & replay
├── gradle/libs.versions.toml              # Modern Gradle Version Catalog
├── build.gradle.kts                       # Root build configuration
├── settings.gradle.kts                    # Root project settings
└── gradle.properties                      # JVM args and AndroidX flags
```

---

## 🚀 How to Build the Installable Android APK

### Option A: Using Android Studio (Recommended)

1. **Open Android Studio** (Ladybug, Iguana, Hedgehog, or newer).
2. Select **Open** and choose the `android/` directory in this project.
3. Wait for Gradle Sync to complete (Android Studio will automatically download the Android SDK 35 and Compose dependencies).
4. Connect an Android phone via USB (with USB Debugging enabled) or start an Android Virtual Device (AVD).
5. Click the green **Run (▶)** button in the top toolbar to install and run the app directly on your device.
6. To export the standalone APK file:
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
   - Once compilation finishes, click **locate** in the popup notification to find `app-debug.apk` in:
     `android/app/build/outputs/apk/debug/app-debug.apk`.

### Option B: Command Line with Gradle

Ensure you have the Android SDK configured (or `ANDROID_HOME` exported) and JDK 17+:

```bash
cd android

# Grant execution rights to the Gradle wrapper (if needed)
chmod +x gradlew

# Build the debug APK
./gradlew assembleDebug
```

The APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

To install on a connected Android phone:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
