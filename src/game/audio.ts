/**
 * Procedural Web Audio synthesizer for Pop & Flow.
 * Generates tactile, organic bubble pops, harmonic kalimba-like chimes, and gentle ambient drones
 * without requiring any external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private isAmbientRunning = false;
  private currentVolume = 0.8;

  // Gentle pentatonic chime frequencies (C5, D5, E5, G5, A5, C6, D6)
  private pentatonicFrequencies = [
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
    1046.50, // C6
    1174.66, // D6
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.ambientGain && this.ctx && this.isAmbientRunning) {
      this.ambientGain.gain.setValueAtTime(
        0.035 * this.currentVolume,
        this.ctx.currentTime
      );
    }
  }

  playPop(combo: number, soundEnabled: boolean, hapticEnabled: boolean, volume = 0.8) {
    // 1. Pleasant subtle haptic feedback
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const duration = Math.min(14 + Math.min(combo, 10) * 1.5, 28);
      try {
        navigator.vibrate(Math.round(duration));
      } catch {
        // Safe fallback if blocked by browser policy
      }
    }

    if (!soundEnabled || volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Map combo count to peaceful pentatonic scale
    const pitchIndex = (Math.max(1, combo) - 1) % this.pentatonicFrequencies.length;
    const baseFreq = this.pentatonicFrequencies[pitchIndex];

    // Smooth rounded pop tone: sine wave with subtle rapid pitch sweep down to mimic water droplet
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.18, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, now + 0.075);

    // Warm low-pass filter so highs never sound piercing
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    const masterVol = Math.max(0.01, Math.min(1, volume));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.32 * masterVol, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.095);
  }

  playBonus(soundEnabled: boolean, hapticEnabled: boolean, volume = 0.8) {
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([16, 35, 24]);
      } catch {
        // Safe fallback
      }
    }

    if (!soundEnabled || volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const masterVol = Math.max(0.01, Math.min(1, volume));
    const notes = [783.99, 987.77, 1174.66, 1318.51]; // G5, B5, D6, E6 shimmer chord

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const startTime = now + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.18 * masterVol, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.24);
    });
  }

  setAmbientDrone(enabled: boolean, volume = 0.8) {
    this.currentVolume = volume;
    if (!enabled) {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      }
      setTimeout(() => {
        this.stopAmbient();
      }, 900);
      return;
    }

    if (this.isAmbientRunning) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopAmbient();
    this.isAmbientRunning = true;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.035 * this.currentVolume, this.ctx.currentTime + 2.5);
    masterGain.connect(this.ctx.destination);
    this.ambientGain = masterGain;

    // Meditative F-Major 9 chord (F3, C4, E4, G4)
    const chordFrequencies = [174.61, 261.63, 329.63, 392.0];

    chordFrequencies.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);

      osc.start();
      this.ambientOscs.push(osc);
    });
  }

  private stopAmbient() {
    this.ambientOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.ambientOscs = [];
    this.isAmbientRunning = false;
  }
}

export const soundEngine = new SoundEngine();
