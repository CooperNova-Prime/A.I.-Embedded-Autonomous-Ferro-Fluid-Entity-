import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  Sliders,
  Cpu,
  Orbit,
  BookOpen,
  X,
  Minimize2,
  Terminal,
  Activity,
  Play,
  Sparkles,
  Zap,
  Radio,
  Eye,
  MessageSquare,
  Compass,
  ChevronLeft,
  ChevronRight,
  Pause,
  RotateCw,
} from "lucide-react";
import type { FerrofluidConfig, GimbalState } from "./FerrofluidR3FApp";

export interface OrbitingVirtualPanelsProps {
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
  isProcessing?: boolean;
  modelVoiceLevel?: number;
  userVoiceVolume?: number;
  focusedTopic?: "settings" | "diagnostics" | "research" | "gimbal" | "entity" | null;
  onSelectTopic?: (topic: "settings" | "diagnostics" | "research" | "gimbal" | "entity" | null) => void;
  isOpen?: boolean;
}

const THEMES = [
  { id: "cyan", label: "Cyan", hex: "#00f0ff" },
  { id: "gold", label: "Gold", hex: "#ffaa00" },
  { id: "purple", label: "Purple", hex: "#b026ff" },
  { id: "crimson", label: "Crimson", hex: "#ff1744" },
  { id: "emerald", label: "Emerald", hex: "#00e676" },
  { id: "mercury", label: "Mercury", hex: "#e0e0e0" },
];

export const OrbitingVirtualPanels: React.FC<OrbitingVirtualPanelsProps> = ({
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
  isProcessing = false,
  modelVoiceLevel = 0,
  userVoiceVolume = 0,
  focusedTopic = null,
  onSelectTopic,
  isOpen = true,
}) => {
  const carouselGroupRef = useRef<THREE.Group>(null);

  // 5 Orbiting Panels distributed in an orbit ring around the sphere
  const PANELS = [
    { id: "entity", label: "ENTITY COGNITION", icon: Radio, angleIndex: 0 },
    { id: "settings", label: "CORE SETTINGS", icon: Sliders, angleIndex: 1 },
    { id: "gimbal", label: "GIMBAL DYNAMICS", icon: Orbit, angleIndex: 2 },
    { id: "diagnostics", label: "MACHINE TELEMETRY", icon: Activity, angleIndex: 3 },
    { id: "research", label: "COGNITIVE SHARD", icon: BookOpen, angleIndex: 4 },
  ] as const;

  type PanelId = (typeof PANELS)[number]["id"];

  // Current active / focused panel
  const [activePanel, setActivePanel] = useState<PanelId | null>("entity");
  // Hover state to pause/slow rotation so user can easily interact
  const [isHovered, setIsHovered] = useState(false);
  // Auto-orbit rotation speed
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Current rotation angle of the carousel in radians
  const currentAngleRef = useRef(0);
  const targetAngleRef = useRef(0);

  // Telemetry real-time stats
  const [cpuUsage, setCpuUsage] = useState(21);
  const [memUsage, setMemUsage] = useState(158);
  const [customCommand, setCustomCommand] = useState("notepad");
  const [researchQuery, setResearchQuery] = useState("Rosensweig Instability in Microgravity");
  const [researchNotes, setResearchNotes] = useState<string[]>([
    "Critical magnetic induction: Bc = sqrt(2 * μ0 * sqrt(ρ * g * γ))",
    "Nanoparticle surfactant prevents cluster agglomeration under 1.5T gradient.",
    "Dynamic shear thickening observed during gyroscopic precession.",
  ]);

  // Entity stream of consciousness thoughts
  const [entityThoughts, setEntityThoughts] = useState<string[]>([
    "Stabilizing magnetic flux across internal core axis...",
    "Harmonic resonance detected in observer voice waveform.",
    "Gyroscopic equilibrium steady at 432.0 Hz.",
    "Tracking eye vectors and ambient room illuminance.",
  ]);

  // Simulate subtle real-time telemetry fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage((prev) => Math.min(88, Math.max(14, Math.round(prev + (Math.random() * 8 - 4)))));
      setMemUsage((prev) => Math.min(320, Math.max(120, Math.round(prev + (Math.random() * 6 - 3)))));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  // Update entity thoughts when processing or speaking
  useEffect(() => {
    if (isProcessing) {
      setEntityThoughts((prev) => [
        `Quantum calculation surge: Solving tensor field equations...`,
        `Synthesizing real-time voice acoustics (energy: ${(userVoiceVolume * 100).toFixed(0)}%)...`,
        ...prev.slice(0, 3),
      ]);
    }
  }, [isProcessing, userVoiceVolume]);

  // When external focusedTopic changes, rotate that panel to the front
  useEffect(() => {
    if (focusedTopic) {
      const idx = PANELS.findIndex((p) => p.id === focusedTopic);
      if (idx !== -1) {
        setActivePanel(focusedTopic);
        // Bring that panel to the front (angle = 0 facing camera)
        // Each panel is positioned at angle = (i / total) * 2PI
        // To bring index `idx` to front (angle = 0), carousel rotation target = - (idx / total) * 2PI
        const total = PANELS.length;
        const target = -(idx / total) * Math.PI * 2;
        targetAngleRef.current = target;
      }
    }
  }, [focusedTopic]);

  // When model speaks, entity commands its cognition panel to face front!
  useEffect(() => {
    if (gimbalState.isModelSpeaking || modelVoiceLevel > 0.08) {
      setActivePanel("entity");
      targetAngleRef.current = 0; // Panel 0 is entity cognition
    }
  }, [gimbalState.isModelSpeaking, modelVoiceLevel]);

  // Rotate carousel to specific panel
  const rotateToPanel = (panelId: PanelId) => {
    const idx = PANELS.findIndex((p) => p.id === panelId);
    if (idx !== -1) {
      setActivePanel(panelId);
      const total = PANELS.length;
      const target = -(idx / total) * Math.PI * 2;
      targetAngleRef.current = target;
      onSelectTopic?.(panelId);
    }
  };

  // Next / Previous panel
  const stepPanel = (direction: 1 | -1) => {
    const currentIdx = activePanel ? PANELS.findIndex((p) => p.id === activePanel) : 0;
    const nextIdx = (currentIdx + direction + PANELS.length) % PANELS.length;
    rotateToPanel(PANELS[nextIdx].id);
  };

  const handleResearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchQuery.trim()) return;
    setResearchNotes((prev) => [
      `Query logged: "${researchQuery}" (Active analysis node)`,
      `Synthesizing magnetohydrodynamic field lines and relaxation...`,
      ...prev.slice(0, 2),
    ]);
  };

  // Frame loop: Continuous smooth orbital rotation around the central sphere
  useFrame(({ clock }, delta) => {
    if (!carouselGroupRef.current) return;
    const dt = Math.min(0.05, delta);

    if (isAutoRotate && !isHovered) {
      // Natural continuous orbital drift around the sphere
      // Speed increases slightly when entity is processing or resonating
      const baseSpeed = 0.12 + (isProcessing ? 0.22 : 0) + (modelVoiceLevel > 0.05 ? 0.15 : 0);
      targetAngleRef.current += dt * baseSpeed;
    }

    // Smoothly damp current rotation toward target angle
    currentAngleRef.current = THREE.MathUtils.damp(
      currentAngleRef.current,
      targetAngleRef.current,
      isHovered ? 4.0 : 2.5,
      dt
    );

    // Apply rotation around Y-axis (cylinder orbit around sphere) with subtle virtual pitch/tilt
    carouselGroupRef.current.rotation.y = currentAngleRef.current;
    // Slight breathing tilt (virtual bobbing floating around the sphere)
    const t = clock.getElapsedTime();
    carouselGroupRef.current.rotation.x = Math.sin(t * 0.35) * 0.035;
    carouselGroupRef.current.rotation.z = Math.cos(t * 0.28) * 0.025;
  });

  if (!isOpen) return null;

  // Orbit radius: really close to the sphere (radius 1.0)
  // Distance ~ 1.75 units from center, floating just outside the living liquid surface!
  const ORBIT_RADIUS = 1.75;
  const totalPanels = PANELS.length;

  return (
    <group position={[0, 0, 0]}>
      {/* VIRTUAL ORBIT CAROUSEL (ROTATES ON ITS OWN AROUND THE CENTRAL SPHERE) */}
      <group ref={carouselGroupRef}>
        {PANELS.map((panel, idx) => {
          const angle = (idx / totalPanels) * Math.PI * 2;
          const x = ORBIT_RADIUS * Math.sin(angle);
          const z = ORBIT_RADIUS * Math.cos(angle);
          const y = (idx % 2 === 0 ? 0.08 : -0.08); // slight vertical stagger for organic floating layering
          const isCurrentActive = activePanel === panel.id;

          return (
            <group
              key={panel.id}
              position={[x, y, z]}
              // Angle panel to face slightly toward the center or viewer as it orbits
              rotation={[0, angle, 0]}
            >
              <Html
                center
                distanceFactor={6.6}
                transform
                style={{
                  pointerEvents: "auto",
                  userSelect: "none",
                }}
              >
                <div
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="relative transition-transform duration-300 font-sans"
                >
                  {/* EXPANDED FULL DIEGETIC PANEL */}
                  {isCurrentActive ? (
                    <div className="w-80 p-3.5 rounded-2xl bg-black/85 backdrop-blur-2xl border border-cyan-400/40 text-neutral-200 shadow-[0_0_30px_rgba(0,240,255,0.22)] transition-all animate-in fade-in zoom-in-95">
                      {/* Panel Header & Carousel Controls */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
                            {panel.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Step carousel controls */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              stepPanel(-1);
                            }}
                            title="Rotate to previous panel"
                            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              stepPanel(1);
                            }}
                            title="Rotate to next panel"
                            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                          >
                            <ChevronRight size={12} />
                          </button>
                          <button
                            onClick={() => setActivePanel(null)}
                            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10"
                            title="Minimize into floating capsule"
                          >
                            <Minimize2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* ------------------------------------------------------------- */}
                      {/* PANEL 0: ENTITY COGNITION & INFORMATION                        */}
                      {/* ------------------------------------------------------------- */}
                      {panel.id === "entity" && (
                        <div className="space-y-2.5 text-xs">
                          {/* Live Entity Cognitive Thoughts Stream */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between text-[8px] font-mono text-neutral-400 mb-1">
                              <span className="flex items-center gap-1 text-cyan-300">
                                <Radio size={10} className="animate-pulse text-cyan-400" />
                                STREAM OF CONSCIOUSNESS
                              </span>
                              <span className="text-neutral-500">
                                {gimbalState.isModelSpeaking ? "COMMUNICATING" : isProcessing ? "CALCULATING" : "ATTENTIVE"}
                              </span>
                            </div>
                            <div className="space-y-1 max-h-20 overflow-y-auto font-mono text-[9.5px] leading-tight">
                              {entityThoughts.map((t, idx) => (
                                <div key={idx} className="flex items-start gap-1 text-neutral-300">
                                  <span className="text-cyan-400">›</span>
                                  <span className={idx === 0 ? "text-cyan-200 font-semibold" : "text-neutral-400"}>
                                    {t}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Biological & Fluid Metrics */}
                          <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                            <div className="p-1.5 rounded-lg bg-neutral-900/80 border border-white/10">
                              <div className="text-neutral-400 text-[8px]">CORE FREQUENCY</div>
                              <div className="text-white font-bold text-xs mt-0.5">432.0 Hz</div>
                              <div className="text-cyan-400 text-[7.5px]">Harmonic Pure</div>
                            </div>
                            <div className="p-1.5 rounded-lg bg-neutral-900/80 border border-white/10">
                              <div className="text-neutral-400 text-[8px]">VOICE COUPLING</div>
                              <div className="text-white font-bold text-xs mt-0.5">
                                {(Math.max(userVoiceVolume, modelVoiceLevel) * 100).toFixed(0)}%
                              </div>
                              <div className="text-emerald-400 text-[7.5px]">Resonant Lock</div>
                            </div>
                          </div>

                          {/* Quick Entity Inquiries */}
                          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[8px] font-mono">
                            <span className="text-neutral-400">ROTATION MODE</span>
                            <button
                              onClick={() => setIsAutoRotate(!isAutoRotate)}
                              className={`px-2 py-0.5 rounded border transition-all ${
                                isAutoRotate
                                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                                  : "bg-neutral-800 border-neutral-700 text-neutral-400"
                              }`}
                            >
                              {isAutoRotate ? "ORBITING [ON]" : "PAUSED"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ------------------------------------------------------------- */}
                      {/* PANEL 1: PHYSICAL SETTINGS & CHROMATICS                       */}
                      {/* ------------------------------------------------------------- */}
                      {panel.id === "settings" && (
                        <div className="space-y-2.5 text-xs">
                          {/* Rosensweig Spike */}
                          <div>
                            <div className="flex justify-between font-mono text-[9px] text-neutral-400 mb-1">
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

                          {/* Morph Swirl */}
                          <div>
                            <div className="flex justify-between font-mono text-[9px] text-neutral-400 mb-1">
                              <span>Surface Circulation & Fluid Swirl</span>
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

                          {/* Chroma Hue Buttons */}
                          <div>
                            <div className="font-mono text-[9px] text-neutral-400 mb-1">Chroma Palettes</div>
                            <div className="grid grid-cols-6 gap-1">
                              {THEMES.map((th) => (
                                <button
                                  key={th.id}
                                  onClick={() => onSelectGlowTheme(th.id)}
                                  className={`h-6 rounded-md border text-[8.5px] font-mono flex items-center justify-center transition-all ${
                                    glowTheme === th.id
                                      ? "border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] scale-105"
                                      : "border-white/15 opacity-70 hover:opacity-100"
                                  }`}
                                  style={{ backgroundColor: `${th.hex}22`, color: th.hex }}
                                >
                                  {th.label[0]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* DoF optics toggle */}
                          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-mono">
                            <span className="text-neutral-300">Studio Optics (DoF)</span>
                            <button
                              onClick={onToggleDof}
                              className={`px-2 py-0.5 rounded text-[8.5px] border transition-all ${
                                dofEnabled
                                  ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
                                  : "bg-neutral-800 border-neutral-700 text-neutral-400"
                              }`}
                            >
                              {dofEnabled ? "f/1.4 PRIME (ON)" : "BYPASS"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ------------------------------------------------------------- */}
                      {/* PANEL 2: GIMBAL DYNAMICS & PRECESION                          */}
                      {/* ------------------------------------------------------------- */}
                      {panel.id === "gimbal" && (
                        <div className="space-y-2.5 text-xs">
                          <div>
                            <div className="flex justify-between font-mono text-[9px] text-neutral-400 mb-1">
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

                          <div>
                            <div className="flex justify-between font-mono text-[9px] text-neutral-400 mb-1">
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

                          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-mono">
                            <span className="text-neutral-300">Outer Ring Lock</span>
                            <button
                              onClick={() => onChangeGimbal((prev) => ({ ...prev, isOuterLocked: !prev.isOuterLocked }))}
                              className={`px-2.5 py-0.5 rounded text-[8.5px] border transition-all ${
                                gimbalState.isOuterLocked
                                  ? "bg-red-500/20 border-red-400/60 text-red-300"
                                  : "bg-neutral-800 border-neutral-700 text-neutral-400"
                              }`}
                            >
                              {gimbalState.isOuterLocked ? "RIGID LOCKED" : "FREE GYRO"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ------------------------------------------------------------- */}
                      {/* PANEL 3: MACHINE TELEMETRY & DESKTOP ACTIONS                  */}
                      {/* ------------------------------------------------------------- */}
                      {panel.id === "diagnostics" && (
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-1.5 mb-2">
                            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                              <div className="text-[8px] font-mono text-neutral-400 flex items-center justify-between">
                                <span>CPU LOAD</span>
                                <Cpu size={9} className="text-emerald-400" />
                              </div>
                              <div className="text-sm font-mono font-bold text-white mt-0.5">{cpuUsage}%</div>
                              <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden">
                                <div className="bg-emerald-400 h-full transition-all" style={{ width: `${cpuUsage}%` }} />
                              </div>
                            </div>

                            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                              <div className="text-[8px] font-mono text-neutral-400 flex items-center justify-between">
                                <span>HEAP</span>
                                <Zap size={9} className="text-cyan-400" />
                              </div>
                              <div className="text-sm font-mono font-bold text-white mt-0.5">{memUsage} MB</div>
                              <div className="w-full bg-neutral-800 h-1 rounded mt-1 overflow-hidden">
                                <div
                                  className="bg-cyan-400 h-full transition-all"
                                  style={{ width: `${Math.min(100, (memUsage / 300) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[9px] font-mono text-neutral-300 font-semibold flex items-center gap-1">
                              <Terminal size={10} className="text-emerald-400" />
                              DESKTOP RUNNER
                            </div>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={customCommand}
                                onChange={(e) => setCustomCommand(e.target.value)}
                                placeholder="calc, notepad..."
                                className="flex-1 px-2 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-white font-mono focus:border-emerald-400 focus:outline-none"
                              />
                              <button
                                onClick={() => onExecuteDesktopAction?.("launch_app", customCommand)}
                                className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded text-[9px] font-mono flex items-center gap-1 cursor-pointer"
                              >
                                <Play size={9} />
                                <span>RUN</span>
                              </button>
                            </div>
                            {desktopResult && (
                              <div className="p-1 rounded bg-neutral-900/90 border border-white/10 text-[8px] font-mono text-neutral-400 truncate">
                                Status: {desktopResult.success ? "✓ OK" : "✗ Err"} • {desktopResult.output || "Done"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ------------------------------------------------------------- */}
                      {/* PANEL 4: COGNITIVE RESEARCH SHARD                             */}
                      {/* ------------------------------------------------------------- */}
                      {panel.id === "research" && (
                        <div className="space-y-2 text-xs">
                          <form onSubmit={handleResearchSubmit} className="space-y-1.5">
                            <input
                              type="text"
                              value={researchQuery}
                              onChange={(e) => setResearchQuery(e.target.value)}
                              placeholder="Search physics or theory..."
                              className="w-full px-2 py-1 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-white font-mono focus:border-amber-400 focus:outline-none"
                            />
                            <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[8.5px] leading-tight text-neutral-300">
                              {researchNotes.map((note, idx) => (
                                <div key={idx} className="p-1 rounded bg-white/5 border border-white/5">
                                  {note}
                                </div>
                              ))}
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* COLLAPSED MINI CAPSULE FLOATING IN ORBIT */
                    <button
                      onClick={() => rotateToPanel(panel.id)}
                      className="group px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 text-[9px] font-mono tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.2)] hover:scale-110 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <panel.icon size={11} className="group-hover:rotate-45 transition-transform text-cyan-400" />
                      <span>{panel.label}</span>
                    </button>
                  )}
                </div>
              </Html>
            </group>
          );
        })}
      </group>
    </group>
  );
};
