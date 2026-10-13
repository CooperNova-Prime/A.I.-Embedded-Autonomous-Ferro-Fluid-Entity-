/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AiModelNode, FerrofluidConfig } from '../types';

export const DISCOVERED_AI_MODELS: AiModelNode[] = [
  {
    id: 'phi-3-mini',
    name: 'Microsoft Phi-3 Mini 3.8B (SLM Core)',
    version: 'Phi-3-mini-4k-instruct / ONNX',
    provider: 'Microsoft Research & Hugging Face',
    type: 'slm_phi3',
    description: 'High-density 3.8B Small Language Model specialized in edge reasoning, autonomous free-range 3D floating flight, and low-latency voice cognition without legs or feet.',
    badge: 'MICROSOFT PHI-3',
    glowTheme: 'cyan',
    capabilities: [
      'Pure Free-Floating 3D Spatial Flight',
      'Edge SLM Low-Latency Inference',
      'Localhost Ollama & ONNX WebGPU Hook',
      'Autonomous Buoyancy & Void Roaming'
    ],
    active: true,
    status: 'ENGAGED',
    specs: {
      latency: '45ms (Local/Edge)',
      throughput: '120 Tokens/sec',
      contextLength: '4K - 128K Tokens'
    }
  },
  {
    id: 'gemini-live-2.5',
    name: 'Gemini 2.5 Live Multimodal Agent',
    version: 'v2.5-flash-live',
    provider: 'Google DeepMind',
    type: 'conversational',
    description: 'Autonomous bidirectional WebSocket audio-visual agent streaming live speech ripples (Aoede voice) directly onto the ferrofluid surface aperture.',
    badge: 'LIVE WEBSOCKET',
    glowTheme: 'cyan',
    capabilities: [
      'Bidirectional Audio Streaming',
      'Dynamic Voice Ripple Aperture',
      'Acoustic Vision Grounding',
      'Autonomous Spatial Tool Calls'
    ],
    active: false,
    status: 'ONLINE',
    specs: {
      latency: '160ms',
      throughput: '24kHz PCM',
      contextLength: '1M Tokens'
    }
  },
  {
    id: 'ferro-levitation-ai',
    name: 'Ferro-Levitation Autonomous Flight Core',
    version: 'Aero-Dynamics-v5.4',
    provider: 'Electromagnetic Field Core',
    type: 'locomotion_rl',
    description: 'Autonomous spatial levitation engine providing weightless 3D drift, harmonic altitude bobbing, and kinetic impulse absorption with zero legs or feet.',
    badge: 'LEVITATION FLIGHT',
    glowTheme: 'emerald',
    capabilities: [
      'Legless 3D Void Levitation',
      'Harmonic Altitude Bobbing',
      'Magnetic Tether & Gaze Following',
      'Kinetic Rebound Dissipation'
    ],
    active: false,
    status: 'ONLINE',
    specs: {
      latency: '1ms (60Hz)',
      throughput: 'Continuous 3D Flow'
    }
  },
  {
    id: 'furryfluid-harmonic-mind',
    name: "Sarah's FurryFluid Harmonic Mind",
    version: 'Harmonic-Gimbal-v5.3',
    provider: 'Alchemical Cybernetics',
    type: 'harmonic_mind',
    description: 'Gyroscopic stabilizer that synchronizes the 4 concentric opening gimbal rings with arcane frequency resonance and Bezier lightning arcs.',
    badge: 'GIMBAL RESONANCE',
    glowTheme: 'purple',
    capabilities: [
      '4-Ring Gyroscopic Synchronization',
      'Bezier Lightning Tendril Flux',
      'High-Speed Kinetic Deflection',
      'Ethereal Void Tumbling'
    ],
    active: false,
    status: 'ONLINE',
    specs: {
      latency: '1ms',
      throughput: '4 Gimbals Sync'
    }
  },
  {
    id: 'elevenlabs-voice-tts',
    name: 'ElevenLabs Emotional Neural Voice Core',
    version: 'Turbo-v2.5',
    provider: 'ElevenLabs Neural Speech',
    type: 'speech_tts',
    description: 'High-fidelity generative voice synthesizer that ripples ferrofluid surface spikes with emotional micro-inflections and acoustic cadences.',
    badge: 'NEURAL SPEECH',
    glowTheme: 'gold',
    capabilities: [
      'Dynamic Frequency Spike Waves',
      'Emotional Audio Micro-Bursts',
      'Low-Latency Speech Synthesis',
      'Harmonic Voice Modulation'
    ],
    active: false,
    status: 'ONLINE',
    specs: {
      latency: '210ms',
      throughput: '44.1kHz High-Fi'
    }
  },
  {
    id: 'deepvision-spatial-sensor',
    name: 'DeepVision Spatial Perception Node',
    version: 'MediaPipe-Vision-v1.0',
    provider: 'On-Device Edge Vision',
    type: 'vision_sensor',
    description: 'Real-time 21-landmark hand gesture and face orientation detector that tethers magnetic spikes to user pinch points and gaze coordinates.',
    badge: 'VISION HUD',
    glowTheme: 'cyan',
    capabilities: [
      'Sub-Pixel Pinch Detection',
      'Magnetic Tethering to Gestures',
      'Face Orientation Gaze Follow',
      'Acoustic Anomaly Auto-Trigger'
    ],
    active: false,
    status: 'ONLINE',
    specs: {
      latency: '24ms',
      throughput: '60 FPS Video'
    }
  },
  {
    id: 'mhd-vector-calculus-codex',
    name: 'Navier-Stokes MHD Vector Codex',
    version: 'Calculus-v3.8',
    provider: 'Computational Physics',
    type: 'vector_codex',
    description: 'Solves coupled Maxwell equations and Rosensweig hydrodynamic instability equations in real time across the fluid surface mesh.',
    badge: 'MHD MATH',
    glowTheme: 'gold',
    capabilities: [
      'Magnetic Pressure Tensor p_mag',
      'Rosensweig Instability Wavelength',
      'Viscous Shear Stress Dissipation',
      'Surface Tension Dispersion'
    ],
    active: false,
    status: 'ONLINE',
    specs: {
      latency: '0.4ms',
      throughput: '28,900 Vertices'
    }
  },
  {
    id: 'local-gguf-socket-bridge',
    name: 'Local Open-Source LLM Socket Plug',
    version: 'Ollama/GGUF-Bridge-v1.2',
    provider: 'Custom Local Model Port',
    type: 'custom_llm',
    description: 'Universal local model connector. Automatically bridges any open-source language model running locally on your machine into this entity.',
    badge: 'LOCAL MODEL',
    glowTheme: 'crimson',
    capabilities: [
      'WebSocket Localhost Bridge',
      'Prompt/Response Fluid Ripple Hook',
      'Custom Temperature/Top-P Sync',
      'Zero Cloud Dependency'
    ],
    active: false,
    status: 'STANDBY',
    specs: {
      latency: 'Localhost',
      throughput: 'Streaming Tokens'
    }
  }
];

/**
 * Merges and assimilates the selected AI model core into the active Ferrofluid Entity,
 * reconfiguring its visual aura, dynamic voice reactivity, locomotion, or gimbal parameters.
 */
export function assimilateAiModelIntoEntity(
  model: AiModelNode,
  prevConfig: FerrofluidConfig
): Partial<FerrofluidConfig> {
  const updates: Partial<FerrofluidConfig> = {
    activeAiModelId: model.id,
    glowTheme: model.glowTheme,
  };

  switch (model.type) {
    case 'slm_phi3':
      updates.aiCoreEnabled = true;
      updates.voiceReactive = true;
      updates.voiceSensitivity = 1.9;
      updates.voiceSpikeBoost = 1.8;
      updates.upperHalfFloating = true;
      updates.autonomousLevitationEnabled = true;
      updates.floatRange = 1.4;
      updates.floatDriftSpeed = 1.25;
      updates.showEquations = true;
      break;

    case 'conversational':
      updates.aiCoreEnabled = true;
      updates.voiceReactive = true;
      updates.voiceSensitivity = 1.8;
      updates.voiceSpikeBoost = 1.7;
      updates.upperHalfFloating = true;
      updates.autonomousLevitationEnabled = true;
      updates.showEquations = true;
      break;

    case 'locomotion_rl':
      updates.autonomousLevitationEnabled = true;
      updates.upperHalfFloating = true;
      updates.floatRange = 1.6;
      updates.floatDriftSpeed = 1.35;
      break;

    case 'harmonic_mind':
      updates.showGimbalRings = true;
      updates.showBezierArcs = true;
      updates.showHoloPanels = true;
      updates.gimbalSpeed = 1.35;
      updates.gimbalMotionStyle = 'fluid';
      updates.arcingTendrilsEnabled = true;
      break;

    case 'speech_tts':
      updates.voiceReactive = true;
      updates.voiceSensitivity = 2.0;
      updates.soundEnabled = true;
      updates.soundVolume = 0.35;
      updates.morphIntensity = 1.4;
      break;

    case 'vision_sensor':
      updates.handTrackingEnabled = true;
      updates.acousticCameraAutoTrigger = true;
      updates.solidSurfaceEnabled = true;
      break;

    case 'vector_codex':
      updates.showEquations = true;
      updates.spikeDensity = 18;
      updates.magneticStrength = 2.4;
      updates.surfaceTension = 1.6;
      break;

    case 'custom_llm':
      updates.aiCoreEnabled = true;
      updates.voiceReactive = true;
      updates.timeAnomalyFrequency = 1.4;
      break;
  }

  return updates;
}
