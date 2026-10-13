import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import * as THREE from "three";
import { VisionTrackingHUD } from "./VisionTrackingHUD";
import type { VisionTrackingData, HandGesture } from "../types";
import { Compass, Eye, Hand, Move, Sparkles, Magnet, Shield, Aperture, LayoutGrid, Layers, Sliders, Cpu, Mic, Search, Download, Smartphone, Atom, Globe, BookOpen } from "lucide-react";
import { audioEngine } from "../utils/audioEngine";
import { LightConstructDock } from "./LightConstructDock";
import {
  DigitalVectorCalculationField,
  DigitalDataStreams,
  RingMicroKnob,
} from "./DigitalCalculationStreams";
import { OrbitingVirtualPanels } from "./OrbitingVirtualPanels";
import { voiceAIService, VUIState, SearchResultData } from "../services/voiceAIService";
import { RingSearchDisplay } from "./RingSearchDisplay";
import { FuturisticGlassmorphicPanel } from "./FuturisticGlassmorphicPanel";
import { DownloadModelModal } from "./DownloadModelModal";
import { ProceduralBestiaryModal } from "./ProceduralBestiaryModal";
import { ProceduralWorldMapModal } from "./ProceduralWorldMapModal";

const UltraTransparentOuterGlassMembrane: React.FC<{ bloomIntensity?: number }> = ({ bloomIntensity = 1.35 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.08;
    meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.05;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.55, 48, 48]} />
      <meshPhysicalMaterial
        color="#0a1926"
        transmission={0.985}
        roughness={0.035}
        ior={1.48}
        thickness={0.18}
        attenuationColor="#ffd700"
        attenuationDistance={4.5}
        emissive="#001420"
        emissiveIntensity={0.06 * bloomIntensity}
        transparent
        opacity={0.22}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// ============================================================================
// 1. DATA TYPES & CONFIGURATIONS
// ============================================================================
export interface FerrofluidConfig {
  magneticStrength: number;
  glowTheme: string;
  morphIntensity: number;
  bloomIntensity?: number;
}

export interface GimbalState {
  audioLevel: number;
  isModelSpeaking: boolean;
  ring1SpeedMult: number;
  ring2PitchMult: number;
  ring3SpeedMult: number;
  isOuterLocked: boolean;
  motionStyle: "fluid" | "rigid" | "oscillating" | "locked";
  glowColor: string;
}

export interface VoiceMetrics {
  volume: number;
  bass: number;
  mid: number;
  treble: number;
}

const GLOW_COLORS: Record<string, string> = {
  cyan: "#00f0ff",
  gold: "#ffaa00",
  purple: "#b026ff",
  crimson: "#ff1744",
  emerald: "#00e676",
  mercury: "#e0e0e0",
};

// ============================================================================
// 2. ULTRA-FAST 3D SIMPLEX NOISE ALGORITHM FOR RANDOM CHAOTIC FLUID DYNAMICS
// (Provides identical organic turbulence as the Studio GLSL snoise shader)
// ============================================================================
const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;
const pArr = new Uint8Array(256);
for (let i = 0; i < 256; i++) pArr[i] = Math.floor(Math.sin(i * 12.9898) * 43758.5453) & 255;
const perm = new Uint8Array(512);
const permMod12 = new Uint8Array(512);
for (let i = 0; i < 512; i++) {
  perm[i] = pArr[i & 255];
  permMod12[i] = (perm[i] % 12);
}
const grad3 = [
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
  1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
  0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
];

function simplex3D(x: number, y: number, z: number): number {
  let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
  const s = (x + y + z) * F3;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const k = Math.floor(z + s);
  const t = (i + j + k) * G3;
  const X0 = i - t;
  const Y0 = j - t;
  const Z0 = k - t;
  const x0 = x - X0;
  const y0 = y - Y0;
  const z0 = z - Z0;

  let i1 = 0, j1 = 0, k1 = 0;
  let i2 = 0, j2 = 0, k2 = 0;
  if (x0 >= y0) {
    if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
    else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
  } else {
    if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
    else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
    else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
  }

  const x1 = x0 - i1 + G3;
  const y1 = y0 - j1 + G3;
  const z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2.0 * G3;
  const y2 = y0 - j2 + 2.0 * G3;
  const z2 = z0 - k2 + 2.0 * G3;
  const x3 = x0 - 1.0 + 3.0 * G3;
  const y3 = y0 - 1.0 + 3.0 * G3;
  const z3 = z0 - 1.0 + 3.0 * G3;

  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;

  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 > 0) {
    const gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
    t0 *= t0;
    n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
  }
  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 > 0) {
    const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
    t1 *= t1;
    n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
  }
  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 > 0) {
    const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
    t2 *= t2;
    n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
  }
  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 > 0) {
    const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
    t3 *= t3;
    n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
  }
  return 32.0 * (n0 + n1 + n2 + n3);
}

// ============================================================================
// 3. ORGANIC FERROFLUID SPHERE CORE WITH DYNAMIC SIMPLEX NORMAL MAP SHADER
// (Features smooth viscous surface tension, unpredictable chaotic 3D fluid drift,
//  multi-layer propagating acoustic voice ripples, dynamic simplex normal map shader,
//  oily thin-film interference, and high-depth reflective studio specular highlights)
// ============================================================================
const OILY_FERROFLUID_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uVoiceVol;
  uniform float uVoiceBass;
  uniform float uVoiceMid;
  uniform float uVoiceTreble;
  uniform float uModelVoice;
  uniform vec3 uDrift;
  uniform float uMorphIntensity;
  uniform float uMagneticStrength;
  uniform vec3 uLocalGazeDir;
  uniform float uVuiState;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vObjectPosition;
  varying vec2 vUv;
  varying float vFrontRipple;
  varying float vAudioTotal;

  // Ashima / Stefan Gustavson 3D Simplex Noise
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Dynamic continuous organic fluid displacement function (Zero stationary lumps!)
  float calculateDisplacement(vec3 p) {
    vec3 np = normalize(p);
    float totalAudio = clamp(uVoiceVol * 1.35 + uModelVoice * 1.5, 0.0, 2.0);

    // 1. JELLYFISH HARMONIC EXPANSION & CONTRACTION (Fluid aquatic breathing stroke)
    float jellyCycle = sin(uTime * 2.1);
    float jellyPulse = pow(clamp(jellyCycle * 0.5 + 0.5, 0.0, 1.0), 2.2);
    float bellContract = (np.y * np.y - 0.45) * jellyPulse * 0.22;
    float equatorBillow = (1.0 - abs(np.y)) * (1.0 - jellyPulse) * 0.14;
    float jellyMorph = (bellContract + equatorBillow) * uMorphIntensity;

    // 2. CONTINUOUS ROTATING FLUID CIRCULATION (No lump is ever stationary!)
    // Rotating multi-frequency phase coordinates keep all points flowing smoothly
    vec3 flowP1 = np * 1.8 + vec3(sin(uTime * 0.65) * 0.9, cos(uTime * 0.55) * 0.9, sin(uTime * 0.75 + 1.2) * 0.9) + uDrift * 0.5;
    float nMacro = snoise(flowP1);

    vec3 flowP2 = np * 3.5 - vec3(cos(uTime * 0.82) * 0.75, sin(uTime * 0.91) * 0.75, cos(uTime * 0.73 + 0.8) * 0.75);
    float nMicro = snoise(flowP2) * 0.5;

    // Toroidal fluid vortex swirl across surface longitudes
    float theta = atan(np.z, np.x);
    float phi = asin(clamp(np.y, -1.0, 1.0));
    float fluidSwirl = sin(theta * 3.0 + phi * 4.0 - uTime * 2.6) * cos(theta * 2.0 - phi * 3.0 + uTime * 2.0) * 0.12;
    float circulation = (nMacro * 0.28 + nMicro * 0.18 + fluidSwirl) * uMorphIntensity;

    // 3. DYNAMIC FRONT-FACE VUI ACOUSTIC VOICE RIPPLE STATE INDICATOR
    // Concentric acoustic ripples radiating outward across the front face facing the viewer
    float faceDot = clamp(dot(np, uLocalGazeDir), -1.0, 1.0);
    float frontAngle = acos(faceDot); // 0 at front focal center, PI at back
    float faceMask = smoothstep(2.35, 0.12, frontAngle);

    float oscSpeed = uTime * (18.0 + uVoiceVol * 24.0 + uModelVoice * 28.0);
    float ringFreq = 26.0 + uVoiceMid * 16.0;
    float frontWave1 = sin(frontAngle * ringFreq - oscSpeed);
    float frontWave2 = sin(frontAngle * (ringFreq * 1.7) - oscSpeed * 1.4) * 0.4;

    // Dynamic VUI State Ripples
    float voiceRipple = 0.0;
    if (uVuiState < 0.5) {
      // 0. STANDBY: Gentle organic harmonic breathing ripples
      voiceRipple = sin(frontAngle * 12.0 - uTime * 3.2) * 0.045 * faceMask;
    } else if (uVuiState < 1.5) {
      // 1. LISTENING: Concentric intake acoustic ripples vibrating with mic frequencies
      float intake = sin(frontAngle * 26.0 - uTime * 16.0) + sin(frontAngle * 42.0 + uTime * 22.0) * 0.45;
      voiceRipple = intake * (0.16 + uVoiceVol * 0.45) * faceMask;
    } else if (uVuiState < 2.5) {
      // 2. THINKING: High frequency quantum interference phase ripples
      float thinkGrid = sin(frontAngle * 34.0 + uTime * 32.0) * cos(np.y * 28.0 - uTime * 24.0);
      voiceRipple = thinkGrid * 0.16 * faceMask;
    } else if (uVuiState < 3.5) {
      // 3. SPEAKING: Powerful outward acoustic shockwaves + spike erupting dance
      voiceRipple = (frontWave1 + frontWave2) * (0.28 + totalAudio * 0.55) * faceMask;
    }

    // High frequency treble vibrations (strictly gated)
    float trebleRipple = sin(frontAngle * 54.0 - oscSpeed * 1.6) * faceMask * (uVoiceTreble * 0.18);

    // 4. RESTLESS ROSENSWEIG MAGNETIC SPIKES (Form and dissolve in dynamic wave cycles)
    float spikeCoord = sin(np.x * 6.0 + uTime * 1.8) * cos(np.y * 6.0 - uTime * 1.5) * sin(np.z * 6.0 + uTime * 1.9);
    float spikeMound = pow(max(0.0, spikeCoord + nMacro * 0.55), 2.2) * (0.22 + totalAudio * 0.35 + uVoiceBass * 0.4) * uMagneticStrength;

    // 5. COMBINED TOTAL DISPLACEMENT
    float net = jellyMorph + circulation + voiceRipple + trebleRipple + spikeMound;
    // Hyperbolic tangent compression to preserve smooth organic fluid boundary
    float e2x = exp(2.0 * net);
    return ((e2x - 1.0) / (e2x + 1.0)) * 0.42;
  }

  void main() {
    vUv = uv;
    vec3 N = normalize(normal);

    // Compute surface displacement directly on GPU
    float disp = calculateDisplacement(N);
    vec3 displacedPosition = N * (1.0 + disp);
    vObjectPosition = displacedPosition;

    // Analytical finite-difference displaced surface normal
    vec3 upVec = abs(N.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T = normalize(cross(upVec, N));
    vec3 B = cross(N, T);

    float eps = 0.025;
    float dispT = calculateDisplacement(normalize(N + T * eps));
    float dispB = calculateDisplacement(normalize(N + B * eps));

    vec3 pT = normalize(N + T * eps) * (1.0 + dispT);
    vec3 pB = normalize(N + B * eps) * (1.0 + dispB);

    vec3 displacedNorm = normalize(cross(pT - displacedPosition, pB - displacedPosition));
    vNormal = normalize(normalMatrix * displacedNorm);

    // Front-face acoustic ripple signal for luminescent glow (VUI state responsive)
    float faceDot = clamp(dot(N, uLocalGazeDir), -1.0, 1.0);
    float frontAngle = acos(faceDot);
    float totalAudio = clamp(uVoiceVol * 1.35 + uModelVoice * 1.5, 0.0, 2.0);
    float oscSpeed = uTime * (18.0 + uVoiceVol * 24.0 + uModelVoice * 28.0);
    float ringFreq = 26.0 + uVoiceMid * 16.0;

    float lumRipple = 0.0;
    if (uVuiState < 0.5) {
      lumRipple = sin(frontAngle * 12.0 - uTime * 3.2) * 0.35;
    } else if (uVuiState < 1.5) {
      lumRipple = (sin(frontAngle * 26.0 - uTime * 16.0) * 0.6 + 0.4) * (0.35 + uVoiceVol * 0.9);
    } else if (uVuiState < 2.5) {
      lumRipple = sin(frontAngle * 34.0 + uTime * 32.0) * 0.85;
    } else {
      lumRipple = sin(frontAngle * ringFreq - oscSpeed) * (0.6 + totalAudio * 0.9);
    }
    vFrontRipple = lumRipple * smoothstep(2.35, 0.12, frontAngle);
    vAudioTotal = totalAudio;

    vec4 worldPos = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const OILY_FERROFLUID_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uVoiceVol;
  uniform float uVoiceBass;
  uniform float uVoiceMid;
  uniform float uVoiceTreble;
  uniform float uModelVoice;
  uniform vec3 uGlowColor;
  uniform vec3 uDrift;
  uniform float uNormalScale;
  uniform float uOilSheen;
  uniform float uMorphIntensity;
  uniform float uMagneticStrength;
  uniform vec3 uCameraPos;
  uniform float uVuiState;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vObjectPosition;
  varying vec2 vUv;
  varying float vFrontRipple;
  varying float vAudioTotal;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCameraPos - vWorldPosition);
    vec3 R = reflect(-V, N);
    float NdotV = clamp(dot(N, V), 0.0, 1.0);

    // 1. PITCH BLACK OBSIDIAN CORE
    // Pure deepest obsidian black (#010204) with high-contrast cavity shading
    vec3 colloidBlackCore = vec3(0.0015, 0.002, 0.0035);

    // 2. WHITE STUDIO ENVIRONMENT REFLECTION
    // Crisp reflection of bright white studio gallery softboxes
    float envHorizon = smoothstep(-0.35, 0.45, R.y);
    vec3 envSky = mix(vec3(0.92, 0.94, 0.98), vec3(1.0, 1.0, 1.0), envHorizon);
    float envFloor = smoothstep(0.1, -0.6, R.y);
    vec3 envGround = mix(vec3(0.85, 0.88, 0.92), vec3(0.95, 0.96, 0.98), envFloor);
    vec3 ambientStudioReflect = mix(envGround, envSky, clamp(R.y * 0.5 + 0.5, 0.0, 1.0));

    // 3. PHYSICAL DIELECTRIC FRESNEL (n ≈ 1.54 for obsidian / dense carrier oil)
    float R0 = 0.06;
    float fresnel = R0 + (1.0 - R0) * pow(1.0 - NdotV, 4.5);

    // 4. MULTI-LIGHT STUDIO SPECULAR HIGHLIGHTS
    // Key softbox from upper right
    vec3 keyLightDir = normalize(vec3(4.5, 7.0, 4.0));
    float specKeyTight = pow(max(0.0, dot(R, keyLightDir)), 360.0) * 5.2; // Razor microglint
    float specKeyBroad = pow(max(0.0, dot(R, keyLightDir)), 48.0) * 1.5;  // Wet oily sheen

    // Fill light from left
    vec3 fillLightDir = normalize(vec3(-5.0, 2.0, 3.0));
    float specFill = pow(max(0.0, dot(R, fillLightDir)), 65.0) * 1.1;

    // Rim / backlight
    vec3 backLightDir = normalize(vec3(0.0, -3.5, -4.5));
    float specBack = pow(max(0.0, dot(R, backLightDir)), 80.0) * 1.4;

    vec3 specularTotal = vec3(1.0, 0.99, 0.98) * (specKeyTight + specKeyBroad) +
                         vec3(0.92, 0.95, 1.0) * specFill +
                         vec3(0.85, 0.90, 0.98) * specBack;

    // 5. THIN-FILM PETROLEUM IRIDESCENCE (Delicate nanoscale carrier-oil interference)
    float cosThetaT = sqrt(max(0.0, 1.0 - (1.0 - NdotV * NdotV) / (1.52 * 1.52)));
    float opd = 2.0 * 1.52 * 420.0 * cosThetaT; // nanometers
    vec3 waveLens = vec3(650.0, 532.0, 450.0);
    vec3 phase = (6.283185307 * opd) / waveLens;
    vec3 oilSheenColor = 0.5 + 0.5 * cos(phase);

    // 6. FRONT-FACE COMMUNICATIVE VOICE WAVE LUMINESCENCE (VUI State Indicator)
    // Concentric acoustic ripples oscillating outward across the front face indicating active state
    float rippleCrest = pow(clamp(vFrontRipple * 0.5 + 0.5, 0.0, 1.0), 2.6);
    vec3 vuiColor = uGlowColor;
    if (uVuiState > 0.5 && uVuiState < 1.5) {
      // 1. Listening: Radiant emerald / cyan
      vuiColor = mix(vec3(0.0, 1.0, 0.5), vec3(0.0, 0.95, 1.0), 0.5);
    } else if (uVuiState > 1.5 && uVuiState < 2.5) {
      // 2. Thinking: Quantum electric violet / cyan
      vuiColor = mix(vec3(0.75, 0.1, 1.0), vec3(0.0, 0.9, 1.0), 0.4);
    } else if (uVuiState > 2.5 && uVuiState < 3.5) {
      // 3. Speaking: Radiant celestial gold / warm cyan
      vuiColor = mix(vec3(1.0, 0.85, 0.1), vec3(0.1, 0.9, 1.0), 0.35);
    }
    vec3 voiceRippleAura = vuiColor * rippleCrest * (0.35 + vAudioTotal * 1.6);

    // 7. FINAL LAYERED PHYSICAL COMPOSITION
    // Pure pitch-black obsidian body
    vec3 color = colloidBlackCore;
    // Crisp white studio reflection delineated by Fresnel
    color += ambientStudioReflect * (fresnel * 1.85);
    // Multi-light glossy specular highlights
    color += specularTotal * (0.85 + fresnel * 0.6);
    // Delicate petroleum sheen shimmering along grazing angles
    color = mix(color, oilSheenColor * 1.25, fresnel * uOilSheen * 0.38);
    // Live communicative front-face voice wave ripples
    color += voiceRippleAura;

    // Internal acoustic breath & metabolic pulse
    float metabolicPulse = 0.02 + uVoiceVol * 0.35 + uModelVoice * 0.45;
    color += uGlowColor * metabolicPulse * (1.0 - NdotV * 0.65);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const FerrofluidSphere: React.FC<{
  config: FerrofluidConfig;
  userVoice: VoiceMetrics;
  modelVoiceLevel: number;
  trackingData?: VisionTrackingData;
  onEntityClick?: () => void;
  vuiState?: VUIState;
}> = ({ config, userVoice, modelVoiceLevel, trackingData, onEntityClick, vuiState = 'standby' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  // Smooth temporal voice smoothing to eliminate jitter and produce heavy viscous fluid momentum
  const smoothVoice = useRef({ vol: 0, bass: 0, mid: 0, treble: 0 });
  const fluidTimeRef = useRef(0);

  // Smooth Eye-Contact Gaze Orientation Basis
  const gazeDir = useRef(new THREE.Vector3(0, 0, 1));

  const glowHex = GLOW_COLORS[config.glowTheme] || GLOW_COLORS.cyan;

  // Custom Normal Map Shader Uniforms
  const shaderUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVoiceVol: { value: 0 },
      uVoiceBass: { value: 0 },
      uVoiceMid: { value: 0 },
      uVoiceTreble: { value: 0 },
      uModelVoice: { value: 0 },
      uGlowColor: { value: new THREE.Color(glowHex) },
      uDrift: { value: new THREE.Vector3(0, 0, 0) },
      uNormalScale: { value: 1.35 },
      uOilSheen: { value: 1.2 },
      uMorphIntensity: { value: config.morphIntensity },
      uMagneticStrength: { value: config.magneticStrength },
      uCameraPos: { value: new THREE.Vector3(0, 0, 5) },
      uLocalGazeDir: { value: new THREE.Vector3(0, 0, 1) },
      uVuiState: { value: 0.0 },
    }),
    []
  );

  useFrame(({ clock, camera }, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(0.05, delta);

    // Smooth incoming voice energy with viscous fluid inertia
    const rawTarget = Math.max(userVoice.volume, modelVoiceLevel * 1.3);
    const targetVol = rawTarget < 0.02 ? 0 : rawTarget;
    // When target is 0 (speech finished or silence), decay smoothly and rapidly
    const lerpRate = targetVol === 0 ? Math.min(1.0, dt * 14.0) : Math.min(1.0, dt * 8.0);
    smoothVoice.current.vol += (targetVol - smoothVoice.current.vol) * lerpRate;
    if (smoothVoice.current.vol < 0.001) smoothVoice.current.vol = 0;

    smoothVoice.current.bass += ((targetVol === 0 ? 0 : userVoice.bass) - smoothVoice.current.bass) * lerpRate;
    smoothVoice.current.mid += ((targetVol === 0 ? 0 : userVoice.mid) - smoothVoice.current.mid) * lerpRate;
    smoothVoice.current.treble += ((targetVol === 0 ? 0 : userVoice.treble) - smoothVoice.current.treble) * lerpRate;
    if (smoothVoice.current.bass < 0.001) smoothVoice.current.bass = 0;
    if (smoothVoice.current.mid < 0.001) smoothVoice.current.mid = 0;
    if (smoothVoice.current.treble < 0.001) smoothVoice.current.treble = 0;

    const voiceVol = smoothVoice.current.vol;
    const voiceBass = smoothVoice.current.bass;
    const voiceMid = smoothVoice.current.mid;
    const voiceTreble = smoothVoice.current.treble;

    // Fluid time accelerates with voice excitation for unpredictable organic surges
    fluidTimeRef.current += dt * (1.0 + voiceVol * 1.8);
    const ft = fluidTimeRef.current;

    // Continuous axial spin of sphere
    meshRef.current.rotation.y += dt * 0.42;
    meshRef.current.rotation.x += dt * 0.11;

    // Local gaze vector computation (decoupled from rotation so face ripples look at viewer)
    const targetGaze = new THREE.Vector3(0, 0, 1);
    if (trackingData && trackingData.faceDetected) {
      targetGaze.set(trackingData.faceX * 0.85, trackingData.faceY * 0.75, 1.0).normalize();
    }
    gazeDir.current.lerp(targetGaze, Math.min(1.0, dt * 4.0));
    const invQuat = meshRef.current.quaternion.clone().invert();
    const localGz = gazeDir.current.clone().normalize().applyQuaternion(invQuat).normalize();

    // Chaotic fluid drift vector
    const driftX = Math.sin(ft * 0.43) * 0.7 + Math.cos(ft * 0.21) * 0.45;
    const driftY = Math.cos(ft * 0.39) * 0.7 + Math.sin(ft * 0.17) * 0.45;
    const driftZ = Math.sin(ft * 0.33) * 0.7 + Math.cos(ft * 0.27) * 0.45;

    // Zero CPU vertex iterations! Directly update GPU shader uniforms:
    if (materialRef.current) {
      const vuiIndex =
        vuiState === 'listening'
          ? 1.0
          : vuiState === 'thinking'
          ? 2.0
          : vuiState === 'speaking'
          ? 3.0
          : vuiState === 'muted'
          ? 4.0
          : 0.0;

      const u = materialRef.current.uniforms;
      u.uTime.value = ft;
      u.uVoiceVol.value = voiceVol;
      u.uVoiceBass.value = voiceBass;
      u.uVoiceMid.value = voiceMid;
      u.uVoiceTreble.value = voiceTreble;
      u.uModelVoice.value = modelVoiceLevel;
      (u.uGlowColor.value as THREE.Color).set(glowHex);
      (u.uDrift.value as THREE.Vector3).set(driftX, driftY, driftZ);
      (u.uLocalGazeDir.value as THREE.Vector3).copy(localGz);
      u.uMorphIntensity.value = config.morphIntensity;
      u.uMagneticStrength.value = config.magneticStrength;
      (u.uCameraPos.value as THREE.Vector3).copy(camera.position);
      u.uVuiState.value = vuiIndex;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onEntityClick?.();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1.0, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={OILY_FERROFLUID_VERTEX_SHADER}
        fragmentShader={OILY_FERROFLUID_FRAGMENT_SHADER}
        uniforms={shaderUniforms}
      />
    </mesh>
  );
};

function activeVoiceLevel(u: VoiceMetrics, m: number): number {
  return Math.max(u.volume, m);
}

// ============================================================================
// 4. DYNAMIC ELECTRICAL ARC & STABILIZATION SYSTEM
// - Surface traveling electricity crawling across the liquid flesh
// - Bilateral stabilizing arcs (Entity -> Rings and Rings -> Entity)
// - Foreground screen/void discharge bolts
// - Photorealistic high-voltage electricity tendrils with fractal branching
// ============================================================================
interface ElectricalVeinData {
  line: THREE.Line;
  positions: Float32Array;
  colors: Float32Array;
  thetaA: number;
  phiA: number;
  thetaB: number;
  phiB: number;
  speed: number;
}

interface StabilizingBoltData {
  outLine: THREE.Line;
  inLine: THREE.Line;
  outPos: Float32Array;
  outCol: Float32Array;
  inPos: Float32Array;
  inCol: Float32Array;
  ringRadius: number;
  ringIdx: number;
}

interface ScreenArcData {
  mainLine: THREE.Line;
  forkLine: THREE.Line;
  mainPos: Float32Array;
  mainCol: Float32Array;
  forkPos: Float32Array;
  forkCol: Float32Array;
  activeTimer: number;
  cooldown: number;
  targetEnd: THREE.Vector3;
}

interface HighVoltageTendrilData {
  mainLine: THREE.Line;
  forkLine: THREE.Line;
  mainPos: Float32Array;
  mainCol: Float32Array;
  forkPos: Float32Array;
  forkCol: Float32Array;
  startDir: THREE.Vector3;
  endDir: THREE.Vector3;
  midDir: THREE.Vector3;
  forkDir: THREE.Vector3;
  reach: number;
  speed: number;
  phase: number;
  loopBack: boolean;
}

const DynamicElectricalArcSystem: React.FC<{
  glowTheme: string;
  userVoice: VoiceMetrics;
  modelVoiceLevel: number;
  isTethered?: boolean;
  tetherTarget?: THREE.Vector3 | null;
}> = ({ glowTheme, userVoice, modelVoiceLevel, isTethered, tetherTarget }) => {
  const groupRef = useRef<THREE.Group>(null);
  const surfaceVeinsRef = useRef<ElectricalVeinData[]>([]);
  const ringBoltsRef = useRef<StabilizingBoltData[]>([]);
  const screenArcsRef = useRef<ScreenArcData[]>([]);
  const tendrilsRef = useRef<HighVoltageTendrilData[]>([]);
  const sparksRef = useRef<THREE.Points>(null);

  const glowHex = GLOW_COLORS[glowTheme] || GLOW_COLORS.cyan;

  // 1. Initialize all electrical lines and geometries
  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    // A. SURFACE TRAVELING ELECTRICITY (Crawling across the liquid flesh)
    const veinList: ElectricalVeinData[] = [];
    const numVeins = 8;
    const veinSegments = 22;

    for (let i = 0; i < numVeins; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(veinSegments * 3);
      const col = new Float32Array(veinSegments * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geo, mat);
      group.add(line);

      veinList.push({
        line,
        positions: pos,
        colors: col,
        thetaA: (i / numVeins) * Math.PI * 2,
        phiA: Math.sin(i * 1.5) * 1.2,
        thetaB: ((i + 2) / numVeins) * Math.PI * 2,
        phiB: Math.cos(i * 1.7) * 1.2,
        speed: 1.2 + (i % 3) * 0.4,
      });
    }
    surfaceVeinsRef.current = veinList;

    // B. BILATERAL STABILIZING BOLTS (Striking from Tesseract Nucleus <-> 4 Concentric Rings)
    const boltList: StabilizingBoltData[] = [];
    const ringRadii = [1.4, 1.7, 2.0, 2.3];
    const boltSegments = 24;

    for (let r = 0; r < 4; r++) {
      // Outward bolt: Entity -> Ring
      const outGeo = new THREE.BufferGeometry();
      const outPos = new Float32Array(boltSegments * 3);
      const outCol = new Float32Array(boltSegments * 3);
      outGeo.setAttribute("position", new THREE.BufferAttribute(outPos, 3));
      outGeo.setAttribute("color", new THREE.BufferAttribute(outCol, 3));
      const outMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
      });
      const outLine = new THREE.Line(outGeo, outMat);
      group.add(outLine);

      // Inward stabilizing bolt: Ring -> Entity
      const inGeo = new THREE.BufferGeometry();
      const inPos = new Float32Array(boltSegments * 3);
      const inCol = new Float32Array(boltSegments * 3);
      inGeo.setAttribute("position", new THREE.BufferAttribute(inPos, 3));
      inGeo.setAttribute("color", new THREE.BufferAttribute(inCol, 3));
      const inMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
      });
      const inLine = new THREE.Line(inGeo, inMat);
      group.add(inLine);

      boltList.push({
        outLine,
        inLine,
        outPos,
        outCol,
        inPos,
        inCol,
        ringRadius: ringRadii[r],
        ringIdx: r,
      });
    }
    ringBoltsRef.current = boltList;

    // C. FOREGROUND / SCREEN DISCHARGE ARCS (Occasionally arcing onto screen/camera)
    const screenArcList: ScreenArcData[] = [];
    const screenSegments = 28;
    const screenForkSegments = 16;

    for (let s = 0; s < 2; s++) {
      const mGeo = new THREE.BufferGeometry();
      const mPos = new Float32Array(screenSegments * 3);
      const mCol = new Float32Array(screenSegments * 3);
      mGeo.setAttribute("position", new THREE.BufferAttribute(mPos, 3));
      mGeo.setAttribute("color", new THREE.BufferAttribute(mCol, 3));
      const mMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const mLine = new THREE.Line(mGeo, mMat);
      group.add(mLine);

      const fGeo = new THREE.BufferGeometry();
      const fPos = new Float32Array(screenForkSegments * 3);
      const fCol = new Float32Array(screenForkSegments * 3);
      fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
      fGeo.setAttribute("color", new THREE.BufferAttribute(fCol, 3));
      const fMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const fLine = new THREE.Line(fGeo, fMat);
      group.add(fLine);

      screenArcList.push({
        mainLine: mLine,
        forkLine: fLine,
        mainPos: mPos,
        mainCol: mCol,
        forkPos: fPos,
        forkCol: fCol,
        activeTimer: 0,
        cooldown: 5.5 + s * 3.5,
        targetEnd: new THREE.Vector3((s === 0 ? -1 : 1) * 1.8, (s === 0 ? 0.9 : -0.8), 3.6),
      });
    }
    screenArcsRef.current = screenArcList;

    // D. HIGH-VOLTAGE ELECTRIC TENDRILS (Refined to loop back and cut back excessive outward sparking)
    const tendrilList: HighVoltageTendrilData[] = [];
    const numTendrils = 4;
    const tMainSegs = 38;
    const tForkSegs = 18;

    for (let i = 0; i < numTendrils; i++) {
      const mainGeo = new THREE.BufferGeometry();
      const mainPos = new Float32Array(tMainSegs * 3);
      const mainCol = new Float32Array(tMainSegs * 3);
      mainGeo.setAttribute("position", new THREE.BufferAttribute(mainPos, 3));
      mainGeo.setAttribute("color", new THREE.BufferAttribute(mainCol, 3));

      const forkGeo = new THREE.BufferGeometry();
      const forkPos = new Float32Array(tForkSegs * 3);
      const forkCol = new Float32Array(tForkSegs * 3);
      forkGeo.setAttribute("position", new THREE.BufferAttribute(forkPos, 3));
      forkGeo.setAttribute("color", new THREE.BufferAttribute(forkCol, 3));

      const theta = i * 2.39996;
      const y = 1 - (i / Math.max(1, numTendrils - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const startDir = new THREE.Vector3(Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY).normalize();

      // Loop back onto surface for 3 of the 4 tendrils to preserve beautiful surface electricity
      const loopBack = i !== 1;
      const endDir = loopBack
        ? new THREE.Vector3(-startDir.x, -startDir.y + Math.sin(i) * 0.3, -startDir.z).normalize()
        : new THREE.Vector3(startDir.x * 1.4, startDir.y * 1.3 + 0.2, startDir.z * 1.4).normalize();

      const midDir = new THREE.Vector3(
        startDir.x * 1.2 + Math.sin(i * 2.2) * 0.5,
        startDir.y * 1.2 + Math.cos(i * 1.8) * 0.5,
        startDir.z * 1.2 + Math.sin(i * 3.1) * 0.5
      ).normalize();

      const forkDir = new THREE.Vector3(
        midDir.x + Math.sin(i * 4.1) * 0.6,
        midDir.y + Math.cos(i * 3.5) * 0.6,
        midDir.z + Math.cos(i * 2.4) * 0.6
      ).normalize();

      const tMainMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });

      const tForkMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
      });

      const mainLine = new THREE.Line(mainGeo, tMainMat);
      const forkLine = new THREE.Line(forkGeo, tForkMat);

      group.add(mainLine);
      group.add(forkLine);

      tendrilList.push({
        mainLine,
        forkLine,
        mainPos,
        mainCol,
        forkPos,
        forkCol,
        startDir,
        endDir,
        midDir,
        forkDir,
        reach: 0.85 + (i % 2) * 0.25,
        speed: 1.9 + (i % 2) * 0.6,
        phase: (i / numTendrils) * Math.PI * 2,
        loopBack,
      });
    }
    tendrilsRef.current = tendrilList;

    // E. STRIKE ROOT SPARK PARTICLES (Glowing plasma nodes at arc impact points)
    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 32;
    const sparkPositions = new Float32Array(sparkCount * 3);
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: new THREE.Color("#ffffff"),
      size: 0.09,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    group.add(sparkPoints);
    sparksRef.current = sparkPoints;

    return () => {
      veinList.forEach((v) => v.line.geometry.dispose());
      boltList.forEach((b) => {
        b.outLine.geometry.dispose();
        b.inLine.geometry.dispose();
      });
      screenArcList.forEach((s) => {
        s.mainLine.geometry.dispose();
        s.forkLine.geometry.dispose();
      });
      tendrilList.forEach((t) => {
        t.mainLine.geometry.dispose();
        t.forkLine.geometry.dispose();
      });
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    const voiceEnergy = Math.max(userVoice.volume, modelVoiceLevel * 1.3);
    // Lightning colors strictly match the spinning lines: Brilliant Gold, Electric Cyan, Champagne White, Warm Amber
    const colGold = new THREE.Color("#ffd700");
    const colCyan = new THREE.Color("#00f0ff");
    const colChampagne = new THREE.Color("#fffdf0");
    const colAmber = new THREE.Color("#ffaa00");

    // 1. SURFACE ELECTRICITY (Crawling across the tesseract core)
    surfaceVeinsRef.current.forEach((v, idx) => {
      const { line, positions, colors, speed } = v;
      const tShift = time * speed * 0.8;
      const count = positions.length / 3;

      // Moving strike roots across the tesseract nucleus surface (radius 0.20)
      const thA = v.thetaA + Math.sin(tShift * 0.9 + idx) * 0.8;
      const phA = v.phiA + Math.cos(tShift * 0.7 + idx) * 0.7;
      const thB = v.thetaB + Math.cos(tShift * 0.85 + idx * 1.3) * 0.8;
      const phB = v.phiB + Math.sin(tShift * 0.65 + idx * 1.1) * 0.7;

      const pA = new THREE.Vector3(
        Math.cos(thA) * Math.cos(phA),
        Math.sin(phA),
        Math.sin(thA) * Math.cos(phA)
      ).normalize();

      const pB = new THREE.Vector3(
        Math.cos(thB) * Math.cos(phB),
        Math.sin(phB),
        Math.sin(thB) * Math.cos(phB)
      ).normalize();

      const axis = new THREE.Vector3().crossVectors(pA, pB).normalize();
      const angle = pA.angleTo(pB);

      for (let s = 0; s < count; s++) {
        const u = s / (count - 1);
        // Geodesic slerp on sphere
        const curPoint = pA.clone().applyAxisAngle(axis, angle * u);

        // High voltage jagged fractal zig-zag crawling on tesseract core
        const perp = new THREE.Vector3().crossVectors(curPoint, axis).normalize();
        const jitterAmp = (0.015 + voiceEnergy * 0.035) * Math.sin(u * Math.PI);
        const j1 = Math.sin(u * 38.0 + time * 60.0 + idx) * jitterAmp;
        const j2 = Math.cos(u * 28.0 - time * 55.0 + idx) * jitterAmp * 0.6;

        // Hugging tesseract nucleus (r = 0.20)
        const r = 0.20 + Math.sin(u * Math.PI) * 0.008;
        const finalP = curPoint.multiplyScalar(r).add(perp.clone().multiplyScalar(j1)).add(axis.clone().multiplyScalar(j2));

        positions[s * 3] = finalP.x;
        positions[s * 3 + 1] = finalP.y;
        positions[s * 3 + 2] = finalP.z;

        // Colors strictly matching spinning lines: champagne root to gold/cyan
        const isStrikeRoot = u < 0.15 || u > 0.85;
        const c = isStrikeRoot ? colChampagne : (idx % 2 === 0 ? colGold : colCyan);
        const flash = 1.2 + voiceEnergy * 2.2 + Math.sin(time * 40.0 + s) * 0.35;

        colors[s * 3] = c.r * flash;
        colors[s * 3 + 1] = c.g * flash;
        colors[s * 3 + 2] = c.b * flash;
      }

      line.geometry.attributes.position.needsUpdate = true;
      line.geometry.attributes.color.needsUpdate = true;
    });

    // 2. BILATERAL STABILIZING BOLTS (Striking from Tesseract Nucleus <-> Rings)
    ringBoltsRef.current.forEach((bolt) => {
      const { outLine, inLine, outPos, outCol, inPos, inCol, ringRadius, ringIdx } = bolt;
      const count = outPos.length / 3;

      // Contact point on rotating gold ring
      const ringAngle = time * (1.6 + ringIdx * 0.4) + ringIdx * (Math.PI / 2);
      const ringY = Math.sin(time * 0.9 + ringIdx) * 0.25;
      const ringContact = new THREE.Vector3(
        Math.cos(ringAngle) * ringRadius,
        ringY,
        Math.sin(ringAngle) * ringRadius
      );

      // Strike anchor directly on tesseract nucleus (radius 0.20)
      const entityAngle = ringAngle + Math.PI * 0.35 + Math.sin(time * 2.0 + ringIdx) * 0.4;
      const entityContact = new THREE.Vector3(
        Math.cos(entityAngle),
        Math.sin(time * 1.5 + ringIdx) * 0.6,
        Math.sin(entityAngle)
      ).normalize().multiplyScalar(0.20);

      // A. Outward bolt: Tesseract -> Ring
      for (let s = 0; s < count; s++) {
        const u = s / (count - 1);
        const baseP = entityContact.clone().lerp(ringContact, u);

        // High-voltage lightning jaggedness
        const perp = new THREE.Vector3(-baseP.y, baseP.x, baseP.z * 0.5).normalize();
        const jagAmp = Math.sin(u * Math.PI) * (0.16 + voiceEnergy * 0.22);
        const jx = Math.sin(u * 32.0 + time * 75.0 + ringIdx) * jagAmp;
        const jy = Math.cos(u * 26.0 - time * 65.0 + ringIdx) * jagAmp;
        const jz = Math.sin(u * 28.0 + time * 85.0 + ringIdx) * jagAmp;

        outPos[s * 3] = baseP.x + perp.x * jx;
        outPos[s * 3 + 1] = baseP.y + perp.y * jy;
        outPos[s * 3 + 2] = baseP.z + perp.z * jz;

        // Same color as spinning lines (Champagne white-hot root -> alternating Gold and Cyan)
        const c = u < 0.12 ? colChampagne : (Math.sin(u * 12.0 + time * 8.0) > 0 ? colGold : colCyan);
        const intensity = (1.3 + voiceEnergy * 2.2 + Math.random() * 0.45);
        outCol[s * 3] = c.r * intensity;
        outCol[s * 3 + 1] = c.g * intensity;
        outCol[s * 3 + 2] = c.b * intensity;
      }

      // B. Inward stabilizing bolt: Ring -> Tesseract (Stabilizing containment feedback)
      const ringReturnContact = new THREE.Vector3(
        Math.cos(ringAngle + Math.PI) * ringRadius,
        -ringY,
        Math.sin(ringAngle + Math.PI) * ringRadius
      );
      const entityReturnContact = entityContact.clone().negate();

      for (let s = 0; s < count; s++) {
        const u = s / (count - 1);
        const baseP = ringReturnContact.clone().lerp(entityReturnContact, u);

        const perp = new THREE.Vector3(baseP.y, -baseP.x, baseP.z * 0.4).normalize();
        const jagAmp = Math.sin(u * Math.PI) * (0.14 + voiceEnergy * 0.18);
        const jx = Math.sin(u * 30.0 - time * 80.0 + ringIdx) * jagAmp;
        const jy = Math.cos(u * 24.0 + time * 70.0 + ringIdx) * jagAmp;
        const jz = Math.sin(u * 26.0 - time * 90.0 + ringIdx) * jagAmp;

        inPos[s * 3] = baseP.x + perp.x * jx;
        inPos[s * 3 + 1] = baseP.y + perp.y * jy;
        inPos[s * 3 + 2] = baseP.z + perp.z * jz;

        const c = u > 0.88 ? colChampagne : (ringIdx % 2 === 0 ? colGold : colCyan);
        const intensity = (1.2 + voiceEnergy * 2.0 + Math.random() * 0.4);
        inCol[s * 3] = c.r * intensity;
        inCol[s * 3 + 1] = c.g * intensity;
        inCol[s * 3 + 2] = c.b * intensity;
      }

      outLine.geometry.attributes.position.needsUpdate = true;
      outLine.geometry.attributes.color.needsUpdate = true;
      inLine.geometry.attributes.position.needsUpdate = true;
      inLine.geometry.attributes.color.needsUpdate = true;
    });

    // 3. SCREEN / CAMERA DISCHARGE ARCS (Crackling from Tesseract into screen space)
    screenArcsRef.current.forEach((arc, sIdx) => {
      const { mainLine, forkLine, mainPos, mainCol, forkPos, forkCol } = arc;
      arc.cooldown -= delta;

      if (arc.cooldown <= 0 || (voiceEnergy > 0.68 && arc.activeTimer <= 0 && arc.cooldown < 3.0)) {
        arc.activeTimer = 0.18 + Math.random() * 0.14;
        arc.cooldown = 7.5 + Math.random() * 6.0;
        arc.targetEnd.set(
          (Math.random() - 0.5) * 3.4,
          (Math.random() - 0.5) * 2.6,
          3.2 + Math.random() * 1.2
        );
      }

      if (arc.activeTimer > 0) {
        arc.activeTimer -= delta;
        mainLine.visible = true;
        forkLine.visible = true;

        // Strike starts from the luminous tesseract nucleus (r = 0.20)
        const startPt = new THREE.Vector3(
          Math.sin(time * 3.0) * 0.15,
          Math.cos(time * 2.5) * 0.15,
          0.18
        );
        const endPt = arc.targetEnd;
        const mCount = mainPos.length / 3;
        let forkStart = new THREE.Vector3();

        for (let s = 0; s < mCount; s++) {
          const u = s / (mCount - 1);
          const base = startPt.clone().lerp(endPt, u);

          const jagAmp = Math.sin(u * Math.PI) * (0.35 + voiceEnergy * 0.4);
          const jx = (Math.sin(u * 44.0 + time * 120.0) + (Math.random() - 0.5) * 0.5) * jagAmp;
          const jy = (Math.cos(u * 38.0 - time * 110.0) + (Math.random() - 0.5) * 0.5) * jagAmp;
          const jz = (Math.sin(u * 32.0 + time * 130.0) + (Math.random() - 0.5) * 0.5) * jagAmp;

          mainPos[s * 3] = base.x + jx;
          mainPos[s * 3 + 1] = base.y + jy;
          mainPos[s * 3 + 2] = base.z + jz;

          if (s === Math.floor(mCount * 0.5)) {
            forkStart.set(base.x + jx, base.y + jy, base.z + jz);
          }

          const flash = (2.0 + voiceEnergy * 2.8 + Math.random() * 0.8) * Math.min(1.0, arc.activeTimer * 5.0);
          const c = u < 0.25 ? colChampagne : (sIdx === 0 ? colGold : colCyan);
          mainCol[s * 3] = c.r * flash;
          mainCol[s * 3 + 1] = c.g * flash;
          mainCol[s * 3 + 2] = c.b * flash;
        }

        // Branching fork into open space
        const fCount = forkPos.length / 3;
        const forkTarget = endPt.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 1.5, 0.5));
        for (let f = 0; f < fCount; f++) {
          const fu = f / (fCount - 1);
          const fBase = forkStart.clone().lerp(forkTarget, fu);
          const fJag = Math.sin(fu * Math.PI) * 0.25;

          forkPos[f * 3] = fBase.x + (Math.random() - 0.5) * fJag;
          forkPos[f * 3 + 1] = fBase.y + (Math.random() - 0.5) * fJag;
          forkPos[f * 3 + 2] = fBase.z + (Math.random() - 0.5) * fJag;

          const fade = (1.0 - fu * 0.6) * Math.min(1.0, arc.activeTimer * 4.0);
          const fc = sIdx === 0 ? colCyan : colGold;
          forkCol[f * 3] = fc.r * fade * 1.8;
          forkCol[f * 3 + 1] = fc.g * fade * 1.8;
          forkCol[f * 3 + 2] = fc.b * fade * 1.8;
        }

        mainLine.geometry.attributes.position.needsUpdate = true;
        mainLine.geometry.attributes.color.needsUpdate = true;
        forkLine.geometry.attributes.position.needsUpdate = true;
        forkLine.geometry.attributes.color.needsUpdate = true;
      } else {
        mainLine.visible = false;
        forkLine.visible = false;
      }
    });

    // 4. HIGH-VOLTAGE ELECTRICITY TENDRILS (Striking directly from Tesseract Core outward)
    tendrilsRef.current.forEach((t, idx) => {
      const {
        mainLine,
        forkLine,
        mainPos,
        mainCol,
        forkPos,
        forkCol,
        startDir,
        endDir,
        midDir,
        forkDir,
        reach,
        speed,
        phase,
        loopBack,
      } = t;

      const effectiveReach = reach * (0.8 + voiceEnergy * 0.75);
      // Starts from the tesseract nucleus surface (r = 0.20)
      const rStart = 0.20;
      const p0x = startDir.x * rStart;
      const p0y = startDir.y * rStart;
      const p0z = startDir.z * rStart;

      let p1x: number, p1y: number, p1z: number;
      let p2x: number, p2y: number, p2z: number;

      const swayTime = time * speed * 0.45 + phase;
      const swayX = Math.sin(swayTime * 1.3) * 0.28 + Math.cos(swayTime * 0.7) * 0.16;
      const swayY = Math.cos(swayTime * 1.1) * 0.28 + Math.sin(swayTime * 0.9) * 0.16;
      const swayZ = Math.sin(swayTime * 1.5 + idx) * 0.28;

      const dynamicMidX = midDir.x + swayX;
      const dynamicMidY = midDir.y + swayY;
      const dynamicMidZ = midDir.z + swayZ;

      if (loopBack) {
        p2x = endDir.x * (rStart + effectiveReach * 0.65);
        p2y = endDir.y * (rStart + effectiveReach * 0.65);
        p2z = endDir.z * (rStart + effectiveReach * 0.65);

        p1x = dynamicMidX * effectiveReach * 1.1;
        p1y = dynamicMidY * effectiveReach * 1.1;
        p1z = dynamicMidZ * effectiveReach * 1.1;
      } else {
        p1x = dynamicMidX * (rStart + effectiveReach * 0.65);
        p1y = dynamicMidY * (rStart + effectiveReach * 0.65);
        p1z = dynamicMidZ * (rStart + effectiveReach * 0.65);

        p2x = (endDir.x + swayX * 0.7) * (rStart + effectiveReach * 1.25);
        p2y = (endDir.y + swayY * 0.7) * (rStart + effectiveReach * 1.25);
        p2z = (endDir.z + swayZ * 0.7) * (rStart + effectiveReach * 1.25);

        if (isTethered && tetherTarget && (idx % 2 === 0 || startDir.z > -0.2)) {
          p2x = THREE.MathUtils.lerp(p2x, tetherTarget.x, 0.8);
          p2y = THREE.MathUtils.lerp(p2y, tetherTarget.y, 0.8);
          p2z = THREE.MathUtils.lerp(p2z, tetherTarget.z, 0.8);
          p1x = THREE.MathUtils.lerp(p1x, tetherTarget.x * 0.5, 0.5);
          p1y = THREE.MathUtils.lerp(p1y, tetherTarget.y * 0.5, 0.5);
          p1z = THREE.MathUtils.lerp(p1z, tetherTarget.z * 0.5, 0.5);
        }
      }

      let branchX = 0, branchY = 0, branchZ = 0;
      const mSegs = mainPos.length / 3;

      for (let s = 0; s < mSegs; s++) {
        const u = s / (mSegs - 1);
        const invU = 1.0 - u;

        // Quadratic backbone
        const bx = invU * invU * p0x + 2 * invU * u * p1x + u * u * p2x;
        const by = invU * invU * p0y + 2 * invU * u * p1y + u * u * p2y;
        const bz = invU * invU * p0z + 2 * invU * u * p1z + u * u * p2z;

        // High-voltage jagged fractal electricity displacement
        const jagAmp = Math.sin(u * Math.PI) * (0.06 + voiceEnergy * 0.18);
        const jx = (Math.sin(u * 34.0 + time * 70.0 + idx) + (Math.random() - 0.5) * 0.3) * jagAmp;
        const jy = (Math.cos(u * 28.0 - time * 65.0 + idx) + (Math.random() - 0.5) * 0.3) * jagAmp;
        const jz = (Math.sin(u * 30.0 + time * 80.0 + idx) + (Math.random() - 0.5) * 0.3) * jagAmp;

        mainPos[s * 3] = bx + jx;
        mainPos[s * 3 + 1] = by + jy;
        mainPos[s * 3 + 2] = bz + jz;

        if (s === Math.floor(mSegs * 0.45)) {
          branchX = bx + jx;
          branchY = by + jy;
          branchZ = bz + jz;
        }

        // Color gradient matching the spinning lines: champagne white core to gold and cyan
        let c = colGold;
        if (u < 0.18 || voiceEnergy > 0.45) {
          c = colChampagne;
        } else {
          c = idx % 2 === 0
            ? colGold.clone().lerp(colCyan, Math.sin(u * Math.PI + time * 5.0) * 0.5 + 0.5)
            : colCyan.clone().lerp(colGold, Math.sin(u * Math.PI + time * 5.0) * 0.5 + 0.5);
        }

        const flash = 1.2 + voiceEnergy * 2.2 + (Math.random() * 0.35);
        mainCol[s * 3] = c.r * flash;
        mainCol[s * 3 + 1] = c.g * flash;
        mainCol[s * 3 + 2] = c.b * flash;
      }

      // Secondary branching fork
      const fSegs = forkPos.length / 3;
      for (let f = 0; f < fSegs; f++) {
        const fu = f / (fSegs - 1);
        const fReach = effectiveReach * 0.55;

        const fx = branchX + forkDir.x * fReach * fu;
        const fy = branchY + forkDir.y * fReach * fu;
        const fz = branchZ + forkDir.z * fReach * fu;

        const fjAmp = (0.04 + voiceEnergy * 0.14) * fu;
        const fjx = (Math.sin(fu * 28.0 - time * 40.0 + idx) + (Math.random() - 0.5) * 0.4) * fjAmp;
        const fjy = (Math.cos(fu * 24.0 + time * 35.0 + idx) + (Math.random() - 0.5) * 0.4) * fjAmp;
        const fjz = (Math.sin(fu * 32.0 - time * 45.0 + idx) + (Math.random() - 0.5) * 0.4) * fjAmp;

        forkPos[f * 3] = fx + fjx;
        forkPos[f * 3 + 1] = fy + fjy;
        forkPos[f * 3 + 2] = fz + fjz;

        const fade = (1.0 - fu * 0.65) * (1.1 + voiceEnergy * 1.5);
        const fc = idx % 2 === 0 ? colCyan : colGold;
        forkCol[f * 3] = fc.r * fade;
        forkCol[f * 3 + 1] = fc.g * fade;
        forkCol[f * 3 + 2] = fc.b * fade;
      }

      mainLine.geometry.attributes.position.needsUpdate = true;
      mainLine.geometry.attributes.color.needsUpdate = true;
      forkLine.geometry.attributes.position.needsUpdate = true;
      forkLine.geometry.attributes.color.needsUpdate = true;
    });

    // 5. STRIKE ROOT SPARK PARTICLES (Sparkling around Tesseract Core)
    if (sparksRef.current) {
      const sparkPosAttr = sparksRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = sparkPosAttr.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        const th = time * 1.4 + i * 1.7;
        const ph = Math.sin(time * 1.1 + i * 2.3);
        const r = 0.20 + (Math.sin(time * 16.0 + i) * 0.5 + 0.5) * 0.04;
        arr[i * 3] = Math.cos(th) * Math.cos(ph) * r;
        arr[i * 3 + 1] = Math.sin(ph) * r;
        arr[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * r;
      }
      sparkPosAttr.needsUpdate = true;
    }
  });

  return <group ref={groupRef} />;
};

// ============================================================================
// 5. 4 CONCENTRIC GIMBAL RINGS WITH ROTATION & FLIPPING MECHANICAL ENGINE
// - Brilliant, beautiful gold color with metallic sheen and rich gold emission
// - Different types of lines: solid gold rings, segmented/dashed vernier arc tracks,
//   astrolabe radial tick marks, and articulated connection lines bridging the rings
// - Inter-ring connection system showing mechanical and energetic coupling!
// ============================================================================

// Segmented / Dashed Vernier Ring Track (Astronomical Astrolabe Calibration Ticks)
const GimbalSegmentedTrack: React.FC<{
  radius: number;
  segments?: number;
}> = ({ radius, segments = 64 }) => {
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(segments * 4 * 3);
    const col = new Float32Array(segments * 4 * 3);
    const colGold = new THREE.Color("#ffd700");
    const colChampagne = new THREE.Color("#fffdf0");

    let pIdx = 0;
    for (let i = 0; i < segments; i++) {
      const theta0 = (i / segments) * Math.PI * 2;
      const theta1 = ((i + 0.65) / segments) * Math.PI * 2;

      // 1. Circumferential segmented dash
      pos[pIdx * 3] = Math.cos(theta0) * radius;
      pos[pIdx * 3 + 1] = 0;
      pos[pIdx * 3 + 2] = Math.sin(theta0) * radius;
      col[pIdx * 3] = colGold.r; col[pIdx * 3 + 1] = colGold.g; col[pIdx * 3 + 2] = colGold.b;
      pIdx++;

      pos[pIdx * 3] = Math.cos(theta1) * radius;
      pos[pIdx * 3 + 1] = 0;
      pos[pIdx * 3 + 2] = Math.sin(theta1) * radius;
      col[pIdx * 3] = colGold.r; col[pIdx * 3 + 1] = colGold.g; col[pIdx * 3 + 2] = colGold.b;
      pIdx++;

      // 2. Radial vernier tick mark
      const isMajor = i % 8 === 0;
      const tickLen = isMajor ? 0.048 : 0.024;
      const cTick = isMajor ? colChampagne : colGold;

      pos[pIdx * 3] = Math.cos(theta0) * (radius - tickLen * 0.5);
      pos[pIdx * 3 + 1] = 0;
      pos[pIdx * 3 + 2] = Math.sin(theta0) * (radius - tickLen * 0.5);
      col[pIdx * 3] = cTick.r * 1.3; col[pIdx * 3 + 1] = cTick.g * 1.3; col[pIdx * 3 + 2] = cTick.b * 1.3;
      pIdx++;

      pos[pIdx * 3] = Math.cos(theta0) * (radius + tickLen * 0.5);
      pos[pIdx * 3 + 1] = 0;
      pos[pIdx * 3 + 2] = Math.sin(theta0) * (radius + tickLen * 0.5);
      col[pIdx * 3] = cTick.r * 1.3; col[pIdx * 3 + 1] = cTick.g * 1.3; col[pIdx * 3 + 2] = cTick.b * 1.3;
      pIdx++;
    }
    return [pos, col];
  }, [radius, segments]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.94}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};



// ============================================================================
// 5. GIMBAL INTER-RING DYNAMIC CONNECTIONS & BRIDGES
// - Mechanical pivots, struts, and glowing laser conduits bridging the concentric rings
// - Ring 1 <-> Ring 2, Ring 2 <-> Ring 3, Ring 3 <-> Ring 4
// - Dynamic traveling energy pulses sliding along the inter-ring bridges
// ============================================================================
const GimbalInterRingConnections: React.FC<{
  state: GimbalState;
}> = ({ state }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bridgeLineRef = useRef<THREE.LineSegments>(null);
  const packetsRef = useRef<THREE.Points>(null);

  // 3 inter-ring interfaces (1-2, 2-3, 3-4), with 4 struts each = 12 struts = 24 segment vertices
  const strutPairs = useMemo(() => [
    { rIn: 1.4, rOut: 1.7, struts: 4, speedRel: 0.9 },
    { rIn: 1.7, rOut: 2.0, struts: 4, speedRel: 1.3 },
    { rIn: 2.0, rOut: 2.3, struts: 4, speedRel: 1.7 },
  ], []);

  const totalStruts = strutPairs.reduce((acc, p) => acc + p.struts, 0); // 12
  const [positions, colors] = useMemo(() => {
    return [new Float32Array(totalStruts * 2 * 3), new Float32Array(totalStruts * 2 * 3)];
  }, [totalStruts]);

  // Traveling energy packets along the struts
  const [packetPos, packetPhases] = useMemo(() => {
    const p = new Float32Array(totalStruts * 3);
    const ph = new Float32Array(totalStruts);
    for (let i = 0; i < totalStruts; i++) {
      ph[i] = (i / totalStruts) * Math.PI * 2;
    }
    return [p, ph];
  }, [totalStruts]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bridgeLineRef.current) {
      const posAttr = bridgeLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = bridgeLineRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      const cArr = colAttr.array as Float32Array;

      let idx = 0;
      let strutIdx = 0;

      strutPairs.forEach(({ rIn, rOut, struts, speedRel }) => {
        for (let s = 0; s < struts; s++) {
          const baseAngle = (s / struts) * Math.PI * 2;
          const rotIn = baseAngle + t * 0.8 * state.ring1SpeedMult;
          const rotOut = baseAngle + t * 0.5 * speedRel * (state.isOuterLocked ? 0.3 : state.ring3SpeedMult);

          const xIn = rIn * Math.cos(rotIn);
          const yIn = (Math.sin(rotIn * 2 + t) * 0.08);
          const zIn = rIn * Math.sin(rotIn);

          const xOut = rOut * Math.cos(rotOut);
          const yOut = (Math.cos(rotOut * 2 + t) * 0.08);
          const zOut = rOut * Math.sin(rotOut);

          // Inner contact vertex
          pArr[idx * 3] = xIn;
          pArr[idx * 3 + 1] = yIn;
          pArr[idx * 3 + 2] = zIn;

          cArr[idx * 3] = 1.0;
          cArr[idx * 3 + 1] = 0.84;
          cArr[idx * 3 + 2] = 0.2;
          idx++;

          // Outer contact vertex
          pArr[idx * 3] = xOut;
          pArr[idx * 3 + 1] = yOut;
          pArr[idx * 3 + 2] = zOut;

          cArr[idx * 3] = 0.4;
          cArr[idx * 3 + 1] = 0.9;
          cArr[idx * 3 + 2] = 1.0;
          idx++;

          // Update packet position sliding along strut
          if (packetPos) {
            const progress = (Math.sin(t * 3.5 + packetPhases[strutIdx]) * 0.5 + 0.5);
            packetPos[strutIdx * 3] = THREE.MathUtils.lerp(xIn, xOut, progress);
            packetPos[strutIdx * 3 + 1] = THREE.MathUtils.lerp(yIn, yOut, progress);
            packetPos[strutIdx * 3 + 2] = THREE.MathUtils.lerp(zIn, zOut, progress);
          }
          strutIdx++;
        }
      });

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    if (packetsRef.current) {
      const pktAttr = packetsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      pktAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic Laser Bridges between Rings */}
      <lineSegments ref={bridgeLineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Sliding Energy Packets on Struts */}
      <points ref={packetsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[packetPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ffffff"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// ============================================================================
// 6. GIMBAL RINGS: 4 CONCENTRIC GOLD-PLATED RINGS
// - Ring 1 (Radius 1.4): Innermost gold torus + vernier track + microknob
// - Ring 2 (Radius 1.7): Middle gold torus + pitch oscillation + microknob
// - Ring 3 (Radius 2.0): Outer-mid gold torus + precession + microknob
// - Ring 4 (Radius 2.3): Outer gimbal halo with lock toggle (Rigid Locked / Free Gyro)
// ============================================================================
const GimbalRings: React.FC<{
  state: GimbalState;
  onChangeGimbal?: React.Dispatch<React.SetStateAction<GimbalState>>;
  onFocusTopic?: (topic: "settings" | "diagnostics" | "research" | "gimbal" | "entity") => void;
  isExpanded?: boolean;
  searchResult?: SearchResultData | null;
  onDismissSearch?: () => void;
}> = ({ state, onChangeGimbal, onFocusTopic, isExpanded = false, searchResult = null, onDismissSearch }) => {
  const outerGroupRef = useRef<THREE.Group>(null);
  const ringScale = useRef(1.0);

  const ring1GroupRef = useRef<THREE.Group>(null);
  const ring1MeshRef = useRef<THREE.Mesh>(null);

  const ring2GroupRef = useRef<THREE.Group>(null);
  const ring2MeshRef = useRef<THREE.Mesh>(null);

  const ring3GroupRef = useRef<THREE.Group>(null);
  const ring3MeshRef = useRef<THREE.Mesh>(null);

  const ring4GroupRef = useRef<THREE.Group>(null);
  const ring4MeshRef = useRef<THREE.Mesh>(null);

  // BRILLIANT, BEAUTIFUL GOLD MATERIAL SPECIFICATION (High-Depth Resolution & Luster)
  const goldMatProps = {
    color: "#f5b722",
    roughness: 0.12,
    metalness: 0.96,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  };

  const goldGlow = new THREE.Color("#ffd700");

  useFrame((_, delta) => {
    // Smooth physical expansion and contraction of rings
    const targetScale = isExpanded || !!searchResult ? 1.38 : 1.0;
    ringScale.current = THREE.MathUtils.damp(ringScale.current, targetScale, 4.0, delta);
    if (outerGroupRef.current) {
      outerGroupRef.current.scale.setScalar(ringScale.current);
    }
    // Ring 1 (Innermost, Radius 1.4):
    if (ring1GroupRef.current && ring1MeshRef.current) {
      ring1GroupRef.current.rotation.set(0, 0, 0); // Stationary reference orbit
      const spinRate = (2.6 * state.ring1SpeedMult + state.audioLevel * 10.0);
      ring1MeshRef.current.rotation.z += delta * spinRate;
    }

    // Ring 2 (Middle, Radius 1.7):
    if (ring2GroupRef.current && ring2MeshRef.current) {
      ring2GroupRef.current.rotation.x += delta * (0.95 * state.ring2PitchMult);
      ring2GroupRef.current.rotation.y += delta * (0.75 * state.ring2PitchMult);
      ring2MeshRef.current.rotation.z += delta * (2.2 * state.ring2PitchMult);
    }

    // Ring 3 (Outer-Mid, Radius 2.0):
    if (ring3GroupRef.current && ring3MeshRef.current) {
      ring3GroupRef.current.rotation.x -= delta * (1.1 * state.ring3SpeedMult);
      ring3GroupRef.current.rotation.y += delta * (1.3 * state.ring3SpeedMult);
      ring3MeshRef.current.rotation.z -= delta * (2.4 * state.ring3SpeedMult);
    }

    // Ring 4 (Outermost Halo, Radius 2.3 - Gyro Locking Control):
    if (ring4GroupRef.current && ring4MeshRef.current) {
      if (state.isOuterLocked) {
        ring4GroupRef.current.rotation.x = THREE.MathUtils.damp(ring4GroupRef.current.rotation.x, 0, 8, delta);
        ring4GroupRef.current.rotation.y = THREE.MathUtils.damp(ring4GroupRef.current.rotation.y, 0, 8, delta);
        ring4GroupRef.current.rotation.z = THREE.MathUtils.damp(ring4GroupRef.current.rotation.z, 0, 8, delta);
        ring4MeshRef.current.rotation.z += delta * 0.4;
      } else {
        ring4GroupRef.current.rotation.x += delta * (1.4 * state.ring3SpeedMult);
        ring4GroupRef.current.rotation.y -= delta * (1.6 * state.ring3SpeedMult);
        ring4MeshRef.current.rotation.z += delta * (2.8 * state.ring3SpeedMult);
      }
    }
  });

  return (
    <group ref={outerGroupRef}>
      {/* 3D Ring Holographic Search Results HUD Display */}
      {searchResult && (
        <RingSearchDisplay
          result={searchResult}
          onDismiss={onDismissSearch || (() => voiceAIService.dismissSearchResult())}
        />
      )}
      {/* Ring 1: Innermost (Radius 1.4) - Brilliant Gold Torus + Segmented Vernier Track */}
      <group ref={ring1GroupRef}>
        <mesh ref={ring1MeshRef}>
          <torusGeometry args={[1.4, 0.024, 24, 96]} />
          <meshPhysicalMaterial {...goldMatProps} emissive={goldGlow} emissiveIntensity={0.38} />
        </mesh>
        <GimbalSegmentedTrack radius={1.4} segments={56} />
        <mesh>
          <torusGeometry args={[1.365, 0.003, 16, 96]} />
          <meshBasicMaterial color="#fff4cc" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
        </mesh>
        <RingMicroKnob
          label="R1 // AXIS"
          subLabel={`${(120 * state.ring1SpeedMult).toFixed(0)} RPM • FLUX 1.42T`}
          themeHex="#ffd700"
          position={[1.4, 0, 0]}
          adjustLabel="RATE"
          onAdjust={() =>
            onChangeGimbal?.((prev) => ({
              ...prev,
              ring1SpeedMult: prev.ring1SpeedMult >= 2.5 ? 0.6 : prev.ring1SpeedMult + 0.4,
            }))
          }
          onFocusPanel={() => onFocusTopic?.("settings")}
        />
      </group>

      {/* Ring 2: Middle (Radius 1.7) - Brilliant Gold Torus + Segmented Vernier Track */}
      <group ref={ring2GroupRef}>
        <mesh ref={ring2MeshRef}>
          <torusGeometry args={[1.7, 0.028, 24, 96]} />
          <meshPhysicalMaterial {...goldMatProps} emissive={goldGlow} emissiveIntensity={0.32} />
        </mesh>
        <GimbalSegmentedTrack radius={1.7} segments={68} />
        <mesh>
          <torusGeometry args={[1.735, 0.0035, 16, 96]} />
          <meshBasicMaterial color="#ffe680" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
        </mesh>
        <RingMicroKnob
          label="R2 // PITCH"
          subLabel={`PITCH ${state.ring2PitchMult.toFixed(1)}x • 42.8°`}
          themeHex="#ffaa00"
          position={[0, 1.7, 0]}
          adjustLabel="TILT"
          onAdjust={() =>
            onChangeGimbal?.((prev) => ({
              ...prev,
              ring2PitchMult: prev.ring2PitchMult >= 2.5 ? 0.5 : prev.ring2PitchMult + 0.5,
            }))
          }
          onFocusPanel={() => onFocusTopic?.("gimbal")}
        />
      </group>

      {/* Ring 3: Outer-Mid (Radius 2.0) - Brilliant Gold Torus + Segmented Vernier Track */}
      <group ref={ring3GroupRef}>
        <mesh ref={ring3MeshRef}>
          <torusGeometry args={[2.0, 0.034, 26, 96]} />
          <meshPhysicalMaterial {...goldMatProps} emissive={goldGlow} emissiveIntensity={0.35} />
        </mesh>
        <GimbalSegmentedTrack radius={2.0} segments={80} />
        <mesh>
          <torusGeometry args={[1.96, 0.0035, 16, 96]} />
          <meshBasicMaterial color="#fff4cc" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
        </mesh>
        <RingMicroKnob
          label="R3 // FLUX"
          subLabel={`PRECESS ${state.ring3SpeedMult.toFixed(1)}x • TACHYON`}
          themeHex="#ffd700"
          position={[-2.0, 0, 0]}
          adjustLabel="RATE"
          onAdjust={() =>
            onChangeGimbal?.((prev) => ({
              ...prev,
              ring3SpeedMult: prev.ring3SpeedMult >= 2.5 ? 0.6 : prev.ring3SpeedMult + 0.4,
            }))
          }
          onFocusPanel={() => onFocusTopic?.("diagnostics")}
        />
      </group>

      {/* Ring 4: Outermost Halo Gimbal (Radius 2.3) - Brilliant Gold Torus + Gyro Lock */}
      <group ref={ring4GroupRef}>
        <mesh ref={ring4MeshRef}>
          <torusGeometry args={[2.3, 0.038, 28, 96]} />
          <meshPhysicalMaterial
            {...goldMatProps}
            emissive={state.isOuterLocked ? new THREE.Color("#ff1744") : goldGlow}
            emissiveIntensity={state.isOuterLocked ? 0.95 : 0.35}
          />
        </mesh>
        <GimbalSegmentedTrack radius={2.3} segments={96} />
        <mesh>
          <torusGeometry args={[2.26, 0.004, 16, 96]} />
          <meshBasicMaterial color="#fff4cc" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
        </mesh>
        <RingMicroKnob
          label="R4 // GYRO"
          subLabel={state.isOuterLocked ? "RIGID LOCKED" : `FREE GYRO • ${state.ring3SpeedMult.toFixed(1)}x`}
          themeHex={state.isOuterLocked ? "#ff1744" : "#ffd700"}
          position={[0, -2.3, 0]}
          adjustLabel={state.isOuterLocked ? "UNLOCK" : "LOCK"}
          onAdjust={() =>
            onChangeGimbal?.((prev) => ({
              ...prev,
              isOuterLocked: !prev.isOuterLocked,
            }))
          }
          onFocusPanel={() => onFocusTopic?.("diagnostics")}
        />
      </group>
    </group>
  );
};

// ============================================================================
// 6B. FLOATING FIELD MOTES (Ambient Cosmic Particulates)
// - 140 orbital floating motes drifting in the void around the entity
// - Smooth voice-reactive orbital excitation
// ============================================================================
const FloatingFieldMotes: React.FC<{
  bgMode: "transparent" | "black-void" | "dark-gray" | "studio";
  glowTheme: string;
  voiceLevel: number;
}> = ({ bgMode, glowTheme, voiceLevel }) => {
  const motesRef = useRef<THREE.Points>(null);
  const count = 140;

  const [positions, phases, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;
      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 0.3 + Math.random() * 0.5;
    }
    return [pos, ph, sp];
  }, [count]);

  const themeHex = GLOW_COLORS[glowTheme] || "#ffd700";

  useFrame(({ clock }) => {
    if (!motesRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = motesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const p = phases[i];
      const spd = speeds[i] + voiceLevel * 1.5;
      const angle = t * spd * 0.35 + p;
      const r = 1.8 + (i % 6) * 0.45 + Math.sin(t * 1.5 + p) * 0.15;
      arr[i * 3] = r * Math.cos(angle);
      arr[i * 3 + 1] += Math.sin(t * 1.2 + p) * 0.003;
      arr[i * 3 + 2] = r * Math.sin(angle);
    }
    posAttr.needsUpdate = true;
  });

  if (bgMode === "transparent") return null;

  return (
    <points ref={motesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={themeHex}
        transparent
        opacity={0.8 + voiceLevel * 0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ============================================================================
// 6. PHOTOGRAPHIC STUDIO DEPTH OF FIELD (Aperture & Focus Engine)
// - Locks razor-sharp optical focus on the central living organism
// - Softly diffuses and blurs the outer rotating gimbal rings with photographic bokeh
// - Auto-tracks the organism's live 3D coordinates during free-range drift & gestures
// ============================================================================
const StudioDepthOfField: React.FC<{
  enabled: boolean;
  organismPosRef: React.RefObject<THREE.Vector3>;
  bokehScale: number;
  focusRange: number;
}> = ({ enabled, organismPosRef, bokehScale, focusRange }) => {
  const dofRef = useRef<DepthOfFieldEffect | null>(null);

  useFrame(() => {
    if (!enabled) return;
    if (dofRef.current?.target && organismPosRef.current) {
      dofRef.current.target.lerp(organismPosRef.current, 0.15);
    }
  });

  return (
    <EffectComposer enabled={enabled} multisampling={0}>
      <DepthOfField
        ref={dofRef}
        target={[0, 0, 0]}
        focusRange={focusRange}
        bokehScale={bokehScale}
      />
    </EffectComposer>
  );
};

// ============================================================================
// 6B. VOID CONTACT SHADOW DISC (GROUND ACCORDION SHADOW)
// - Casts a soft Gaussian contact drop-shadow directly below the floating entity
// - Grounds the entity in real 3D space for Black Void, Dark Gray, and Studio White
// ============================================================================
const VoidContactShadow: React.FC<{
  bgMode: 'transparent' | 'black-void' | 'dark-gray' | 'studio';
  organismPosRef?: React.RefObject<THREE.Vector3>;
}> = ({ bgMode, organismPosRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    if (organismPosRef?.current) {
      meshRef.current.position.x = organismPosRef.current.x * 0.7;
      meshRef.current.position.z = organismPosRef.current.z * 0.7;
    }
  });

  if (bgMode === 'transparent') return null;

  const shadowColor = bgMode === 'studio' ? '#0f172a' : '#000000';
  const shadowOpacity = bgMode === 'studio' ? 0.38 : bgMode === 'dark-gray' ? 0.65 : 0.88;

  return (
    <mesh ref={meshRef} position={[0, -2.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7.5, 7.5]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{
          uColor: { value: new THREE.Color(shadowColor) },
          uOpacity: { value: shadowOpacity },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float d = distance(vUv, vec2(0.5));
            float inner = exp(-d * d * 18.0) * 0.75;
            float outer = exp(-d * d * 4.5) * 0.25;
            float alpha = (inner + outer) * smoothstep(0.5, 0.15, d) * uOpacity;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
};

// ============================================================================
// 7. WHOLE-ORGANISM FREE-RANGE MOVEMENT PHYSICS CONTAINER
// ============================================================================
const FreeRangeOrganismContainer: React.FC<{
  config: FerrofluidConfig;
  userVoice: VoiceMetrics;
  modelVoiceLevel: number;
  gimbalState: GimbalState;
  trackingData: VisionTrackingData;
  movementMode: 'autonomous_roam' | 'follow_face' | 'follow_hand' | 'magnetic_tether' | 'anchor';
  mood: 'curious' | 'attentive' | 'resonating' | 'defensive' | 'quiescent';
  freeRangeEnabled: boolean;
  manualTargetPos: THREE.Vector3 | null;
  organismPosRef?: React.RefObject<THREE.Vector3>;
  isSpatialPanelsOpen?: boolean;
  onToggleSpatialPanels?: () => void;
  focusedSpatialTopic?: 'settings' | 'diagnostics' | 'research' | 'gimbal' | 'entity' | 'all' | null;
  onSelectSpatialTopic?: (topic: 'settings' | 'diagnostics' | 'research' | 'gimbal' | 'entity' | 'all' | null) => void;
  onChangeConfig?: React.Dispatch<React.SetStateAction<FerrofluidConfig>>;
  onChangeGimbal?: React.Dispatch<React.SetStateAction<GimbalState>>;
  onSelectGlowTheme?: (theme: string) => void;
  dofEnabled?: boolean;
  onToggleDof?: () => void;
  onExecuteDesktopAction?: (action: string, command: string) => void;
  desktopResult?: { action: string; success: boolean; output: string } | null;
  isProcessing?: boolean;
  vuiState?: VUIState;
  searchResult?: SearchResultData | null;
  onDismissSearch?: () => void;
  isRingsExpanded?: boolean;
  onOpenGlassmorphicPanel?: () => void;
}> = ({
  config,
  userVoice,
  modelVoiceLevel,
  gimbalState,
  trackingData,
  movementMode,
  mood,
  freeRangeEnabled,
  manualTargetPos,
  organismPosRef,
  isSpatialPanelsOpen,
  onToggleSpatialPanels,
  focusedSpatialTopic,
  onSelectSpatialTopic,
  onChangeConfig,
  onChangeGimbal,
  onSelectGlowTheme,
  dofEnabled,
  onToggleDof,
  onExecuteDesktopAction,
  desktopResult,
  isProcessing = false,
  vuiState = 'standby',
  searchResult = null,
  onDismissSearch,
  isRingsExpanded = false,
  onOpenGlassmorphicPanel,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(0, 0, 0));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const rot = useRef(new THREE.Euler(0, 0, 0));

  const lastVol = useRef(0);
  const recoilOffset = useRef(new THREE.Vector3(0, 0, 0));
  const attentionFactor = useRef(0);
  const speechLingerTimer = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(0.08, delta);

    const voiceVol = Math.max(userVoice.volume, modelVoiceLevel * 1.25);
    const volDelta = voiceVol - lastVol.current;
    lastVol.current = voiceVol;

    // Transient shockwave detection: sudden loud sound causes physical recoil
    if (volDelta > 0.32) {
      recoilOffset.current.z -= volDelta * 0.75;
      recoilOffset.current.y += (Math.random() - 0.5) * 0.3;
    }
    recoilOffset.current.lerp(new THREE.Vector3(0, 0, 0), dt * 5.0);

    // Conversational Attention vs Ambient Free-Floating:
    // When someone speaks (user voice or AI speech), activate attention and linger for 2.4 seconds
    const isSpeaking = voiceVol > 0.045;
    if (isSpeaking) {
      speechLingerTimer.current = 2.4;
    } else if (speechLingerTimer.current > 0) {
      speechLingerTimer.current -= dt;
    }

    const isAttentive = isSpeaking || speechLingerTimer.current > 0;
    const targetAttention = isAttentive ? 1.0 : 0.0;
    attentionFactor.current = THREE.MathUtils.damp(attentionFactor.current, targetAttention, 2.8, dt);

    // Compute Target Position based on tracking mode
    if (!freeRangeEnabled || movementMode === 'anchor') {
      target.current.set(0, 0, 0);
    } else if (manualTargetPos) {
      target.current.copy(manualTargetPos);
    } else if (movementMode === 'follow_face' && trackingData.faceDetected) {
      // 3D Head Tracking: match user's head position in room
      const tx = trackingData.faceX * 1.9;
      const ty = trackingData.faceY * 1.3;
      const tz = (trackingData.faceDist - 1.0) * 1.4 + (voiceVol > 0.05 ? 0.35 : 0);
      target.current.set(tx, ty, tz);
    } else if (
      (movementMode === 'follow_hand' || movementMode === 'magnetic_tether') &&
      trackingData.handDetected
    ) {
      const tx = trackingData.handX * 2.3;
      const ty = trackingData.handY * 1.6;
      let tz = 0.4;
      if (trackingData.isPinching) {
        // Pinch = Magnetic Tractor Beam: glides close to fingers
        tz = 1.0;
      } else if (trackingData.isOpenPalm) {
        // Open Palm = Repulsor Shield: glides back safely
        tz = -1.1;
      }
      target.current.set(tx, ty, tz);
    } else {
      // Autonomous Roaming Mode:
      // 1. Viscous Aquatic Jellyfish Swimming & Buoyancy Drift (smooth, weightless oceanic motion)
      const roamTime = t * 0.32;
      const rx = Math.sin(roamTime * 0.72) * 1.5 + Math.cos(roamTime * 0.31) * 0.45;
      // Jellyfish rhythmic propulsive stroke & buoyant glide
      const jellyStroke = Math.pow(Math.sin(t * 1.4) * 0.5 + 0.5, 2.5) * 0.18;
      const ry = Math.cos(roamTime * 0.54) * 0.85 + Math.sin(roamTime * 0.22) * 0.25 + jellyStroke;
      const rz = Math.sin(roamTime * 0.41 + 0.8) * 0.75;
      const roamTarget = new THREE.Vector3(rx, ry, rz);

      // 2. Centered Attentive Focus (Centers smoothly to front when spoken to)
      const attentiveTarget = new THREE.Vector3(
        trackingData.faceDetected ? trackingData.faceX * 0.55 : 0,
        trackingData.faceDetected ? trackingData.faceY * 0.4 : 0,
        0.48 + (voiceVol > 0.06 ? 0.15 : 0)
      );

      // Seamless velvety interpolation between free-floating roam and centered attention
      target.current.lerpVectors(roamTarget, attentiveTarget, attentionFactor.current);
    }

    const finalTarget = target.current.clone().add(recoilOffset.current);

    // Viscous fluid dynamic spring-damper integration (high fluid drag for jellyfish weightlessness)
    const springK = trackingData.isPinching ? 8.0 : 3.2;
    const damping = trackingData.isPinching ? 0.88 : 0.94;

    const diff = finalTarget.sub(pos.current);
    const accel = diff.multiplyScalar(springK);
    vel.current.add(accel.multiplyScalar(dt));
    vel.current.multiplyScalar(Math.pow(damping, dt * 60));
    pos.current.add(vel.current.clone().multiplyScalar(dt));

    groupRef.current.position.copy(pos.current);
    if (organismPosRef?.current) {
      organismPosRef.current.copy(pos.current);
    }

    // Fluid 3D Swimming Banking & Pitch
    const targetRoll =
      -vel.current.x * 0.22 + (trackingData.faceDetected ? trackingData.faceRoll * 0.35 : 0);
    const targetPitch =
      vel.current.y * 0.2 +
      voiceVol * 0.12 +
      (trackingData.faceDetected ? trackingData.facePitch * 0.25 : 0);
    const targetYaw =
      vel.current.x * 0.18 + (trackingData.faceDetected ? trackingData.faceYaw * 0.25 : 0);

    rot.current.x = THREE.MathUtils.damp(rot.current.x, targetPitch, 2.5, dt);
    rot.current.y = THREE.MathUtils.damp(rot.current.y, targetYaw, 2.5, dt);
    rot.current.z = THREE.MathUtils.damp(rot.current.z, targetRoll, 2.5, dt);

    groupRef.current.rotation.set(rot.current.x, rot.current.y, rot.current.z);
  });

    const handleEntityClick = () => {
      recoilOffset.current.z -= 0.35;
      recoilOffset.current.y += (Math.random() - 0.5) * 0.25;
      try {
        audioEngine.playMagneticPulse(0.8);
      } catch (_) {}
      onOpenGlassmorphicPanel?.();
    };

    return (
      <group ref={groupRef} scale={0.52}>
        {/* Living 3D Ferrofluid Sphere with Rosensweig Spikes, Dielectric Fresnel, and Acoustic Waves */}
        <FerrofluidSphere
          config={config}
          userVoice={userVoice}
          modelVoiceLevel={modelVoiceLevel}
          trackingData={trackingData}
          onEntityClick={handleEntityClick}
          vuiState={vuiState}
        />
        <DynamicElectricalArcSystem
          glowTheme={config.glowTheme}
          userVoice={userVoice}
          modelVoiceLevel={modelVoiceLevel}
          isTethered={trackingData.isPinching}
          tetherTarget={
            trackingData.isPinching
              ? new THREE.Vector3(trackingData.handX * 2.2, trackingData.handY * 1.5, 1.4)
              : null
          }
        />
        <GimbalRings
          state={gimbalState}
          onChangeGimbal={onChangeGimbal}
          isExpanded={isRingsExpanded}
          searchResult={searchResult}
          onDismissSearch={onDismissSearch}
        />
        <GimbalInterRingConnections state={gimbalState} />
        {/* Ultra-transparent glass membrane encasing the entire orb, nucleus, and rings */}
        <UltraTransparentOuterGlassMembrane bloomIntensity={config.bloomIntensity} />
      </group>
    );
  };

// ============================================================================
// 8. MINIMAL FUTURISTIC LIGHT HUD BAR
// ============================================================================
const FuturisticLightHUD: React.FC<{
  isConnected: boolean;
  isConnecting: boolean;
  onToggleConnection: () => void;
  statusText: string;
  freeRangeEnabled: boolean;
  onToggleFreeRange: () => void;
  movementMode: 'autonomous_roam' | 'follow_face' | 'follow_hand' | 'magnetic_tether' | 'anchor';
  visionEnabled: boolean;
  onToggleVision: () => void;
  trackingData: VisionTrackingData;
  isDockOpen: boolean;
  onToggleDock: () => void;
  bgMode: 'transparent' | 'black-void' | 'dark-gray' | 'studio';
  onChangeBgMode: (mode: 'transparent' | 'black-void' | 'dark-gray' | 'studio') => void;
  isCalculating?: boolean;
  onToggleCalculate?: () => void;
  vuiState?: VUIState;
  onOpenGlassmorphicPanel?: () => void;
  onOpenDownloadModal?: () => void;
  wakePhrase?: string;
  onTestWake?: () => void;
  onOpenBestiary?: () => void;
  onOpenWorldMap?: () => void;
}> = ({
  isConnected,
  isConnecting,
  onToggleConnection,
  statusText,
  freeRangeEnabled,
  onToggleFreeRange,
  movementMode,
  visionEnabled,
  onToggleVision,
  trackingData,
  isDockOpen,
  onToggleDock,
  bgMode,
  onChangeBgMode,
  isCalculating = false,
  onToggleCalculate,
  vuiState = 'standby',
  onOpenGlassmorphicPanel,
  onOpenDownloadModal,
  wakePhrase = 'Hey Ferro',
  onTestWake,
  onOpenBestiary,
  onOpenWorldMap,
}) => {
  const nextBgMode = () => {
    if (bgMode === 'black-void') onChangeBgMode('dark-gray');
    else if (bgMode === 'dark-gray') onChangeBgMode('studio');
    else if (bgMode === 'studio') onChangeBgMode('transparent');
    else onChangeBgMode('black-void');
  };

  const bgLabel =
    bgMode === 'black-void'
      ? 'OBSIDIAN'
      : bgMode === 'dark-gray'
      ? 'GRAPHITE'
      : bgMode === 'studio'
      ? 'STUDIO'
      : 'TRANSPARENT';

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-auto select-none">
      {/* Left: VUI State Indicator, Wake Phrase & Settings Panel Trigger */}
      <div className="flex items-center gap-2">
        {/* Dynamic VUI State Indicator Badge */}
        <button
          onClick={onOpenGlassmorphicPanel}
          title="Voice User Interface State Indicator - Click to open Glassmorphic Settings"
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-all backdrop-blur-xl ${
            vuiState === 'listening'
              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(0,255,128,0.4)] animate-pulse'
              : vuiState === 'speaking'
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse'
              : vuiState === 'thinking'
              ? 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(180,0,255,0.4)] animate-pulse'
              : 'bg-black/60 hover:bg-black/80 border-cyan-500/30 text-cyan-300 hover:border-cyan-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              vuiState === 'listening'
                ? 'bg-emerald-400 animate-ping'
                : vuiState === 'speaking'
                ? 'bg-cyan-400 animate-ping'
                : vuiState === 'thinking'
                ? 'bg-purple-400 animate-ping'
                : 'bg-cyan-400/80'
            }`}
          />
          <span className="font-bold">VUI // {vuiState.toUpperCase()}</span>
          <span className="text-[9px] text-stone-400 hidden sm:inline">[SETTINGS]</span>
        </button>

        {/* Wake Phrase Quick Trigger */}
        <button
          onClick={onTestWake}
          title={`Wake Phrase: "${wakePhrase}" (Say aloud or click to awaken)`}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 hover:border-cyan-500/40 text-[10px] font-mono text-cyan-200 backdrop-blur-md cursor-pointer transition-all"
        >
          <Mic size={12} className="text-cyan-400" />
          <span>WAKE: &ldquo;{wakePhrase}&rdquo;</span>
        </button>

        {/* Bestiary & Procedural Fauna */}
        {onOpenBestiary && (
          <button
            onClick={onOpenBestiary}
            title="Open Mathematical Procedural Bestiary & Fauna Lexicon"
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Atom size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">BESTIARY</span>
          </button>
        )}

        {/* Procedural 2D & 3D World Map */}
        {onOpenWorldMap && (
          <button
            onClick={onOpenWorldMap}
            title="Open Procedural 2D & 3D World Cartography & Biome Map"
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Globe size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">WORLD MAP</span>
          </button>
        )}

        {/* 3D Model Download */}
        {onOpenDownloadModal && (
          <button
            onClick={onOpenDownloadModal}
            title="Download 3D Model (.GLB/.OBJ) or Desktop Companion App"
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Download size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">3D MODEL</span>
          </button>
        )}
      </div>

      {/* Right: Vision, Free-Range, Background Void & Connection */}
      <div className="flex items-center gap-2">
        {/* Dynamic Data Stream / Quantum Processing Surge Button */}
        <button
          onClick={onToggleCalculate}
          title="Toggle Quantum Calculation & Data Stream Processing Surge Effect (loading glamour)"
          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-wider border backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 ${
            isCalculating
              ? "bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              : "bg-black/60 text-neutral-400 border-white/10 hover:text-white"
          }`}
        >
          <Cpu size={11} className={isCalculating ? "animate-spin text-cyan-300" : ""} />
          <span className="hidden md:inline">STREAM:</span>
          <span>{isCalculating ? "CALCULATING" : "IDLE"}</span>
        </button>

        {/* Quick Void Background Knob / Toggle */}
        <button
          onClick={nextBgMode}
          title="Cycle Void Background: Obsidian Void / Graphite Void / Studio White / Transparent"
          className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-neutral-300 border border-white/10 hover:border-cyan-500/40 backdrop-blur-md text-[10px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <Layers size={12} className="text-cyan-400" />
          <span className="hidden md:inline text-neutral-400">BG:</span>
          <span className="font-semibold text-neutral-200">{bgLabel}</span>
        </button>

        {/* Free Range Roam Toggle */}
        <button
          onClick={onToggleFreeRange}
          title="Toggle autonomous 3D floating movement"
          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-wider border backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 ${
            freeRangeEnabled
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
              : "bg-black/60 text-neutral-400 border-white/10 hover:text-white"
          }`}
        >
          <Move size={11} className={freeRangeEnabled ? "animate-spin" : ""} />
          <span className="hidden sm:inline">ROAM:</span>
          <span>{freeRangeEnabled ? movementMode.split('_')[0].toUpperCase() : "OFF"}</span>
        </button>

        {/* Vision Tracking Toggle */}
        <button
          onClick={onToggleVision}
          title="Toggle Face & Hand Vision Tracking"
          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-wider border backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 ${
            visionEnabled
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
              : "bg-black/60 text-neutral-400 border-white/10 hover:text-white"
          }`}
        >
          <Eye size={11} />
          <span className="hidden sm:inline">VISION:</span>
          <span>{visionEnabled ? (trackingData.faceDetected ? "LOCK" : "SEEK") : "OFF"}</span>
        </button>

        {/* AI Connect / Disconnect */}
        <button
          onClick={onToggleConnection}
          disabled={isConnecting}
          className={`px-4 py-1.5 rounded-xl text-[11px] font-mono font-bold tracking-wider backdrop-blur-xl transition-all cursor-pointer shadow-lg ${
            isConnected
              ? "bg-red-500/25 text-red-300 border border-red-500/50 hover:bg-red-500/35 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              : "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/35 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          }`}
        >
          {isConnecting ? "LINKING..." : isConnected ? "DISCONNECT" : "INITIALIZE AI"}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 7. MASTER COMPONENT & SEAMLESS AUDIO PIPELINE
// ============================================================================
export default function FerrofluidApp({ onSwitchToStudio }: { onSwitchToStudio?: () => void } = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState("STANDBY");

  // Core Simulation State
  const [config, setConfig] = useState<FerrofluidConfig>({
    magneticStrength: 1.4,
    glowTheme: "cyan",
    morphIntensity: 1.0,
    bloomIntensity: 1.35,
  });
  const [isDockOpen, setIsDockOpen] = useState(false);

  // Gimbal Mechanics State
  const [gimbalState, setGimbalState] = useState<GimbalState>({
    audioLevel: 0,
    isModelSpeaking: false,
    ring1SpeedMult: 1.0,
    ring2PitchMult: 1.0,
    ring3SpeedMult: 1.0,
    isOuterLocked: false,
    motionStyle: "fluid",
    glowColor: GLOW_COLORS.cyan,
  });

  // Live FFT Voice Metrics (Extracted from user microphone)
  const [userVoiceMetrics, setUserVoiceMetrics] = useState<VoiceMetrics>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });
  const [modelVoiceLevel, setModelVoiceLevel] = useState(0);

  // Free-Range Movement & Vision Tracking State
  const [freeRangeEnabled, setFreeRangeEnabled] = useState(true);
  const [movementMode, setMovementMode] = useState<
    'autonomous_roam' | 'follow_face' | 'follow_hand' | 'magnetic_tether' | 'anchor'
  >('autonomous_roam');
  const [organismMood, setOrganismMood] = useState<
    'curious' | 'attentive' | 'resonating' | 'defensive' | 'quiescent'
  >('curious');
  const [manualTargetPos, setManualTargetPos] = useState<THREE.Vector3 | null>(null);

  const [visionEnabled, setVisionEnabled] = useState(false);
  // Photographic Studio Optics State (Depth of Field)
  const [dofEnabled, setDofEnabled] = useState(true);
  const [dofBokehScale, setDofBokehScale] = useState(3.0);
  const [dofFocusRange, setDofFocusRange] = useState(1.6);
  const organismPosRef = useRef(new THREE.Vector3(0, 0, 0));

  // Diegetic Spatial UI Panels & Desktop Integration
  const [isSpatialPanelsOpen, setIsSpatialPanelsOpen] = useState(true);
  const [focusedSpatialTopic, setFocusedSpatialTopic] = useState<'settings' | 'diagnostics' | 'research' | 'gimbal' | 'entity' | 'all' | null>('entity');
  const [desktopResult, setDesktopResult] = useState<{ action: string; success: boolean; output: string } | null>(null);
  const [bgMode, setBgMode] = useState<'transparent' | 'black-void' | 'dark-gray' | 'studio'>('black-void');

  // Quantum Calculation & Data Stream Processing Surge (Glamour Loading Visual State)
  const [isSimulatingProcessing, setIsSimulatingProcessing] = useState(false);
  const isCalculating =
    isConnecting ||
    isSimulatingProcessing ||
    userVoiceMetrics.volume > 0.05 ||
    modelVoiceLevel > 0.03 ||
    gimbalState.isModelSpeaking;

  // Voice AI, VUI State & Ring Search Engine
  const [vuiState, setVuiState] = useState<VUIState>(voiceAIService.getState());
  const [searchResult, setSearchResult] = useState<SearchResultData | null>(voiceAIService.getActiveSearchResult());
  const [isRingsExpanded, setIsRingsExpanded] = useState(false);
  const [isGlassmorphicPanelOpen, setIsGlassmorphicPanelOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isBestiaryOpen, setIsBestiaryOpen] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [focusSectorId, setFocusSectorId] = useState<string | null>(null);
  const [focusFaunaId, setFocusFaunaId] = useState<string | null>(null);

  useEffect(() => {
    const unsubState = voiceAIService.subscribeState((st) => {
      setVuiState(st);
      if (st === 'speaking') {
        setGimbalState((prev) => ({ ...prev, isModelSpeaking: true }));
      } else {
        setGimbalState((prev) => ({ ...prev, isModelSpeaking: false }));
      }
    });

    const unsubSearch = voiceAIService.subscribeSearch((sr) => {
      setSearchResult(sr);
      if (sr) {
        setIsRingsExpanded(true);
      } else {
        setIsRingsExpanded(false);
      }
    });

    // Automatically initialize continuous wake phrase listener
    voiceAIService.startWakeListening();

    return () => {
      unsubState();
      unsubSearch();
    };
  }, []);

  const handleExecuteDesktopAction = (action: string, command: string) => {
    try {
      const electron = (window as any).require?.('electron');
      if (electron?.ipcRenderer) {
        electron.ipcRenderer.send('execute-desktop-action', { action, command });
        return;
      }
    } catch (_) {}

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ desktopAction: { action, command } }));
    }

    setDesktopResult({
      action,
      success: true,
      output:
        action === 'system_status'
          ? 'System Online: Vite dev host active, 3D WebGL context optimal, Electron IPC bridge ready.'
          : `Dispatched command [${command}] to desktop executor pipeline.`,
    });
  };

  const [trackingData, setTrackingData] = useState<VisionTrackingData>({
    active: false,
    faceDetected: false,
    faceX: 0,
    faceY: 0,
    faceDist: 1.0,
    facePitch: 0,
    faceYaw: 0,
    faceRoll: 0,
    mouthOpen: false,
    handDetected: false,
    handX: 0,
    handY: 0,
    handDist: 1.0,
    gesture: 'none',
    pinchDistance: 1.0,
    isPinching: false,
    isOpenPalm: false,
  });

  // Audio References
  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Web Audio Sequential Timeline Scheduler
  // (Prevents overlapping parallel chunk playback that creates "many voices at once" chorus)
  const nextPlayTimeRef = useRef<number>(0);

  // User mic analyser node
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const freqBufferRef = useRef<Uint8Array | null>(null);

  // Model audio output analyser
  const modelAnalyserRef = useRef<AnalyserNode | null>(null);
  // Audio output softening chain (Low-pass filter + Gain node)
  const outputFilterRef = useRef<BiquadFilterNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Converts Float32Array mic data to Base64 Int16 PCM (16kHz)
  const pcmToBase64 = (buffer: Float32Array) => {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      const sample = Math.max(-1, Math.min(1, buffer[l]));
      buf[l] = sample * 0x7fff;
    }

    const bytes = new Uint8Array(buf.buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Immediate barge-in cleanup
  const stopAllAudioPlayback = () => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (_) {}
    });
    activeSourcesRef.current.clear();
    nextPlayTimeRef.current = 0;
    setGimbalState((prev) => ({ ...prev, isModelSpeaking: false }));
    setModelVoiceLevel(0);
  };

  // Playback 24kHz Int16 PCM with SEAMLESS TIME SCHEDULING
  // This ensures chunks play strictly sequentially in natural human cadence without overlapping
  const playAudioChunk = (ctx: AudioContext, base64Audio: string) => {
    if (!ctx || ctx.state === "closed") return;

    try {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const binary = window.atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const view = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(view.length);
      for (let i = 0; i < view.length; i++) float32Array[i] = view[i] / 0x8000;

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (modelAnalyserRef.current) {
        source.connect(modelAnalyserRef.current);
      } else if (outputFilterRef.current) {
        source.connect(outputFilterRef.current);
      } else if (outputGainRef.current) {
        source.connect(outputGainRef.current);
      } else {
        source.connect(ctx.destination);
      }

      activeSourcesRef.current.add(source);
      setGimbalState((prev) => ({ ...prev, isModelSpeaking: true }));

      // Scheduled playback: schedule precisely at or after the previous chunk completes
      const now = ctx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0) {
          setGimbalState((prev) => ({ ...prev, isModelSpeaking: false }));
          setModelVoiceLevel(0);
          nextPlayTimeRef.current = 0;
        }
      };
    } catch (err) {
      console.warn("Audio chunk decode/playback failed:", err);
    }
  };

  // Real-time animation frame polling of microphone & speaker FFT for physical reactivity
  useEffect(() => {
    let animId: number;
    const pollAudio = () => {
      // 1. User Microphone FFT Analysis
      if (userAnalyserRef.current && freqBufferRef.current) {
        userAnalyserRef.current.getByteFrequencyData(freqBufferRef.current);
        const buf = freqBufferRef.current;
        const len = buf.length;

        let total = 0;
        let bass = 0;
        let mid = 0;
        let treble = 0;

        const bassCut = Math.floor(len * 0.12);
        const midCut = Math.floor(len * 0.45);

        for (let i = 0; i < len; i++) {
          const val = buf[i] / 255;
          total += val;
          if (i < bassCut) bass += val;
          else if (i < midCut) mid += val;
          else treble += val;
        }

        const vol = Math.min(1.0, (total / len) * 3.2);
        const normBass = Math.min(1.0, (bass / Math.max(1, bassCut)) * 2.8);
        const normMid = Math.min(1.0, (mid / Math.max(1, midCut - bassCut)) * 3.0);
        const normTreble = Math.min(1.0, (treble / Math.max(1, len - midCut)) * 3.4);

        setUserVoiceMetrics({ volume: vol, bass: normBass, mid: normMid, treble: normTreble });
        setGimbalState((prev) => ({ ...prev, audioLevel: vol }));
      }

      // 2. Model AI Audio Level
      if (modelAnalyserRef.current) {
        const data = new Uint8Array(64);
        modelAnalyserRef.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / (data.length * 255);
        setModelVoiceLevel(avg);
      }

      animId = requestAnimationFrame(pollAudio);
    };

    animId = requestAnimationFrame(pollAudio);
    return () => cancelAnimationFrame(animId);
  }, []);

  const connectAI = async () => {
    setIsConnecting(true);
    setStatusText("CONNECTING...");

    try {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/live`);
      wsRef.current = ws;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      inputCtxRef.current = inputCtx;
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      outputCtxRef.current = outputCtx;

      // 1. Model audio analyser (for visual core FFT reactivity)
      const mAnalyser = outputCtx.createAnalyser();
      mAnalyser.fftSize = 128;
      modelAnalyserRef.current = mAnalyser;

      // 2. Low-pass filter to soften AI voice, reducing harsh high-frequency sizzle and sibilance artifacts
      const lowPassFilter = outputCtx.createBiquadFilter();
      lowPassFilter.type = "lowpass";
      // 5400Hz cutoff with Butterworth Q (0.707) rolls off digital quantization & high-frequency edge
      lowPassFilter.frequency.setValueAtTime(5400, outputCtx.currentTime);
      lowPassFilter.Q.setValueAtTime(0.707, outputCtx.currentTime);
      outputFilterRef.current = lowPassFilter;

      // 3. Output Gain node to soften attack and ensure headroom against 0 dBFS clipping
      const outputGain = outputCtx.createGain();
      outputGain.gain.setValueAtTime(0.92, outputCtx.currentTime);
      outputGainRef.current = outputGain;

      // Audio Graph routing:
      // mAnalyser -> lowPassFilter -> outputGain -> outputCtx.destination
      mAnalyser.connect(lowPassFilter);
      lowPassFilter.connect(outputGain);
      outputGain.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);

      // Create user voice FFT analyser
      const uAnalyser = inputCtx.createAnalyser();
      uAnalyser.fftSize = 256;
      freqBufferRef.current = new Uint8Array(uAnalyser.frequencyBinCount);
      userAnalyserRef.current = uAnalyser;
      source.connect(uAnalyser);

      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusText("CORE ONLINE");
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        // 1. Audio stream chunks with sequential playback scheduling
        if (msg.audio && outputCtxRef.current) {
          playAudioChunk(outputCtxRef.current, msg.audio);
        }

        // 2. Interruption event (barge-in)
        if (msg.interrupted) {
          stopAllAudioPlayback();
        }

        // 3. Dynamic Tool Handlers
        if (msg.toolCall) {
          const { name, args } = msg.toolCall;

          if (name === "changeFerrofluidConfig") {
            setConfig((prev) => ({
              ...prev,
              ...(args.magneticStrength !== undefined && { magneticStrength: args.magneticStrength }),
              ...(args.glowTheme !== undefined && { glowTheme: args.glowTheme }),
              ...(args.morphIntensity !== undefined && { morphIntensity: args.morphIntensity }),
            }));
            if (args.glowTheme && GLOW_COLORS[args.glowTheme]) {
              setGimbalState((prev) => ({ ...prev, glowColor: GLOW_COLORS[args.glowTheme] }));
            }
          }

          if (name === "adjustGimbalDynamics") {
            const { targetRing, speedMultiplier, motionStyle } = args;
            setGimbalState((prev) => {
              const mult = speedMultiplier !== undefined ? speedMultiplier : 1.0;
              const isLocked = motionStyle === "locked";

              if (targetRing === "inner") return { ...prev, ring1SpeedMult: mult };
              if (targetRing === "ring2") return { ...prev, ring2PitchMult: mult };
              if (targetRing === "ring3") return { ...prev, ring3SpeedMult: mult };
              if (targetRing === "outer") return { ...prev, isOuterLocked: isLocked || mult === 0 };

              if (targetRing === "all") {
                return {
                  ...prev,
                  ring1SpeedMult: mult,
                  ring2PitchMult: mult,
                  ring3SpeedMult: mult,
                  isOuterLocked: isLocked,
                  ...(motionStyle && { motionStyle }),
                };
              }
              return prev;
            });
          }

          if (name === "moveOrganism") {
            const { targetX, targetY, targetZ, movementStyle, mood: newMood } = args;
            if (targetX !== undefined || targetY !== undefined || targetZ !== undefined) {
              setManualTargetPos(
                new THREE.Vector3(
                  targetX ?? 0,
                  targetY ?? 0,
                  targetZ ?? 0
                )
              );
            }
            if (newMood) setOrganismMood(newMood);
            if (movementStyle) {
              if (movementStyle === "roam") {
                setMovementMode("autonomous_roam");
                setManualTargetPos(null);
              } else if (movementStyle === "approach") {
                setManualTargetPos(new THREE.Vector3(0, 0, 1.2));
              } else if (movementStyle === "retreat") {
                setManualTargetPos(new THREE.Vector3(0, 0, -1.1));
              } else if (movementStyle === "float_up") {
                setManualTargetPos(new THREE.Vector3(0, 1.2, 0.2));
              }
            }
          }

          if (name === "setMovementMode") {
            const { mode } = args;
            if (mode) {
              setMovementMode(mode);
              setManualTargetPos(null);
            }
          }

          if (name === "toggleSpatialPanels") {
            const { open, panelTopic } = args;
            setIsSpatialPanelsOpen((prev) => (open !== undefined ? open : !prev));
            if (panelTopic) setFocusedSpatialTopic(panelTopic);
          }

          if (name === "executeDesktopAction") {
            const { action, command } = args;
            handleExecuteDesktopAction(action, command);
          }

          if (name === "triggerQuantumCalculation") {
            const { calculating } = args;
            if (calculating !== undefined) {
              setIsSimulatingProcessing(calculating);
            }
          }
        }

        if (msg.desktopActionResult) {
          setDesktopResult(msg.desktopActionResult);
        }
      };

      ws.onclose = () => disconnectAI();
    } catch (err) {
      console.error(err);
      disconnectAI();
    }
  };

  const safeCloseAudioContext = (ctx: AudioContext | null) => {
    if (!ctx) return;
    try {
      if (ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
    } catch (_) {
      // AudioContext already closed or closing
    }
  };

  const disconnectAI = () => {
    stopAllAudioPlayback();

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      ws.onclose = null;
      ws.onerror = null;
      try {
        ws.close();
      } catch (_) {}
    }

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (_) {}
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (_) {}
      streamRef.current = null;
    }

    if (inputCtxRef.current) {
      const ctx = inputCtxRef.current;
      inputCtxRef.current = null;
      safeCloseAudioContext(ctx);
    }

    if (outputCtxRef.current) {
      const ctx = outputCtxRef.current;
      outputCtxRef.current = null;
      safeCloseAudioContext(ctx);
    }

    userAnalyserRef.current = null;
    modelAnalyserRef.current = null;
    outputFilterRef.current = null;
    outputGainRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setStatusText("STANDBY");
  };

  useEffect(() => () => disconnectAI(), []);

  // Interface Visibility (Removed / Hidden by default for clean immersion)
  const [showInterface, setShowInterface] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
        setShowInterface((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden touch-none select-none transition-colors duration-500 ${
        bgMode === "transparent"
          ? "bg-transparent"
          : bgMode === "studio"
          ? "bg-[#f8fafc]"
          : bgMode === "dark-gray"
          ? "bg-[#14171f]"
          : "bg-[#020306]"
      }`}
    >
      {/* Optional Minimal Futuristic Light HUD Bar (Toggled with H key or discrete bottom icon) */}
      {showInterface && (
        <FuturisticLightHUD
          isConnected={isConnected}
          isConnecting={isConnecting}
          onToggleConnection={isConnected ? disconnectAI : connectAI}
          statusText={statusText}
          freeRangeEnabled={freeRangeEnabled}
          onToggleFreeRange={() => setFreeRangeEnabled(!freeRangeEnabled)}
          movementMode={movementMode}
          visionEnabled={visionEnabled}
          onToggleVision={() => setVisionEnabled(!visionEnabled)}
          trackingData={trackingData}
          isDockOpen={isDockOpen}
          onToggleDock={() => setIsDockOpen((prev) => !prev)}
          bgMode={bgMode}
          onChangeBgMode={setBgMode}
          isCalculating={isCalculating}
          onToggleCalculate={() => setIsSimulatingProcessing((prev) => !prev)}
          vuiState={vuiState}
          onOpenGlassmorphicPanel={() => setIsGlassmorphicPanelOpen(true)}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          wakePhrase={voiceAIService.getWakePhrase()}
          onTestWake={() => voiceAIService.handleWakeTrigger()}
          onOpenBestiary={() => setIsBestiaryOpen(true)}
          onOpenWorldMap={() => setIsWorldMapOpen(true)}
        />
      )}

      {/* Light Construct Dock with Bloom & Tendril Glow Slider (Collapsible/Pinnable on Left) */}
      {showInterface && (
        <LightConstructDock
          isOpen={isDockOpen}
          onToggleOpen={() => setIsDockOpen((prev) => !prev)}
          config={config}
          onChangeConfig={setConfig}
          gimbalState={gimbalState}
          onChangeGimbal={setGimbalState}
          glowTheme={config.glowTheme}
          onSelectGlowTheme={(theme) => {
            setConfig((prev) => ({ ...prev, glowTheme: theme }));
            if (GLOW_COLORS[theme]) {
              setGimbalState((prev) => ({ ...prev, glowColor: GLOW_COLORS[theme] }));
            }
          }}
          bgMode={bgMode}
          onChangeBgMode={setBgMode}
          dofEnabled={dofEnabled}
          onToggleDof={() => setDofEnabled(!dofEnabled)}
          dofBokehScale={dofBokehScale}
          onChangeDofBokeh={setDofBokehScale}
          onExecuteDesktopAction={handleExecuteDesktopAction}
          desktopResult={desktopResult}
          onOpenBestiary={() => setIsBestiaryOpen(true)}
          onOpenWorldMap={() => setIsWorldMapOpen(true)}
          onOpenGlassmorphicPanel={() => setIsGlassmorphicPanelOpen(true)}
        />
      )}

      {/* MediaPipe Vision Tracking HUD (Only shown if UI toggled on and vision actively enabled) */}
      {showInterface && visionEnabled && (
        <VisionTrackingHUD
          enabled={visionEnabled}
          onToggle={setVisionEnabled}
          onTrackingUpdate={setTrackingData}
          movementMode={movementMode}
          onSelectMovementMode={(m) => {
            setMovementMode(m);
            setManualTargetPos(null);
          }}
        />
      )}

      {/* Discrete, Subtle Minimal UI Toggle (Floating in Bottom Corner, Unobtrusive) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setShowInterface((prev) => !prev)}
          title={showInterface ? "Hide Interface [H]" : "Show Controls [H]"}
          className="px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 text-neutral-400 hover:text-cyan-300 text-[10px] font-mono tracking-wider transition-all duration-300 opacity-25 hover:opacity-100 flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          <Sparkles size={11} className={showInterface ? "text-cyan-400" : ""} />
          <span>{showInterface ? "HIDE UI [H]" : "UI [H]"}</span>
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, isMobile ? 6.8 : 4.8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        {bgMode !== "transparent" && (
          <color
            attach="background"
            args={[
              bgMode === "studio"
                ? "#f8fafc"
                : bgMode === "dark-gray"
                ? "#14171f"
                : "#020306",
            ]}
          />
        )}
        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 8, 6]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-6, -4, -6]} intensity={0.9} color="#e2e8f0" />
        <pointLight position={[0, 4, 4]} intensity={1.1} color="#ffffff" />
        <pointLight
          position={[-6, 4, -4]}
          color={config.glowTheme === "crimson" ? "#ff1744" : "#00f0ff"}
          intensity={0.9}
        />

        {/* Floating Field Motes */}
        <FloatingFieldMotes
          bgMode={bgMode}
          glowTheme={config.glowTheme}
          voiceLevel={userVoiceMetrics.volume}
        />

        {/* Soft Void Ground Contact Shadow */}
        <VoidContactShadow
          bgMode={bgMode}
          organismPosRef={organismPosRef}
        />

        <Suspense fallback={null}>
          {/* Whole-Organism 3D Free-Range Spatial Entity */}
          <FreeRangeOrganismContainer
            config={config}
            userVoice={userVoiceMetrics}
            modelVoiceLevel={modelVoiceLevel}
            gimbalState={gimbalState}
            trackingData={trackingData}
            movementMode={movementMode}
            mood={organismMood}
            freeRangeEnabled={freeRangeEnabled}
            manualTargetPos={manualTargetPos}
            organismPosRef={organismPosRef}
            isSpatialPanelsOpen={isSpatialPanelsOpen}
            onToggleSpatialPanels={() => setIsSpatialPanelsOpen(!isSpatialPanelsOpen)}
            focusedSpatialTopic={focusedSpatialTopic}
            onSelectSpatialTopic={setFocusedSpatialTopic}
            onChangeConfig={setConfig}
            onChangeGimbal={setGimbalState}
            onSelectGlowTheme={(theme) => {
              setConfig((prev) => ({ ...prev, glowTheme: theme }));
              if (GLOW_COLORS[theme]) {
                setGimbalState((prev) => ({ ...prev, glowColor: GLOW_COLORS[theme] }));
              }
            }}
            dofEnabled={dofEnabled}
            onToggleDof={() => setDofEnabled(!dofEnabled)}
            onExecuteDesktopAction={handleExecuteDesktopAction}
            desktopResult={desktopResult}
            isProcessing={isCalculating}
            vuiState={vuiState}
            searchResult={searchResult}
            onDismissSearch={() => voiceAIService.dismissSearchResult()}
            isRingsExpanded={isRingsExpanded}
            onOpenGlassmorphicPanel={() => setIsGlassmorphicPanelOpen(true)}
          />
        </Suspense>

        {/* Native Touch Pinch-to-Zoom & Orbit */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.0}
          maxDistance={12.0}
          dampingFactor={0.08}
          rotateSpeed={0.8}
        />

        {/* Photographic Studio Depth of Field Post-Processing */}
        <StudioDepthOfField
          enabled={dofEnabled}
          organismPosRef={organismPosRef}
          bokehScale={dofBokehScale}
          focusRange={dofFocusRange}
        />
      </Canvas>

      {/* All-in-One Futuristic Glassmorphic Settings Panel */}
      <FuturisticGlassmorphicPanel
        isOpen={isGlassmorphicPanelOpen}
        onClose={() => setIsGlassmorphicPanelOpen(false)}
        vuiState={vuiState}
        onStateChange={(st) => voiceAIService.setState(st)}
        config={config}
        onChangeConfig={setConfig}
        gimbalState={gimbalState}
        onChangeGimbal={setGimbalState}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        isRingsExpanded={isRingsExpanded}
        onToggleExpandRings={() => setIsRingsExpanded((prev) => !prev)}
        onOpenBestiary={(faunaId) => {
          if (faunaId) setFocusFaunaId(faunaId);
          setIsBestiaryOpen(true);
        }}
        onOpenWorldMap={(sectorId) => {
          if (sectorId) setFocusSectorId(sectorId);
          setIsWorldMapOpen(true);
        }}
      />

      {/* Mathematical Procedural Bestiary & Fauna Lexicon Modal */}
      <ProceduralBestiaryModal
        isOpen={isBestiaryOpen}
        onClose={() => setIsBestiaryOpen(false)}
        onNavigateToSector={(secId) => {
          setFocusSectorId(secId);
          setIsWorldMapOpen(true);
        }}
      />

      {/* Procedural 2D & 3D World Cartography Modal */}
      <ProceduralWorldMapModal
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        initialSectorId={focusSectorId}
        onOpenFauna={(faunaId) => {
          setFocusFaunaId(faunaId);
          setIsBestiaryOpen(true);
        }}
      />

      {/* 3D Model Asset Export Modal (.GLB / .OBJ) */}
      <DownloadModelModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
