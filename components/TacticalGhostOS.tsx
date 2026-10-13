/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Bot,
  Sliders,
  Eye,
  Download,
  Activity,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Zap,
  Sparkles,
  Camera,
  Maximize2,
  Minimize2,
  X,
  ChevronUp,
  ChevronDown,
  Layers,
  Compass,
  Footprints,
  BookOpen,
  Ear,
  EyeOff,
  Radio,
  SlidersHorizontal,
  Code2,
  Crosshair,
} from 'lucide-react';
import { FerrofluidConfig, MagnetNode, AiModelNode, LocomotionTelemetryData } from '../types';
import { DISCOVERED_AI_MODELS } from '../services/aiModelsRegistry';
import { audioEngine } from '../utils/audioEngine';

export type GhostDrawerType =
  | 'none'
  | 'ai_directory'
  | 'locomotion'
  | 'controls'
  | 'export'
  | 'codex'
  | 'tennis';

interface Props {
  config: FerrofluidConfig;
  onUpdateConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
  magnets: MagnetNode[];
  onAddMagnet: (x: number, z: number, polarity: 'north' | 'south') => void;
  onRemoveMagnet: (id: string) => void;
  onClearMagnets: () => void;
  onOpenTennisModal: () => void;
  onOpenCodex: () => void;
  onOpenExportModal: () => void;
  onOpenAiDirectoryModal: () => void;
  onOpenUnifiedCodeModal?: () => void;
  onOpenDesktopPluginModal?: () => void;
  onOpenDedicatedLLM?: () => void;
  onOpenFlutterFlowModal?: () => void;
  onToggleCoordinatesPanel?: () => void;
  showCoordinatesPanel?: boolean;
  onTakeSnapshot: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  getLocomotionTelemetry?: () => LocomotionTelemetryData | null;
  onApplyImpulse?: (fx: number, fz: number) => void;
}

export const TacticalGhostOS: React.FC<Props> = ({
  config,
  onUpdateConfig,
  magnets,
  onAddMagnet,
  onRemoveMagnet,
  onClearMagnets,
  onOpenTennisModal,
  onOpenCodex,
  onOpenExportModal,
  onOpenAiDirectoryModal,
  onOpenUnifiedCodeModal,
  onOpenDesktopPluginModal,
  onOpenDedicatedLLM,
  onOpenFlutterFlowModal,
  onToggleCoordinatesPanel,
  showCoordinatesPanel,
  onTakeSnapshot,
  isFullscreen,
  onToggleFullscreen,
  getLocomotionTelemetry,
  onApplyImpulse,
}) => {
  const [hudMode, setHudMode] = useState<'tactical' | 'minimal' | 'stealth'>('tactical');
  const [activeDrawer, setActiveDrawer] = useState<GhostDrawerType>('none');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(config.voiceReactive ?? false);
  const [acousticAlertToast, setAcousticAlertToast] = useState<string | null>(null);

  // Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Acoustic Anomaly Surveillance Engine
  useEffect(() => {
    if (!config.acousticCameraAutoTrigger) return;

    let previousAudioLevel = 0;
    const threshold = config.acousticAnomalyThreshold || 0.58;

    const surveillanceInterval = setInterval(() => {
      const metrics = audioEngine.getVoiceMetrics();
      const currentLevel = metrics.volume;

      // Detect sudden loud acoustic spike / anomaly
      const soundSpikeDelta = currentLevel - previousAudioLevel;
      if ((currentLevel > threshold || soundSpikeDelta > 0.45) && !config.handTrackingEnabled) {
        audioEngine.playMagneticPulse(1.5);
        onUpdateConfig((prev) => ({ ...prev, handTrackingEnabled: true }));
        setAcousticAlertToast(`ACOUSTIC ANOMALY [${Math.round(currentLevel * 100)}%] → VISION CAM ENGAGED`);

        setTimeout(() => {
          setAcousticAlertToast(null);
        }, 4000);
      }

      previousAudioLevel = currentLevel;
    }, 150);

    return () => clearInterval(surveillanceInterval);
  }, [config.acousticCameraAutoTrigger, config.acousticAnomalyThreshold, config.handTrackingEnabled, onUpdateConfig]);

  const activeAi = DISCOVERED_AI_MODELS.find((m) => m.id === config.activeAiModelId) || DISCOVERED_AI_MODELS[0];

  const toggleDrawer = (drawer: GhostDrawerType) => {
    if (activeDrawer === drawer) {
      setActiveDrawer('none');
    } else {
      setActiveDrawer(drawer);
    }
  };

  const handleToggleVoice = async () => {
    if (isVoiceActive) {
      audioEngine.stopVoiceInput();
      setIsVoiceActive(false);
      onUpdateConfig((p) => ({ ...p, voiceReactive: false }));
    } else {
      try {
        await audioEngine.startVoiceInput();
        setIsVoiceActive(true);
        onUpdateConfig((p) => ({ ...p, voiceReactive: true }));
      } catch (err) {
        console.warn('Microphone error:', err);
      }
    }
  };

  const handleToggleAudio = () => {
    const next = !config.soundEnabled;
    onUpdateConfig((p) => ({ ...p, soundEnabled: next }));
    if (next) {
      audioEngine.start();
      audioEngine.setVolume(config.soundVolume);
    } else {
      audioEngine.stop();
    }
  };

  const handleTriggerSurge = () => {
    audioEngine.playTimeAnomalyArc();
    // Dispatch window surge event
    const event = new CustomEvent('ferrofluid-surge-trigger');
    window.dispatchEvent(event);
  };

  if (hudMode === 'stealth') {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setHudMode('tactical')}
          className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/80 backdrop-blur-xl border border-cyan-500/30 text-cyan-300 font-mono text-[10px] tracking-widest flex items-center gap-2 shadow-2xl transition-all cursor-pointer"
          title="Restore Ghost OS HUD"
        >
          <Activity size={13} className="animate-pulse" />
          <span>RESTORE GHOST OS</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none select-none font-mono">
      {/* 1. ACOUSTIC ANOMALY TOAST NOTIFICATION */}
      {acousticAlertToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#090d18]/90 backdrop-blur-2xl border border-cyan-400 text-cyan-200 text-xs font-bold shadow-[0_0_30px_rgba(0,240,255,0.4)]">
            <Ear size={15} className="text-cyan-300 animate-pulse" />
            <span>{acousticAlertToast}</span>
          </div>
        </div>
      )}

      {/* 2. TOP TACTICAL GHOST STATUS RAIL */}
      <header className="fixed top-0 inset-x-0 z-40 pointer-events-auto p-2 sm:p-3 flex items-center justify-between">
        {/* Left: Brand Pill & Quantum Core Telemetry */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/40 backdrop-blur-2xl border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            <span className="text-xs font-bold tracking-wider text-white">CAUDEX</span>
            <span className="text-[10px] text-cyan-400 font-bold hidden sm:inline">OS v5.4</span>
            <div className="w-[1px] h-3.5 bg-white/10 mx-1 hidden sm:block" />
            <span className="text-[10px] text-stone-400 hidden sm:inline">{currentTime}</span>
          </div>

          {/* Dedicated Platform Coordinates Toggle */}
          {onToggleCoordinatesPanel && (
            <button
              onClick={onToggleCoordinatesPanel}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-2xl border text-xs font-bold transition-all cursor-pointer shadow-md ${
                showCoordinatesPanel
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'bg-black/35 border-white/10 text-stone-300 hover:text-white hover:border-cyan-500/30'
              }`}
              title="Toggle Dedicated Platform Coordinate Tracking & Curiosity HUD"
            >
              <Compass size={13} className="text-cyan-400" />
              <span className="hidden md:inline">COORDINATES</span>
            </button>
          )}
        </div>

        {/* Center: DEDICATED AI MODELS RENDERED / PRESENT NODE */}
        <div className="flex items-center">
          <button
            onClick={onOpenAiDirectoryModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black/40 to-emerald-950/40 backdrop-blur-2xl border border-cyan-400/40 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all cursor-pointer group shadow-[0_4px_24px_rgba(0,0,0,0.5)] active:scale-95"
            title="Click to view and assimilate available AI Models discovered in vicinity"
          >
            <Brain size={14} className="text-cyan-300 group-hover:animate-pulse" />
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-[11px] font-bold text-white tracking-wide">
                AI MODELS PRESENT
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-500/30">
                {DISCOVERED_AI_MODELS.length}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-[10px] text-emerald-300 pl-1 border-l border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeAi.name.split(' ')[0]}</span>
            </div>
          </button>

          {/* Dedicated CAUDEX Desktop Companion Plugin */}
          {onOpenDesktopPluginModal && (
            <button
              onClick={onOpenDesktopPluginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-950/50 to-cyan-950/50 hover:from-purple-900/60 hover:to-cyan-900/60 border border-purple-400/40 hover:border-purple-300 text-purple-200 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] ml-2"
              title="Copy CAUDEX to float on desktop of any computer"
            >
              <Bot size={13} className="text-purple-300" />
              <span className="hidden sm:inline">DESKTOP PLUGIN</span>
            </button>
          )}

          {/* Unified AI · Voice · 3D Model Code Repository Trigger */}
          {onOpenUnifiedCodeModal && (
            <button
              onClick={onOpenUnifiedCodeModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] ml-2"
              title="Inspect & Export Complete Unified AI + Voice + 3D Ferrofluid Code Architecture"
            >
              <Code2 size={13} className="text-cyan-300" />
              <span>CODE: AI·VOICE·3D</span>
            </button>
          )}
        </div>

        {/* Right: Quick Tactical Utilities */}
        <div className="flex items-center gap-1.5">
          {/* Acoustic Camera Surveillance Toggle */}
          <button
            onClick={() => onUpdateConfig((p) => ({ ...p, acousticCameraAutoTrigger: !p.acousticCameraAutoTrigger }))}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-2xl backdrop-blur-2xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              config.acousticCameraAutoTrigger
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-black/35 border-white/10 text-stone-400 hover:text-stone-200'
            }`}
            title={
              config.acousticCameraAutoTrigger
                ? 'Acoustic Surveillance Active: Camera auto-engages on noise spikes'
                : 'Enable Acoustic Surveillance: Auto-activates camera when noise is heard'
            }
          >
            <Ear size={13} className={config.acousticCameraAutoTrigger ? 'text-cyan-300' : 'text-stone-400'} />
            <span className="text-[10px] font-bold hidden lg:inline">
              {config.acousticCameraAutoTrigger ? 'AUTO-CAM ON' : 'AUTO-CAM'}
            </span>
          </button>

          {/* HUD Mode Switcher */}
          <button
            onClick={() => setHudMode(hudMode === 'tactical' ? 'minimal' : 'tactical')}
            className="p-1.5 rounded-2xl bg-black/35 backdrop-blur-2xl border border-white/10 text-stone-400 hover:text-white transition-all cursor-pointer"
            title={hudMode === 'tactical' ? 'Minimal Ghost Mode' : 'Tactical Full Mode'}
          >
            <SlidersHorizontal size={13} />
          </button>

          {/* Stealth View (Hide All UI) */}
          <button
            onClick={() => setHudMode('stealth')}
            className="p-1.5 rounded-2xl bg-black/35 backdrop-blur-2xl border border-white/10 text-stone-400 hover:text-cyan-300 transition-all cursor-pointer"
            title="Stealth Mode (Zero UI for full 3D viewport clarity)"
          >
            <EyeOff size={13} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-2xl bg-black/35 backdrop-blur-2xl border border-white/10 text-stone-400 hover:text-white transition-all cursor-pointer hidden sm:block"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </header>

      {/* 3. GHOST DOCKED DRAWER (SLIDES OUT CLEANLY - ZERO OVERLAPS) */}
      {activeDrawer !== 'none' && (
        <aside className="fixed top-14 right-2 sm:right-4 z-40 w-84 sm:w-96 max-h-[84vh] overflow-y-auto pointer-events-auto rounded-3xl bg-black/45 backdrop-blur-2xl border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.7)] p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-white tracking-wider uppercase">
              {activeDrawer === 'locomotion' && 'Autonomous 3D Levitation & AI Flight'}
              {activeDrawer === 'controls' && 'Tactical Fluid Parameters'}
              {activeDrawer === 'export' && '3D Model Exporter'}
            </span>
            <button
              onClick={() => setActiveDrawer('none')}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* DRAWER CONTENT 1: AUTONOMOUS 3D LEVITATION & FLIGHT */}
          {activeDrawer === 'locomotion' && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <div className="font-bold text-white">Autonomous 3D Levitation</div>
                  <div className="text-[10px] text-stone-400">Pure Legless Aerial Organism</div>
                </div>
                <button
                  onClick={() =>
                    onUpdateConfig((p) => ({
                      ...p,
                      upperHalfFloating: !(p.upperHalfFloating ?? true),
                      autonomousLevitationEnabled: !(p.upperHalfFloating ?? true),
                    }))
                  }
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                    config.upperHalfFloating ?? true
                      ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {config.upperHalfFloating ?? true ? 'ENGAGED' : 'DOCKED'}
                </button>
              </div>

              {/* Drift Agility Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-300 text-[11px]">
                  <span>Levitation Drift Speed</span>
                  <span className="font-mono text-cyan-400">{(config.floatDriftSpeed || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={config.floatDriftSpeed || 1.0}
                  onChange={(e) => onUpdateConfig((p) => ({ ...p, floatDriftSpeed: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-black/60 rounded-lg"
                />
              </div>

              {/* 3D Spatial Range Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-stone-300 text-[11px]">
                  <span>Autonomous Spatial Range</span>
                  <span className="font-mono text-cyan-400">{(config.floatRange || 1.2).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={config.floatRange || 1.2}
                  onChange={(e) => onUpdateConfig((p) => ({ ...p, floatRange: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-black/60 rounded-lg"
                />
              </div>

              {/* Impulse Kick Test */}
              <button
                onClick={() => {
                  audioEngine.playMagneticPulse(1.5);
                  if (onApplyImpulse) {
                    onApplyImpulse((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
                  }
                }}
                className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>Test Magnetic Impulse & Buoyancy Recovery</span>
              </button>
            </div>
          )}

          {/* DRAWER CONTENT 2: TACTICAL FLUID PARAMETERS */}
          {activeDrawer === 'controls' && (
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-stone-300 text-[11px]">
                  <span>Magnetic Field Strength</span>
                  <span className="font-mono text-cyan-400">{config.magneticStrength.toFixed(1)} T</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={config.magneticStrength}
                  onChange={(e) => onUpdateConfig((p) => ({ ...p, magneticStrength: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-black/60 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-300 text-[11px]">
                  <span>Spike Density</span>
                  <span className="font-mono text-cyan-400">{config.spikeDensity} spikes</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="1"
                  value={config.spikeDensity}
                  onChange={(e) => onUpdateConfig((p) => ({ ...p, spikeDensity: parseInt(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-black/60 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-300 text-[11px]">
                  <span>Spike Height</span>
                  <span className="font-mono text-cyan-400">{(config.spikeHeight || 1.6).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={config.spikeHeight || 1.6}
                  onChange={(e) => onUpdateConfig((p) => ({ ...p, spikeHeight: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-black/60 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone-300 text-[11px]">
                  <span>Voice Sensitivity</span>
                  <span className="font-mono text-cyan-400">{(config.voiceSensitivity || 1.6).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={config.voiceSensitivity || 1.6}
                  onChange={(e) => onUpdateConfig((p) => ({ ...p, voiceSensitivity: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-black/60 rounded-lg"
                />
              </div>
            </div>
          )}
        </aside>
      )}

      {/* 4. BOTTOM MOBILE & DESKTOP GHOST OS CONTROL RAIL */}
      <footer className="fixed bottom-3 inset-x-0 z-40 pointer-events-auto px-3 sm:px-6 flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1.5 px-3 rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all hover:border-cyan-500/30">
          {/* Quick Voice Ripple Mic */}
          <button
            onClick={handleToggleVoice}
            title={isVoiceActive ? 'Mute Microphone Voice Ripples' : 'Enable Acoustic Voice Ripples'}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 animate-pulse'
                : 'bg-black/20 border-white/5 text-stone-400 hover:text-stone-200'
            }`}
          >
            {isVoiceActive ? <Mic size={14} /> : <MicOff size={14} />}
          </button>

          {/* Quick Harmonic Audio */}
          <button
            onClick={handleToggleAudio}
            title={config.soundEnabled ? 'Mute Harmonic Audio' : 'Enable Harmonic Drone Audio'}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              config.soundEnabled
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                : 'bg-black/20 border-white/5 text-stone-400 hover:text-stone-200'
            }`}
          >
            {config.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Electromagnetic Surge */}
          <button
            onClick={handleTriggerSurge}
            title="Electromagnetic Temporal Surge"
            className="p-2 rounded-2xl bg-black/20 hover:bg-amber-500/20 border border-white/5 hover:border-amber-400/40 text-stone-400 hover:text-amber-300 transition-all cursor-pointer"
          >
            <Zap size={14} />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

          {/* Autonomous Levitation Drawer Trigger */}
          <button
            onClick={() => toggleDrawer('locomotion')}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeDrawer === 'locomotion' || (config.upperHalfFloating ?? true)
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-black/20 border-white/5 text-stone-300 hover:text-white'
            }`}
            title="Autonomous 3D Levitation & Spatial Flight"
          >
            <Compass size={13} className={(config.upperHalfFloating ?? true) ? 'text-cyan-300' : 'text-stone-400'} />
            <span className="hidden sm:inline">LEVITATION</span>
          </button>

          {/* Parameters Drawer Trigger */}
          <button
            onClick={() => toggleDrawer('controls')}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeDrawer === 'controls'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                : 'bg-black/20 border-white/5 text-stone-300 hover:text-white'
            }`}
          >
            <Sliders size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">PARAMETERS</span>
          </button>

          {/* Camera Vision Toggle */}
          <button
            onClick={() => onUpdateConfig((p) => ({ ...p, handTrackingEnabled: !p.handTrackingEnabled }))}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              config.handTrackingEnabled
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 animate-pulse'
                : 'bg-black/20 border-white/5 text-stone-300 hover:text-white'
            }`}
            title="Toggle Webcam Hand & Face Tracking"
          >
            <Eye size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">VISION</span>
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

          {/* Unified AI · Voice · 3D Code Repository */}
          {onOpenUnifiedCodeModal && (
            <button
              onClick={onOpenUnifiedCodeModal}
              className="px-3 py-1.5 rounded-2xl bg-black/40 hover:bg-cyan-950/50 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
              title="Inspect and copy code for AI + Voice + 3D Ferrofluid"
            >
              <Code2 size={13} className="text-cyan-400" />
              <span className="hidden sm:inline">AI·VOICE CODE</span>
            </button>
          )}

          {/* Dedicated CAUDEX Desktop Companion Plugin */}
          {onOpenDesktopPluginModal && (
            <button
              onClick={onOpenDesktopPluginModal}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-cyan-950/50 hover:from-purple-900/60 hover:to-cyan-900/50 border border-purple-400/40 hover:border-purple-300 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              title="Copy CAUDEX to float on desktop of any computer"
            >
              <Bot size={13} className="text-purple-300" />
              <span className="hidden sm:inline">DESKTOP PLUGIN</span>
            </button>
          )}

          {/* Direct 3D Model Export Button (GLTF / FBX / OBJ) */}
          <button
            onClick={onOpenExportModal}
            className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-emerald-950/50 hover:from-cyan-900/60 hover:to-emerald-900/50 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            title="Download 3D Model (.GLTF, .GLB, .FBX, .OBJ) with all features"
          >
            <Download size={13} className="text-cyan-400" />
            <span>EXPORT 3D</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
