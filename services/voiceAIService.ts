/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { audioEngine } from '../utils/audioEngine';
import { askUnifiedGeminiAgent } from './geminiService';

export type VUIState = 'standby' | 'listening' | 'thinking' | 'speaking' | 'muted';

export interface SearchResultData {
  query: string;
  title: string;
  summary: string;
  keyPoints: string[];
  source: string;
  timestamp: string;
}

type VUIListener = (state: VUIState) => void;
type SearchListener = (result: SearchResultData | null) => void;
type TextListener = (text: string) => void;

class VoiceAIService {
  private currentState: VUIState = 'standby';
  private wakePhrase: string = 'hey caudex';
  private isWakeListening: boolean = false;
  private recognition: any = null;
  private isMuted: boolean = false;
  private autoRevertTimeout: any = null;
  private activeSearchResult: SearchResultData | null = null;

  private stateListeners: Set<VUIListener> = new Set();
  private searchListeners: Set<SearchListener> = new Set();
  private transcriptListeners: Set<TextListener> = new Set();
  private responseListeners: Set<TextListener> = new Set();

  constructor() {
    this.initSpeechRecognition();
  }

  public getState(): VUIState {
    return this.currentState;
  }

  public getWakePhrase(): string {
    return this.wakePhrase;
  }

  public setWakePhrase(phrase: string) {
    this.wakePhrase = phrase.toLowerCase().trim();
  }

  public getActiveSearchResult(): SearchResultData | null {
    return this.activeSearchResult;
  }

  public subscribeState(listener: VUIListener): () => void {
    this.stateListeners.add(listener);
    listener(this.currentState);
    return () => this.stateListeners.delete(listener);
  }

  public subscribeSearch(listener: SearchListener): () => void {
    this.searchListeners.add(listener);
    listener(this.activeSearchResult);
    return () => this.searchListeners.delete(listener);
  }

  public subscribeTranscript(listener: TextListener): () => void {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  public subscribeResponse(listener: TextListener): () => void {
    this.responseListeners.add(listener);
    return () => this.responseListeners.delete(listener);
  }

  public setState(state: VUIState) {
    if (this.currentState === state) return;
    this.currentState = state;
    this.stateListeners.forEach((l) => l(state));
  }

  /**
   * Initializes continuous background Web Speech recognition for Wake Phrase
   */
  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.info('[VoiceAI] Web SpeechRecognition API not supported in this browser; fallback audio volume gate active.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        transcript = transcript.trim().toLowerCase();
        this.transcriptListeners.forEach((l) => l(transcript));

        // Check if wake phrase is triggered while in standby
        if (this.currentState === 'standby' || this.currentState === 'muted') {
          if (this.matchesWakePhrase(transcript)) {
            this.handleWakeTrigger(transcript);
          }
        } else if (this.currentState === 'listening') {
          // In listening state, if speech pauses or ends, process command
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            const command = transcript.replace(new RegExp(`^${this.wakePhrase}\\s*`, 'i'), '').trim();
            if (command.length > 2) {
              this.processUserCommand(command);
            }
          }
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.debug('[VoiceAI] SpeechRecognition error:', e.error);
        }
      };

      this.recognition.onend = () => {
        // Automatically restart speech recognition if wake listening is enabled
        if (this.isWakeListening && !this.isMuted) {
          try {
            this.recognition.start();
          } catch (_) {}
        }
      };
    } catch (err) {
      console.warn('[VoiceAI] Failed to instantiate SpeechRecognition:', err);
    }
  }

  private matchesWakePhrase(transcript: string): boolean {
    const clean = transcript.toLowerCase();
    const wp = this.wakePhrase.toLowerCase();
    return (
      clean.includes(wp) ||
      clean.includes('caudex') ||
      clean.includes('hey caudex') ||
      clean.includes('hey ferro') ||
      clean.includes('ferro') ||
      clean.includes('wake up') ||
      clean.includes('computer')
    );
  }

  /**
   * Handle entity awakening
   */
  public handleWakeTrigger(rawTranscript?: string) {
    if (this.isMuted) return;

    // Play celestial chime
    try {
      audioEngine.playMagneticPulse(1.2);
    } catch (_) {}

    this.setState('listening');
    this.transcriptListeners.forEach((l) => l('Wake phrase detected: "' + (rawTranscript || this.wakePhrase) + '"'));

    // Automatically transition to standby if user doesn't speak after 8 seconds
    if (this.autoRevertTimeout) clearTimeout(this.autoRevertTimeout);
    this.autoRevertTimeout = setTimeout(() => {
      if (this.currentState === 'listening') {
        this.setState('standby');
      }
    }, 8500);
  }

  /**
   * Start continuous wake phrase background listener
   */
  public startWakeListening(): boolean {
    this.isWakeListening = true;
    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (err) {
        // Might already be active
        return true;
      }
    }
    return false;
  }

  public stopWakeListening() {
    this.isWakeListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }

  /**
   * Process user speech or typed search query
   */
  public async processUserCommand(query: string) {
    if (this.autoRevertTimeout) clearTimeout(this.autoRevertTimeout);
    this.setState('thinking');

    const cleanQuery = query.trim();
    this.transcriptListeners.forEach((l) => l(`Processing: "${cleanQuery}"`));

    try {
      // Query Unified Gemini Agent Core
      const aiResponse = await askUnifiedGeminiAgent(cleanQuery);

      // Dispatch dynamic personality reaction event for synchronous scale & sarcasm expressions
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('caudex-personality-reaction', {
            detail: {
              scale: aiResponse.scaleReaction ?? 1.1,
              mood: aiResponse.personalityMood ?? 'curious',
              text: aiResponse.speechText,
              thought: aiResponse.thought,
            },
          })
        );
        // Spikes acoustic curiosity vector toward audio observer
        window.dispatchEvent(
          new CustomEvent('caudex-acoustic-curiosity', {
            detail: {
              volume: 1.0,
              query: cleanQuery,
            },
          })
        );
      }

      // Trigger 3D Visual Actions if emitted by AI
      if (aiResponse.visualAction) {
        if (aiResponse.visualAction.triggerSurge) {
          try {
            audioEngine.playTimeAnomalyArc();
            window.dispatchEvent(new CustomEvent('ferrofluid-surge-trigger'));
          } catch (_) {}
        }
        if (aiResponse.visualAction.impulseKick) {
          try {
            (window as any).__LOCOMOTION_APPLY_IMPULSE__?.(
              (Math.random() - 0.5) * 35,
              (Math.random() - 0.5) * 35
            );
          } catch (_) {}
        }
      }

      const result: SearchResultData = {
        query: cleanQuery,
        title: aiResponse.isFallback ? 'CAUDEX Cognitive Stream' : 'Gemini 2.5 Neural Synthesis',
        summary: aiResponse.speechText,
        keyPoints: [
          `Thought: ${aiResponse.thought}`,
          `Personality: ${aiResponse.personalityMood || 'curious'} (${aiResponse.scaleReaction ? `${aiResponse.scaleReaction}x scale dynamic` : '1.0x'})`,
          `Status: Unified CAUDEX AI + Voice + 3D Mesh Synchronized`,
          `Model: Google Gemini 2.5 Flash / CAUDEX Core`,
        ],
        source: 'Google GenAI · CAUDEX Unified Pipeline',
        timestamp: new Date().toLocaleTimeString(),
      };

      this.activeSearchResult = result;
      this.searchListeners.forEach((l) => l(result));

      // Transition to speaking and vocalize response
      this.speakResponse(aiResponse.speechText);
    } catch (err) {
      console.warn('[VoiceAI] processUserCommand error:', err);
      // Fallback to local synthesizer
      const fallbackResult = await this.synthesizeSearchResult(cleanQuery);
      this.activeSearchResult = fallbackResult;
      this.searchListeners.forEach((l) => l(fallbackResult));
      this.speakResponse(fallbackResult.summary);
    }
  }

  /**
   * Speaks the response with Web Speech Synthesis (TTS)
   * while pulsing the VUI state to 'speaking'
   */
  public speakResponse(text: string) {
    if (this.autoRevertTimeout) clearTimeout(this.autoRevertTimeout);
    this.setState('speaking');
    this.responseListeners.forEach((l) => l(text));

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.05;

      // Select high quality voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.lang.startsWith('en')
      );
      if (preferred) utterance.voice = preferred;

      // Pulse ferrofluid surface ripples in sync with speech synthesis cadence
      const rippleInterval = setInterval(() => {
        if (this.currentState === 'speaking') {
          audioEngine.triggerSimulatedVoiceBurst(0.65 + Math.random() * 0.4);
        } else {
          clearInterval(rippleInterval);
        }
      }, 180);

      utterance.onend = () => {
        clearInterval(rippleInterval);
        this.onSpeechComplete();
      };

      utterance.onerror = () => {
        clearInterval(rippleInterval);
        this.onSpeechComplete();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer if TTS is not available
      const duration = Math.max(3000, text.length * 75);
      setTimeout(() => this.onSpeechComplete(), duration);
    }
  }

  private onSpeechComplete() {
    this.setState('standby');

    // Auto-revert rings display after 8 seconds of reading time
    if (this.autoRevertTimeout) clearTimeout(this.autoRevertTimeout);
    this.autoRevertTimeout = setTimeout(() => {
      this.activeSearchResult = null;
      this.searchListeners.forEach((l) => l(null));
    }, 8000);
  }

  /**
   * Synthesize real-time search knowledge data
   */
  private async synthesizeSearchResult(query: string): Promise<SearchResultData> {
    const qLower = query.toLowerCase();

    // Contextual answers for common topics
    if (qLower.includes('who are you') || qLower.includes('what are you') || qLower.includes('ferrofluid')) {
      return {
        query,
        title: 'Embodied AI Ferrofluid Organism',
        summary:
          'I am an embodied virtual AI entity synthesized from nano-scale colloidal magnetite particles suspended in carrier fluid, stabilized by an equatorial gyroscopic gimbal armature.',
        keyPoints: [
          'Substance: Surfactant-coated Fe3O4 nanoparticles (10 nm)',
          'Physics: Rosensweig normal-field magnetic instability',
          'Cognition: Front-face VUI acoustic harmonic waveform synthesis',
          'Navigation: Autonomous free-range 3D fluidic roaming',
        ],
        source: 'Ferrofluid Quantum Neural Core v4.2',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (qLower.includes('time') || qLower.includes('date') || qLower.includes('clock')) {
      const now = new Date();
      return {
        query,
        title: 'Temporal Synchronization Readout',
        summary: `The current local time is ${now.toLocaleTimeString()} on ${now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`,
        keyPoints: [
          `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
          `UTC Offset: ${now.getTimezoneOffset() / -60} hours`,
          `High-Precision Epoch: ${Date.now()} ms`,
          'Temporal Anchor: Stable resonant frequency',
        ],
        source: 'System Chronometer Node',
        timestamp: now.toLocaleTimeString(),
      };
    }

    if (qLower.includes('weather') || qLower.includes('forecast')) {
      return {
        query,
        title: 'Atmospheric Environmental Sensor',
        summary:
          'Current atmospheric parameters indicate stable ambient barometric pressure at 1013 hPa, 22°C ambient thermal equilibrium, and zero electromagnetic precipitation.',
        keyPoints: [
          'Barometric Pressure: 1013.25 hPa',
          'Relative Humidity: 46%',
          'Magnetic Flux Density: 1.48 Tesla',
          'Acoustic Waveguide: Optimal clarity',
        ],
        source: 'Atmospheric Telemetry Grid',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (qLower.includes('bestiary') || qLower.includes('fauna') || qLower.includes('lexicon') || qLower.includes('creature')) {
      return {
        query,
        title: 'Mathematical Procedural Bestiary & Fauna',
        summary:
          'All cataloged fauna in this universe—including the Colloidal Leviathan, Rosensweig Strider, and Tesseract Chimera—are synthesized purely through mathematical procedural coding and inverse-kinematic equations.',
        keyPoints: [
          'Colloidal Leviathan: Sinusoidal kinematic vertebral splines (4.8T)',
          'Rosensweig Strider: Hexapodal IK gait & superellipsoid thorax (3.2T)',
          'Dielectric Nautilus: Logarithmic spiral r = a*e^(bθ) & Bessel mantle (1.9T)',
          'Tesseract Chimera: 4D SO(4) rotation stereographic projection (7.4T)',
          'Procedural Engine: Real-time dynamic vertex deformers',
        ],
        source: 'Lexicon & Mathematical Fauna Archive',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (qLower.includes('leviathan') || qLower.includes('ferro-wyrm') || qLower.includes('wyrm')) {
      return {
        query,
        title: 'Colloidal Leviathan (Draco Magnetohydrodynamica)',
        summary:
          'A colossal apex serpent composed of viscous ferrofluid articulated along sinusoidal traveling wave splines. It navigates the magnetic trenches of the Ferric Sea.',
        keyPoints: [
          'Classification: Macro-Colloidal Apex Organism',
          'Formula: x(s,t) = A*sin(ωt + ks), R(s) = R0*sin(πs/L)^0.75',
          'Habitat: The Ferric Sea & Deep Abyss',
          'Magnetic Resonance: 4.8 Tesla',
        ],
        source: 'Bestiary Archive // Sector 01',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (qLower.includes('map') || qLower.includes('world') || qLower.includes('cartography') || qLower.includes('terrain')) {
      return {
        query,
        title: 'Procedural 2D & 3D World Cartography',
        summary:
          'The world map is generated mathematically using multi-octave Fractal Brownian Motion (FBM) combined with dipole magnetic vector fields and Rosensweig critical instability peaks.',
        keyPoints: [
          'Elevation: H(x, y) = Σ 2^(-o) * Noise(2^o x, 2^o y)',
          'Magnetic Streamlines: B(r) = (μ0/4π) * (3(m·r)r - m) / r^3',
          'Sectors: Ferric Sea, Rosensweig Ridge, Quicksilver Basin, Tachyon Caldera',
          'Views: 2D Holographic Vector Contours & 3D Planetary Mesh',
        ],
        source: 'Geodetic Planetary Sensorium',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    // Default intelligent knowledge synthesis
    return {
      query,
      title: `Search Findings: ${query}`,
      summary: `Analyzed query "${query}". Synthesizing real-time telemetry across quantum networks: data streams verified, optical refraction indexed, and knowledge projected to ring armature.`,
      keyPoints: [
        `Target Subject: "${query}"`,
        'Neural Confidence: 98.4%',
        'Ring Projection: Augmented Torus HUD Active',
        'Auto-Revert: Armature will fold back to normal size after readout',
      ],
      source: 'Global Planetary Sensorium & Gemini Neural Index',
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  /**
   * Manual dismiss of active search result (converts rings back immediately)
   */
  public dismissSearchResult() {
    if (this.autoRevertTimeout) clearTimeout(this.autoRevertTimeout);
    this.activeSearchResult = null;
    this.searchListeners.forEach((l) => l(null));
    if (this.currentState === 'speaking') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.setState('standby');
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.setState('muted');
      this.stopWakeListening();
    } else {
      this.setState('standby');
      this.startWakeListening();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const voiceAIService = new VoiceAIService();
