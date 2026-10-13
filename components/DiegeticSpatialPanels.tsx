import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  Sliders,
  Cpu,
  Orbit,
  BookOpen,
  X,
  Maximize2,
  Minimize2,
  Terminal,
  Activity,
  Play,
  Sparkles,
  Search,
  Zap,
  Atom,
  Globe,
} from "lucide-react";
import type { FerrofluidConfig, GimbalState } from "./FerrofluidR3FApp";

export interface DiegeticPanelsProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  focusedTopic?: "settings" | "diagnostics" | "research" | "gimbal" | "all" | null;
  config: FerrofluidConfig;
  onChangeConfig: React.Dispatch<React.SetStateAction<FerrofluidConfig>>;
  gimbalState: GimbalState;
  onChangeGimbal: React.Dispatch<React.SetStateAction<GimbalState>>;
  glowTheme: string;
  onSelectGlowTheme: (theme: string) => void;
  dofEnabled: boolean;
  onToggleDof: () => void;
  onExecuteDesktopAction?: (action: string, command: string) => void;
  desktopResult?: { action: string; success: boolean; output: string } | null;
  onOpenBestiary?: () => void;
  onOpenWorldMap?: () => void;
}

export const DiegeticSpatialPanels: React.FC<DiegeticPanelsProps> = ({
  isOpen,
  onToggleOpen,
  focusedTopic,
  config,
  onChangeConfig,
  gimbalState,
  onChangeGimbal,
  glowTheme,
  onSelectGlowTheme,
  dofEnabled,
  onToggleDof,
  onExecuteDesktopAction,
  desktopResult,
  onOpenBestiary,
  onOpenWorldMap,
}) => {
  // Individual panel expanded state (when isOpen is true, or user clicks mini capsule)
  const [activePanel, setActivePanel] = useState<string | null>(focusedTopic || "settings");

  // Telemetry real-time stats
  const [cpuUsage, setCpuUsage] = useState(18);
  const [memUsage, setMemUsage] = useState(142);
  const [customCommand, setCustomCommand] = useState("notepad");
  const [researchQuery, setResearchQuery] = useState("Rosensweig Instability in Microgravity");
  const [researchNotes, setResearchNotes] = useState<string[]>([
    "Critical magnetic induction: Bc = sqrt(2 * μ0 * sqrt(ρ * g * γ))",
    "Nanoparticle surfactant encapsulation prevents cluster agglomeration under 1.5T gradient.",
    "Dynamic shear thickening observed during high-speed gyroscopic precession.",
  ]);

  useEffect(() => {
    if (focusedTopic) {
      setActivePanel(focusedTopic === "all" ? "settings" : focusedTopic);
    }
  }, [focusedTopic]);

  // Simulate subtle real-time fluctuations for system telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage((prev) => Math.min(88, Math.max(12, Math.round(prev + (Math.random() * 8 - 4)))));
      setMemUsage((prev) => Math.min(320, Math.max(110, Math.round(prev + (Math.random() * 4 - 2)))));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleResearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchQuery.trim()) return;
    setResearchNotes((prev) => [
      `Query logged: "${researchQuery}" (Active analysis node)`,
      `Synthesizing magnetohydrodynamic field lines and thermal relaxation factors...`,
      ...prev.slice(0, 3),
    ]);
  };

  const THEMES = [
    { id: "cyan", label: "Cyan", hex: "#00f0ff" },
    { id: "gold", label: "Gold", hex: "#ffaa00" },
    { id: "purple", label: "Purple", hex: "#b026ff" },
    { id: "crimson", label: "Crimson", hex: "#ff1744" },
    { id: "emerald", label: "Emerald", hex: "#00e676" },
    { id: "mercury", label: "Mercury", hex: "#e0e0e0" },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. WEST ORBIT: CORE SETTINGS & CHROMATICS PANEL                           */}
      {/* ========================================================================= */}
      <group position={[-2.45, 0.25, 0.2]}>
        <Html center distanceFactor={7.5} style={{ pointerEvents: "auto", userSelect: "none" }}>
          {activePanel === "settings" && isOpen ? (
            <div className="w-80 p-4 rounded-2xl bg-black/85 backdrop-blur-2xl border border-cyan-500/40 text-neutral-200 shadow-[0_0_35px_rgba(0,240,255,0.18)] transition-all animate-in fade-in zoom-in-95 font-sans">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-300">
                    DIEGETIC UI • CORE PHYSICAL SETTINGS
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePanel(null)}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Minimize Panel"
                  >
                    <Minimize2 size={12} />
                  </button>
                  <button
                    onClick={onToggleOpen}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Close All Spatial Panels"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Magnetic Strength Slider */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-neutral-400 mb-1">
                    <span>Magnetic Spike Amplitude (Rosensweig)</span>
                    <span className="text-cyan-300 font-bold">{config.magneticStrength.toFixed(2)}T</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3.0"
                    step="0.05"
                    value={config.magneticStrength}
                    onChange={(e) =>
                      onChangeConfig((prev) => ({ ...prev, magneticStrength: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
                  />
                </div>

                {/* Morph Intensity Slider */}
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-neutral-400 mb-1">
                    <span>Surface Circulation & Breathing Swirl</span>
                    <span className="text-cyan-300 font-bold">{config.morphIntensity.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2.5"
                    step="0.05"
                    value={config.morphIntensity}
                    onChange={(e) =>
                      onChangeConfig((prev) => ({ ...prev, morphIntensity: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
                  />
                </div>

                {/* Chroma Palettes */}
                <div>
                  <div className="font-mono text-[10px] text-neutral-400 mb-1.5">Bioluminescent Chroma Hue</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => onSelectGlowTheme(th.id)}
                        className={`h-7 rounded-lg border text-[9px] font-mono flex items-center justify-center transition-all ${
                          glowTheme === th.id
                            ? "border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-105"
                            : "border-white/15 opacity-70 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: `${th.hex}22`, color: th.hex }}
                      >
                        {th.label[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Depth of field toggle */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-300">Studio Optics (DoF)</span>
                  <button
                    onClick={onToggleDof}
                    className={`px-2.5 py-1 rounded text-[10px] border transition-all ${
                      dofEnabled
                        ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
                        : "bg-neutral-800 border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {dofEnabled ? "f/1.4 PRIME (ON)" : "BYPASS"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!isOpen) onToggleOpen();
                setActivePanel("settings");
              }}
              className="group px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 text-[10px] font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:scale-110 transition-all cursor-pointer"
            >
              <Sliders size={12} className="group-hover:rotate-45 transition-transform" />
              <span>SPATIAL SETTINGS</span>
            </button>
          )}
        </Html>
      </group>

      {/* ========================================================================= */}
      {/* 2. NORTH ORBIT: GYROSCOPIC GIMBAL DYNAMICS                                */}
      {/* ========================================================================= */}
      <group position={[0, 2.35, -0.2]}>
        <Html center distanceFactor={7.5} style={{ pointerEvents: "auto", userSelect: "none" }}>
          {activePanel === "gimbal" && isOpen ? (
            <div className="w-80 p-4 rounded-2xl bg-black/85 backdrop-blur-2xl border border-purple-500/40 text-neutral-200 shadow-[0_0_35px_rgba(176,38,255,0.18)] transition-all animate-in fade-in zoom-in-95 font-sans">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Orbit size={14} className="text-purple-400 animate-spin" style={{ animationDuration: "10s" }} />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-purple-300">
                    DIEGETIC UI • GIMBAL PRECESION
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePanel(null)}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Minimize Panel"
                  >
                    <Minimize2 size={12} />
                  </button>
                  <button
                    onClick={onToggleOpen}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Close Spatial Panels"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Ring 1 Inner Speed */}
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-neutral-400 mb-1">
                    <span>Ring 1 (Inner Spin Speed)</span>
                    <span className="text-purple-300 font-bold">{gimbalState.ring1SpeedMult.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4.0"
                    step="0.1"
                    value={gimbalState.ring1SpeedMult}
                    onChange={(e) =>
                      onChangeGimbal((prev) => ({ ...prev, ring1SpeedMult: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-purple-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
                  />
                </div>

                {/* Ring 2 Pitch */}
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-neutral-400 mb-1">
                    <span>Ring 2 (Vertical Pitch Dynamics)</span>
                    <span className="text-purple-300 font-bold">{gimbalState.ring2PitchMult.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4.0"
                    step="0.1"
                    value={gimbalState.ring2PitchMult}
                    onChange={(e) =>
                      onChangeGimbal((prev) => ({ ...prev, ring2PitchMult: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-purple-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
                  />
                </div>

                {/* Outer Ring Lock Mode */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-200 font-semibold">Outer Ring Gyro Lock</div>
                    <div className="text-[9px] text-neutral-400">Lock perimeter ring to steady horizon</div>
                  </div>
                  <button
                    onClick={() => onChangeGimbal((prev) => ({ ...prev, isOuterLocked: !prev.isOuterLocked }))}
                    className={`px-3 py-1 rounded-md text-[10px] font-mono border transition-all ${
                      gimbalState.isOuterLocked
                        ? "bg-red-500/20 border-red-400/60 text-red-300"
                        : "bg-neutral-800 border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {gimbalState.isOuterLocked ? "RIGID LOCKED" : "FREE GYRO"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!isOpen) onToggleOpen();
                setActivePanel("gimbal");
              }}
              className="group px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 text-[10px] font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(176,38,255,0.2)] hover:scale-110 transition-all cursor-pointer"
            >
              <Orbit size={12} className="group-hover:rotate-90 transition-transform" />
              <span>GIMBAL DYNAMICS</span>
            </button>
          )}
        </Html>
      </group>

      {/* ========================================================================= */}
      {/* 3. EAST ORBIT: MACHINE TELEMETRY & DESKTOP ACTIONS                        */}
      {/* ========================================================================= */}
      <group position={[2.45, 0.25, 0.2]}>
        <Html center distanceFactor={7.5} style={{ pointerEvents: "auto", userSelect: "none" }}>
          {activePanel === "diagnostics" && isOpen ? (
            <div className="w-80 p-4 rounded-2xl bg-black/85 backdrop-blur-2xl border border-emerald-500/40 text-neutral-200 shadow-[0_0_35px_rgba(0,230,118,0.18)] transition-all animate-in fade-in zoom-in-95 font-sans">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-300">
                    DIEGETIC UI • MACHINE & DESKTOP
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePanel(null)}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Minimize Panel"
                  >
                    <Minimize2 size={12} />
                  </button>
                  <button
                    onClick={onToggleOpen}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Close Spatial Panels"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Real-time Simulated Telemetry Gauges */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>CPU LOAD</span>
                    <Cpu size={10} className="text-emerald-400" />
                  </div>
                  <div className="text-base font-mono font-bold text-white mt-1">{cpuUsage}%</div>
                  <div className="w-full bg-neutral-800 h-1 rounded mt-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all" style={{ width: `${cpuUsage}%` }} />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>ACTIVE HEAP</span>
                    <Zap size={10} className="text-cyan-400" />
                  </div>
                  <div className="text-base font-mono font-bold text-white mt-1">{memUsage} MB</div>
                  <div className="w-full bg-neutral-800 h-1 rounded mt-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all"
                      style={{ width: `${Math.min(100, (memUsage / 300) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Action Launchpad */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
                  <Terminal size={11} className="text-emerald-400" />
                  DESKTOP ACTION EXECUTOR
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    placeholder="notepad, calc, powershell..."
                    className="flex-1 px-2.5 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    onClick={() => onExecuteDesktopAction?.("launch_app", customCommand)}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Play size={10} />
                    <span>RUN</span>
                  </button>
                </div>
                {desktopResult && (
                  <div className="p-1.5 rounded bg-neutral-900/90 border border-white/10 text-[9px] font-mono text-neutral-400 truncate">
                    Status: {desktopResult.success ? "✓ Executed" : "✗ Error"} • {desktopResult.output || "Done"}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!isOpen) onToggleOpen();
                setActivePanel("diagnostics");
              }}
              className="group px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400 text-[10px] font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,230,118,0.2)] hover:scale-110 transition-all cursor-pointer"
            >
              <Activity size={12} className="group-hover:scale-125 transition-transform" />
              <span>MACHINE TELEMETRY</span>
            </button>
          )}
        </Html>
      </group>

      {/* ========================================================================= */}
      {/* 4. SOUTH ORBIT: DEEP RESEARCH & COGNITIVE SHARD                           */}
      {/* ========================================================================= */}
      <group position={[0, -2.35, 0.2]}>
        <Html center distanceFactor={7.5} style={{ pointerEvents: "auto", userSelect: "none" }}>
          {activePanel === "research" && isOpen ? (
            <div className="w-88 p-4 rounded-2xl bg-black/85 backdrop-blur-2xl border border-amber-500/40 text-neutral-200 shadow-[0_0_35px_rgba(255,170,0,0.18)] transition-all animate-in fade-in zoom-in-95 font-sans">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-amber-400" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-amber-300">
                    DIEGETIC UI • COGNITIVE RESEARCH SHARD
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePanel(null)}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Minimize Panel"
                  >
                    <Minimize2 size={12} />
                  </button>
                  <button
                    onClick={onToggleOpen}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                    title="Close Spatial Panels"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Research query form */}
              <form onSubmit={handleResearchSubmit} className="flex gap-1.5 mb-2.5">
                <div className="relative flex-1">
                  <Search size={11} className="absolute left-2.5 top-2 text-neutral-400" />
                  <input
                    type="text"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    placeholder="Research topic, equation, or paper..."
                    className="w-full pl-7 pr-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} />
                  <span>DISPATCH</span>
                </button>
              </form>

              {/* Realtime Research Findings */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {/* Mathematical Procedural Launchers */}
                {onOpenBestiary && (
                  <button
                    type="button"
                    onClick={onOpenBestiary}
                    className="w-full p-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-left text-[10px] font-mono text-cyan-200 flex items-center justify-between transition-all cursor-pointer shadow-sm"
                  >
                    <span className="flex items-center gap-1.5">
                      <Atom size={12} className="text-cyan-400" />
                      <span>Procedural Bestiary & Fauna (3D)</span>
                    </span>
                    <span className="text-[8.5px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">OPEN</span>
                  </button>
                )}

                {onOpenWorldMap && (
                  <button
                    type="button"
                    onClick={onOpenWorldMap}
                    className="w-full p-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-left text-[10px] font-mono text-cyan-200 flex items-center justify-between transition-all cursor-pointer shadow-sm"
                  >
                    <span className="flex items-center gap-1.5">
                      <Globe size={12} className="text-cyan-400" />
                      <span>Procedural 2D & 3D World Map</span>
                    </span>
                    <span className="text-[8.5px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">OPEN</span>
                  </button>
                )}

                {researchNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-neutral-900/80 border border-white/5 text-[10px] font-mono text-neutral-300 leading-relaxed"
                  >
                    <span className="text-amber-400 font-bold mr-1.5">§{idx + 1}</span>
                    {note}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!isOpen) onToggleOpen();
                setActivePanel("research");
              }}
              className="group px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 text-[10px] font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(255,170,0,0.2)] hover:scale-110 transition-all cursor-pointer"
            >
              <BookOpen size={12} className="group-hover:scale-125 transition-transform" />
              <span>RESEARCH SHARD</span>
            </button>
          )}
        </Html>
      </group>
    </group>
  );
};
