/**
 * Procedural Web Audio synthesizer for Pop & Flow.
 * Generates tactile, organic bubble pops and gentle ambient tones without any external asset loading.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private isAmbientRunning = false;

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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playPop(combo: number, soundEnabled: boolean, hapticEnabled: boolean) {
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const duration = Math.min(18 + combo * 3, 40);
      try {
        navigator.vibrate(duration);
      } catch {
        // ignore if blocked by browser policy
      }
    }

    if (!soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Map combo to pentatonic scale
    const pitchIndex = (Math.max(1, combo) - 1) % this.pentatonicFrequencies.length;
    const baseFreq = this.pentatonicFrequencies[pitchIndex];

    // Bubble pop sound design: sine wave with rapid pitch drop and snappy exponential gain decay
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.15, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playBonus(soundEnabled: boolean, hapticEnabled: boolean) {
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 40, 35]);
      } catch {
        // ignore
      }
    }

    if (!soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [783.99, 987.77, 1174.66, 1318.51]; // G5, B5, D6, E6 chime

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.045;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  setAmbientDrone(enabled: boolean) {
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
    masterGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 2.0); // very soft relaxing background
    masterGain.connect(this.ctx.destination);
    this.ambientGain = masterGain;

    // Frequencies for a warm, meditative pastel chord (F3, C4, E4, G4)
    const chordFrequencies = [174.61, 261.63, 329.63, 392.00];

    chordFrequencies.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass filter to keep it super warm and soothing
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);

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
