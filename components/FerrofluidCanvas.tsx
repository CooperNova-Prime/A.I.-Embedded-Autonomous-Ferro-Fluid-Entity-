/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, Compass, Eye, Sparkles, Orbit, Maximize2 } from 'lucide-react';
import { FerrofluidConfig, MagnetNode, BallSkin, CaudexCoordinateTelemetry, CaudexMood, VisionTrackingData } from '../types';
import { createArcaneRingTexture, createTennisBallSeamTexture, getGlowColors } from '../utils/arcaneTextures';
import { GimbalSystem } from '../utils/gimbalSystem';
import { audioEngine } from '../utils/audioEngine';
import { screenToWorld } from '../utils/screenToWorld';
import { KineticProbeSystem, getFerrofluidSurfaceRadius } from '../utils/kineticCollisionEngine';

interface Props {
  config: FerrofluidConfig;
  magnets: MagnetNode[];
  onAddMagnet?: (x: number, z: number) => void;
  onUpdateMagnetPosition?: (id: string, x: number, z: number) => void;
  pinchMidpoint?: { x: number; y: number; dist: number; active: boolean } | null;
  onCoordinateTelemetry?: (data: CaudexCoordinateTelemetry) => void;
  visionTrackingData?: VisionTrackingData | null;
}

// Maximum magnetic poles supported by shader uniform array
const MAX_MAGNETS = 8;

function createInitialMagnets(currentMagnets: MagnetNode[] = []): THREE.Vector4[] {
  return Array.from({ length: MAX_MAGNETS }, (_, i) => {
    if (i < currentMagnets.length) {
      const m = currentMagnets[i];
      return new THREE.Vector4(m.x, m.z, m.strength, m.polarity === 'north' ? 1.0 : -1.0);
    }
    return new THREE.Vector4(0, 0, 0, 0);
  });
}

function getSkinModeIndex(skin?: BallSkin): number {
  switch (skin) {
    case 'void-refraction': return 0;
    case 'alchemical-ink': return 1;
    case 'quicksilver': return 2;
    case 'supernova': return 3;
    case 'emerald-abyss': return 4;
    case 'liquid-ink': return 5;
    case 'black-matte': return 6;
    default: return 0;
  }
}

interface ElectricalFilament {
  mainLine: THREE.Line;
  forkLine: THREE.Line;
  mainGeo: THREE.BufferGeometry;
  forkGeo: THREE.BufferGeometry;
  mainPos: Float32Array;
  mainCol: Float32Array;
  forkPos: Float32Array;
  forkCol: Float32Array;
  startDir: THREE.Vector3;
  endDir: THREE.Vector3;
  midDir: THREE.Vector3;
  forkBranchIndex: number;
  forkDir: THREE.Vector3;
  reach: number;
  speed: number;
  phase: number;
  freq: number;
  loopBack: boolean;
}

/**
 * Electrical Arcing Ethereal Energy System
 * Generates dynamic high-voltage plasma electrical arcs with fractal ionization jitter,
 * secondary lightning fork branching, hot-white incandescent electric cores, and
 * ethereal cyan/violet corona discharge.
 */
class ElectricalArcingEtherealSystem {
  public group: THREE.Group;
  public filaments: ElectricalFilament[] = [];
  public currentCount = 0;
  private lastCrackleTime = 0;

  constructor(count = 8) {
    this.group = new THREE.Group();
    this.rebuild(count);
  }

  public rebuild(count: number) {
    while (this.group.children.length > 0) {
      const child = this.group.children[0] as THREE.Line;
      this.group.remove(child);
      child.geometry?.dispose();
      (child.material as THREE.Material)?.dispose();
    }
    this.filaments = [];
    this.currentCount = count;

    const mainSegments = 54;
    const forkSegments = 24;

    for (let i = 0; i < count; i++) {
      // Main arc geometry
      const mainGeo = new THREE.BufferGeometry();
      const mainPos = new Float32Array(mainSegments * 3);
      const mainCol = new Float32Array(mainSegments * 3);
      mainGeo.setAttribute('position', new THREE.BufferAttribute(mainPos, 3));
      mainGeo.setAttribute('color', new THREE.BufferAttribute(mainCol, 3));

      // Secondary branching fork geometry
      const forkGeo = new THREE.BufferGeometry();
      const forkPos = new Float32Array(forkSegments * 3);
      const forkCol = new Float32Array(forkSegments * 3);
      forkGeo.setAttribute('position', new THREE.BufferAttribute(forkPos, 3));
      forkGeo.setAttribute('color', new THREE.BufferAttribute(forkCol, 3));

      // Golden spiral distribution on sphere surface
      const theta = i * 2.39996;
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const startDir = new THREE.Vector3(
        Math.cos(theta) * radiusAtY,
        y,
        Math.sin(theta) * radiusAtY
      ).normalize();

      const loopBack = i % 2 === 0;
      const endDir = loopBack
        ? new THREE.Vector3(-startDir.x, -startDir.y + (Math.sin(i * 1.5) * 0.35), -startDir.z).normalize()
        : new THREE.Vector3(startDir.x * 2.2, startDir.y * 1.9 + 0.4, startDir.z * 2.2).normalize();

      const midDir = new THREE.Vector3(
        startDir.x * 1.5 + Math.sin(i * 2.1) * 0.8,
        startDir.y * 1.5 + Math.cos(i * 1.7) * 0.8,
        startDir.z * 1.5 + Math.sin(i * 3.3) * 0.8
      ).normalize();

      // Fork branch configuration
      const forkBranchIndex = Math.floor(mainSegments * (0.35 + (i % 3) * 0.15));
      const forkDir = new THREE.Vector3(
        midDir.x + Math.sin(i * 4.2) * 0.9,
        midDir.y + Math.cos(i * 3.7) * 0.9,
        midDir.z + Math.cos(i * 2.5) * 0.9
      ).normalize();

      const matMain = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });

      const matFork = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });

      const mainLine = new THREE.Line(mainGeo, matMain);
      const forkLine = new THREE.Line(forkGeo, matFork);

      this.group.add(mainLine);
      this.group.add(forkLine);

      this.filaments.push({
        mainLine,
        forkLine,
        mainGeo,
        forkGeo,
        mainPos,
        mainCol,
        forkPos,
        forkCol,
        startDir,
        endDir,
        midDir,
        forkBranchIndex,
        forkDir,
        reach: 1.5 + (i % 4) * 0.65,
        speed: 2.2 + (i % 3) * 0.9,
        phase: (i / Math.max(1, count)) * Math.PI * 2,
        freq: 32.0 + (i % 5) * 12.0,
        loopBack,
      });
    }
  }

  public update(
    time: number,
    sphereRadius: number,
    glowThemeHex: string | number,
    arcIntensity = 1.6,
    anomalySurge = 0,
    voiceTreble = 0,
    visible = true,
    soundEnabled = false
  ) {
    this.group.visible = visible;
    if (!visible) return;

    // Trigger sporadic electric crackle sound on surges only if sound is enabled
    if (soundEnabled && (anomalySurge > 0.4 || voiceTreble > 0.6)) {
      if (time - this.lastCrackleTime > 0.4) {
        this.lastCrackleTime = time;
        audioEngine.playElectricalArcEnergy(anomalySurge + voiceTreble);
      }
    }

    const themeColor = new THREE.Color(glowThemeHex);
    // Ethereal electrical palette: Electric Cyan, Ethereal Violet, and Pure Blinding Core White
    const electricCyan = new THREE.Color(0x00f0ff);
    const etherealViolet = new THREE.Color(0x8b5cf6);
    const whiteHotCore = new THREE.Color(0xffffff);

    this.filaments.forEach((t, idx) => {
      const {
        mainGeo,
        forkGeo,
        mainPos,
        mainCol,
        forkPos,
        forkCol,
        startDir,
        endDir,
        midDir,
        reach,
        speed,
        phase,
        freq,
        loopBack,
        forkBranchIndex,
        forkDir,
      } = t;

      const effectiveIntensity = arcIntensity * (1.0 + anomalySurge * 2.8 + voiceTreble * 1.5);
      const arcWander = Math.sin(time * speed * 0.65 + phase);
      const mainSegments = mainPos.length / 3;

      let branchOriginX = 0;
      let branchOriginY = 0;
      let branchOriginZ = 0;

      // Update Main Electrical Filament
      for (let s = 0; s < mainSegments; s++) {
        const u = s / (mainSegments - 1);

        // Smooth Bezier trajectory
        const rStart = sphereRadius * 0.98;
        const p0x = startDir.x * rStart;
        const p0y = startDir.y * rStart;
        const p0z = startDir.z * rStart;

        const maxApex = sphereRadius + reach * (1.1 + arcWander * 0.35);
        const p1x = midDir.x * maxApex;
        const p1y = midDir.y * maxApex;
        const p1z = midDir.z * maxApex;

        const rEnd = loopBack ? sphereRadius * 0.98 : sphereRadius + reach * 1.8;
        const p2x = endDir.x * rEnd;
        const p2y = endDir.y * rEnd;
        const p2z = endDir.z * rEnd;

        // Quadratic Bezier interpolation
        const invU = 1.0 - u;
        const bx = invU * invU * p0x + 2 * invU * u * p1x + u * u * p2x;
        const by = invU * invU * p0y + 2 * invU * u * p1y + u * u * p2y;
        const bz = invU * invU * p0z + 2 * invU * u * p1z + u * u * p2z;

        // High-Frequency Electrical Ionization Micro-Jitter (40-60 Hz chaotic lightning zigzag)
        const envelope = Math.sin(u * Math.PI);
        const jitterFreq = freq + anomalySurge * 36.0;
        const jitterAmp = (0.09 + anomalySurge * 0.35 + voiceTreble * 0.28) * envelope * effectiveIntensity;

        // High-speed electrical ionization noise
        const jx = Math.sin(u * jitterFreq + time * 52.0 + idx * 5.1) * jitterAmp;
        const jy = Math.cos(u * jitterFreq * 0.92 - time * 48.0 + idx * 3.3) * jitterAmp;
        const jz = Math.sin(u * jitterFreq * 1.35 + time * 58.0 + phase) * jitterAmp;

        const finalX = bx + jx;
        const finalY = by + jy;
        const finalZ = bz + jz;

        mainPos[s * 3] = finalX;
        mainPos[s * 3 + 1] = finalY;
        mainPos[s * 3 + 2] = finalZ;

        if (s === forkBranchIndex) {
          branchOriginX = finalX;
          branchOriginY = finalY;
          branchOriginZ = finalZ;
        }

        // Traveling Electrical Discharge Shockwave
        const dischargeWave = Math.sin(u * 24.0 - time * 38.0 + phase);
        const isCoreStrike = dischargeWave > 0.35 || anomalySurge > 0.35 || voiceTreble > 0.55;

        // Ethereal corona aura coloring
        let c: THREE.Color;
        if (isCoreStrike) {
          c = whiteHotCore.clone().lerp(electricCyan, 0.2);
        } else {
          c = electricCyan.clone().lerp(etherealViolet, Math.sin(u * Math.PI + time * 2.0) * 0.5 + 0.5);
          c.lerp(themeColor, 0.25);
        }

        const flash = 1.0 + anomalySurge * 2.5 + voiceTreble * 1.8;
        mainCol[s * 3] = c.r * flash;
        mainCol[s * 3 + 1] = c.g * flash;
        mainCol[s * 3 + 2] = c.b * flash;
      }

      mainGeo.attributes.position.needsUpdate = true;
      mainGeo.attributes.color.needsUpdate = true;

      // Update Secondary Fork Lightning Branch
      const forkSegments = forkPos.length / 3;
      for (let f = 0; f < forkSegments; f++) {
        const fu = f / (forkSegments - 1);
        const forkReach = reach * 0.85;

        const fx = branchOriginX + forkDir.x * forkReach * fu;
        const fy = branchOriginY + forkDir.y * forkReach * fu;
        const fz = branchOriginZ + forkDir.z * forkReach * fu;

        // High frequency fork jitter
        const fJitterAmp = (0.07 + anomalySurge * 0.22) * fu * effectiveIntensity;
        const fjx = Math.sin(fu * 38.0 - time * 44.0 + idx) * fJitterAmp;
        const fjy = Math.cos(fu * 34.0 + time * 42.0 + idx) * fJitterAmp;
        const fjz = Math.sin(fu * 46.0 - time * 48.0 + idx) * fJitterAmp;

        forkPos[f * 3] = fx + fjx;
        forkPos[f * 3 + 1] = fy + fjy;
        forkPos[f * 3 + 2] = fz + fjz;

        // Tapering ethereal fade towards fork tip
        const forkFade = 1.0 - fu * 0.7;
        const isForkHot = Math.sin(fu * 16.0 - time * 32.0) > 0.4 || anomalySurge > 0.4;
        const fc = isForkHot ? whiteHotCore.clone() : etherealViolet.clone().lerp(electricCyan, 0.4);

        const fFlash = (1.0 + anomalySurge * 2.0) * forkFade;
        forkCol[f * 3] = fc.r * fFlash;
        forkCol[f * 3 + 1] = fc.g * fFlash;
        forkCol[f * 3 + 2] = fc.b * fFlash;
      }

      forkGeo.attributes.position.needsUpdate = true;
      forkGeo.attributes.color.needsUpdate = true;
    });
  }

  public dispose() {
    this.filaments.forEach((t) => {
      t.mainGeo.dispose();
      t.forkGeo.dispose();
      (t.mainLine.material as THREE.Material).dispose();
      (t.forkLine.material as THREE.Material).dispose();
    });
  }
}

export const FerrofluidCanvas: React.FC<Props> = ({
  config,
  magnets,
  onAddMagnet,
  onUpdateMagnetPosition,
  pinchMidpoint,
  onCoordinateTelemetry,
  visionTrackingData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  // Synchronous Master Scale (Gimbal rings and ferrofluid center expand, zoom in, and zoom out, and decrease all with the same mass, all the same size, all at the same time)
  const masterEntityScaleRef = useRef<number>(config.modelScaleFactor || 1.0);
  const targetEntityScaleRef = useRef<number>(config.modelScaleFactor || 1.0);
  const sarcasmScaleRef = useRef<number>(1.0);
  const sarcasmTargetScaleRef = useRef<number>(1.0);
  const personalityMoodRef = useRef<CaudexMood>('curious');

  // Dedicated Platform Tracking Coordinates & Autonomous Curiosity Destination
  const destinationTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.35, 0));
  const destinationSourceRef = useRef<'curiosity' | 'camera_face' | 'camera_hand' | 'voice_acoustic' | 'manual_waypoint' | 'desktop_boundary'>('curiosity');
  const destinationLabelRef = useRef<string>('Autonomous Void Drift');
  const curiosityIndexRef = useRef<number>(85);
  const autoCuriosityRoamingRef = useRef<boolean>(true);
  const lastCuriosityShiftRef = useRef<number>(0);

  // References to dynamic meshes and uniforms
  const fluidMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
  const ringGroupRef = useRef<THREE.Group | null>(null);
  const gimbalSystemRef = useRef<GimbalSystem | null>(null);
  const floatingEqGroupRef = useRef<THREE.Group | null>(null);
  const magnetMarkersGroupRef = useRef<THREE.Group | null>(null);

  // Void floating orb group & anomalies
  const orbGroupRef = useRef<THREE.Group | null>(null);
  const orbPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.25, 0));
  const prevOrbPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.25, 0));
  const entityVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const solidCoreMeshRef = useRef<THREE.Mesh | null>(null);
  const gimbalRigAnchorRef = useRef<THREE.Group | null>(null);
  const kineticProbesRef = useRef<KineticProbeSystem | null>(null);
  const electricalArcsRef = useRef<ElectricalArcingEtherealSystem | null>(null);
  const voidParticlesRef = useRef<THREE.Points | null>(null);
  const shockwaveRingRef = useRef<THREE.Mesh | null>(null);
  const anomalySurgeRef = useRef<number>(0);
  const lastAnomalyTimeRef = useRef<number>(0);
  const levitationImpulseRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Interaction tracking
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const initialCamRadius = config.cameraDistance || 13.5;
  const cameraOrbitRef = useRef({
    theta: Math.PI * 0.25,
    phi: Math.PI * 0.32,
    radius: initialCamRadius,
    target: new THREE.Vector3(0, 0, 0),
  });
  const targetRadiusRef = useRef(initialCamRadius);
  const [zoomRadius, setZoomRadius] = useState(initialCamRadius);

  // Dynamic interactive magnetic pole controlled by mouse
  const pointerWorldPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const pointerActiveRef = useRef(false);

  // Pre-create and cache seam texture and geometries
  const seamTexture = useMemo(() => createTennisBallSeamTexture(), []);
  const sphereGeoRef = useRef<THREE.SphereGeometry | null>(null);
  const discGeoRef = useRef<THREE.PlaneGeometry | null>(null);

  // Shaders uniforms
  const uniformsRef = useRef<{
    uTime: { value: number };
    uMagneticStrength: { value: number };
    uViscosity: { value: number };
    uSurfaceTension: { value: number };
    uOscillationFreq: { value: number };
    uSpikeDensity: { value: number };
    uSpikeHeight: { value: number };
    uPointerPos: { value: THREE.Vector2 };
    uPointerActive: { value: number };
    uGlowColor: { value: THREE.Vector3 };
    uGlowIntensity: { value: number };
    uIridescence: { value: number };
    uAbyssDarkness: { value: number };
    uMagnets: { value: THREE.Vector4[] };
    uMagnetCount: { value: number };
    uIsSphere: { value: number };
    uBallRadius: { value: number };
    uShowSeam: { value: number };
    uSeamMap: { value: THREE.CanvasTexture };
    uSkinMode: { value: number };
    uMorphIntensity: { value: number };
    uMorphSpeed: { value: number };
    uRefractionIntensity: { value: number };
    uVoidAbsorption: { value: number };
    uShimmerSpeed: { value: number };
    uVoiceVolume: { value: number };
    uVoiceBass: { value: number };
    uVoiceMid: { value: number };
    uVoiceTreble: { value: number };
    uVoiceSpikeBoost: { value: number };
    uAnomalySurge: { value: number };
    uOrbPosition: { value: THREE.Vector3 };
    uVoiceAmp: { value: number };
    uVoicePulse: { value: number };
    uLowLight: { value: number };
    uSolidSurface: { value: number };
    uSolidHardness: { value: number };
    uEntityVelocity: { value: THREE.Vector3 };
    uVelocityDrag: { value: number };
  }>({
    uTime: { value: 0 },
    uMagneticStrength: { value: config.magneticStrength },
    uViscosity: { value: config.viscosity },
    uSurfaceTension: { value: config.surfaceTension },
    uOscillationFreq: { value: config.oscillationFreq },
    uSpikeDensity: { value: config.spikeDensity },
    uSpikeHeight: { value: config.spikeHeight },
    uPointerPos: { value: new THREE.Vector2(0, 0) },
    uPointerActive: { value: 0 },
    uGlowColor: { value: getGlowColors(config.glowTheme).rgbVec },
    uGlowIntensity: { value: config.wireframeGlowIntensity },
    uIridescence: { value: config.iridescence },
    uAbyssDarkness: { value: config.abyssDarkness },
    uMagnets: { value: createInitialMagnets(magnets) },
    uMagnetCount: { value: Math.min(magnets?.length || 0, MAX_MAGNETS) },
    uIsSphere: { value: config.meshShape === 'sphere' ? 1.0 : 0.0 },
    uBallRadius: { value: (config.tennisBallDiameter || 6.7) / 2.0 },
    uShowSeam: { value: config.showTennisBallSeam ? 1.0 : 0.0 },
    uSeamMap: { value: seamTexture },
    uSkinMode: { value: getSkinModeIndex(config.ballSkin) },
    uMorphIntensity: { value: config.morphIntensity ?? 1.15 },
    uMorphSpeed: { value: config.morphSpeed ?? 1.0 },
    uRefractionIntensity: { value: config.refractionIntensity ?? 1.6 },
    uVoidAbsorption: { value: config.voidAbsorption ?? 0.92 },
    uShimmerSpeed: { value: config.shimmerSpeed ?? 1.2 },
    uVoiceVolume: { value: 0 },
    uVoiceBass: { value: 0 },
    uVoiceMid: { value: 0 },
    uVoiceTreble: { value: 0 },
    uVoiceSpikeBoost: { value: config.voiceSpikeBoost ?? 1.7 },
    uAnomalySurge: { value: 0 },
    uOrbPosition: { value: new THREE.Vector3(0, 1.25, 0) },
    uVoiceAmp: { value: 0 },
    uVoicePulse: { value: 0 },
    uLowLight: { value: config.lowLightMode ? 1.0 : 0.0 },
    uSolidSurface: { value: (config.solidSurfaceEnabled ?? true) ? 1.0 : 0.0 },
    uSolidHardness: { value: config.solidCoreHardness ?? 1.0 },
    uEntityVelocity: { value: new THREE.Vector3(0, 0, 0) },
    uVelocityDrag: { value: 0.65 },
  });

  // Handle pinch midpoint updates from vision HUD or gestures:
  // Inside the pinch detection logic:
  // if (pinchDistance < 0.08) {
  //   const targetWorldPos = screenToWorld(midX, midY, 0);
  //   sphere.position.lerp(targetWorldPos, 0.15);
  // }
  useEffect(() => {
    if (!pinchMidpoint || !pinchMidpoint.active) return;
    if (pinchMidpoint.dist < 0.08 && cameraRef.current && orbGroupRef.current) {
      const targetWorldPos = screenToWorld(pinchMidpoint.x, pinchMidpoint.y, cameraRef.current, 0, true);
      orbPosRef.current.lerp(targetWorldPos, 0.15);
      orbGroupRef.current.position.lerp(targetWorldPos, 0.15);
    }
  }, [pinchMidpoint]);

  // Synchronize uniforms & geometry when config updates
  useEffect(() => {
    const u = uniformsRef.current;
    u.uMagneticStrength.value = config.magneticStrength;
    u.uViscosity.value = config.viscosity;
    u.uSurfaceTension.value = config.surfaceTension;
    u.uOscillationFreq.value = config.oscillationFreq;
    u.uSpikeDensity.value = config.spikeDensity;
    u.uSpikeHeight.value = config.spikeHeight;
    u.uGlowColor.value = getGlowColors(config.glowTheme).rgbVec;
    u.uGlowIntensity.value = config.wireframeGlowIntensity;
    u.uIridescence.value = config.iridescence;
    u.uAbyssDarkness.value = config.abyssDarkness;
    u.uIsSphere.value = config.meshShape === 'sphere' ? 1.0 : 0.0;
    u.uBallRadius.value = (config.tennisBallDiameter || 6.7) / 2.0;
    u.uShowSeam.value = config.showTennisBallSeam ? 1.0 : 0.0;
    u.uSkinMode.value = getSkinModeIndex(config.ballSkin);
    u.uMorphIntensity.value = config.morphIntensity ?? 1.15;
    u.uMorphSpeed.value = config.morphSpeed ?? 1.0;
    u.uRefractionIntensity.value = config.refractionIntensity ?? 1.6;
    u.uVoidAbsorption.value = config.voidAbsorption ?? 0.92;
    u.uShimmerSpeed.value = config.shimmerSpeed ?? 1.2;
    u.uVoiceSpikeBoost.value = config.voiceSpikeBoost ?? 1.7;
    u.uLowLight.value = config.lowLightMode ? 1.0 : 0.0;
    u.uSolidSurface.value = (config.solidSurfaceEnabled ?? true) ? 1.0 : 0.0;
    u.uSolidHardness.value = config.solidCoreHardness ?? 1.0;

    if (solidCoreMeshRef.current) {
      solidCoreMeshRef.current.visible = (config.meshShape === 'sphere') && (config.solidSurfaceEnabled ?? true);
    }
    if (kineticProbesRef.current) {
      kineticProbesRef.current.updateTheme(config.glowTheme);
    }

    // Handle Electrical Arcs count rebuild
    if (electricalArcsRef.current && config.tendrilCount) {
      if (electricalArcsRef.current.currentCount !== config.tendrilCount) {
        electricalArcsRef.current.rebuild(config.tendrilCount);
      }
    }

    // Audio Engine state sync
    if (config.soundEnabled) {
      audioEngine.start(config.soundFrequency || 84);
      audioEngine.setVolume(config.soundVolume ?? 0.25);
    } else {
      audioEngine.stop();
    }

    // Voice Engine state sync
    if (config.voiceReactive) {
      audioEngine.startVoiceInput().catch(() => {});
    } else {
      audioEngine.stopVoiceInput();
    }

    // Camera Distance config sync
    if (config.cameraDistance && Math.abs(targetRadiusRef.current - config.cameraDistance) > 0.1) {
      targetRadiusRef.current = config.cameraDistance;
      setZoomRadius(config.cameraDistance);
    }

    // Swap active geometry between Sphere and Basin Disc
    const isSphere = config.meshShape === 'sphere';
    const activeGeo = isSphere ? sphereGeoRef.current : discGeoRef.current;

    if (activeGeo && fluidMeshRef.current && wireframeMeshRef.current) {
      if (fluidMeshRef.current.geometry !== activeGeo) {
        fluidMeshRef.current.geometry = activeGeo;
        wireframeMeshRef.current.geometry = activeGeo;
      }

      if (isSphere) {
        if (orbGroupRef.current && fluidMeshRef.current.parent !== orbGroupRef.current) {
          orbGroupRef.current.add(fluidMeshRef.current);
        }
        fluidMeshRef.current.rotation.x = 0;
        wireframeMeshRef.current.rotation.x = 0;
        wireframeMeshRef.current.position.y = 0;
        const ballScale = (config.tennisBallDiameter || 6.7) / 6.7;
        fluidMeshRef.current.scale.setScalar(ballScale);
        wireframeMeshRef.current.scale.setScalar(ballScale * 1.002);
      } else {
        if (sceneRef.current && fluidMeshRef.current.parent !== sceneRef.current) {
          sceneRef.current.add(fluidMeshRef.current);
        }
        fluidMeshRef.current.rotation.x = -Math.PI / 2;
        wireframeMeshRef.current.rotation.x = -Math.PI / 2;
        wireframeMeshRef.current.position.y = 0.005;
        fluidMeshRef.current.scale.set(1, 1, 1);
        wireframeMeshRef.current.scale.set(1, 1, 1);
      }
    }

    // Wireframe overlay management:
    // If you had a wireframe overlay object: scene.remove(wireframeHelper);
    if (wireframeMeshRef.current) {
      if (!config.wireframeVisible) {
        // Explicitly remove from parent/scene when wireframe is not enabled
        if (wireframeMeshRef.current.parent) {
          wireframeMeshRef.current.parent.remove(wireframeMeshRef.current);
        }
        wireframeMeshRef.current.visible = false;
      } else {
        const targetParent = isSphere ? orbGroupRef.current : sceneRef.current;
        if (targetParent && wireframeMeshRef.current.parent !== targetParent) {
          targetParent.add(wireframeMeshRef.current);
        }
        wireframeMeshRef.current.visible = true;
      }
    }

    if (ringGroupRef.current) {
      ringGroupRef.current.visible = config.showArcaneRings;
      ringGroupRef.current.position.y = isSphere ? 0 : -0.05;
    }
    if (gimbalSystemRef.current) {
      gimbalSystemRef.current.setVisible(
        isSphere && (config.showGimbalRings ?? true),
        isSphere && (config.showBezierArcs ?? true),
        isSphere && (config.showHoloPanels ?? true)
      );
    }
    if (floatingEqGroupRef.current) {
      floatingEqGroupRef.current.visible = config.showEquations;
    }
  }, [config]);

  // Synchronize magnets array into uniform array
  useEffect(() => {
    const list = uniformsRef.current.uMagnets.value;
    for (let i = 0; i < MAX_MAGNETS; i++) {
      if (i < magnets.length) {
        const m = magnets[i];
        list[i].set(m.x, m.z, m.strength, m.polarity === 'north' ? 1.0 : -1.0);
      } else {
        list[i].set(0, 0, 0, 0);
      }
    }
    uniformsRef.current.uMagnetCount.value = Math.min(magnets.length, MAX_MAGNETS);
  }, [magnets]);

  // Initialize Scene, Shaders, Mesh, Camera & Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    (window as any).__FERROFLUID_SCENE__ = scene;
    scene.background = new THREE.Color(0x020306);
    scene.fog = new THREE.FogExp2(0x020306, 0.035);

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraTransform();

    // WebGL Renderer with High Dynamic Range Tone Mapping
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (err) {
      console.warn('WebGL initialization failed or context unavailable:', err);
      return;
    }
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Custom Vertex Shader Code with Localized Voice Aperture & Acoustic Resonances
    const vertexShader = `
      uniform float uTime;
      uniform float uMagneticStrength;
      uniform float uViscosity;
      uniform float uSurfaceTension;
      uniform float uOscillationFreq;
      uniform float uSpikeDensity;
      uniform float uSpikeHeight;
      uniform vec2 uPointerPos;
      uniform float uPointerActive;
      uniform vec4 uMagnets[8];
      uniform int uMagnetCount;
      uniform float uIsSphere;
      uniform float uBallRadius;
      uniform float uShowSeam;
      uniform float uMorphIntensity;
      uniform float uMorphSpeed;
      uniform float uVoiceVolume;
      uniform float uVoiceBass;
      uniform float uVoiceMid;
      uniform float uVoiceTreble;
      uniform float uVoiceSpikeBoost;
      uniform float uAnomalySurge;
      uniform float uVoiceAmp;
      uniform float uVoicePulse;
      uniform float uSolidSurface;
      uniform float uSolidHardness;
      uniform vec3 uEntityVelocity;
      uniform float uVelocityDrag;

      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying float vDisplacement;
      varying float vDistCenter;
      varying float vVoiceIntensity;

      // 3D Simplex noise for fluidic micro-undulations and organic voice noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      float calculateSpike(vec2 pos, vec2 center, float strength, float density, float power) {
        float d = distance(pos, center);
        if (d > 3.0) return 0.0;
        float envelope = exp(-pow(d * 1.5, 2.0));
        float wave = cos(d * density - uTime * uOscillationFreq * 3.0);
        float spike = pow(max(0.0, (1.0 + wave) * 0.5), power);
        return spike * envelope * strength;
      }

      void main() {
        vUv = uv;
        vec3 pos = position;

        if (uIsSphere > 0.5) {
          // 3D SPHERICAL FERROFLUID TENNIS BALL
          vec3 normDir = normalize(pos);
          vDistCenter = length(pos);
          float r0 = uBallRadius > 0.1 ? uBallRadius : 3.35;
          pos = normDir * r0;

          float totalDisp = 0.0;

          // 1. TENNIS BALL MORPHING BODY (Quadrupole prolate-oblate & organic fluid undulations)
          if (uMorphIntensity > 0.001) {
            float mTime = uTime * uMorphSpeed;
            float cosT = normDir.y;
            float p2 = 0.5 * (3.0 * cosT * cosT - 1.0);
            float bodyStretch = sin(mTime * 1.8) * p2 * 0.44;

            float phiAngle = atan(normDir.z, normDir.x);
            float equatorialSqueeze = cos(2.0 * phiAngle + mTime * 1.4) * (1.0 - cosT * cosT) * 0.32;
            float helicalWave = sin(normDir.x * 2.8 + normDir.y * 2.2 + normDir.z * 2.8 + mTime * 2.2) * 0.22;
            float breathing = sin(mTime * 2.6) * 0.12;

            float morphCombined = (bodyStretch + equatorialSqueeze + helicalWave + breathing) * uMorphIntensity;
            totalDisp += morphCombined;
          }

          // 2. Standing Spherical Cymatic Harmonics
          float waveK = uSpikeDensity * 0.75;
          float harmonic1 = sin(normDir.x * waveK + uTime * uOscillationFreq * 2.0);
          float harmonic2 = cos(normDir.y * waveK * 1.15 - uTime * uOscillationFreq * 1.6);
          float harmonic3 = sin(normDir.z * waveK + sin(normDir.x * 2.5));
          float cymaticRipple = (harmonic1 * harmonic2 + harmonic3 * 0.4) * (uMagneticStrength * 0.22 + 0.06);
          totalDisp += cymaticRipple;

          // 3. Curvilinear Tennis Ball Seam Physical Groove
          if (uShowSeam > 0.5) {
            float seamBand = 1.0 - abs(normDir.y);
            totalDisp -= seamBand * 0.03 * uSurfaceTension;
          }

          // 4. Interactive pointer magnet pull in 3D
          if (uPointerActive > 0.01) {
            vec3 pWorld = vec3(uPointerPos.x, 0.0, uPointerPos.y);
            float pDist = distance(pos, pWorld);
            if (pDist < 4.2) {
              float pSpike = pow(max(0.0, 1.0 - pDist / 4.2), 2.2) * uPointerActive * 1.5;
              totalDisp += pSpike * uSpikeHeight;
            }
          }

          // 5. Discrete Magnetic Poles in 3D
          for (int i = 0; i < 8; i++) {
            if (i >= uMagnetCount) break;
            vec4 m = uMagnets[i];
            vec3 mPos = vec3(m.x, 0.0, m.y);
            float mDist = distance(pos, mPos);
            if (mDist < 5.0) {
              float falloff = exp(-pow(mDist * 0.55, 2.0));
              float spikeWave = cos(mDist * uSpikeDensity - uTime * uOscillationFreq * 3.0);
              float spike = pow(max(0.0, (1.0 + spikeWave) * 0.5), uSurfaceTension * 2.8) * falloff;
              totalDisp += spike * m.z * m.w * uSpikeHeight * uMagneticStrength * 0.75;
            }
          }

          // 6. Voice / Speech Physical Aperture Stimulation & Rosensweig Spike Ripples
          // Transform normal to View Space (Eye Space)
          vec3 vNormalEye = normalize(normalMatrix * normDir);
          float faceCameraDot = dot(vNormalEye, vec3(0.0, 0.0, 1.0));

          // Define the localized "Voice Aperture": only affects vertices within a cone pointing toward the viewer
          float voiceMask = smoothstep(0.60, 0.98, faceCameraDot);

          // Voice Physical Stimulation ripples & procedural noise
          float voiceRipples = sin((1.0 - faceCameraDot) * 35.0 - uVoicePulse) * 0.5 + 0.5;
          float voiceNoise = snoise(pos * 1.8 + vec3(uTime * 2.5));

          // Combine displacement: spikes erupt outwards when speaking
          float voiceDisplacement = voiceMask * uVoiceAmp * (voiceRipples * 0.45 + abs(voiceNoise) * 0.55) * uVoiceSpikeBoost;

          // Acoustic Rosensweig frequency separation
          if (uVoiceVolume > 0.005) {
            float vBoost = uVoiceSpikeBoost;
            float bassFreq = uSpikeDensity * 0.95;
            float bassWave = sin(normDir.x * bassFreq + normDir.y * bassFreq + normDir.z * bassFreq - uTime * 14.0);
            float voiceBassSpikes = pow(max(0.0, 0.5 + 0.5 * bassWave), 4.0) * uVoiceBass * 1.45 * vBoost;
            float vocalRipples = sin(normDir.y * 24.0 - uTime * 28.0) * cos(normDir.x * 20.0 + uTime * 18.0) * uVoiceMid * 0.65 * vBoost;
            float voiceNeedles = pow(max(0.0, sin(normDir.z * 36.0 + normDir.x * 32.0 + uTime * 40.0)), 6.0) * uVoiceTreble * 0.95 * vBoost;
            totalDisp += (voiceBassSpikes + vocalRipples + voiceNeedles) * uVoiceVolume;
          }

          totalDisp += voiceDisplacement;
          vVoiceIntensity = voiceMask * uVoiceAmp;

          // 7. Time-based Temporal Flux Anomaly Surge
          if (uAnomalySurge > 0.005) {
            float anomalyOsc = sin(normDir.x * 18.0 + uTime * 36.0) * cos(normDir.y * 14.0 - uTime * 30.0);
            float anomalySpike = pow(max(0.0, sin(normDir.z * 12.0 + uTime * 20.0)), 3.0) * 1.35;
            totalDisp += (anomalyOsc * 0.45 + anomalySpike) * uAnomalySurge;
          }

          // 8. Velocity-Based Dynamic Hydrodynamic Drag Parameter:
          // Fluid reacts realistically to abrupt changes in entity movement:
          // Trailing side elongates into an inertial wake/droplet tail,
          // Leading front flattens under stagnation pressure,
          // and equatorial shear wave ripples undulate during acceleration.
          float velSpeed = length(uEntityVelocity);
          if (velSpeed > 0.005 && uVelocityDrag > 0.001) {
            vec3 velDir = normalize(uEntityVelocity);
            float velDot = dot(normDir, velDir);
            float trailingWake = pow(max(0.0, -velDot), 1.6) * 0.45;
            float leadingCompression = -pow(max(0.0, velDot), 1.4) * 0.22;
            float equatorShear = sin(dot(normDir, cross(velDir, vec3(0.0, 1.0, 0.0))) * 7.5 - uTime * (9.0 + velSpeed * 2.2)) * 0.085 * (1.0 - abs(velDot));
            float dragFactor = min(velSpeed * uVelocityDrag * 0.35, 1.35);
            totalDisp += (trailingWake + leadingCompression + equatorShear) * dragFactor;
          }

          // SOLID SURFACE BOUNDARY ENFORCEMENT:
          // The ferrofluid rests upon an impenetrable solid spherical substrate.
          // Displacements (spikes, ripples, waves) erupt strictly outwards from the solid surface boundary.
          if (uSolidSurface > 0.5) {
            totalDisp = max(0.0, totalDisp * uSolidHardness);
          }

          pos += normDir * totalDisp;
          vDisplacement = totalDisp;
          vNormal = normalize(normalMatrix * normDir);

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vViewPosition = -mvPosition.xyz;

          gl_Position = projectionMatrix * mvPosition;

        } else {
          // PLANAR CIRCULAR BASIN
          float r = length(pos.xy);
          vDistCenter = r;
          float abyssDip = -pow(r / 3.8, 2.5) * 0.8;
          float totalDisp = 0.0;

          float waveK = uSpikeDensity * 1.4;
          float standingWave = sin(pos.x * waveK + sin(pos.y * 2.0)) * cos(pos.y * waveK + uTime * uOscillationFreq);
          float radialWave = cos(r * uSpikeDensity - uTime * uOscillationFreq * 2.5) * exp(-r * 0.6);
          totalDisp += (standingWave * 0.25 + radialWave * 0.5) * (uMagneticStrength * 0.35 + 0.1);

          if (uPointerActive > 0.01) {
            float pSpike = calculateSpike(pos.xy, uPointerPos, uPointerActive * 1.6, uSpikeDensity * 1.3, uSurfaceTension * 2.8);
            totalDisp += pSpike * uSpikeHeight;
          }

          for (int i = 0; i < 8; i++) {
            if (i >= uMagnetCount) break;
            vec4 m = uMagnets[i];
            float mSpike = calculateSpike(pos.xy, m.xy, m.z * uMagneticStrength, uSpikeDensity, uSurfaceTension * 3.2);
            totalDisp += mSpike * m.w * uSpikeHeight;
          }

          if (uVoiceVolume > 0.005) {
            float vVoiceWave = cos(r * 22.0 - uTime * 24.0) * uVoiceMid * 0.45 * uVoiceSpikeBoost;
            float vBassSpike = calculateSpike(pos.xy, vec2(0.0, 0.0), uVoiceBass * 1.8 * uVoiceSpikeBoost, uSpikeDensity * 1.2, 2.5);
            totalDisp += (vVoiceWave + vBassSpike) * uVoiceVolume;
          }
          if (uAnomalySurge > 0.005) {
            float vAnomaly = sin(pos.x * 12.0 + uTime * 32.0) * cos(pos.y * 12.0 - uTime * 26.0) * uAnomalySurge * 0.65;
            totalDisp += vAnomaly;
          }

          float edgeDamping = smoothstep(3.8, 3.2, r);
          pos.z += (totalDisp + abyssDip) * edgeDamping;
          vDisplacement = pos.z;
          vVoiceIntensity = uVoiceAmp;

          float delta = 0.035;
          vec2 px = pos.xy + vec2(delta, 0.0);
          vec2 py = pos.xy + vec2(0.0, delta);
          float dispX = (radialWave + sin(px.x * waveK)) * 0.15 * uMagneticStrength;
          float dispY = (radialWave + cos(py.y * waveK)) * 0.15 * uMagneticStrength;
          vec3 tangentX = vec3(delta, 0.0, dispX);
          vec3 tangentY = vec3(0.0, delta, dispY);
          vec3 calcNormal = normalize(cross(tangentX, tangentY));

          vNormal = normalize(normalMatrix * calcNormal);
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vViewPosition = -mvPosition.xyz;

          gl_Position = projectionMatrix * mvPosition;
        }
      }
    `;

    // Fragment Shader: Void Black + Liquid Fluid Ink + Black Matte with Real-Time Dynamic Light Refraction
    const fragmentShader = `
      uniform float uTime;
      uniform float uIridescence;
      uniform float uAbyssDarkness;
      uniform vec3 uGlowColor;
      uniform float uGlowIntensity;
      uniform float uIsSphere;
      uniform float uShowSeam;
      uniform sampler2D uSeamMap;
      uniform int uSkinMode;
      uniform float uMorphIntensity;
      uniform float uRefractionIntensity;
      uniform float uVoidAbsorption;
      uniform float uShimmerSpeed;
      uniform float uLowLight;

      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying float vDisplacement;
      varying float vDistCenter;
      varying float vVoiceIntensity;

      vec3 iridescencePalette(float t) {
        vec3 a = vec3(0.12, 0.14, 0.22);
        vec3 b = vec3(0.65, 0.55, 0.65);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.00, 0.33, 0.67);
        return a + b * cos(6.28318 * (c * t + d));
      }

      vec3 spectralPrism(float t) {
        return vec3(
          0.5 + 0.5 * cos(6.28318 * (t + 0.00)),
          0.5 + 0.5 * cos(6.28318 * (t + 0.33)),
          0.5 + 0.5 * cos(6.28318 * (t + 0.67))
        );
      }

      void main() {
        if (uIsSphere < 0.5 && vDistCenter > 3.8) {
          discard;
        }

        // 1. Compute dynamic smooth normals across the displaced fluid
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Ensure normal faces the camera
        if (dot(normal, viewDir) < 0.0) {
          normal = -normal;
        }

        // 2. High-contrast Fresnel curve (Schlick's approximation)
        float NdotV = max(dot(normal, viewDir), 0.0);
        float fresnel = pow(1.0 - NdotV, 4.0);
        float softRim = pow(1.0 - NdotV, 2.5);

        // 3. Specular highlights simulating sharp dynamic studio key light sources
        vec3 lightDir1 = normalize(vec3(1.5, 2.0, 1.0));
        vec3 halfVec1 = normalize(lightDir1 + viewDir);
        float spec1 = pow(max(dot(normal, halfVec1), 0.0), 128.0);

        vec3 lightDir2 = normalize(vec3(-1.8, 1.2, -1.0));
        vec3 halfVec2 = normalize(lightDir2 + viewDir);
        float spec2 = pow(max(dot(normal, halfVec2), 0.0), 64.0);

        // 4. Subtle chromatic refraction ring (real-time dynamic light bending around fluid horizon)
        vec3 refractR = refract(-viewDir, normal, 0.95);
        vec3 refractG = refract(-viewDir, normal, 0.97);
        vec3 refractB = refract(-viewDir, normal, 0.99);

        vec3 refractionEdge = vec3(
          pow(1.0 - max(dot(normal, -refractR), 0.0), 3.0),
          pow(1.0 - max(dot(normal, -refractG), 0.0), 3.0),
          pow(1.0 - max(dot(normal, -refractB), 0.0), 3.0)
        ) * 0.4;

        vec3 finalColor = vec3(0.0);

        if (uSkinMode == 5) {
          // LIQUID FLUID INK (Organic fluid calligraphy black ink - calm, zero glitter, pure fluid gloss)
          vec3 inkBase = vec3(0.003, 0.003, 0.005);
          vec3 inkSheen = vec3(0.65, 0.72, 0.85) * (spec1 * 1.4 + spec2 * 0.6);
          vec3 dynamicRefract = vec3(0.18, 0.28, 0.45) * refractionEdge * (0.8 + uRefractionIntensity * 0.4);
          vec3 rimFresnel = mix(inkBase, vec3(0.7, 0.78, 0.9), fresnel * 0.45);

          finalColor = mix(inkBase, rimFresnel, fresnel);
          finalColor += inkSheen * (uLowLight > 0.5 ? 0.6 : 1.0);
          finalColor += dynamicRefract * softRim;

        } else if (uSkinMode == 6) {
          // BLACK MATTE (Obsidian carbon velvet matte - ultra-low light effects, muted diffuse, zero glare)
          vec3 matteBlack = vec3(0.006, 0.006, 0.008);
          float diffuse = max(0.0, dot(normal, lightDir1)) * 0.06;
          vec3 subtleRim = vec3(0.2, 0.22, 0.26) * pow(1.0 - NdotV, 5.0) * 0.35;
          vec3 microRefract = vec3(0.12, 0.16, 0.24) * refractionEdge * 0.25;

          finalColor = matteBlack + diffuse + subtleRim + microRefract;
          finalColor += vec3(0.3, 0.35, 0.4) * spec1 * 0.12;

        } else if (uSkinMode == 0) {
          // VOID BLACK REFRACTION (Signature Event Horizon: Deep void black + high-contrast refraction ring)
          vec3 voidBlack = vec3(0.002, 0.002, 0.004);
          vec3 liquidSilver = vec3(0.95, 0.98, 1.0);
          vec3 iridescentTint = vec3(0.4, 0.6, 1.0) * refractionEdge;

          finalColor = mix(voidBlack, liquidSilver, fresnel);
          finalColor += iridescentTint * fresnel;
          finalColor += liquidSilver * spec1 * (uLowLight > 0.5 ? 1.0 : 1.8);
          finalColor += vec3(0.5, 0.7, 1.0) * spec2 * 0.5;

        } else if (uSkinMode == 1) {
          // ALCHEMICAL INK
          float iriCoord = NdotV * 2.5 + vDisplacement * 1.2 + uTime * 0.08;
          vec3 iriColor = iridescencePalette(iriCoord);
          vec3 edgeGlow = uGlowColor * pow(1.0 - NdotV, 3.0) * uGlowIntensity * 0.35;
          finalColor = mix(vec3(0.005), iriColor, uIridescence * 0.65) * fresnel * 1.2;
          finalColor += vec3(0.95, 0.95, 0.95) * spec1 * 1.2 + edgeGlow;

        } else if (uSkinMode == 2) {
          // QUICKSILVER
          vec3 chrome = vec3(0.92, 0.94, 0.98);
          finalColor = mix(vec3(0.18, 0.20, 0.24), chrome, fresnel);
          finalColor += chrome * (spec1 * 2.2 + spec2 * 1.0);

        } else if (uSkinMode == 3) {
          // SOLAR CORONA
          vec3 fire = mix(vec3(0.95, 0.2, 0.05), vec3(1.0, 0.8, 0.2), fresnel);
          finalColor = mix(vec3(0.008, 0.002, 0.001), fire, fresnel);
          finalColor += vec3(1.0, 0.9, 0.7) * spec1 * 1.5;

        } else if (uSkinMode == 4) {
          // EMERALD JADE
          vec3 jade = mix(vec3(0.02, 0.85, 0.55), vec3(0.1, 0.45, 0.95), fresnel);
          finalColor = mix(vec3(0.002, 0.008, 0.005), jade, fresnel);
          finalColor += vec3(0.85, 1.0, 0.95) * spec1 * 1.4;
        }

        // 5. Voice Core Emission (A subtle iridescent blue-violet bio-luminescent pulse)
        vec3 voiceGlowColor = mix(uGlowColor, vec3(0.2, 0.5, 1.0), 0.65);
        vec3 voiceAperture = voiceGlowColor * vVoiceIntensity * 1.6;
        finalColor += voiceAperture;

        // Tennis ball seam highlight
        if (uIsSphere > 0.5 && uShowSeam > 0.5) {
          vec4 seam = texture2D(uSeamMap, vUv);
          vec3 seamGlow = (uSkinMode == 6)
            ? vec3(0.15, 0.18, 0.22) * seam.r * 0.4
            : mix(uGlowColor, vec3(0.6, 0.8, 1.0), 0.5) * seam.r * 0.65;
          finalColor += seamGlow;
        }

        if (uIsSphere < 0.5) {
          float rimFade = smoothstep(3.8, 3.6, vDistCenter);
          finalColor *= rimFade;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Wireframe Fragment Shader
    const wireframeFragmentShader = `
      uniform vec3 uGlowColor;
      uniform float uGlowIntensity;
      uniform float uTime;
      uniform float uIsSphere;
      uniform float uShowSeam;
      uniform sampler2D uSeamMap;

      varying vec3 vWorldPosition;
      varying float vDisplacement;
      varying float vDistCenter;
      varying vec2 vUv;

      void main() {
        if (uIsSphere < 0.5 && vDistCenter > 3.75) discard;
        float heightFactor = smoothstep(-0.2, 0.8, vDisplacement);
        float intensity = uGlowIntensity * (0.8 + heightFactor * 1.2);
        vec3 glow = uGlowColor * intensity;
        vec3 coreColor = mix(glow, vec3(1.0), 0.35);
        gl_FragColor = vec4(coreColor, 0.85);
      }
    `;

    // High Density Disc and Sphere Geometries
    const discGeometry = new THREE.PlaneGeometry(7.6, 7.6, 170, 170);
    const sphereGeometry = new THREE.SphereGeometry(3.35, 140, 140);
    discGeoRef.current = discGeometry;
    sphereGeoRef.current = sphereGeometry;

    const isInitialSphere = config.meshShape === 'sphere';
    const activeGeometry = isInitialSphere ? sphereGeometry : discGeometry;

    // Deep Dark Ink Substance Mesh
    const fluidMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
    });

    const fluidMesh = new THREE.Mesh(activeGeometry, fluidMaterial);
    fluidMeshRef.current = fluidMesh;

    // Wireframe Mesh (Helper)
    const wireframeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: wireframeFragmentShader,
      uniforms: uniformsRef.current,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wireframeMesh = new THREE.Mesh(activeGeometry, wireframeMaterial);
    wireframeMesh.visible = config.wireframeVisible;
    wireframeMeshRef.current = wireframeMesh;

    // Void Floating Orb Group
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);
    orbGroupRef.current = orbGroup;
    (window as any).__FERROFLUID_ORB_GROUP__ = orbGroup;

    if (isInitialSphere) {
      orbGroup.position.copy(orbPosRef.current);
      orbGroup.add(fluidMesh);
      if (config.wireframeVisible) {
        orbGroup.add(wireframeMesh);
      }

      // Impenetrable Solid Core Substrate Mesh beneath ferrofluid surface
      const r0 = (config.tennisBallDiameter || 6.7) / 2.0;
      const solidCoreGeo = new THREE.SphereGeometry(r0 * 0.988, 64, 64);
      const solidCoreMat = new THREE.MeshPhysicalMaterial({
        color: 0x05070a,
        emissive: new THREE.Color(getGlowColors(config.glowTheme).hex),
        emissiveIntensity: 0.16,
        metalness: 0.98,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 1.0,
      });
      const solidCoreMesh = new THREE.Mesh(solidCoreGeo, solidCoreMat);
      solidCoreMesh.visible = config.solidSurfaceEnabled ?? true;
      orbGroup.add(solidCoreMesh);
      solidCoreMeshRef.current = solidCoreMesh;
    } else {
      fluidMesh.rotation.x = -Math.PI / 2;
      scene.add(fluidMesh);
      if (config.wireframeVisible) {
        wireframeMesh.rotation.x = -Math.PI / 2;
        wireframeMesh.position.y = 0.005;
        scene.add(wireframeMesh);
      }
    }

    // Electrical Arcing Ethereal Energy System
    const electricalArcs = new ElectricalArcingEtherealSystem(config.tendrilCount || 8);
    orbGroup.add(electricalArcs.group);
    electricalArcsRef.current = electricalArcs;

    // Photo-Realistic 4-Ring Gimbal System with Bezier Lightning Arcs & Holo Panels
    // Attached to a dedicated gyroscopic anchor in world space, completely decoupled
    // so the rings are immune to ferrofluid dynamic surfaces and pulses!
    const gimbalRigAnchor = new THREE.Group();
    gimbalRigAnchor.position.copy(orbPosRef.current);
    scene.add(gimbalRigAnchor);
    gimbalRigAnchorRef.current = gimbalRigAnchor;

    const gimbalSystem = new GimbalSystem(fluidMesh, config.glowTheme);
    gimbalSystem.setVisible(
      isInitialSphere && (config.showGimbalRings ?? true),
      isInitialSphere && (config.showBezierArcs ?? true),
      isInitialSphere && (config.showHoloPanels ?? true)
    );
    gimbalRigAnchor.add(gimbalSystem.group);
    gimbalSystemRef.current = gimbalSystem;

    // Pure Autonomous Free-Floating 3D Levitation & Spatial Flight (Zero legs/feet)
    (window as any).__LOCOMOTION_APPLY_IMPULSE__ = (fx: number, fz: number) => {
      levitationImpulseRef.current.add(new THREE.Vector3(fx * 0.04, Math.abs(fx) * 0.015, fz * 0.04));
      audioEngine.playMagneticPulse(1.2);
    };

    (window as any).__LOCOMOTION_SYSTEM__ = {
      isEnabled: () => false,
      getTelemetry: () => ({
        active: true,
        gaitType: 'aerial_levitation',
        locomotionState: 'FREE_FLOATING_FLIGHT',
        velocity: {
          x: levitationImpulseRef.current.x,
          y: levitationImpulseRef.current.y,
          z: levitationImpulseRef.current.z,
          speed: levitationImpulseRef.current.length(),
        },
        heading: orbGroup.rotation.y,
        com: { x: orbPosRef.current.x, y: orbPosRef.current.y, z: orbPosRef.current.z },
        zmp: { x: orbPosRef.current.x, z: orbPosRef.current.z },
        balanceMargin: 0.99,
        stabilityScore: 100,
        rlReward: 95.0,
        joints: [],
        contacts: [],
        navTarget: { x: orbPosRef.current.x, y: orbPosRef.current.y, z: orbPosRef.current.z, label: '3D Autonomous Void' },
        isRecoveringFromImpulse: levitationImpulseRef.current.length() > 0.05,
      }),
    };

    // Full 3D Asset Export Target containing all features (ferrofluid core, spikes, 4 gimbal rings - zero feet/legs)
    const exportTargetGroup = new THREE.Group();
    exportTargetGroup.name = 'FerrofluidArcane_PureFloatingEntity';
    scene.add(exportTargetGroup);
    exportTargetGroup.add(orbGroup);
    exportTargetGroup.add(gimbalRigAnchor);
    (window as any).__FERROFLUID_EXPORT_TARGET__ = exportTargetGroup;
    (window as any).__FERROFLUID_SCENE__ = scene;

    // Kinetic Colliding Probes Swarm ("everything else bounces off it")
    const kineticProbes = new KineticProbeSystem(14, config.glowTheme);
    scene.add(kineticProbes.group);
    kineticProbesRef.current = kineticProbes;

    // Temporal Anomaly Shockwave Ring
    const shockwaveGeo = new THREE.RingGeometry(3.35, 3.85, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(getGlowColors(config.glowTheme).hex),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveRing = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveRing.visible = false;
    scene.add(shockwaveRing);
    shockwaveRingRef.current = shockwaveRing;

    // Free Floating Void Quantum Dust Particles with Solid Surface Bounce Physics
    const pCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = new Float32Array(pCount * 3);
    for (let p = 0; p < pCount; p++) {
      pPos[p * 3] = (Math.random() - 0.5) * 18.0;
      pPos[p * 3 + 1] = Math.random() * 8.0 - 1.0;
      pPos[p * 3 + 2] = (Math.random() - 0.5) * 16.0;

      pVel[p * 3] = (Math.random() - 0.5) * 0.012;
      pVel[p * 3 + 1] = 0.002 + Math.random() * 0.004;
      pVel[p * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.userData = { vel: pVel };
    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color(getGlowColors(config.glowTheme).hex),
      size: 0.07,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const voidParticles = new THREE.Points(pGeo, pMat);
    voidParticles.visible = config.voidParticlesEnabled ?? true;
    scene.add(voidParticles);
    voidParticlesRef.current = voidParticles;

    // Circular Depths & Arcane Concentric Astrolabe Rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ringGroupRef.current = ringGroup;

    const arcaneTexture = createArcaneRingTexture(512);
    const ringRadii = [4.15, 4.65, 5.25];
    const ringSpeeds = [0.0018, -0.0014, 0.0011];

    ringRadii.forEach((r, idx) => {
      const geo = new THREE.RingGeometry(r, r + 0.38, 64);
      const mat = new THREE.MeshBasicMaterial({
        map: arcaneTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55 - idx * 0.12,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color(getGlowColors(config.glowTheme).hex),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = -0.02 * (idx + 1);
      mesh.userData = { rotSpeed: ringSpeeds[idx] };
      ringGroup.add(mesh);
    });

    ringGroup.visible = config.showArcaneRings;

    // Floating Vector Equations Group
    const floatingEqGroup = new THREE.Group();
    scene.add(floatingEqGroup);
    floatingEqGroupRef.current = floatingEqGroup;

    const mathFormulas = [
      '\\mu_0 \\nabla^2 \\mathbf{H} = 0',
      'p_{mag} = \\frac{1}{2} \\mu_0 M_n^2',
      '\\gamma k_c^2 + \\rho g = \\mu_0 M^2 k_c',
      '\\nabla \\times \\mathbf{B} = \\mu_0 (\\mathbf{J} + \\epsilon_0 \\partial_t \\mathbf{E})',
      '\\tau_{visc} = \\eta \\nabla^2 \\mathbf{u}',
      'k_{max} = \\frac{\\mu_0 M^2}{2 \\gamma}',
    ];

    mathFormulas.forEach((formula, i) => {
      const eqCanvas = document.createElement('canvas');
      eqCanvas.width = 384;
      eqCanvas.height = 80;
      const ctx = eqCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 384, 80);
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.fillStyle = getGlowColors(config.glowTheme).hex;
        ctx.shadowColor = getGlowColors(config.glowTheme).hex;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formula, 192, 40);
      }
      const tex = new THREE.CanvasTexture(eqCanvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const ang = (i / mathFormulas.length) * Math.PI * 2;
      const rad = 4.8;
      sprite.position.set(Math.cos(ang) * rad, 0.4 + (i % 3) * 0.35, Math.sin(ang) * rad);
      sprite.scale.set(2.4, 0.5, 1);
      sprite.userData = {
        basePos: sprite.position.clone(),
        oscSpeed: 0.8 + (i % 4) * 0.3,
        phase: i * 1.1,
      };
      floatingEqGroup.add(sprite);
    });

    floatingEqGroup.visible = config.showEquations;

    // Group for 3D Magnet visualizer markers
    const magnetMarkersGroup = new THREE.Group();
    scene.add(magnetMarkersGroup);
    magnetMarkersGroupRef.current = magnetMarkersGroup;

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const entry = entries[0];
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(container);

    // Animation & Physics Loop
    let animationFrameId: number;
    let lastFrameTime = performance.now();
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const nowTime = performance.now();
      const delta = Math.min((nowTime - lastFrameTime) * 0.001, 0.05);
      lastFrameTime = nowTime;

      const elapsedTime = clock.getElapsedTime();
      uniformsRef.current.uTime.value = elapsedTime;

      // 1. Voice & Speech Frequency Capture (Microphone + AI Speech Stream)
      let voiceVol = 0;
      let voiceBass = 0;
      let voiceMid = 0;
      let voiceTreble = 0;

      const voiceData = audioEngine.getVoiceData(configRef.current.voiceSensitivity || 1.2);
      if (configRef.current.voiceReactive || audioEngine.getIsVoiceActive() || voiceData.volume > 0.005) {
        voiceVol = voiceData.volume;
        voiceBass = voiceData.bass;
        voiceMid = voiceData.mid;
        voiceTreble = voiceData.treble;
      }

      // Update voice amplitude and pulse uniforms as specified
      const currentAudioLevel = voiceVol;
      uniformsRef.current.uVoiceAmp.value = THREE.MathUtils.lerp(
        uniformsRef.current.uVoiceAmp.value,
        currentAudioLevel,
        0.25
      );
      uniformsRef.current.uVoicePulse.value = elapsedTime * 15.0;

      // 2. Time-Based Temporal Anomaly Trigger
      const anomalyCadence = 6.0 / Math.max(0.2, configRef.current.timeAnomalyFrequency || 1.0);
      if (elapsedTime - lastAnomalyTimeRef.current > anomalyCadence) {
        lastAnomalyTimeRef.current = elapsedTime;
        anomalySurgeRef.current = 1.0;
        if (configRef.current.soundEnabled) {
          audioEngine.playTimeAnomalyArc();
        }
      }

      // Decay anomaly surge
      if (anomalySurgeRef.current > 0.005) {
        anomalySurgeRef.current = Math.max(0, anomalySurgeRef.current - 0.022);
      }

      // Voice volume spikes can trigger anomaly bursts
      if (voiceVol > 0.65 && anomalySurgeRef.current < 0.5) {
        anomalySurgeRef.current = Math.min(1.0, anomalySurgeRef.current + 0.55);
      }

      // Update uniforms for voice and anomaly reactivity
      uniformsRef.current.uVoiceVolume.value = voiceVol;
      uniformsRef.current.uVoiceBass.value = voiceBass;
      uniformsRef.current.uVoiceMid.value = voiceMid;
      uniformsRef.current.uVoiceTreble.value = voiceTreble;
      uniformsRef.current.uAnomalySurge.value = anomalySurgeRef.current;

      // 3. Pure Autonomous Free-Floating 3D Levitation & AI Flight Dynamics (Zero legs/feet)
      const isSphere = configRef.current.meshShape === 'sphere';

      if (orbGroupRef.current) {
        if (isSphere && (configRef.current.upperHalfFloating ?? true)) {
          const driftSpeed = configRef.current.floatDriftSpeed || 1.0;
          const driftRange = configRef.current.floatRange || 1.0;
          const t = elapsedTime * 0.42 * driftSpeed;

          // -------------------------------------------------------------
          // CAUDEX DEDICATED PLATFORM TRACKING & CURIOSITY DESTINATION
          // -------------------------------------------------------------
          // 1. Camera Real-Time Observer Tracking:
          if (visionTrackingData && visionTrackingData.active && visionTrackingData.faceDetected) {
            const camUserX = visionTrackingData.faceX * 2.8;
            const camUserY = 1.35 + visionTrackingData.faceY * 1.4;
            const camUserZ = 0.5 + (1.0 - visionTrackingData.faceDist) * 2.5;
            destinationTargetRef.current.set(camUserX, camUserY, camUserZ);
            destinationSourceRef.current = 'camera_face';
            destinationLabelRef.current = 'Real-Time Camera Observer';
            curiosityIndexRef.current = Math.min(100, curiosityIndexRef.current + 2);
          } else if (voiceVol > 0.05) {
            // 2. Acoustic Voice Curiosity Vector (when user speaks, curious forward lean toward camera):
            curiosityIndexRef.current = 100;
            const voiceForward = 1.4 + voiceVol * 0.8;
            destinationTargetRef.current.set(Math.sin(t * 0.5) * 0.35, 1.4 + voiceVol * 0.4, voiceForward);
            destinationSourceRef.current = 'voice_acoustic';
            destinationLabelRef.current = 'Acoustic Voice Observer';
          } else if (autoCuriosityRoamingRef.current && destinationSourceRef.current === 'curiosity') {
            // 3. Autonomous Curiosity Roaming:
            if (elapsedTime - lastCuriosityShiftRef.current > 5.2) {
              lastCuriosityShiftRef.current = elapsedTime;
              const rAngle = Math.random() * Math.PI * 2;
              const rDist = (1.1 + Math.random() * 1.5) * driftRange;
              const rY = 1.15 + (Math.sin(t * 1.2) * 0.5 + 0.5) * driftRange;
              destinationTargetRef.current.set(
                Math.cos(rAngle) * rDist,
                rY,
                Math.sin(rAngle) * rDist * 0.65
              );
              destinationSourceRef.current = 'curiosity';
              destinationLabelRef.current = 'Autonomous Spatial Roam';
              curiosityIndexRef.current = 75 + Math.floor(Math.random() * 20);
            }
          }

          // Apply and damp any magnetic impulse recoil
          if (levitationImpulseRef.current.lengthSq() > 0.0001) {
            orbPosRef.current.add(levitationImpulseRef.current);
            levitationImpulseRef.current.multiplyScalar(0.92);
          }

          // Hand Gesture & Pinch Point Tracking:
          if (pinchMidpoint && pinchMidpoint.active) {
            // Hand is actively pinching: grab and glide orb directly to hand in 3D world space
            const targetPos = screenToWorld(pinchMidpoint.x, pinchMidpoint.y, camera, 0, true);
            orbPosRef.current.lerp(targetPos, 0.16);
            orbGroupRef.current.position.copy(orbPosRef.current);
          } else if (pinchMidpoint) {
            // Hand is detected: pull magnetic spikes towards hand location
            const handPos = screenToWorld(pinchMidpoint.x, pinchMidpoint.y, camera, 0, true);
            uniformsRef.current.uPointerPos.value.set(handPos.x, handPos.z);
            uniformsRef.current.uPointerActive.value = 0.85;

            if (!isDraggingRef.current) {
              orbPosRef.current.lerp(destinationTargetRef.current, 0.045);
              orbGroupRef.current.position.copy(orbPosRef.current);
            }
          } else if (!isDraggingRef.current) {
            orbPosRef.current.lerp(destinationTargetRef.current, 0.045);
            orbGroupRef.current.position.copy(orbPosRef.current);
          }

          // Ethereal gyroscopic tumbling in the void
          orbGroupRef.current.rotation.x = Math.sin(t * 0.65) * 0.14;
          orbGroupRef.current.rotation.z = Math.cos(t * 0.55) * 0.11;
          orbGroupRef.current.rotation.y += 0.0035 * configRef.current.rotationSpeed;
        } else {
          if (pinchMidpoint && pinchMidpoint.active) {
            const targetPos = screenToWorld(pinchMidpoint.x, pinchMidpoint.y, camera, 0, true);
            orbPosRef.current.lerp(targetPos, 0.16);
            orbGroupRef.current.position.copy(orbPosRef.current);
          } else if (!isDraggingRef.current) {
            orbPosRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.08);
            orbGroupRef.current.position.copy(orbPosRef.current);
          }
          orbGroupRef.current.rotation.x = 0;
          orbGroupRef.current.rotation.z = 0;
        }

        // Synchronize gimbal rig anchor with orb center
        if (gimbalRigAnchorRef.current) {
          gimbalRigAnchorRef.current.position.copy(orbPosRef.current);
        }
        uniformsRef.current.uOrbPosition.value.copy(orbPosRef.current);

        // Calculate entity movement velocity in 3D world space for dynamic drag displacement
        const dt = Math.max(0.001, Math.min(0.06, delta));
        const instantVelocity = orbPosRef.current.clone().sub(prevOrbPosRef.current).divideScalar(dt);
        prevOrbPosRef.current.copy(orbPosRef.current);
        entityVelocityRef.current.lerp(instantVelocity, 0.32);
        uniformsRef.current.uEntityVelocity.value.copy(entityVelocityRef.current);
        const dynamicDrag = 0.55 + (configRef.current.viscosity || 1.0) * 0.25;
        uniformsRef.current.uVelocityDrag.value = dynamicDrag;

        // -------------------------------------------------------------
        // SYNCHRONOUS MASTER SCALE (Gimbal rings and ferrofluid center
        // expand, zoom in, and zoom out, and decrease all with the same mass,
        // all the same size, all at the same time)
        // -------------------------------------------------------------
        sarcasmScaleRef.current = THREE.MathUtils.lerp(
          sarcasmScaleRef.current,
          sarcasmTargetScaleRef.current,
          0.08
        );
        masterEntityScaleRef.current = THREE.MathUtils.lerp(
          masterEntityScaleRef.current,
          targetEntityScaleRef.current * sarcasmScaleRef.current,
          0.14
        );
        const unifiedScale = masterEntityScaleRef.current;

        orbGroupRef.current.scale.setScalar(unifiedScale);
        if (gimbalRigAnchorRef.current) {
          gimbalRigAnchorRef.current.scale.setScalar(unifiedScale);
        }
        if ((window as any).__FERROFLUID_EXPORT_TARGET__) {
          (window as any).__FERROFLUID_EXPORT_TARGET__.scale.setScalar(unifiedScale);
        }

        // Emit real-time platform coordinate telemetry (throttled every 4 frames)
        if (onCoordinateTelemetry && (Math.floor(elapsedTime * 60) % 4 === 0)) {
          const proj = orbPosRef.current.clone().project(camera);
          const screenX = (proj.x * 0.5 + 0.5) * window.innerWidth;
          const screenY = (-(proj.y * 0.5) + 0.5) * window.innerHeight;
          const dist = orbPosRef.current.distanceTo(destinationTargetRef.current);

          const telemetryData: CaudexCoordinateTelemetry = {
            worldCoords: {
              x: orbPosRef.current.x,
              y: orbPosRef.current.y,
              z: orbPosRef.current.z,
            },
            screenCoords: {
              x: screenX,
              y: screenY,
              nx: proj.x,
              ny: proj.y,
            },
            destinationTarget: {
              x: destinationTargetRef.current.x,
              y: destinationTargetRef.current.y,
              z: destinationTargetRef.current.z,
              source: destinationSourceRef.current,
              label: destinationLabelRef.current,
            },
            distanceToTarget: dist,
            curiosityIndex: curiosityIndexRef.current,
            personalityMood: personalityMoodRef.current,
            sarcasticScalingMultiplier: sarcasmScaleRef.current,
            masterEntityScale: unifiedScale,
            autoCuriosityRoaming: autoCuriosityRoamingRef.current,
            trackingCameraActive: Boolean(visionTrackingData?.active && visionTrackingData?.faceDetected),
          };

          onCoordinateTelemetry(telemetryData);
          (window as any).__CAUDEX_COORDINATES__ = telemetryData;
        }
      }

      // 4. Update Electrical Arcing Ethereal Energy System
      if (electricalArcsRef.current) {
        const ballR = (configRef.current.tennisBallDiameter || 6.7) / 2.0;
        const glowHex = getGlowColors(configRef.current.glowTheme).hex;
        electricalArcsRef.current.update(
          elapsedTime,
          ballR,
          glowHex,
          configRef.current.tendrilArcIntensity || 1.6,
          anomalySurgeRef.current,
          voiceTreble,
          isSphere && (configRef.current.arcingTendrilsEnabled ?? true),
          configRef.current.soundEnabled
        );
      }

      // 5. Update Temporal Shockwave Anomaly Ring
      if (shockwaveRingRef.current) {
        if (anomalySurgeRef.current > 0.02 && isSphere) {
          shockwaveRingRef.current.visible = true;
          shockwaveRingRef.current.position.copy(orbPosRef.current);
          const expandFactor = 1.0 + (1.0 - anomalySurgeRef.current) * 3.4;
          shockwaveRingRef.current.scale.set(expandFactor, expandFactor, expandFactor);
          shockwaveRingRef.current.quaternion.copy(camera.quaternion);
          const mat = shockwaveRingRef.current.material as THREE.MeshBasicMaterial;
          mat.opacity = anomalySurgeRef.current * 0.75;
          mat.color.set(getGlowColors(configRef.current.glowTheme).hex);
        } else {
          shockwaveRingRef.current.visible = false;
        }
      }

      // Update Decoupled Gimbal Rig Anchor:
      // Gimbal armature centers on orb in world coordinates,
      // but maintains strictly unwarped gyroscopic orientation (0,0,0),
      // completely isolating the rings from ferrofluid dynamic surfaces and wobbles!
      if (gimbalRigAnchorRef.current) {
        gimbalRigAnchorRef.current.position.copy(orbPosRef.current);
        gimbalRigAnchorRef.current.rotation.set(0, 0, 0);
      }

      // 6. Void Quantum Particles Brownian Flow & Solid Surface Collision Bounce
      if (voidParticlesRef.current && voidParticlesRef.current.visible) {
        const positions = voidParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = voidParticlesRef.current.geometry.userData?.vel as Float32Array;
        const pLen = positions.length / 3;
        const orbCenter = orbPosRef.current;
        const bRad = (configRef.current.tennisBallDiameter || 6.7) / 2.0;
        const restitution = configRef.current.particleBounceRestitution ?? 1.35;
        const sparks = kineticProbesRef.current?.sparks;
        const themeHex = getGlowColors(configRef.current.glowTheme).hex;

        for (let i = 0; i < pLen; i++) {
          const idx = i * 3;
          if (velocities) {
            positions[idx] += velocities[idx];
            positions[idx + 1] += velocities[idx + 1];
            positions[idx + 2] += velocities[idx + 2];
            velocities[idx] *= 0.992;
            velocities[idx + 1] = velocities[idx + 1] * 0.992 + 0.0001; // gentle thermal convection
            velocities[idx + 2] *= 0.992;
          } else {
            positions[idx + 1] += 0.004 * (1.0 + Math.sin(elapsedTime * 0.8 + i) * 0.5);
          }

          if (positions[idx + 1] > 7.5) {
            positions[idx + 1] = -1.2;
          }

          if (isSphere) {
            const dx = positions[idx] - orbCenter.x;
            const dy = positions[idx + 1] - orbCenter.y;
            const dz = positions[idx + 2] - orbCenter.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist > 0.001) {
              const nx = dx / dist;
              const ny = dy / dist;
              const nz = dz / dist;
              const normVec = new THREE.Vector3(nx, ny, nz);

              // Query dynamic surface boundary at this contact direction
              const solidRadius = getFerrofluidSurfaceRadius(
                normVec,
                bRad,
                elapsedTime,
                configRef.current.magneticStrength,
                configRef.current.spikeDensity,
                configRef.current.spikeHeight,
                configRef.current.morphIntensity ?? 1.15,
                configRef.current.solidSurfaceEnabled ?? true
              );

              // SOLID SURFACE COLLISION: Entity hits solid ferrofluid surface and bounces off!
              if (dist <= solidRadius + 0.06) {
                if (velocities) {
                  const vDotN = velocities[idx] * nx + velocities[idx + 1] * ny + velocities[idx + 2] * nz;
                  if (vDotN < 0) {
                    velocities[idx] -= (1.0 + restitution) * vDotN * nx;
                    velocities[idx + 1] -= (1.0 + restitution) * vDotN * ny;
                    velocities[idx + 2] -= (1.0 + restitution) * vDotN * nz;

                    // Elastic tangential scatter impulse
                    velocities[idx] += (Math.random() - 0.5) * 0.015;
                    velocities[idx + 1] += (Math.random() - 0.5) * 0.015;
                    velocities[idx + 2] += (Math.random() - 0.5) * 0.015;
                  }
                }

                // Push position out to solid boundary
                positions[idx] = orbCenter.x + nx * (solidRadius + 0.08);
                positions[idx + 1] = orbCenter.y + ny * (solidRadius + 0.08);
                positions[idx + 2] = orbCenter.z + nz * (solidRadius + 0.08);

                // Collision sparks on bounce
                if (sparks && (configRef.current.showCollisionSparks ?? true) && Math.random() < 0.22) {
                  sparks.emit(
                    new THREE.Vector3(positions[idx], positions[idx + 1], positions[idx + 2]),
                    normVec,
                    3,
                    themeHex
                  );
                }
              } else if (dist < 5.0 && dist > 0.1) {
                const swirlSpeed = 0.004 / Math.max(0.5, dist);
                positions[idx] += -dz * swirlSpeed;
                positions[idx + 2] += dx * swirlSpeed;
              }
            }
          }
        }
        voidParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 7. Kinetic Bouncing Probes Swarm ("everything else bounces off it")
      if (kineticProbesRef.current && isSphere && (configRef.current.kineticCollidersEnabled ?? true)) {
        const bRad = (configRef.current.tennisBallDiameter || 6.7) / 2.0;
        kineticProbesRef.current.update(
          0.016,
          orbPosRef.current,
          bRad,
          elapsedTime,
          configRef.current.magneticStrength,
          configRef.current.spikeDensity,
          configRef.current.spikeHeight,
          configRef.current.morphIntensity ?? 1.15,
          configRef.current.particleBounceRestitution ?? 1.35,
          configRef.current.soundEnabled
        );
      }

      // Auto-rotation of camera if enabled
      if (configRef.current.autoRotate) {
        cameraOrbitRef.current.theta += 0.003 * configRef.current.rotationSpeed;
        updateCameraTransform();
      }

      // Solid Core & Fluid Shell Geometry:
      // The solid core and base sphere maintain rigid calibrated geometry (1,1,1)
      // guaranteeing an impenetrable, un-deformed solid substrate
      if (isSphere && fluidMeshRef.current) {
        fluidMeshRef.current.scale.set(1, 1, 1);
        if (wireframeMeshRef.current) {
          wireframeMeshRef.current.scale.set(1, 1, 1);
        }
        if (solidCoreMeshRef.current) {
          solidCoreMeshRef.current.scale.set(1, 1, 1);
        }
      }

      // Smooth cinematic camera zoom interpolation
      const curR = cameraOrbitRef.current.radius;
      const targetR = targetRadiusRef.current;
      if (Math.abs(curR - targetR) > 0.01) {
        cameraOrbitRef.current.radius += (targetR - curR) * 0.12;
        updateCameraTransform();
      }

      // Update 4-Ring Gimbal Rig & Bezier Lightning Arcs
      // Note: The rings are completely immune to the ferrofluid's dynamic surface!
      if (gimbalSystemRef.current && isSphere) {
        const isSurging = anomalySurgeRef.current > 0.05;
        const speedMult = (configRef.current.gimbalSpeed ?? 1.0) * configRef.current.symbolRotationSpeed;
        const ringSpeeds = {
          r1: configRef.current.ring1Speed ?? 1.0,
          r2: configRef.current.ring2Speed ?? 1.0,
          r3: configRef.current.ring3Speed ?? 1.0,
          r4: configRef.current.ring4Speed ?? 1.0,
        };
        const motionStyle = configRef.current.gimbalMotionStyle ?? 'fluid';
        const handOpenBoost = pinchMidpoint && !pinchMidpoint.active && pinchMidpoint.dist > 0.14 ? 1.85 : 1.0;
        gimbalSystemRef.current.update(elapsedTime, speedMult * handOpenBoost, isSurging, ringSpeeds, motionStyle);
      }

      // Rotate circular arcane depth rings
      if (ringGroupRef.current) {
        ringGroupRef.current.children.forEach((child) => {
          if (child.userData?.rotSpeed) {
            child.rotation.z += child.userData.rotSpeed * configRef.current.symbolRotationSpeed;
          }
        });
      }

      // Floating equation levitation
      if (floatingEqGroupRef.current) {
        floatingEqGroupRef.current.children.forEach((sprite) => {
          if (sprite.userData?.basePos) {
            const bp = sprite.userData.basePos as THREE.Vector3;
            const speed = sprite.userData.oscSpeed;
            const phase = sprite.userData.phase;
            sprite.position.y = bp.y + Math.sin(elapsedTime * speed + phase) * 0.12;
            sprite.quaternion.copy(camera.quaternion);
          }
        });
      }

      // Render Scene
      renderer.render(scene, camera);
    };

    // CAUDEX Global Window Event Listeners & Destination Triggers
    const handleSetDestination = (e: any) => {
      const d = e.detail;
      if (d) {
        destinationTargetRef.current.set(d.x ?? 0, d.y ?? 1.35, d.z ?? 0);
        destinationSourceRef.current = d.source || 'manual_waypoint';
        destinationLabelRef.current = d.label || 'Manual Spatial Waypoint';
        curiosityIndexRef.current = 100;
        audioEngine.playMagneticPulse(1.2);
      }
    };

    const handlePersonalityReaction = (e: any) => {
      const d = e.detail;
      if (d) {
        if (d.mood) personalityMoodRef.current = d.mood;
        if (d.scale) {
          sarcasmTargetScaleRef.current = d.scale;
          setTimeout(() => {
            sarcasmTargetScaleRef.current = 1.0;
          }, 2200);
        }
      }
    };

    const handleAcousticCuriosity = () => {
      curiosityIndexRef.current = 100;
      destinationTargetRef.current.set(0, 1.45, 1.85);
      destinationSourceRef.current = 'voice_acoustic';
      destinationLabelRef.current = 'Acoustic Voice Observer';
    };

    const handleSetScale = (e: any) => {
      if (e.detail?.scale) {
        targetEntityScaleRef.current = e.detail.scale;
      }
    };

    window.addEventListener('caudex-set-destination', handleSetDestination);
    window.addEventListener('caudex-personality-reaction', handlePersonalityReaction);
    window.addEventListener('caudex-acoustic-curiosity', handleAcousticCuriosity);
    window.addEventListener('caudex-set-scale', handleSetScale);

    (window as any).__CAUDEX_SET_DESTINATION__ = (x: number, y: number, z: number, label?: string) => {
      destinationTargetRef.current.set(x, y, z);
      destinationSourceRef.current = 'manual_waypoint';
      destinationLabelRef.current = label || 'Manual Destination';
      curiosityIndexRef.current = 100;
      audioEngine.playMagneticPulse(1.2);
    };
    (window as any).__CAUDEX_SET_SCALE__ = (s: number) => {
      targetEntityScaleRef.current = s;
    };
    (window as any).__CAUDEX_TRIGGER_SARCASM__ = () => {
      personalityMoodRef.current = 'sarcastic';
      sarcasmTargetScaleRef.current = 0.88;
      audioEngine.playMagneticPulse(1.3);
      setTimeout(() => {
        sarcasmTargetScaleRef.current = 1.18;
      }, 550);
      setTimeout(() => {
        sarcasmTargetScaleRef.current = 1.0;
      }, 2300);
    };

    animate();

    return () => {
      window.removeEventListener('caudex-set-destination', handleSetDestination);
      window.removeEventListener('caudex-personality-reaction', handlePersonalityReaction);
      window.removeEventListener('caudex-acoustic-curiosity', handleAcousticCuriosity);
      window.removeEventListener('caudex-set-scale', handleSetScale);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      discGeometry.dispose();
      sphereGeometry.dispose();
      fluidMaterial.dispose();
      wireframeMaterial.dispose();
      arcaneTexture.dispose();
      electricalArcs.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      kineticProbes.dispose();
      if (solidCoreMeshRef.current) {
        solidCoreMeshRef.current.geometry.dispose();
        (solidCoreMeshRef.current.material as THREE.Material).dispose();
        solidCoreMeshRef.current = null;
      }
      if (gimbalSystemRef.current) {
        gimbalSystemRef.current.dispose();
        gimbalSystemRef.current = null;
      }
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update camera coordinates based on spherical orbit
  const updateCameraTransform = useCallback(() => {
    const cam = cameraRef.current;
    if (!cam) return;

    const { theta, phi, radius, target } = cameraOrbitRef.current;
    cam.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cam.position.y = target.y + radius * Math.cos(phi);
    cam.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cam.lookAt(target);
  }, []);

  // Update ring colors when theme changes
  useEffect(() => {
    const glow = getGlowColors(config.glowTheme);
    if (ringGroupRef.current) {
      ringGroupRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material && 'color' in mesh.material) {
          (mesh.material as THREE.MeshBasicMaterial).color.set(glow.hex);
        }
      });
    }

    if (gimbalSystemRef.current) {
      gimbalSystemRef.current.updateTheme(config.glowTheme);
    }

    if (floatingEqGroupRef.current) {
      floatingEqGroupRef.current.children.forEach((child) => {
        const sprite = child as THREE.Sprite;
        if (sprite.material) {
          sprite.material.color.set(glow.hex);
        }
      });
    }
  }, [config.glowTheme]);

  // Update Magnet 3D visualizer rings
  useEffect(() => {
    if (!sceneRef.current || !magnetMarkersGroupRef.current) return;
    const group = magnetMarkersGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      child.geometry?.dispose();
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material?.dispose();
    }

    magnets.forEach((m) => {
      const ringGeo = new THREE.RingGeometry(0.18, 0.26, 32);
      const isNorth = m.polarity === 'north';
      const ringMat = new THREE.MeshBasicMaterial({
        color: isNorth ? 0x38bdf8 : 0xf43f5e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(m.x, 0.08, m.z);

      const dotGeo = new THREE.CircleGeometry(0.08, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.rotation.x = -Math.PI / 2;
      dotMesh.position.set(m.x, 0.09, m.z);

      group.add(ringMesh);
      group.add(dotMesh);
    });
  }, [magnets]);

  // Raycaster for surface intersection
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVec = useRef(new THREE.Vector2());

  const getGroundIntersection = useCallback((clientX: number, clientY: number): THREE.Vector3 | null => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return null;

    const rect = container.getBoundingClientRect();
    mouseVec.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouseVec.current, camera);

    if (config.meshShape === 'sphere') {
      const radius = (config.tennisBallDiameter || 6.7) / 2.0;
      const sphereCenter = orbPosRef.current || new THREE.Vector3(0, 0, 0);
      const sphere = new THREE.Sphere(sphereCenter, radius * 1.25);
      const hit = new THREE.Vector3();
      if (raycaster.current.ray.intersectSphere(sphere, hit)) {
        return hit;
      }
    }

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    return raycaster.current.ray.intersectPlane(plane, target);
  }, [config.meshShape, config.tennisBallDiameter]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    const groundHit = getGroundIntersection(e.clientX, e.clientY);
    if (!groundHit) return;

    const localHit = config.meshShape === 'sphere' && orbPosRef.current
      ? groundHit.clone().sub(orbPosRef.current)
      : groundHit;

    if (config.interactionMode === 'magnet') {
      if (e.shiftKey && onAddMagnet) {
        onAddMagnet(groundHit.x, groundHit.z);
        audioEngine.playMagneticPulse(1.2);
      } else {
        pointerWorldPosRef.current.copy(groundHit);
        pointerActiveRef.current = true;
        uniformsRef.current.uPointerPos.value.set(localHit.x, localHit.z);
        uniformsRef.current.uPointerActive.value = 1.0;
        audioEngine.playMagneticPulse(0.8);
      }
    } else if (config.interactionMode === 'stir' || config.interactionMode === 'pulse') {
      pointerWorldPosRef.current.copy(groundHit);
      pointerActiveRef.current = true;
      uniformsRef.current.uPointerPos.value.set(localHit.x, localHit.z);
      uniformsRef.current.uPointerActive.value = 1.0;
      audioEngine.playDropRipple();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const groundHit = getGroundIntersection(e.clientX, e.clientY);

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (e.shiftKey && cameraRef.current && orbGroupRef.current) {
        // Shift + Drag acts as 3D Pinch-to-Glide interaction
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const normX = (e.clientX - rect.left) / rect.width;
          const normY = (e.clientY - rect.top) / rect.height;
          const targetWorldPos = screenToWorld(normX, normY, cameraRef.current, 0);
          orbPosRef.current.lerp(targetWorldPos, 0.15);
          orbGroupRef.current.position.lerp(targetWorldPos, 0.15);
        }
      } else if (config.interactionMode === 'orbit' || e.buttons === 2 || e.altKey) {
        cameraOrbitRef.current.theta -= deltaX * 0.008;
        cameraOrbitRef.current.phi = Math.max(0.1, Math.min(Math.PI * 0.48, cameraOrbitRef.current.phi + deltaY * 0.008));
        updateCameraTransform();
      } else if (groundHit && (config.interactionMode === 'magnet' || config.interactionMode === 'stir')) {
        const localHit = config.meshShape === 'sphere' && orbPosRef.current
          ? groundHit.clone().sub(orbPosRef.current)
          : groundHit;
        pointerWorldPosRef.current.copy(groundHit);
        uniformsRef.current.uPointerPos.value.set(localHit.x, localHit.z);
        uniformsRef.current.uPointerActive.value = 1.0;

        if (config.interactionMode === 'stir' && orbGroupRef.current) {
          // Stir mode smoothly nudges the floating orb towards the pointer
          orbPosRef.current.lerp(groundHit, 0.06);
          orbGroupRef.current.position.copy(orbPosRef.current);
        }
      }
    } else if (groundHit && config.interactionMode !== 'orbit') {
      const localHit = config.meshShape === 'sphere' && orbPosRef.current
        ? groundHit.clone().sub(orbPosRef.current)
        : groundHit;
      uniformsRef.current.uPointerPos.value.set(localHit.x, localHit.z);
      uniformsRef.current.uPointerActive.value = 0.35;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (config.interactionMode !== 'orbit') {
      let val = uniformsRef.current.uPointerActive.value;
      const fadeInterval = setInterval(() => {
        val *= 0.75;
        uniformsRef.current.uPointerActive.value = val;
        if (val < 0.02) {
          uniformsRef.current.uPointerActive.value = 0;
          clearInterval(fadeInterval);
        }
      }, 30);
    }
  };

  // Multi-Touch Pinch-to-Zoom, Touch Orbit & Spike Stretch Detection
  const touchStateRef = useRef<{
    lastX: number;
    lastY: number;
    lastTapTime: number;
    initialDist: number;
    initialRadius: number;
  }>({
    lastX: 0,
    lastY: 0,
    lastTapTime: 0,
    initialDist: 0,
    initialRadius: 13.5,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const isDoubleTap = now - touchStateRef.current.lastTapTime < 320;
      touchStateRef.current.lastTapTime = now;
      touchStateRef.current.lastX = t.clientX;
      touchStateRef.current.lastY = t.clientY;

      if (isDoubleTap) {
        // Double tap resets camera focus & synchronous scale
        targetRadiusRef.current = 13.5;
        cameraOrbitRef.current.target.set(0, 0, 0);
        targetEntityScaleRef.current = 1.0;
        sarcasmScaleRef.current = 1.0;
        sarcasmTargetScaleRef.current = 1.0;
        audioEngine.playMagneticPulse(1.0);
      }
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStateRef.current.initialDist = dist || 1;
      touchStateRef.current.initialRadius = targetRadiusRef.current;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // 1-Finger Touch: Smoothly rotate camera orbit around the 3D entity
      const t = e.touches[0];
      const dx = t.clientX - touchStateRef.current.lastX;
      const dy = t.clientY - touchStateRef.current.lastY;
      touchStateRef.current.lastX = t.clientX;
      touchStateRef.current.lastY = t.clientY;

      cameraOrbitRef.current.theta -= dx * 0.008;
      cameraOrbitRef.current.phi = Math.max(0.1, Math.min(Math.PI * 0.48, cameraOrbitRef.current.phi + dy * 0.008));
      updateCameraTransform();
    } else if (e.touches.length === 2 && containerRef.current) {
      // 2-Finger Touch: Pinch-to-Zoom & Synchronous Master Entity Scale Stretch
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / Math.max(1, touchStateRef.current.initialDist);

      // Camera Distance Zoom (Pinch In = Zoom Out, Spread = Zoom In)
      const newRadius = THREE.MathUtils.clamp(
        touchStateRef.current.initialRadius / Math.max(0.2, ratio),
        2.8,
        28.0
      );
      targetRadiusRef.current = newRadius;
      setZoomRadius(newRadius);

      // Synchronous Master Scale: BOTH gimbal rings and ferrofluid core expand/decrease together!
      const stretchMultiplier = THREE.MathUtils.clamp(ratio, 0.4, 3.0);
      targetEntityScaleRef.current = stretchMultiplier;
      uniformsRef.current.uSpikeHeight.value = config.spikeHeight * (0.8 + stretchMultiplier * 0.35);
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current.initialDist = 0;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.altKey || e.ctrlKey) {
      // Alt / Ctrl + Wheel stretches the gimbal rings and core synchronously
      const delta = -e.deltaY * 0.002;
      const currentScale = targetEntityScaleRef.current;
      const newScale = THREE.MathUtils.clamp(currentScale + delta, 0.4, 3.0);
      targetEntityScaleRef.current = newScale;
      uniformsRef.current.uSpikeHeight.value = config.spikeHeight * (0.8 + newScale * 0.35);
    } else {
      // Standard Wheel: Zooms camera in and out
      targetRadiusRef.current = Math.max(2.8, Math.min(28.0, targetRadiusRef.current + e.deltaY * 0.008));
      setZoomRadius(targetRadiusRef.current);
    }
  };

  // Zoom preset levels mapped to exact physical design diameters:
  // Core (6.7cm) -> 4.2 Three.js radius
  // Inner Ring (18cm) -> 7.8 Three.js radius
  // Middle Ring (26cm) -> 11.5 Three.js radius
  // Outer Ring (36cm) -> 16.0 Three.js radius
  // Holographic Halo (42cm) -> 21.0 Three.js radius
  const ZOOM_PRESETS = useMemo(() => [
    { id: 'core', label: 'Core', diameter: '6.7 cm', radius: 4.2, desc: 'Macro Ferrofluid Core' },
    { id: 'inner', label: 'Inner', diameter: '18 cm', radius: 7.8, desc: 'Black Chrome Equator' },
    { id: 'middle', label: 'Mid', diameter: '26 cm', radius: 11.5, desc: 'Titanium Pitch Ring' },
    { id: 'outer', label: 'Outer', diameter: '36 cm', radius: 16.0, desc: 'Gunmetal Roll Ring' },
    { id: 'halo', label: 'Halo Rig', diameter: '42 cm', radius: 21.0, desc: 'Full 42cm Holographic Rig' },
  ], []);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    targetRadiusRef.current = Math.max(3.2, targetRadiusRef.current - 2.8);
    setZoomRadius(targetRadiusRef.current);
    audioEngine.playMagneticPulse(1.1);
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    targetRadiusRef.current = Math.min(26.0, targetRadiusRef.current + 2.8);
    setZoomRadius(targetRadiusRef.current);
    audioEngine.playMagneticPulse(0.9);
  };

  // Single-click toggle between Macro Core (4.2) and Full 42cm Rig (21.0)
  const handleToggleZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (targetRadiusRef.current > 12.0) {
      targetRadiusRef.current = 4.2;
    } else {
      targetRadiusRef.current = 21.0;
    }
    setZoomRadius(targetRadiusRef.current);
    audioEngine.playMagneticPulse(1.2);
  };

  const handleSelectPreset = (rad: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    targetRadiusRef.current = rad;
    setZoomRadius(rad);
    audioEngine.playMagneticPulse(1.0);
  };

  // Launch interactive kinetic probe that bounces off the solid ferrofluid surface
  const handleLaunchProbe = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!cameraRef.current || !kineticProbesRef.current) return;
    const camPos = cameraRef.current.position.clone();
    const target = orbPosRef.current.clone();
    kineticProbesRef.current.launchUserProbe(camPos, target, 0.32);
  }, []);

  // Compute active focus tier for telemetry
  const activePreset = ZOOM_PRESETS.reduce((prev, curr) =>
    Math.abs(curr.radius - zoomRadius) < Math.abs(prev.radius - zoomRadius) ? curr : prev
  );

  return (
    <div className="w-full h-full relative select-none overflow-hidden touch-none">
      <div
        ref={containerRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        id="ferrofluid-viewport-canvas"
      />

      {/* FLOATING GHOST GLASS ZOOM CONTROLLER (LIFTED ABOVE OS RAIL TO PREVENT OVERLAP) */}
      <div
        className="absolute bottom-16 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto"
        id="gimbal-zoom-controller-dock"
      >
        {/* Main Neumorphic Glass Control Bar */}
        <div className="flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-[#070b12]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all hover:border-cyan-400/40">
          {/* Quick Toggle: Core (6.7cm) ⇄ Full Rig (42cm) */}
          <button
            onClick={handleToggleZoom}
            title="Toggle between Ø 6.7 cm Core and Ø 42 cm Full Rig"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/70 to-blue-950/60 border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 font-mono text-[11px] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Compass size={13} className="text-cyan-400 animate-spin-slow" />
            <span>TOGGLE ZOOM</span>
            <span className="text-[10px] text-cyan-400/80 hidden sm:inline">
              {targetRadiusRef.current > 12.0 ? '(TO CORE)' : '(TO 42cm RIG)'}
            </span>
          </button>

          <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

          {/* Stepper Zoom In */}
          <button
            onClick={handleZoomIn}
            title="Zoom In (Decrease Camera Distance)"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-900/80 border border-white/10 hover:border-cyan-400/50 text-stone-300 hover:text-cyan-300 hover:scale-105 active:scale-90 transition-all cursor-pointer shadow-inner"
          >
            <ZoomIn size={15} />
          </button>

          {/* Stepper Zoom Out */}
          <button
            onClick={handleZoomOut}
            title="Zoom Out (Expand View to Full 42cm Ring)"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-900/80 border border-white/10 hover:border-cyan-400/50 text-stone-300 hover:text-cyan-300 hover:scale-105 active:scale-90 transition-all cursor-pointer shadow-inner"
          >
            <ZoomOut size={15} />
          </button>

          <div className="w-[1px] h-5 bg-white/10 mx-0.5 hidden sm:block" />

          {/* Direct Diameter Presets */}
          <div className="hidden sm:flex items-center gap-1">
            {ZOOM_PRESETS.map((p) => {
              const isSelected = Math.abs(zoomRadius - p.radius) < 1.8;
              return (
                <button
                  key={p.id}
                  onClick={(e) => handleSelectPreset(p.radius, e)}
                  title={`${p.desc} (${p.diameter})`}
                  className={`px-2 py-1 rounded-lg font-mono text-[10px] transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                      : 'bg-stone-900/40 border-white/5 text-stone-400 hover:text-stone-200 hover:border-white/20'
                  }`}
                >
                  {p.label} <span className="text-[9px] opacity-75">{p.diameter}</span>
                </button>
              );
            })}
          </div>

          <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

          {/* Quick Action: Launch Kinetic Probe (watch it bounce off the solid ferrofluid surface) */}
          <button
            onClick={handleLaunchProbe}
            title="Launch an orbital kinetic probe to watch it bounce off the solid ferrofluid surface with sparks and sound"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-950/60 to-rose-950/50 border border-amber-500/40 text-amber-200 hover:text-white hover:border-amber-300 font-mono text-[10px] font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">BOUNCE PROBE</span>
            <span className="sm:hidden">BOUNCE</span>
          </button>

          <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

          {/* Telemetry Indicator Readout */}
          <div className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[9.5px] text-stone-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-stone-400">FOCUS:</span>
            <span className="text-cyan-300 font-semibold">{activePreset.diameter}</span>
          </div>

          <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

          {/* Non-overlapping Controls Hint Tooltip Trigger */}
          <div className="relative group">
            <button
              className="px-2 py-0.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-white/10 hover:border-cyan-400/40 text-[9.5px] font-mono text-stone-300 hover:text-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="View interaction mouse & keyboard shortcuts"
            >
              <span>⌨ Controls</span>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:flex group-focus-within:flex items-center gap-2.5 bg-[#090b10]/95 backdrop-blur-xl border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-2xl font-mono text-[9.5px] text-stone-300 whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95">
              <span><strong className="text-cyan-300">Drag:</strong> Orbit / Pull Spikes</span>
              <span className="text-white/20">•</span>
              <span><strong className="text-cyan-300">Scroll:</strong> Zoom Abyss</span>
              <span className="text-white/20">•</span>
              <span><strong className="text-cyan-300">Shift+Click:</strong> Drop Magnet Pole</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
