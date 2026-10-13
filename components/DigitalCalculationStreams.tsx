import React, { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Cpu, Zap, Sliders, Eye } from "lucide-react";

// ============================================================================
// 1. MATHEMATICAL EQUATIONS & CALCULATION SHARDS
// ============================================================================
const MATH_EQUATIONS = [
  "∂Ψ/∂t = -i/ℏ ĤΨ",
  "∇ × B = μ₀(J + ε₀ ∂E/∂t)",
  "∮ E · da = Q / ε₀",
  "ds² = -(1 - 2M/r)dt² + dr²/(1 - 2M/r)",
  "λ = h / p",
  "det(J - λI) = 0",
  "R_{μν} - ½ R g_{μν} = 8πG T_{μν}",
  "∇ · (ρ v) + ∂ρ/∂t = 0",
  "e^{iπ} + 1 = 0",
  "∫_{∂Ω} ω = ∫_Ω dω",
  "Δp · Δx ≥ ℏ/2",
  "H(s) = Y(s)/X(s)",
  "S = -k_B ∑ p_i ln(p_i)",
  "∇²φ - (1/c²) ∂²φ/∂t² = 0",
];

const HEX_STREAMS = [
  "0x7F4A09 // ADDR_BUS",
  "0x8C1B3F // MATRIX_REG",
  "0xA2E091 // TENSOR_FLUX",
  "0x00FF3C // QUANTUM_LATCH",
  "0x3B88C1 // EIGEN_VEC",
  "0xF104D2 // RECURSION_DEPTH",
  "0x5E29A0 // COHERENCE_SYNC",
  "0x11C7E9 // FERRO_VORTEX",
];

// ============================================================================
// 2. VECTOR CALCULATION LINE GEOMETRIES (FLOATS & ROTATES ON ITS OWN)
// ============================================================================
export const DigitalVectorCalculationField: React.FC<{
  isProcessing: boolean;
  glowColor?: string;
  intensity?: number;
}> = ({ isProcessing, glowColor = "#00f0ff", intensity = 1.0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRingsRef = useRef<THREE.Group>(null);

  // Generate orbital calculation arc vertices (concentric dashed vector rings)
  const [orbitArcsGeometry, axesGeometry] = useMemo(() => {
    // 1. Orbital vector circles with segment gaps
    const arcSegments: THREE.Vector3[] = [];
    const radii = [1.52, 1.82, 2.12, 2.42];

    radii.forEach((r, idx) => {
      const segments = 48;
      const tiltAngle = (idx * Math.PI) / 4;

      for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;

        const p1 = new THREE.Vector3(
          r * Math.cos(theta1),
          r * Math.sin(theta1) * Math.cos(tiltAngle),
          r * Math.sin(theta1) * Math.sin(tiltAngle)
        );
        const p2 = new THREE.Vector3(
          r * Math.cos(theta2),
          r * Math.sin(theta2) * Math.cos(tiltAngle),
          r * Math.sin(theta2) * Math.sin(tiltAngle)
        );
        arcSegments.push(p1, p2);
      }
    });

    // 2. Vector coordinate calculation axes & cross-rays
    const axesPts: THREE.Vector3[] = [];
    axesPts.push(new THREE.Vector3(-2.6, 0, 0), new THREE.Vector3(2.6, 0, 0));
    axesPts.push(new THREE.Vector3(0, -2.6, 0), new THREE.Vector3(0, 2.6, 0));
    axesPts.push(new THREE.Vector3(-1.9, -1.9, 0), new THREE.Vector3(1.9, 1.9, 0));
    axesPts.push(new THREE.Vector3(-1.9, 1.9, 0), new THREE.Vector3(1.9, -1.9, 0));

    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcSegments);
    const axesGeo = new THREE.BufferGeometry().setFromPoints(axesPts);

    return [arcGeo, axesGeo];
  }, []);

  // Frame animation: Floats and rotates around the sphere on its own multi-axis rotation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Independent virtual rotational drift around the central entity
      groupRef.current.rotation.y = t * 0.16;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.22;
      groupRef.current.rotation.z = Math.cos(t * 0.16) * 0.18;
    }

    if (pulseRingsRef.current) {
      // Reticle sub-rotation
      pulseRingsRef.current.rotation.z = -t * 0.35;
      pulseRingsRef.current.rotation.y = t * 0.22;
    }
  });

  const lineColor = new THREE.Color(glowColor);

  return (
    <group ref={groupRef}>
      {/* Dynamic Coordinate Ray Lines */}
      <lineSegments geometry={axesGeometry}>
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={isProcessing ? 0.45 * intensity : 0.15 * intensity}
          linewidth={1}
        />
      </lineSegments>

      {/* Orbital Vector Calculation Rings */}
      <lineSegments geometry={orbitArcsGeometry}>
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={isProcessing ? 0.55 * intensity : 0.22 * intensity}
          linewidth={1}
        />
      </lineSegments>

      {/* Vector Reticle Crosshairs & Orbiting Ticks */}
      <group ref={pulseRingsRef}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh
            key={i}
            position={[
              2.25 * Math.cos(angle),
              2.25 * Math.sin(angle) * 0.7,
              2.25 * Math.sin(angle) * 0.7,
            ]}
          >
            <octahedronGeometry args={[0.032, 0]} />
            <meshBasicMaterial
              color={lineColor}
              wireframe
              transparent
              opacity={isProcessing ? 0.9 : 0.4}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ============================================================================
// 3. STREAMING DATA & MATHEMATICAL CASCADES (FLOATS ON ITS OWN ROTATION)
// ============================================================================
export const DigitalDataStreams: React.FC<{
  isProcessing: boolean;
  glowTheme?: string;
}> = ({ isProcessing, glowTheme = "cyan" }) => {
  const containerRef = useRef<THREE.Group>(null);
  const [streamTick, setStreamTick] = useState(0);

  // Cycle streams faster when processing
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamTick((prev) => prev + 1);
    }, isProcessing ? 180 : 850);
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Rotate gracefully in an orbit around the sphere
  useFrame(({ clock }) => {
    if (!containerRef.current) return;
    const t = clock.getElapsedTime();
    const spd = isProcessing ? 0.28 : 0.09;
    containerRef.current.rotation.y = t * spd;
    containerRef.current.rotation.x = Math.sin(t * 0.18) * 0.08;
  });

  // Float close to the sphere (radius ~ 2.05)
  const streamRadius = 2.05;

  return (
    <group ref={containerRef}>
      {/* 1. Orbiting Calculation Stream (Close Orbit) */}
      <group position={[-streamRadius, 0.25, 0]}>
        <Html
          transform
          distanceFactor={6.5}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`flex flex-col gap-1 p-2 rounded-xl border font-mono select-none transition-all duration-300 ${
              isProcessing
                ? "bg-black/85 border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.4)] text-cyan-200"
                : "bg-black/50 border-cyan-500/25 text-cyan-400/70"
            }`}
            style={{ width: "190px" }}
          >
            <div className="flex items-center justify-between text-[7.5px] font-bold tracking-widest border-b border-cyan-500/30 pb-1">
              <span className="flex items-center gap-1 text-cyan-300">
                <Cpu size={9} className={isProcessing ? "animate-spin text-cyan-300" : ""} />
                {isProcessing ? "PROCESSING" : "CALC_STREAM"}
              </span>
              <span className="text-[7px] text-neutral-400">
                {isProcessing ? "5.2 TFLOPS" : "IDLE"}
              </span>
            </div>

            {/* Mathematical Equations Cascade */}
            <div className="flex flex-col gap-0.5 text-[8px] leading-tight overflow-hidden">
              {MATH_EQUATIONS.slice(
                streamTick % 6,
                (streamTick % 6) + (isProcessing ? 4 : 2)
              ).map((eq, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 font-mono tracking-tight transition-all duration-200"
                >
                  <span className="text-cyan-500 text-[6.5px]">›</span>
                  <span className={i === 0 && isProcessing ? "text-white font-bold" : "text-cyan-300"}>
                    {eq}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[7px] text-neutral-400 font-mono pt-0.5 border-t border-cyan-500/20 flex justify-between">
              <span>MEM: {HEX_STREAMS[streamTick % HEX_STREAMS.length].split(" ")[0]}</span>
              <span className="text-cyan-400">ΔE 0.04</span>
            </div>
          </div>
        </Html>
      </group>

      {/* 2. Opposite Side Orbiting Hex Stream */}
      <group position={[streamRadius, -0.25, 0]}>
        <Html
          transform
          distanceFactor={6.5}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`flex flex-col gap-1 p-2 rounded-xl border font-mono select-none transition-all duration-300 ${
              isProcessing
                ? "bg-black/85 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.4)] text-purple-200"
                : "bg-black/50 border-purple-500/25 text-purple-400/70"
            }`}
            style={{ width: "185px" }}
          >
            <div className="flex items-center justify-between text-[7.5px] font-bold tracking-widest border-b border-purple-500/30 pb-1">
              <span className="flex items-center gap-1 text-purple-300">
                <Zap size={9} className={isProcessing ? "animate-pulse" : ""} />
                {isProcessing ? "QUANTUM KERNEL" : "DATA_STREAM"}
              </span>
              <span className="text-[7px] text-neutral-400">0x7F</span>
            </div>

            <div className="flex flex-col gap-0.5 text-[8px] leading-tight">
              {HEX_STREAMS.slice(
                (streamTick + 2) % 4,
                ((streamTick + 2) % 4) + (isProcessing ? 3 : 2)
              ).map((hex, i) => (
                <div key={i} className="flex items-center gap-1 font-mono">
                  <span className="text-purple-500 text-[6.5px]">#</span>
                  <span className={i === 0 && isProcessing ? "text-purple-200 font-bold" : "text-purple-400"}>
                    {hex}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[7px] text-neutral-400 font-mono pt-0.5 border-t border-purple-500/20 flex justify-between">
              <span>SYNC: PARITY</span>
              <span className="text-purple-400">99.8%</span>
            </div>
          </div>
        </Html>
      </group>

      {/* 3. Top Holographic Loading Surge Indicator (Active during processing) */}
      {isProcessing && (
        <group position={[0, 2.4, 0]}>
          <Html
            center
            transform
            distanceFactor={6.8}
            style={{ pointerEvents: "none" }}
          >
            <div className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-black/90 border border-cyan-400/90 shadow-[0_0_25px_rgba(0,240,255,0.6)] backdrop-blur-xl select-none">
              <div className="flex items-center gap-2 text-[9.5px] font-mono font-bold text-cyan-200 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>QUANTUM CALCULATION SURGE</span>
                <span className="text-cyan-400 font-normal">{(84 + (streamTick % 16)).toFixed(0)}%</span>
              </div>
              <div className="w-44 h-1 bg-neutral-800 rounded-full overflow-hidden border border-cyan-500/40">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-white to-purple-400 transition-all duration-200"
                  style={{ width: `${65 + ((streamTick * 7) % 35)}%` }}
                />
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

// ============================================================================
// 4. TINY INTERACTIVE BEZELS, KNOBS & MICRO-SPHERES ON GIMBAL RINGS
// - Replaces big clunky HTML tags with exquisite 3D micro-bezels / jewel spheres
// - Only displays sleek HUD readout when the user lands mouse on them!
// ============================================================================
export interface RingMicroKnobProps {
  label: string;
  subLabel: string;
  themeHex: string;
  position: [number, number, number];
  onAdjust?: () => void;
  adjustLabel?: string;
  onFocusPanel?: () => void;
}

export const RingMicroKnob: React.FC<RingMicroKnobProps> = ({
  label,
  subLabel,
  themeHex,
  position,
  onAdjust,
  adjustLabel = "ADJUST",
  onFocusPanel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const collarRef = useRef<THREE.Mesh>(null);

  // Subtle pulsing scale on hover
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const targetScale = isHovered ? 1.45 + Math.sin(t * 8.0) * 0.1 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);
    if (collarRef.current) {
      collarRef.current.rotation.z = t * (isHovered ? 4.0 : 1.2);
    }
  });

  const glowColor = new THREE.Color(themeHex);

  return (
    <group position={position}>
      {/* 1. Metallic Bezel Collar Ring */}
      <mesh ref={collarRef}>
        <torusGeometry args={[0.056, 0.007, 12, 24]} />
        <meshStandardMaterial
          color="#222530"
          metalness={0.96}
          roughness={0.2}
          emissive={glowColor}
          emissiveIntensity={isHovered ? 0.6 : 0.15}
        />
      </mesh>

      {/* 2. Micro-Sphere / Jewel Knob (Interactive Hit Target) */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onFocusPanel?.();
        }}
      >
        <sphereGeometry args={[0.042, 16, 16]} />
        <meshPhysicalMaterial
          color={isHovered ? "#ffffff" : themeHex}
          emissive={glowColor}
          emissiveIntensity={isHovered ? 1.8 : 0.75}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
};
