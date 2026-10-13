/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Sliders,
  Compass,
  Radio,
  Search,
  Monitor,
  Smartphone,
  Download,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
  Orbit,
  Cpu,
  Layers,
  Check,
  ChevronRight,
  Maximize2,
  Atom,
  Globe,
  MapPin,
  BookOpen
} from 'lucide-react';
import { VUIState, voiceAIService, SearchResultData } from '../services/voiceAIService';
import { usePWAInstall } from '../utils/usePWAInstall';
import { audioEngine } from '../utils/audioEngine';
import { BESTIARY_SPECS } from '../utils/proceduralFauna';
import { WORLD_SECTORS } from '../utils/proceduralWorldMap';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vuiState: VUIState;
  onStateChange: (state: VUIState) => void;
  config: any;
  onChangeConfig: (updater: (prev: any) => any) => void;
  gimbalState: any;
  onChangeGimbal: (updater: (prev: any) => any) => void;
  onOpenDownloadModal: () => void;
  isRingsExpanded: boolean;
  onToggleExpandRings: () => void;
  onOpenBestiary?: (faunaId?: string) => void;
  onOpenWorldMap?: (sectorId?: string) => void;
}

export const FuturisticGlassmorphicPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  vuiState,
  onStateChange,
  config,
  onChangeConfig,
  gimbalState,
  onChangeGimbal,
  onOpenDownloadModal,
  isRingsExpanded,
  onToggleExpandRings,
  onOpenBestiary,
  onOpenWorldMap,
}) => {
  const [activeTab, setActiveTab] = useState<'vui' | 'search' | 'movement' | 'aesthetics' | 'bestiary' | 'worldmap' | 'desktop'>('vui');
  const [wakePhraseInput, setWakePhraseInput] = useState(voiceAIService.getWakePhrase());
  const [isWakeActive, setIsWakeActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  useEffect(() => {
    setWakePhraseInput(voiceAIService.getWakePhrase());
  }, []);

  if (!isOpen) return null;

  const handleSetWakePhrase = (phrase: string) => {
    setWakePhraseInput(phrase);
    voiceAIService.setWakePhrase(phrase);
  };

  const handleTestWake = () => {
    voiceAIService.handleWakeTrigger(wakePhraseInput);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    voiceAIService.processUserCommand(searchQuery);
    setSearchQuery('');
  };

  const copyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const THEMES = [
    { id: 'cyan', label: 'Cyan', hex: '#00f0ff' },
    { id: 'gold', label: 'Gold', hex: '#ffd700' },
    { id: 'purple', label: 'Purple', hex: '#b026ff' },
    { id: 'emerald', label: 'Emerald', hex: '#00e676' },
    { id: 'crimson', label: 'Crimson', hex: '#ff1744' },
    { id: 'mercury', label: 'Mercury', hex: '#e2e8f0' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#060913]/90 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-stone-200">
        {/* Top Arcane Holographic Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold tracking-wider text-white">
                  EMBODIED VIRTUAL AI CORE
                </h2>
                {/* Dynamic VUI Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${
                    vuiState === 'listening'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(0,255,128,0.4)]'
                      : vuiState === 'speaking'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : vuiState === 'thinking'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-[0_0_10px_rgba(180,0,255,0.4)]'
                      : 'bg-black/60 text-stone-400 border-white/10'
                  }`}
                >
                  ● {vuiState}
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300/70">
                Front-Face VUI Ripples • Ring Search Displays • Autonomous Movement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-cyan-500/15 bg-black/40 px-4 text-xs font-mono scrollbar-none">
          {[
            { id: 'vui', label: 'VUI & WAKE', icon: Mic },
            { id: 'search', label: 'RING SEARCH', icon: Search },
            { id: 'bestiary', label: 'LEXICON & FAUNA', icon: Atom },
            { id: 'worldmap', label: 'WORLD MAP', icon: Globe },
            { id: 'movement', label: 'MOVEMENT', icon: Compass },
            { id: 'aesthetics', label: 'RIPPLES & GLOW', icon: Sliders },
            { id: 'desktop', label: 'DESKTOP & HOME', icon: Monitor },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
          {/* TAB 1: VUI & WAKE PHRASE */}
          {activeTab === 'vui' && (
            <div className="space-y-5">
              {/* Dynamic VUI Visualizer Status Card */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    <Radio size={16} className="text-cyan-400 animate-pulse" />
                    <span>VUI Body Ripple State: [{vuiState.toUpperCase()}]</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Concentric acoustic wave rings ripple dynamically across the front face facing your view.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      voiceAIService.setState('listening');
                      onStateChange('listening');
                    }}
                    className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
                      vuiState === 'listening'
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400'
                        : 'bg-black/50 text-stone-400 border-white/10 hover:text-white'
                    }`}
                  >
                    Listen
                  </button>
                  <button
                    onClick={() => {
                      voiceAIService.speakResponse('Synthesizing speech harmonics. Physical Rosensweig ripples active.');
                    }}
                    className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
                      vuiState === 'speaking'
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400'
                        : 'bg-black/50 text-stone-400 border-white/10 hover:text-white'
                    }`}
                  >
                    Speak
                  </button>
                  <button
                    onClick={() => {
                      voiceAIService.setState('standby');
                      onStateChange('standby');
                    }}
                    className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
                      vuiState === 'standby'
                        ? 'bg-white/20 text-white border-white/40'
                        : 'bg-black/50 text-stone-400 border-white/10 hover:text-white'
                    }`}
                  >
                    Standby
                  </button>
                </div>
              </div>

              {/* Wake Phrase Configuration */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#090e18] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Mic size={14} className="text-cyan-400" />
                    Voice Wake Phrase Detection
                  </span>
                  <button
                    onClick={() => {
                      const next = !isWakeActive;
                      setIsWakeActive(next);
                      if (next) voiceAIService.startWakeListening();
                      else voiceAIService.stopWakeListening();
                    }}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      isWakeActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                        : 'bg-black/40 text-stone-500 border-white/10'
                    }`}
                  >
                    {isWakeActive ? 'ACTIVE (LISTENING)' : 'DISABLED'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-stone-400">Wake Word / Phrase:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={wakePhraseInput}
                      onChange={(e) => handleSetWakePhrase(e.target.value)}
                      placeholder='e.g. "hey ferro", "computer"'
                      className="flex-1 bg-black/60 border border-white/10 focus:border-cyan-400 px-3 py-2 rounded-xl text-white outline-none"
                    />
                    <button
                      onClick={handleTestWake}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Play size={12} />
                      <span>Test Wake</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Hey Ferro', 'Ferro', 'Wake Up', 'Computer', 'Jarvis'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSetWakePhrase(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                        wakePhraseInput.toLowerCase() === preset.toLowerCase()
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-black/40 text-stone-400 border-white/10 hover:border-white/30'
                      }`}
                    >
                      &ldquo;{preset}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Sensitivity Slider */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Voice Ripple Sensitivity:</span>
                  <span className="text-cyan-300">{(config.voiceSensitivity || 1.2).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={config.voiceSensitivity || 1.2}
                  onChange={(e) =>
                    onChangeConfig((prev: any) => ({
                      ...prev,
                      voiceSensitivity: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: RING SEARCH & DISPLAYS */}
          {activeTab === 'search' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-[11px] text-cyan-200/90 leading-relaxed">
                When you ask a question or search, the 4 concentric gimbal rings expand outwards and project a curved holographic HUD display showing search results, key points, and sources.
              </div>

              {/* Live Search Input Box */}
              <form onSubmit={handleSearchSubmit} className="space-y-2">
                <label className="text-white font-bold flex items-center gap-1.5">
                  <Search size={14} className="text-cyan-400" />
                  Ask Question or Search Web:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., What is ferrofluid? or Weather report"
                    className="flex-1 bg-black/60 border border-white/10 focus:border-cyan-400 px-3.5 py-2.5 rounded-xl text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Search</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </form>

              {/* Instant Questions */}
              <div className="space-y-2">
                <span className="text-stone-400 text-[11px]">Instant Inquiries:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'What is a quantum ferrofluid?',
                    'Who are you?',
                    'Atmospheric Weather and Telemetry',
                    'Local Time and Chronometer',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => voiceAIService.processUserCommand(q)}
                      className="p-2.5 rounded-xl bg-[#090e18] hover:bg-[#0d1424] border border-white/10 hover:border-cyan-500/40 text-left text-cyan-200 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate">{q}</span>
                      <Search size={12} className="text-cyan-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Expand/Retract Rings Toggle */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Ring Armature Expansion:</div>
                  <div className="text-[11px] text-stone-400">
                    {isRingsExpanded ? 'Rings Expanded for holographic data display' : 'Rings in compact normal size'}
                  </div>
                </div>
                <button
                  onClick={onToggleExpandRings}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Orbit size={14} />
                  <span>{isRingsExpanded ? 'Convert Normal' : 'Expand Rings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LEXICON & PROCEDURAL MATHEMATICAL BESTIARY */}
          {activeTab === 'bestiary' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    <Atom size={16} className="text-cyan-400 animate-spin" />
                    <span>Mathematical Procedural Fauna & Bestiary</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    All character and fauna models are generated dynamically via mathematical procedural coding (parametric curves, inverse kinematics, and minimal surfaces).
                  </p>
                </div>
                {onOpenBestiary && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBestiary();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Maximize2 size={13} />
                    <span>Open 3D Viewport</span>
                  </button>
                )}
              </div>

              {/* Grid of 6 Procedural Fauna */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BESTIARY_SPECS.map((spec) => (
                  <div
                    key={spec.id}
                    className="p-3.5 rounded-2xl bg-[#080d19] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{spec.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            {spec.category === 'character' ? 'CHARACTER' : spec.category === 'cosmic' ? '4D ENTITY' : 'FAUNA'}
                          </span>
                          <span
                            className={`text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${
                              spec.threatLevel === 'Cosmic'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                                : spec.threatLevel === 'Predatory'
                                ? 'bg-red-500/20 text-red-300 border-red-400/40'
                                : spec.threatLevel === 'Resonant'
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            }`}
                          >
                            {spec.threatLevel}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] italic text-stone-400">{spec.scientificName}</div>
                      <div className="p-2 rounded-lg bg-black/60 border border-cyan-500/20 text-[9.5px] text-cyan-200 truncate">
                        <code>{spec.mathematicalBasis.formula}</code>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-stone-400">
                      <span>Flux: {spec.magneticResonanceTesla} Tesla</span>
                      {onOpenBestiary && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenBestiary(spec.id);
                          }}
                          className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect 3D</span>
                          <ChevronRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROCEDURAL WORLD MAP (2D & 3D) */}
          {activeTab === 'worldmap' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    <Globe size={16} className="text-cyan-400 animate-pulse" />
                    <span>Procedural 2D & 3D World Cartography</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    The entire world map and terrain are synthesized mathematically using multi-octave FBM and dipole magnetic streamline vector fields.
                  </p>
                </div>
                {onOpenWorldMap && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenWorldMap();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Maximize2 size={13} />
                    <span>Launch Map</span>
                  </button>
                )}
              </div>

              {/* Grid of World Sectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WORLD_SECTORS.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-2xl bg-[#080d19] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.colorHex }} />
                          <span className="font-bold text-white text-xs">{sec.name}</span>
                        </div>
                        <span className="text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          {sec.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 line-clamp-2">{sec.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-stone-400">
                      <span>Fauna: {sec.residentFaunaName}</span>
                      {onOpenWorldMap && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenWorldMap(sec.id);
                          }}
                          className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>View on Map</span>
                          <ChevronRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MOVEMENT & EMBODIMENT */}
          {activeTab === 'movement' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-[11px] text-cyan-200/90 leading-relaxed">
                The ferrofluid entity features independent autonomous fluidic roaming with natural 3D Lissajous curves, smooth banking, and attentive gaze orientation.
              </div>

              {/* Autonomous Roam Toggle */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Autonomous Roaming:</div>
                  <div className="text-[11px] text-stone-400">Independent 3D space exploration and drifting</div>
                </div>
                <button
                  onClick={() =>
                    onChangeConfig((prev: any) => ({
                      ...prev,
                      upperHalfFloating: !prev.upperHalfFloating,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    config.upperHalfFloating !== false
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-black/40 text-stone-500 border-white/10'
                  }`}
                >
                  {config.upperHalfFloating !== false ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>

              {/* Roaming Speed Slider */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Roam Velocity:</span>
                  <span className="text-cyan-300">{(config.floatDriftSpeed || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={config.floatDriftSpeed || 1.0}
                  onChange={(e) =>
                    onChangeConfig((prev: any) => ({
                      ...prev,
                      floatDriftSpeed: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Roaming Bounds Slider */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Roaming Range Bounds:</span>
                  <span className="text-cyan-300">{(config.floatRange || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.2"
                  step="0.1"
                  value={config.floatRange || 1.0}
                  onChange={(e) =>
                    onChangeConfig((prev: any) => ({
                      ...prev,
                      floatRange: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SURFACE RIPPLES & GLOW */}
          {activeTab === 'aesthetics' && (
            <div className="space-y-5">
              {/* Rosensweig Spikes */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Rosensweig Spike Height:</span>
                  <span className="text-cyan-300">{(config.spikeHeight || 1.6).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.1"
                  value={config.spikeHeight || 1.6}
                  onChange={(e) =>
                    onChangeConfig((prev: any) => ({
                      ...prev,
                      spikeHeight: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Magnetic Strength */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Magnetic Field Intensity:</span>
                  <span className="text-cyan-300">{(config.magneticStrength || 1.8).toFixed(1)} Tesla</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={config.magneticStrength || 1.8}
                  onChange={(e) =>
                    onChangeConfig((prev: any) => ({
                      ...prev,
                      magneticStrength: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Theme Selector */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-2.5">
                <span className="font-bold text-white">Glow & Aura Theme:</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() =>
                        onChangeConfig((prev: any) => ({ ...prev, glowTheme: th.id }))
                      }
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        config.glowTheme === th.id
                          ? 'bg-white/10 border-white text-white shadow-lg'
                          : 'bg-black/40 border-white/10 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.hex }} />
                      <span className="text-[10px]">{th.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DESKTOP & HOME SCREEN */}
          {activeTab === 'desktop' && (
            <div className="space-y-5">
              {/* Android Homepage PWA */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Smartphone size={14} className="text-cyan-400" />
                      Add to Android / iOS Home Screen
                    </span>
                    <p className="text-[11px] text-stone-400">
                      Installs as a standalone virtual companion directly onto your phone&apos;s home page.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-2">
                    <Check size={14} />
                    <span>Already installed on device home screen!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Smartphone size={14} />
                    <span>Add to Android Home Screen</span>
                  </button>
                ) : isIOS ? (
                  <div className="text-[11px] text-stone-300 bg-black/40 p-3 rounded-xl border border-white/10">
                    Tap the <strong>Share</strong> button in Safari, then tap <strong>Add to Home Screen</strong>.
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-400 bg-black/40 p-2.5 rounded-xl border border-white/10">
                    Use browser menu &rarr; <strong>&ldquo;Install App&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                  </div>
                )}
              </div>

              {/* Windows Desktop Companion */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 space-y-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Monitor size={14} className="text-cyan-400" />
                    Microsoft Windows Desktop Companion (Electron)
                  </span>
                  <p className="text-[11px] text-stone-400">
                    Runs as a borderless, transparent floating window that hovers over your desktop windows.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>npm run dev:electron</code>
                    <button
                      onClick={() => copyCmd('npm run dev:electron', 'c1')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'c1' ? <Check size={14} className="text-emerald-400" /> : <CopyText />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>npm run desktop</code>
                    <button
                      onClick={() => copyCmd('npm run desktop', 'c2')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'c2' ? <Check size={14} className="text-emerald-400" /> : <CopyText />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3D Model Asset Export */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Download size={14} className="text-cyan-400" />
                    Download 3D Model (.GLB / .OBJ)
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Export 3D asset with concentric gimbal rings for Blender, Windows 3D Viewer, or CAD.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenDownloadModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold transition-all cursor-pointer"
                >
                  Export 3D
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-cyan-500/20 bg-black/60 flex items-center justify-between text-[10px] font-mono text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Wake Phrase: &ldquo;{wakePhraseInput}&rdquo;</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

const CopyText = () => <span className="text-[10px] font-mono">COPY</span>;
