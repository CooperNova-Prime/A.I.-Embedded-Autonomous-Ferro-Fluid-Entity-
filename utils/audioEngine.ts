/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class ArcaneAudioEngine {
  private ctx: AudioContext | null = null;
  private oscDrone: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;
  private gainDrone: GainNode | null = null;
  private gainMaster: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isRunning = false;

  // Voice / Speech input components
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private freqBuffer: Uint8Array | null = null;
  private timeBuffer: Uint8Array | null = null;
  private isMicActive = false;
  private simulatedVoiceLevel = 0.0;
  private lastSimulatedTime = 0;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();

          this.gainMaster = this.ctx.createGain();
          this.gainMaster.gain.setValueAtTime(0.2, this.ctx.currentTime);
          this.gainMaster.connect(this.ctx.destination);

          this.filter = this.ctx.createBiquadFilter();
          this.filter.type = 'lowpass';
          this.filter.frequency.setValueAtTime(320, this.ctx.currentTime);
          this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime);
          this.filter.connect(this.gainMaster);

          this.gainDrone = this.ctx.createGain();
          this.gainDrone.gain.setValueAtTime(0.0, this.ctx.currentTime);
          this.gainDrone.connect(this.filter);
        }
      } catch (err) {
        console.warn('AudioContext initialization unavailable or deferred:', err);
      }
    }
  }

  public start(baseFreq = 84) {
    this.init();
    if (!this.ctx || this.isRunning) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;

    // Sub-bass magnetic resonance
    this.oscDrone = this.ctx.createOscillator();
    this.oscDrone.type = 'sine';
    this.oscDrone.frequency.setValueAtTime(baseFreq, now);

    // Ethereal fifth harmonic
    this.oscHarmonic = this.ctx.createOscillator();
    this.oscHarmonic.type = 'triangle';
    this.oscHarmonic.frequency.setValueAtTime(baseFreq * 1.5, now);

    if (this.gainDrone) {
      this.oscDrone.connect(this.gainDrone);
      this.oscHarmonic.connect(this.gainDrone);

      this.gainDrone.gain.cancelScheduledValues(now);
      this.gainDrone.gain.setValueAtTime(0.001, now);
      this.gainDrone.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
    }

    this.oscDrone.start();
    this.oscHarmonic.start();
    this.isRunning = true;
  }

  public stop() {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    if (this.gainDrone) {
      this.gainDrone.gain.cancelScheduledValues(now);
      this.gainDrone.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    }
    setTimeout(() => {
      try {
        this.oscDrone?.stop();
        this.oscHarmonic?.stop();
        this.oscDrone?.disconnect();
        this.oscHarmonic?.disconnect();
      } catch {
        // ignore already stopped
      }
      this.isRunning = false;
    }, 600);
  }

  public setVolume(vol: number) {
    if (!this.ctx || !this.gainMaster) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.gainMaster.gain.setTargetAtTime(clamped * 0.4, this.ctx.currentTime, 0.05);
  }

  public updateFrequency(freq: number) {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    const mapped = 55 + freq * 18; // 55Hz - 145Hz ambient magnetic drone
    this.oscDrone?.frequency.setTargetAtTime(mapped, now, 0.1);
    this.oscHarmonic?.frequency.setTargetAtTime(mapped * 1.5, now, 0.1);
    this.filter?.frequency.setTargetAtTime(mapped * 4, now, 0.1);
  }

  public playMagneticPulse(intensity = 1.0) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * intensity, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(0.15 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      if (this.gainMaster) {
        gain.connect(this.gainMaster);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio playback silently suppressed if context is inactive
    }
  }

  public playDropRipple() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      if (this.gainMaster) {
        gain.connect(this.gainMaster);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio playback silently suppressed
    }
  }

  /**
   * Play crisp elastic rebound ping when particles or probes bounce off the solid ferrofluid surface
   */
  public playSurfaceBounce(intensity = 1.0) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const basePitch = 320 + Math.random() * 180;
      osc.frequency.setValueAtTime(basePitch * intensity, now);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 1.8, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);

      const amp = Math.min(0.12, 0.05 * intensity);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.16);

      osc.connect(gain);
      if (this.gainMaster) {
        gain.connect(this.gainMaster);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Audio playback silently suppressed
    }
  }

  /**
   * Activate live microphone capture for voice / speech reactive spikes & ripples
   */
  public async startVoiceInput(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume().catch(() => {});
    }

    try {
      if (this.micStream) {
        this.stopVoiceInput();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.75;

      this.freqBuffer = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeBuffer = new Uint8Array(this.analyser.frequencyBinCount);

      // Connect mic to analyser only (NOT to destination to prevent feedback howl)
      this.micSource.connect(this.analyser);
      this.isMicActive = true;
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or audio input unavailable:', err);
      this.isMicActive = false;
      return false;
    }
  }

  public stopVoiceInput(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {}
      this.micSource = null;
    }
    this.analyser = null;
    this.isMicActive = false;
  }

  public getIsVoiceActive(): boolean {
    return this.isMicActive;
  }

  /**
   * Extract live vocal metrics: overall volume RMS, bass (pitch resonance), mid (speech formant), and treble (sibilance)
   */
  public getVoiceMetrics(sensitivity = 1.0): {
    volume: number;
    bass: number;
    mid: number;
    treble: number;
    waveform: number;
  } {
    if (this.isMicActive && this.analyser && this.freqBuffer && this.timeBuffer) {
      this.analyser.getByteFrequencyData(this.freqBuffer);
      this.analyser.getByteTimeDomainData(this.timeBuffer);

      const binCount = this.freqBuffer.length;
      let totalFreq = 0;
      let bassFreq = 0;
      let midFreq = 0;
      let trebleFreq = 0;

      // Frequency bins (bin bandwidth ≈ 44100 / 512 ≈ 86 Hz)
      const bassEnd = Math.floor(binCount * 0.12); // ~0 to 250 Hz (fundamental vocal tones)
      const midEnd = Math.floor(binCount * 0.45);  // ~250 Hz to 2 kHz (speech formants)

      for (let i = 0; i < binCount; i++) {
        const val = this.freqBuffer[i] / 255;
        totalFreq += val;
        if (i < bassEnd) bassFreq += val;
        else if (i < midEnd) midFreq += val;
        else trebleFreq += val;
      }

      // Time-domain RMS peak
      let waveSum = 0;
      for (let i = 0; i < binCount; i++) {
        const wave = (this.timeBuffer[i] - 128) / 128;
        waveSum += wave * wave;
      }
      const rms = Math.sqrt(waveSum / binCount);

      const normVolume = Math.min(1.0, (totalFreq / binCount) * 2.5 * sensitivity);
      const normBass = Math.min(1.0, (bassFreq / Math.max(1, bassEnd)) * 2.2 * sensitivity);
      const normMid = Math.min(1.0, (midFreq / Math.max(1, midEnd - bassEnd)) * 2.4 * sensitivity);
      const normTreble = Math.min(1.0, (trebleFreq / Math.max(1, binCount - midEnd)) * 2.8 * sensitivity);

      // Also combine with any active AI speech playback level
      let aiPulse = 0;
      if (this.simulatedVoiceLevel > 0.01) {
        const now = performance.now();
        const dt = (now - this.lastSimulatedTime) / 1000;
        this.lastSimulatedTime = now;
        this.simulatedVoiceLevel = Math.max(0, this.simulatedVoiceLevel - dt * 2.2);
        aiPulse = this.simulatedVoiceLevel * sensitivity;
      }

      return {
        volume: Math.max(normVolume, aiPulse),
        bass: Math.max(normBass, aiPulse * 0.9),
        mid: Math.max(normMid, aiPulse * 1.1),
        treble: Math.max(normTreble, aiPulse * 0.7),
        waveform: Math.max(Math.min(1.0, rms * 3.5 * sensitivity), aiPulse * 0.8),
      };
    }

    // Fallback or AI speech playback acoustic pulse
    if (this.simulatedVoiceLevel > 0.01) {
      const now = performance.now();
      const dt = (now - this.lastSimulatedTime) / 1000;
      this.lastSimulatedTime = now;
      this.simulatedVoiceLevel = Math.max(0, this.simulatedVoiceLevel - dt * 2.2);

      const pulse = this.simulatedVoiceLevel * sensitivity;
      return {
        volume: pulse,
        bass: pulse * 0.9,
        mid: pulse * 1.1,
        treble: pulse * 0.7,
        waveform: pulse * 0.8,
      };
    }

    return { volume: 0, bass: 0, mid: 0, treble: 0, waveform: 0 };
  }

  public getVoiceData(sensitivity = 1.0) {
    return this.getVoiceMetrics(sensitivity);
  }

  /**
   * Feed external audio PCM samples (e.g. from AI speech playback)
   * so the ferrofluid surface dynamically ripples in sync with the AI's spoken voice
   */
  public feedExternalAudioChunk(samples: Float32Array) {
    if (!samples || samples.length === 0) return;
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);
    // Amplify speech transients for clear physical ripples and mouth aperture pulsations
    const targetLevel = Math.min(2.5, rms * 6.0);
    this.simulatedVoiceLevel = Math.max(this.simulatedVoiceLevel, targetLevel);
    this.lastSimulatedTime = performance.now();
  }

  /**
   * Trigger simulated voice burst (e.g. for previewing voice spike ripples with 1 click)
   */
  public triggerSimulatedVoiceBurst(intensity = 1.0) {
    this.simulatedVoiceLevel = Math.min(2.0, intensity);
    this.lastSimulatedTime = performance.now();
    this.playMagneticPulse(0.9 * intensity);
  }

  /**
   * Ethereal plasma arc & time anomaly sound effect
   */
  public playTimeAnomalyArc() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.45);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(3600, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.5);
      filter.Q.setValueAtTime(6.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      if (this.gainMaster) {
        gain.connect(this.gainMaster);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Audio playback silently suppressed
    }
  }

  /**
   * Electrical arcing ethereal energy sound effect (crackling plasma ionization & ethereal discharge)
   */
  public playElectricalArcEnergy(intensity = 1.0) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      // High-voltage noise crackle
      const bufferSize = this.ctx.sampleRate * 0.25;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Sporadic electric spark crackles
        output[i] = Math.random() > 0.88 ? Math.random() * 2 - 1 : 0;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(3800, now + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14 * Math.min(2.0, intensity), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      // Ethereal carrier tone
      const etherealOsc = this.ctx.createOscillator();
      etherealOsc.type = 'sine';
      etherealOsc.frequency.setValueAtTime(880, now);
      etherealOsc.frequency.linearRampToValueAtTime(1760, now + 0.1);
      etherealOsc.frequency.linearRampToValueAtTime(440, now + 0.25);

      const etherealGain = this.ctx.createGain();
      etherealGain.gain.setValueAtTime(0.05 * intensity, now);
      etherealGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      etherealOsc.connect(etherealGain);

      if (this.gainMaster) {
        gain.connect(this.gainMaster);
        etherealGain.connect(this.gainMaster);
      } else {
        gain.connect(this.ctx.destination);
        etherealGain.connect(this.ctx.destination);
      }

      whiteNoise.start(now);
      etherealOsc.start(now);
      etherealOsc.stop(now + 0.25);
    } catch {
      // Audio playback silently suppressed
    }
  }
}

export const audioEngine = new ArcaneAudioEngine();
