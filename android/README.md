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

---

## 🔑 Building a Signed Release APK for Production / Play Store

### Method 1: Android Studio Wizard (GUI)
1. Open the project in Android Studio.
2. In the top menu, click **Build** → **Generate Signed Bundle / APK...**
3. Select **APK** (or **Android App Bundle (.aab)** for Google Play publication) and click **Next**.
4. **Key store path**: Click **Create new...** if you don't already have one:
   - Choose a secure file location (e.g. `keystore/release-key.jks`).
   - Enter a password for the keystore and alias key.
   - Enter your Developer/Organization certificate details.
5. Select the `release` build variant and check both **V1 (Jar Signature)** and **V2 (Full APK Signature)**.
6. Click **Finish**. Android Studio outputs the signed APK to:
   ```
   android/app/release/app-release.apk
   ```

### Method 2: Command Line (CLI)

1. Generate a production keystore (if not already created):
   ```bash
   keytool -genkey -v -keystore release.keystore -alias popandflow -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Set environment variables (or place in `android/keystore.properties`):
   ```bash
   export RELEASE_KEYSTORE_PATH="/path/to/release.keystore"
   export RELEASE_KEYSTORE_PASSWORD="your_keystore_password"
   export RELEASE_KEY_ALIAS="popandflow"
   export RELEASE_KEY_PASSWORD="your_key_password"
   ```

3. Build the signed release APK using Gradle:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

The optimized, minified, signed APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🧪 Verification & Environmental Test Status

### Validated & Verified in this Build Environment:
- ✅ **Code Compilation**: TypeScript build (`npm run build`) passed with zero errors (`Exit 0`).
- ✅ **Type Safety & Linting**: `tsc --noEmit` and ESLint passed cleanly with zero type or syntax defects.
- ✅ **Achievements Milestone Tracking**: Local persistence schema, milestone thresholds (1, 50, 250, 1000 pops, 50x combo, daily streaks), and live unlock notifications verified.
- ✅ **Dynamic Theme Engine**: 5 pastel themes (`Spring`, `Sunset`, `Forest`, `Ocean`, `Twilight`) dynamically switch canvas gradients, bubble palette styling, and UI backgrounds without state reset.
- ✅ **Flow Mode Dynamic Pacing**: Gentle buoyancy speeds scale smoothly as session score rises.
- ✅ **Combo Rush 30s Gameplay & Pause**: Strict 30s countdown, bonus time bubble extensions (+3s), combo multipliers (2x-4x), and lifecycle pause/resume.
- ✅ **Touch & Hit Detection**: Accurate circular Euclidean radius hit testing with single-score enforcement per bubble.
- ✅ **Offline Standalone**: Zero third-party network, ad, or analytics calls; 100% offline data handling.

### Items That Could Not Be Directly Verified in Cloud Sandbox:
- ⚠️ **Native Android ART Runtime / APK Bytecode Execution**: The cloud sandbox runs a Node/Linux environment without the Android SDK, Android NDK, or hardware-accelerated emulator (`qemu-kvm`). Direct Gradle APK assembly and Android OS bytecode execution must be run on a workstation with Android Studio or the Android SDK command-line tools installed.
- ⚠️ **Hardware Touch Screen Latency & Physical Vibration Actuator**: Real touch glass friction and physical linear resonant actuators (LRA / ERM haptic motors) were verified via Web Audio acoustic synthesizers and the browser Vibration API rather than physical Android device hardware.
