import React, { useState, useRef, useEffect } from "react";
import {
  Sliders,
  Sparkles,
  Orbit,
  Layers,
  Cpu,
  BookOpen,
  Pin,
  PinOff,
  ChevronDown,
  ChevronRight,
  Zap,
  Terminal,
  Play,
  RotateCw,
  Lock,
  Unlock,
  Eye,
  Aperture,
  Compass,
  Atom,
  Globe,
} from "lucide-react";
import type { FerrofluidConfig, GimbalState } from "./FerrofluidR3FApp";

export interface LightConstructDockProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  config: FerrofluidConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<FerrofluidConfig>>;
  gimbalState: GimbalState;
  onChangeGimbal: React.Dispatch<React.SetStateAction<GimbalState>>;
  glowTheme: string;
  onSelectGlowTheme: (theme: string) => void;
  bgMode: "transparent" | "black-void" | "dark-gray" | "studio";
  onChangeBgMode: (mode: "transparent" | "black-void" | "dark-gray" | "studio") => void;
  dofEnabled: boolean;
  onToggleDof: () => void;
  dofBokehScale: number;
  onChangeDofBokeh: (scale: number) => void;
  onExecuteDesktopAction?: (action: string, command: string) => void;
  desktopResult?: { action: string; success: boolean; output: string } | null;
  onOpenBestiary?: () => void;
  onOpenWorldMap?: () => void;
  onOpenGlassmorphicPanel?: () => void;
}

export const LightConstructDock: React.FC<LightConstructDockProps> = ({
  isOpen,
  onToggleOpen,
  config,
  onChangeConfig,
  gimbalState,
  onChangeGimbal,
  glowTheme,
  onSelectGlowTheme,
  bgMode,
  onChangeBgMode,
  dofEnabled,
  onToggleDof,
  dofBokehScale,
  onChangeDofBokeh,
  onExecuteDesktopAction,
  desktopResult,
  onOpenBestiary,
  onOpenWorldMap,
  onOpenGlassmorphicPanel,
}) => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active accordion section
  const [activeTab, setActiveTab] = useState<"core" | "gimbal" | "void" | "telemetry" | "codex">("core");

  // Telemetry real-time values
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(14);
  const [customCmd, setCustomCmd] = useState("notepad");

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(58 + Math.random() * 4));
      setLatency(Math.floor(12 + Math.random() * 5));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 420);
    }
  };

  const expanded = isOpen || isPinned || isHovered;

  const glowThemes = [
    { id: "cyan", name: "Cyan", color: "#00f0ff" },
    { id: "gold", name: "Gold", color: "#ffd700" },
    { id: "purple", name: "Violet", color: "#b347ff" },
    { id: "emerald", name: "Emerald", color: "#00ff88" },
    { id: "crimson", name: "Crimson", color: "#ff2255" },
    { id: "mercury", name: "Mercury", color: "#e2e8f0" },
  ];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed left-4 top-16 bottom-16 z-40 flex items-center pointer-events-auto"
    >
      {/* 1. COLLAPSED LIGHT-CONSTRUCT BLADE / STRIP */}
      {!expanded && (
        <button
          onClick={onToggleOpen}
          aria-label="Open Light Construct Settings"
          className="group relative flex flex-col items-center justify-between py-5 px-2.5 rounded-2xl cursor-pointer select-none transition-all duration-300
            backdrop-blur-xl bg-neutral-950/40 border border-cyan-400/30 hover:border-cyan-400/70
            shadow-[0_0_20px_rgba(0,240,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.2)]
            hover:shadow-[0_0_28px_rgba(0,240,255,0.35)] hover:scale-[1.02]"
        >
          {/* Top glowing laser indicator */}
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />

          {/* Icon */}
          <div className="my-4 p-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 group-hover:text-white transition-colors">
            <Sliders size={15} />
          </div>

          {/* Vertical light-etched label */}
          <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-mono tracking-widest text-cyan-300/80 group-hover:text-cyan-200 transition-colors uppercase font-medium">
            LIGHT CONSTRUCT // SETTINGS
          </span>

          {/* Bottom active theme pip */}
          <div
            className="w-2.5 h-2.5 rounded-full mt-4 border border-white/40 shadow-sm"
            style={{
              backgroundColor: glowThemes.find((t) => t.id === glowTheme)?.color || "#00f0ff",
            }}
          />
        </button>
      )}

      {/* 2. EXPANDED GLASSMORPHIC LIGHT CONSTRUCT PANEL */}
      {expanded && (
        <div
          className="w-84 max-h-[85vh] flex flex-col rounded-2xl overflow-hidden select-none transition-all duration-300
            backdrop-blur-2xl bg-neutral-950/75 border border-cyan-400/40
            shadow-[0_8px_38px_rgba(0,0,0,0.8),0_0_30px_rgba(0,240,255,0.22),inset_0_1px_2px_rgba(255,255,255,0.25)]"
        >
          {/* TOP LIGHT HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-transparent to-cyan-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <Sliders size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold tracking-wider text-white">
                  LIGHT CONSTRUCT
                </h3>
                <span className="text-[9px] font-mono text-cyan-300/70 tracking-widest">
                  FERROFLUID // DESKTOP CONTROLS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? "Unpin (auto-collapse on mouse leave)" : "Pin panel open"}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isPinned
                    ? "bg-cyan-500/30 border-cyan-400/60 text-cyan-200"
                    : "bg-neutral-900/60 border-neutral-700/40 text-neutral-400 hover:text-white"
                }`}
              >
                {isPinned ? <Pin size={11} /> : <PinOff size={11} />}
              </button>
              <button
                onClick={() => {
                  setIsPinned(false);
                  setIsHovered(false);
                  if (isOpen) onToggleOpen();
                }}
                title="Collapse dock"
                className="p-1.5 rounded-lg border border-neutral-700/40 bg-neutral-900/60 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* NAVIGATION LIGHT TABS */}
          <div className="flex border-b border-white/5 bg-black/40 px-2 py-1.5 gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "core", label: "Core", icon: Sparkles },
              { id: "gimbal", label: "Gimbal", icon: Orbit },
              { id: "void", label: "Void & Optics", icon: Layers },
              { id: "telemetry", label: "Telemetry", icon: Cpu },
              { id: "codex", label: "Codex", icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.25)] font-bold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon size={11} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 text-xs font-mono">
            {/* 1. CORE SPHERE SETTINGS */}
            {activeTab === "core" && (
              <div className="space-y-4">
                {/* Bloom & Tendril Glow Slider */}
                <div className="space-y-1.5 p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 shadow-[0_0_15px_rgba(255,170,0,0.12)]">
                  <div className="flex justify-between items-center text-[10px] text-neutral-300">
                    <span className="text-amber-300 font-semibold tracking-wider flex items-center gap-1.5">
                      <Sparkles size={11} className="text-amber-400 animate-pulse" /> BLOOM & TENDRIL GLOW
                    </span>
                    <span className="text-amber-300 font-bold font-mono">
                      {(config.bloomIntensity ?? 1.35).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={config.bloomIntensity ?? 1.35}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeConfig((prev) => ({ ...prev, bloomIntensity: val }));
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
                    <span>ETHEREAL GHOST</span>
                    <span>COSMIC RADIANCE</span>
                  </div>
                </div>

                {/* Magnetic Field Spikes */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-300">
                    <span className="text-cyan-400 font-semibold tracking-wider flex items-center gap-1">
                      <Zap size={11} /> ROSENSWEIG SPIKES
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {config.magneticStrength.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={config.magneticStrength}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeConfig((prev) => ({ ...prev, magneticStrength: val }));
                    }}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] text-neutral-500">
                    <span>MILD SPHEROID</span>
                    <span>RESTLESS ROSENSWEIG</span>
                  </div>
                </div>

                {/* Fluid Morphing Inertia / Viscosity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-300">
                    <span className="text-cyan-400 font-semibold tracking-wider flex items-center gap-1">
                      <RotateCw size={11} /> FLUID VISCOSITY & FLOW
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {config.morphIntensity.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.05"
                    value={config.morphIntensity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeConfig((prev) => ({ ...prev, morphIntensity: val }));
                    }}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] text-neutral-500">
                    <span>DENSE OBSIDIAN</span>
                    <span>SURGING TOROIDAL</span>
                  </div>
                </div>

                {/* Bioluminescent Chroma Theme Swatches */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="text-[10px] text-neutral-300 tracking-wider font-semibold text-cyan-400">
                    BIOLUMINESCENT CHROMA
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {glowThemes.map((item) => {
                      const isSel = glowTheme === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onSelectGlowTheme(item.id)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-[9px] tracking-wider transition-all cursor-pointer ${
                            isSel
                              ? "bg-cyan-500/20 border-cyan-400/80 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                              : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-400"
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full border border-white/30"
                            style={{
                              backgroundColor: item.color,
                              boxShadow: isSel ? `0 0 8px ${item.color}` : "none",
                            }}
                          />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. GIMBAL ARMATURE DYNAMICS */}
            {activeTab === "gimbal" && (
              <div className="space-y-4">
                {/* Outer Ring Lock Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-neutral-900/50">
                  <div className="flex items-center gap-2">
                    {gimbalState.isOuterLocked ? (
                      <Lock size={14} className="text-red-400" />
                    ) : (
                      <Unlock size={14} className="text-emerald-400" />
                    )}
                    <div>
                      <div className="text-[10px] font-bold text-white tracking-wider">
                        RING 4 LOCK
                      </div>
                      <div className="text-[8px] text-neutral-400">
                        {gimbalState.isOuterLocked ? "LOCKED IN ALIGNMENT" : "FREE GYROSCOPIC TUMBLING"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onChangeGimbal((prev) => ({
                        ...prev,
                        isOuterLocked: !prev.isOuterLocked,
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                      gimbalState.isOuterLocked
                        ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(255,50,50,0.3)]"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                    }`}
                  >
                    {gimbalState.isOuterLocked ? "UNLOCK" : "LOCK"}
                  </button>
                </div>

                {/* Ring Velocities */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-neutral-400">
                      <span>R1 SPIN (INNER AXIS)</span>
                      <span className="text-cyan-300 font-bold">{gimbalState.ring1SpeedMult.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.5"
                      step="0.1"
                      value={gimbalState.ring1SpeedMult}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onChangeGimbal((prev) => ({ ...prev, ring1SpeedMult: val }));
                      }}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-neutral-400">
                      <span>R2 PITCH OSCILLATION</span>
                      <span className="text-cyan-300 font-bold">{gimbalState.ring2PitchMult.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.5"
                      step="0.1"
                      value={gimbalState.ring2PitchMult}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onChangeGimbal((prev) => ({ ...prev, ring2PitchMult: val }));
                      }}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-neutral-400">
                      <span>R3 COUNTER-PRECESSION</span>
                      <span className="text-cyan-300 font-bold">{gimbalState.ring3SpeedMult.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.5"
                      step="0.1"
                      value={gimbalState.ring3SpeedMult}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onChangeGimbal((prev) => ({ ...prev, ring3SpeedMult: val }));
                      }}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                    />
                  </div>
                </div>

                {/* Preset Motion Modes */}
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[10px] text-neutral-400">MOTION PRESETS</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { name: "Fluid", r1: 1.0, r2: 1.0, r3: 1.0, lock: false },
                      { name: "Resonant", r1: 2.2, r2: 1.8, r3: 2.5, lock: false },
                      { name: "Rigid", r1: 0.5, r2: 0.5, r3: 0.5, lock: true },
                    ].map((m) => (
                      <button
                        key={m.name}
                        onClick={() =>
                          onChangeGimbal((prev) => ({
                            ...prev,
                            ring1SpeedMult: m.r1,
                            ring2PitchMult: m.r2,
                            ring3SpeedMult: m.r3,
                            isOuterLocked: m.lock,
                          }))
                        }
                        className="px-2 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:border-cyan-500/40 text-[9px] text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. VOID & OPTICS (BACKGROUNDS & STUDIO DEPTH OF FIELD) */}
            {activeTab === "void" && (
              <div className="space-y-4">
                {/* Background Void Modes */}
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-cyan-400 tracking-wider flex items-center gap-1.5">
                    <Layers size={11} /> VOID ENVIRONMENT & SHADOWS
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "transparent",
                        title: "Transparent",
                        desc: "Windows Desktop Mode",
                        dotBg: "bg-transparent border-dashed border border-cyan-400",
                      },
                      {
                        id: "black-void",
                        title: "Obsidian Void",
                        desc: "Deep Cosmic Black",
                        dotBg: "bg-[#020204]",
                      },
                      {
                        id: "dark-gray",
                        title: "Dark Gray Void",
                        desc: "Industrial Slate",
                        dotBg: "bg-[#111317]",
                      },
                      {
                        id: "studio",
                        title: "Studio White",
                        desc: "Photographic Drop Shadow",
                        dotBg: "bg-white",
                      },
                    ].map((mode) => {
                      const isSel = bgMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => onChangeBgMode(mode.id as any)}
                          className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSel
                              ? "bg-cyan-500/20 border-cyan-400/80 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                              : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-400"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${mode.dotBg}`} />
                            <span className="text-[10px] font-bold text-neutral-200">
                              {mode.title}
                            </span>
                          </div>
                          <span className="text-[8px] text-neutral-500">{mode.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Studio Depth of Field Lens */}
                <div className="p-3 rounded-xl border border-white/5 bg-neutral-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Aperture
                        size={13}
                        className={dofEnabled ? "text-amber-400" : "text-neutral-500"}
                      />
                      <div>
                        <div className="text-[10px] font-bold text-white">STUDIO f/1.4 DOF</div>
                        <div className="text-[8px] text-neutral-400">
                          {dofEnabled ? "MACRO BOKEH BLUR" : "INFINITE FOCUS PIN-SHARP"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onToggleDof}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                        dofEnabled
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(255,180,50,0.3)]"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {dofEnabled ? "ACTIVE" : "OFF"}
                    </button>
                  </div>

                  {dofEnabled && (
                    <div className="space-y-1 pt-2 border-t border-white/5">
                      <div className="flex justify-between text-[8px] text-neutral-400">
                        <span>BOKEH SCALE</span>
                        <span className="text-amber-300 font-bold">{dofBokehScale.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.2"
                        value={dofBokehScale}
                        onChange={(e) => onChangeDofBokeh(parseFloat(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. TELEMETRY & HARDWARE DESKTOP ACTIONS */}
            {activeTab === "telemetry" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-white/5 bg-neutral-900/60">
                    <div className="text-[8px] text-neutral-400">FRAME TIME</div>
                    <div className="text-sm font-bold text-emerald-400">{fps} FPS</div>
                    <div className="text-[8px] text-neutral-500">16.6ms / frame</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-white/5 bg-neutral-900/60">
                    <div className="text-[8px] text-neutral-400">AUDIO LATENCY</div>
                    <div className="text-sm font-bold text-cyan-400">{latency} ms</div>
                    <div className="text-[8px] text-neutral-500">WebAudio 24kHz</div>
                  </div>
                </div>

                {/* Desktop Action Runner */}
                <div className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 space-y-2">
                  <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Terminal size={11} /> DESKTOP PIPELINE EXECUTION
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customCmd}
                      onChange={(e) => setCustomCmd(e.target.value)}
                      placeholder="e.g. notepad, calc, url..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-700 text-[10px] text-neutral-200 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => onExecuteDesktopAction?.("launch_app", customCmd)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 border border-cyan-400/50 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Play size={10} /> RUN
                    </button>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => onExecuteDesktopAction?.("system_status", "status")}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[9px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      Check Status
                    </button>
                    <button
                      onClick={() => onExecuteDesktopAction?.("open_url", "https://ai.google.dev")}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[9px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      Open Docs
                    </button>
                  </div>

                  {desktopResult && (
                    <div className="mt-2 p-2 rounded-lg bg-black/60 border border-neutral-800 text-[9px] text-neutral-300 max-h-20 overflow-y-auto">
                      <div className="text-cyan-400 font-bold mb-0.5">
                        [Result // {desktopResult.action}]
                      </div>
                      <div>{desktopResult.output}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. RESEARCH CODEX & MATHEMATICAL PROCEDURAL SHARDS */}
            {activeTab === "codex" && (
              <div className="space-y-3">
                {/* Mathematical Bestiary & Fauna Card */}
                {onOpenBestiary && (
                  <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1.5">
                        <Atom size={12} className="text-cyan-400" />
                        PROCEDURAL BESTIARY (3D)
                      </div>
                      <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                        6 SPECIMENS
                      </span>
                    </div>
                    <p className="text-[9px] text-neutral-300 leading-relaxed font-sans">
                      All fauna and character models are generated dynamically using mathematical procedural algorithms: parametric sinusoidal splines, inverse kinematics, and minimal surface level sets.
                    </p>
                    <button
                      onClick={onOpenBestiary}
                      className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-[9.5px] font-mono font-bold text-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Atom size={11} />
                      <span>LAUNCH 3D PROCEDURAL LEXICON</span>
                    </button>
                  </div>
                )}

                {/* Procedural 2D/3D World Map Card */}
                {onOpenWorldMap && (
                  <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1.5">
                        <Globe size={12} className="text-cyan-400" />
                        PROCEDURAL WORLD MAP (2D/3D)
                      </div>
                      <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                        6 SECTORS
                      </span>
                    </div>
                    <p className="text-[9px] text-neutral-300 leading-relaxed font-sans">
                      Planetary terrain elevation and dipole magnetic field lines synthesized mathematically via multi-octave Fractal Brownian Motion and Maxwell field equations.
                    </p>
                    <button
                      onClick={onOpenWorldMap}
                      className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-[9.5px] font-mono font-bold text-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Globe size={11} />
                      <span>EXPLORE 2D / 3D WORLD MAP</span>
                    </button>
                  </div>
                )}

                {/* All-in-One Glassmorphic Panel Quick Launch */}
                {onOpenGlassmorphicPanel && (
                  <button
                    onClick={onOpenGlassmorphicPanel}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 hover:from-cyan-900/60 hover:to-purple-900/60 border border-cyan-400/40 text-[9.5px] font-mono font-bold text-white transition-all cursor-pointer flex items-center justify-between shadow-md"
                  >
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Sparkles size={12} />
                      ALL-IN-ONE VUI & SETTINGS
                    </span>
                    <ChevronRight size={12} className="text-cyan-400" />
                  </button>
                )}

                <div className="p-3 rounded-xl border border-white/5 bg-neutral-900/50 space-y-1.5">
                  <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                    <BookOpen size={11} /> ROSENSWEIG INSTABILITY
                  </div>
                  <p className="text-[9px] text-neutral-300 leading-relaxed">
                    Occurs when a ferrofluid is subjected to a perpendicular magnetic field exceeding
                    critical threshold Bc = √(4μ₀ρgγ). Surface tension and magnetic permeability
                    interlock to organize into hexagonal cone peaks.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-neutral-900/50 space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <Orbit size={11} /> GYROSCOPIC PRECESSION
                  </div>
                  <p className="text-[9px] text-neutral-300 leading-relaxed">
                    Torque-induced angular velocity precession: Ωp = τ / (I · ωs). The 4-ring
                    armature isolates rotational moments, maintaining zero net drift along the
                    focal observer vector.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
