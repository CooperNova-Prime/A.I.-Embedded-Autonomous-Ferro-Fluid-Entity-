/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { FerrofluidConfig, MagnetNode } from '../types';
import {
  CircleDot,
  Zap,
  Compass,
  Magnet,
  Sparkles,
  Layers,
  BookOpen,
  Activity,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  ChevronUp,
  Pin,
  PinOff,
  Sliders,
  Menu,
  Grid,
  Brain,
  Eye,
  Hand,
  Bot,
  Footprints,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

// Sub-panels
import { SubstancePanel, BALL_SKINS } from './controls/SubstancePanel';
import { PhysicsPanel } from './controls/PhysicsPanel';
import { GimbalPanel } from './controls/GimbalPanel';
import { PolesPanel } from './controls/PolesPanel';
import { AnomaliesPanel } from './controls/AnomaliesPanel';
import { AICorePanel } from './controls/AICorePanel';
import { PresetsPanel, PRESETS } from './controls/PresetsPanel';
import { TelemetryPanel } from './controls/TelemetryPanel';

// Re-export for compatibility
export { PRESETS, BALL_SKINS };

export type ActivePanelKey =
  | 'substance'
  | 'physics'
  | 'gimbal'
  | 'poles'
  | 'anomalies'
  | 'ai_core'
  | 'presets'
  | 'telemetry';

export type MenuLayoutMode = 'dropdown' | 'drawer';

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
  magnets: MagnetNode[];
  onAddMagnet: (x: number, z: number, polarity: 'north' | 'south') => void;
  onRemoveMagnet: (id: string) => void;
  onClearMagnets: () => void;
  onOpenTennisModal?: () => void;
  onOpenCodex?: () => void;
  onTakeSnapshot?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ArcaneControls: React.FC<Props> = ({
  config,
  onChangeConfig,
  magnets,
  onAddMagnet,
  onRemoveMagnet,
  onClearMagnets,
  onOpenTennisModal,
  onOpenCodex,
  onTakeSnapshot,
  isFullscreen,
  onToggleFullscreen,
}) => {
  // Navigation layout state
  const [layoutMode, setLayoutMode] = useState<MenuLayoutMode>('dropdown');
  const [activeDropdown, setActiveDropdown] = useState<ActivePanelKey | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  // Expanding drawer accordion state (which sections are expanded)
  const [expandedSections, setExpandedSections] = useState<Record<ActivePanelKey, boolean>>({
    substance: true,
    physics: false,
    gimbal: false,
    poles: false,
    anomalies: false,
    ai_core: false,
    presets: false,
    telemetry: false,
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick mic & audio state
  const [isVoiceActive, setIsVoiceActive] = useState(
    audioEngine.getIsVoiceActive() || !!config.voiceReactive
  );

  // Close dropdown on click outside if not pinned
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPinned) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if click was on one of the menu buttons
        const target = event.target as HTMLElement;
        if (target.closest('[data-dropdown-trigger]')) return;
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPinned]);

  const toggleDropdown = (key: ActivePanelKey) => {
    if (activeDropdown === key) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(key);
    }
  };

  const toggleSection = (key: ActivePanelKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleVoice = async () => {
    if (isVoiceActive) {
      audioEngine.stopVoiceInput();
      setIsVoiceActive(false);
      onChangeConfig((p) => ({ ...p, voiceReactive: false }));
    } else {
      try {
        await audioEngine.startVoiceInput();
        setIsVoiceActive(true);
        onChangeConfig((p) => ({ ...p, voiceReactive: true }));
      } catch (err) {
        console.warn('Microphone access denied:', err);
      }
    }
  };

  const toggleAudio = () => {
    const next = !config.soundEnabled;
    onChangeConfig((p) => ({ ...p, soundEnabled: next }));
    if (next) {
      audioEngine.start();
      audioEngine.setVolume(config.soundVolume);
    } else {
      audioEngine.stop();
    }
  };

  const triggerSurge = () => {
    audioEngine.playMagneticPulse(1.0);
    const prev = config.magneticStrength;
    onChangeConfig((p) => ({ ...p, magneticStrength: Math.min(p.magneticStrength + 0.8, 3.0) }));
    setTimeout(() => {
      onChangeConfig((p) => ({ ...p, magneticStrength: prev }));
    }, 450);
  };

  // Nav items configuration
  const NAV_ITEMS: Array<{
    key: ActivePanelKey;
    label: string;
    icon: any;
    badge?: string | number;
  }> = [
    {
      key: 'substance',
      label: 'Substance',
      icon: CircleDot,
      badge: config.meshShape === 'sphere' ? '6.7cm' : 'Basin',
    },
    {
      key: 'physics',
      label: 'Physics',
      icon: Activity,
      badge: `${config.magneticStrength.toFixed(1)}T`,
    },
    {
      key: 'gimbal',
      label: 'Gimbal',
      icon: Compass,
      badge: config.showGimbalRings ? '4-Ring' : undefined,
    },
    {
      key: 'poles',
      label: 'Poles',
      icon: Magnet,
      badge: magnets.length > 0 ? magnets.length : undefined,
    },
    {
      key: 'anomalies',
      label: 'Anomalies',
      icon: Sparkles,
      badge: isVoiceActive ? 'Live' : undefined,
    },
    {
      key: 'ai_core',
      label: 'AI Core',
      icon: Brain,
      badge: config.aiCoreEnabled ? 'Linked' : undefined,
    },
    {
      key: 'presets',
      label: 'Presets',
      icon: Layers,
    },
    {
      key: 'telemetry',
      label: 'Telemetry',
      icon: BookOpen,
    },
  ];

  // Render sub-panel content based on key
  const renderPanelContent = (key: ActivePanelKey) => {
    switch (key) {
      case 'substance':
        return (
          <SubstancePanel
            config={config}
            onChangeConfig={onChangeConfig}
            onOpenTennisModal={onOpenTennisModal}
          />
        );
      case 'physics':
        return <PhysicsPanel config={config} onChangeConfig={onChangeConfig} />;
      case 'gimbal':
        return <GimbalPanel config={config} onChangeConfig={onChangeConfig} />;
      case 'poles':
        return (
          <PolesPanel
            config={config}
            onChangeConfig={onChangeConfig}
            magnets={magnets}
            onAddMagnet={onAddMagnet}
            onRemoveMagnet={onRemoveMagnet}
            onClearMagnets={onClearMagnets}
          />
        );
      case 'anomalies':
        return <AnomaliesPanel config={config} onChangeConfig={onChangeConfig} />;
      case 'ai_core':
        return <AICorePanel config={config} onChangeConfig={onChangeConfig} />;
      case 'presets':
        return <PresetsPanel config={config} onChangeConfig={onChangeConfig} />;
      case 'telemetry':
        return (
          <TelemetryPanel
            config={config}
            onOpenCodex={onOpenCodex}
            onOpenTennisModal={onOpenTennisModal}
          />
        );
      default:
        return null;
    }
  };

  const getPanelTitle = (key: ActivePanelKey) => {
    switch (key) {
      case 'substance':
        return 'Substance Geometry & Regulation Scale';
      case 'physics':
        return 'Magnetohydrodynamic Wave Parameters';
      case 'gimbal':
        return '4-Ring Gyroscope Gimbal & Optic Rings';
      case 'poles':
        return 'Magnetic Dipole Poles & Interactions';
      case 'anomalies':
        return 'Voice Reactivity & Void Anomalies';
      case 'presets':
        return 'Curated Archetype Profiles';
      case 'telemetry':
        return 'Live Mathematical Physics Telemetry';
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP UNIFIED HUD NAVIGATION BAR (Zero Overlap with Viewport Elements)   */}
      {/* ========================================================================= */}
      <header
        id="arcane-top-hud-bar"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] flex items-center gap-2 bg-[#090b10]/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl select-none"
      >
        {/* Brand / Logo Pill */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10 flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00ffff]" />
          <span className="font-cinzel text-xs font-bold tracking-widest text-white hidden md:inline">
            FERROFLUID ARCANA
          </span>
        </div>

        {/* Active Shape Pill Trigger */}
        <button
          onClick={() => {
            if (layoutMode === 'drawer') {
              setIsDrawerOpen(true);
              setExpandedSections((p) => ({ ...p, substance: true }));
            } else {
              setActiveDropdown('substance');
            }
          }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25 transition-all text-[11px] font-mono font-semibold flex-shrink-0 cursor-pointer"
          title="Click to configure substance form & skin"
        >
          <CircleDot size={12} className="text-cyan-400" />
          <span className="hidden sm:inline">
            {config.meshShape === 'sphere'
              ? `Tennis Ball (${(config.tennisBallDiameter || 6.7).toFixed(1)}cm)`
              : 'Abyss Basin'}
          </span>
          <span className="sm:hidden">
            {config.meshShape === 'sphere' ? '6.7cm' : 'Basin'}
          </span>
        </button>

        {/* Dropdown Menu Triggers (When in Dropdown Mode) */}
        {layoutMode === 'dropdown' && (
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeDropdown === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  data-dropdown-trigger={item.key}
                  onClick={() => toggleDropdown(item.key)}
                  className={`px-2.5 py-1 rounded-xl font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                      : 'bg-stone-900/40 border-white/5 text-stone-300 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-cyan-300' : 'text-stone-400'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-cyan-400 text-black font-bold'
                          : 'bg-white/10 text-stone-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 opacity-60 ${
                      isActive ? 'rotate-180 text-cyan-300' : ''
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        )}

        {/* Drawer Trigger Button (When in Drawer Mode) */}
        {layoutMode === 'drawer' && (
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`px-3 py-1 rounded-xl font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer border ${
              isDrawerOpen
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-stone-900/60 border-white/10 text-stone-300 hover:text-white'
            }`}
          >
            <Menu size={13} className="text-cyan-400" />
            <span>Side Control Dock</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
              {isDrawerOpen ? 'Open' : 'Closed'}
            </span>
          </button>
        )}

        {/* Separator */}
        <div className="w-[1px] h-4 bg-white/10 mx-0.5 flex-shrink-0" />

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Voice Instability Toggle */}
          <button
            onClick={toggleVoice}
            title={isVoiceActive ? 'Disable Microphone Instability' : 'Enable Voice Reactive Ripples'}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 animate-pulse'
                : 'bg-stone-900/50 border-white/10 text-stone-400 hover:text-stone-200'
            }`}
          >
            {isVoiceActive ? <Mic size={13} /> : <MicOff size={13} />}
          </button>

          {/* Webcam Camera Vision & Hand Tracking Toggle */}
          <button
            onClick={() => onChangeConfig((p) => ({ ...p, handTrackingEnabled: !p.handTrackingEnabled }))}
            title={config.handTrackingEnabled ? 'Turn Off Webcam Vision & Hand Tracking' : 'Open Webcam Camera & Hand Tracking HUD'}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              config.handTrackingEnabled
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-stone-900/50 border-white/10 text-stone-400 hover:text-cyan-300 hover:border-cyan-500/30'
            }`}
          >
            <Eye size={13} />
          </button>

          {/* Embodied AI Agent Physics Locomotion HUD Toggle */}
          <button
            onClick={() => {
              onChangeConfig((p) => {
                const next = !p.embodiedLocomotionEnabled;
                return {
                  ...p,
                  embodiedLocomotionEnabled: next,
                  showLocomotionTelemetry: next ? true : p.showLocomotionTelemetry,
                };
              });
            }}
            title={config.embodiedLocomotionEnabled ? 'Disengage Embodied Locomotion' : 'Engage Embodied AI Locomotion & Physics Joints'}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              config.embodiedLocomotionEnabled
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-stone-900/50 border-white/10 text-stone-400 hover:text-emerald-300 hover:border-emerald-500/30'
            }`}
          >
            <Bot size={13} />
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            title={config.soundEnabled ? 'Mute Harmonic Audio' : 'Enable Harmonic Audio'}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              config.soundEnabled
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                : 'bg-stone-900/50 border-white/10 text-stone-400 hover:text-stone-200'
            }`}
          >
            {config.soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Electromagnetic Surge */}
          <button
            onClick={triggerSurge}
            title="Electromagnetic Surge Pulse"
            className="p-1.5 rounded-xl bg-stone-900/50 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-stone-400 hover:text-amber-300 transition-all cursor-pointer"
          >
            <Zap size={13} />
          </button>

          {/* Snapshot */}
          {onTakeSnapshot && (
            <button
              onClick={onTakeSnapshot}
              title="Capture High-Res Image"
              className="p-1.5 rounded-xl bg-stone-900/50 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-stone-400 hover:text-cyan-200 transition-all cursor-pointer"
            >
              <Camera size={13} />
            </button>
          )}

          {/* Fullscreen */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-1.5 rounded-xl bg-stone-900/50 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-stone-400 hover:text-cyan-200 transition-all cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {/* Layout Mode Switcher (Dropdowns ⇄ Expanding Drawer) */}
          <button
            onClick={() => {
              if (layoutMode === 'dropdown') {
                setLayoutMode('drawer');
                setIsDrawerOpen(true);
                setActiveDropdown(null);
              } else {
                setLayoutMode('dropdown');
                setIsDrawerOpen(false);
              }
            }}
            title={
              layoutMode === 'dropdown'
                ? 'Switch to Expanding Side Menu'
                : 'Switch to Floating Dropdown Menus'
            }
            className="px-2 py-1 rounded-xl bg-stone-900/80 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-[10px] font-mono text-stone-300 hover:text-cyan-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Sliders size={11} className="text-cyan-400" />
            <span className="hidden lg:inline">
              {layoutMode === 'dropdown' ? 'Side Menu' : 'Dropdowns'}
            </span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. FLOATING DROPDOWN CARD (Mode: 'dropdown')                               */}
      {/* Exactly 1 panel open at a time; never reaches bottom zoom dock            */}
      {/* ========================================================================= */}
      {layoutMode === 'dropdown' && activeDropdown && (
        <div
          ref={dropdownRef}
          id={`dropdown-panel-${activeDropdown}`}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-[95vw] sm:w-[500px] max-h-[calc(100vh-130px)] flex flex-col bg-[#0b0e14]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.2)] animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        >
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {activeDropdown === 'substance' && <CircleDot size={13} />}
                {activeDropdown === 'physics' && <Activity size={13} />}
                {activeDropdown === 'gimbal' && <Compass size={13} />}
                {activeDropdown === 'poles' && <Magnet size={13} />}
                {activeDropdown === 'anomalies' && <Sparkles size={13} />}
                {activeDropdown === 'presets' && <Layers size={13} />}
                {activeDropdown === 'telemetry' && <BookOpen size={13} />}
              </span>
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {getPanelTitle(activeDropdown)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Pin Toggle */}
              <button
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? 'Unpin (Close on click outside)' : 'Pin (Keep open during 3D orbit)'}
                className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isPinned
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isPinned ? <Pin size={13} /> : <PinOff size={13} />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setActiveDropdown(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close panel"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Dropdown Scrollable Body */}
          <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {renderPanelContent(activeDropdown)}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EXPANDING SIDE MENU / DRAWER (Mode: 'drawer')                           */}
      {/* Docks on the left; accordion sections; stops safely above bottom HUD      */}
      {/* ========================================================================= */}
      {layoutMode === 'drawer' && isDrawerOpen && (
        <aside
          id="arcane-side-drawer"
          className="fixed top-14 left-4 bottom-20 w-88 md:w-96 z-40 flex flex-col bg-[#0b0e14]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.2)] animate-in slide-in-from-left duration-200 overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00ffff]" />
              <span className="font-cinzel text-xs font-bold tracking-wider text-white">
                ARCANE CONTROL DOCK
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setLayoutMode('dropdown');
                  setIsDrawerOpen(false);
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white font-mono text-[10px] cursor-pointer"
                title="Switch back to Floating Dropdown Menus"
              >
                Switch to Dropdowns
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-stone-400 hover:text-white hover:bg-white/10 rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Accordion Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isOpen = expandedSections[item.key];
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-white/5 bg-stone-900/30 overflow-hidden transition-all"
                >
                  {/* Accordion Section Header */}
                  <button
                    onClick={() => toggleSection(item.key)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/5 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={13} className="text-cyan-400" />
                      <span className="font-mono text-xs font-bold text-stone-200">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/20">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp size={14} className="text-stone-400" />
                    ) : (
                      <ChevronDown size={14} className="text-stone-400" />
                    )}
                  </button>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div className="p-3 border-t border-white/5 bg-black/20">
                      {renderPanelContent(item.key)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </>
  );
};
