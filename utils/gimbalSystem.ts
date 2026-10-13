/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GlowTheme } from '../types';
import { getGlowColors } from './arcaneTextures';

interface ArcConnection {
  line: THREE.Line;
  curve: THREE.CubicBezierCurve3;
  startObj: THREE.Object3D;
  endObj: THREE.Object3D;
  startOffset: THREE.Vector3;
  endOffset: THREE.Vector3;
  color: number;
  speed: number;
  phase: number;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
}

interface EnergyPacket {
  mesh: THREE.Mesh;
  arcIndex: number;
  progress: number;
  speed: number;
  scale: number;
}

interface HoloPanel {
  mesh: THREE.Mesh;
  basePos: THREE.Vector3;
  baseAngle: number;
  radius: number;
  oscSpeed: number;
  phase: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

/**
 * EXACT PHYSICAL DIMENSION RATIOS (relative to Ø 6.7 cm Core Sphere = 2.0 Three.js units):
 * Scale Factor: 2.0 / 6.7 = 0.2985 Three.js units per cm
 *
 * - Core Sphere: Diameter: 6.7 cm  -> Radius: 1.000 Three.js units (Diameter: 2.00)
 * - Inner Ring:  Diameter: 18 cm   -> Radius: 2.686 Three.js units (Diameter: 5.37)  [Black Chrome]
 * - Middle Ring: Diameter: 26 cm   -> Radius: 3.880 Three.js units (Diameter: 7.76)  [Titanium]
 * - Outer Ring:  Diameter: 36 cm   -> Radius: 5.373 Three.js units (Diameter: 10.74) [Gunmetal]
 * - Halo:        Diameter: 42 cm   -> Radius: 6.268 Three.js units (Diameter: 12.54) [Holographic Halo Glass]
 */
export const GIMBAL_METRICS = {
  SPHERE_DIAMETER_CM: 6.7,
  INNER_RING_DIAMETER_CM: 18,
  MIDDLE_RING_DIAMETER_CM: 26,
  OUTER_RING_DIAMETER_CM: 36,
  HALO_DIAMETER_CM: 42,
  UNITS_PER_CM: 2.0 / 6.7,
  R_CORE: 1.0,
  R_INNER: 9.0 * (2.0 / 6.7),    // ~2.686
  R_MIDDLE: 13.0 * (2.0 / 6.7),  // ~3.880
  R_OUTER: 18.0 * (2.0 / 6.7),   // ~5.373
  R_HALO: 21.0 * (2.0 / 6.7),    // ~6.268
};

/**
 * 4-Ring Photo-Realistic Gimbal System with Cybernetic Living Architecture:
 * - Inner Ring (18cm): Black Chrome, locked strictly to the sphere equator (Y axis rotation only)
 * - Middle Ring (26cm): Titanium, rotating on gyroscopic pitch axis
 * - Outer Ring (36cm): Gunmetal, rotating on gyroscopic roll axis
 * - Holographic Halo (42cm): 85% Transparent Refractive Glass with frosted edges and internal glow
 * - Living Core Pulse synchronization
 * - Neumorphic Glass HUD Panels with data nodes, processing indicators, dynamic channels, and hexagonal controls
 */
export class GimbalSystem {
  public group: THREE.Group;
  public ringsGroup: THREE.Group;
  public arcGroup: THREE.Group;
  public panelsGroup: THREE.Group;
  public packetsGroup: THREE.Group;

  // Physical Rings
  public ring1Inner: THREE.Mesh;       // 18 cm - Black Chrome (Equatorial)
  public ring2Middle: THREE.Mesh;      // 26 cm - Titanium (Pitch axis)
  public ring3Outer: THREE.Mesh;       // 36 cm - Gunmetal (Roll axis)
  public ring4Halo: THREE.Mesh;        // 42 cm - Holographic Halo Glass
  public ringPivots: THREE.Mesh[] = [];

  // Bezier arcs and packets
  private arcs: ArcConnection[] = [];
  private packets: EnergyPacket[] = [];
  private panels: HoloPanel[] = [];

  // Core reference
  private coreAnchor: THREE.Object3D;

  // Materials list
  private blackChromeMaterial!: THREE.MeshPhysicalMaterial;
  private titaniumMaterial!: THREE.MeshPhysicalMaterial;
  private gunmetalMaterial!: THREE.MeshPhysicalMaterial;
  private haloGlassMaterial!: THREE.MeshPhysicalMaterial;
  private arcMaterials: THREE.LineBasicMaterial[] = [];
  private packetMaterial: THREE.MeshBasicMaterial;

  constructor(coreAnchor: THREE.Object3D, glowTheme: GlowTheme = 'cyan') {
    this.coreAnchor = coreAnchor;
    this.group = new THREE.Group();
    this.group.name = 'GimbalRigSystem';

    this.ringsGroup = new THREE.Group();
    this.arcGroup = new THREE.Group();
    this.panelsGroup = new THREE.Group();
    this.packetsGroup = new THREE.Group();

    this.group.add(this.ringsGroup);
    this.group.add(this.arcGroup);
    this.group.add(this.panelsGroup);
    this.group.add(this.packetsGroup);

    const themeColors = getGlowColors(glowTheme);
    const themeColorHex = new THREE.Color(themeColors.hex).getHex();

    // -------------------------------------------------------------
    // 1. PHYSICAL PBR MATERIALS
    // -------------------------------------------------------------
    // Black Chrome: Deep void mirror obsidian finish
    this.blackChromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x080b10,
      emissive: new THREE.Color(themeColorHex),
      emissiveIntensity: 0.25,
      metalness: 0.98,
      roughness: 0.04,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      ior: 1.6,
    });

    // Titanium: Aerospace Grade 5 brushed metallic sheen
    this.titaniumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88929c,
      emissive: new THREE.Color(themeColorHex),
      emissiveIntensity: 0.2,
      metalness: 0.88,
      roughness: 0.16,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
      reflectivity: 0.85,
    });

    // Gunmetal: Heavy ballistic dark alloy
    this.gunmetalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x20242a,
      emissive: new THREE.Color(themeColorHex),
      emissiveIntensity: 0.22,
      metalness: 0.94,
      roughness: 0.12,
      clearcoat: 0.65,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9,
    });

    // Holographic Halo Glass: 85% Transparency, Refraction, Frosted Edges, Internal Glow
    this.haloGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a1420,
      emissive: new THREE.Color(themeColorHex),
      emissiveIntensity: 0.65,
      transmission: 0.85,
      opacity: 0.85,
      transparent: true,
      roughness: 0.09,
      metalness: 0.12,
      ior: 1.52,
      thickness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    // -------------------------------------------------------------
    // 2. CONSTRUCT 4 GIMBAL RINGS WITH PRECISE PHYSICAL SCALING
    // -------------------------------------------------------------
    // Inner Ring: Diameter 18 cm (Radius ~2.686 units) - Black Chrome
    const rInner = GIMBAL_METRICS.R_INNER;
    const geoInner = new THREE.TorusGeometry(rInner, 0.056, 32, 140);
    this.ring1Inner = new THREE.Mesh(geoInner, this.blackChromeMaterial);
    // Align strictly horizontally with the sphere equator
    this.ring1Inner.rotation.x = Math.PI / 2;
    this.ringsGroup.add(this.ring1Inner);
    this.addEquatorialAzimuthNotches(this.ring1Inner, rInner, themeColorHex);

    // Middle Ring: Diameter 26 cm (Radius ~3.880 units) - Titanium
    const rMiddle = GIMBAL_METRICS.R_MIDDLE;
    const geoMiddle = new THREE.TorusGeometry(rMiddle, 0.068, 32, 160);
    this.ring2Middle = new THREE.Mesh(geoMiddle, this.titaniumMaterial);
    this.ring2Middle.rotation.x = Math.PI / 3;
    this.ringsGroup.add(this.ring2Middle);

    // Outer Ring: Diameter 36 cm (Radius ~5.373 units) - Gunmetal
    const rOuter = GIMBAL_METRICS.R_OUTER;
    const geoOuter = new THREE.TorusGeometry(rOuter, 0.082, 32, 180);
    this.ring3Outer = new THREE.Mesh(geoOuter, this.gunmetalMaterial);
    this.ring3Outer.rotation.z = Math.PI / 4;
    this.ringsGroup.add(this.ring3Outer);

    // Holographic Halo: Diameter 42 cm (Radius ~6.268 units) - 85% Translucent Glass
    const rHalo = GIMBAL_METRICS.R_HALO;
    const geoHalo = new THREE.TorusGeometry(rHalo, 0.048, 32, 200);
    this.ring4Halo = new THREE.Mesh(geoHalo, this.haloGlassMaterial);
    this.ring4Halo.rotation.x = Math.PI / 6;
    this.ring4Halo.rotation.y = Math.PI / 4;
    this.ringsGroup.add(this.ring4Halo);

    // Secondary decorative thin laser halo band inside the 42cm ring
    const geoHaloBand = new THREE.RingGeometry(rHalo - 0.22, rHalo + 0.22, 96);
    const haloBandMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(themeColorHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const haloBandMesh = new THREE.Mesh(geoHaloBand, haloBandMat);
    this.ring4Halo.add(haloBandMesh);

    // Add precision gimbal mechanical pivot nodes at joints
    this.buildGimbalBearingPivots(themeColorHex);

    // -------------------------------------------------------------
    // 3. CREATE BEZIER LIGHTNING ARCS
    // -------------------------------------------------------------
    this.createBezierArc(this.coreAnchor, this.ring1Inner, 0x00ffff, 1.4, 0);
    this.createBezierArc(this.ring1Inner, this.ring2Middle, 0x55ccff, 1.8, 1.2);
    this.createBezierArc(this.ring2Middle, this.ring3Outer, 0xffffff, 2.1, 2.4);
    this.createBezierArc(this.ring3Outer, this.ring4Halo, 0x00ffea, 1.6, 3.6);
    this.createBezierArc(this.coreAnchor, this.ring2Middle, 0x99ffff, 2.4, 4.8);
    this.createBezierArc(this.ring1Inner, this.ring3Outer, 0x00ffaa, 1.9, 0.6);

    // -------------------------------------------------------------
    // 4. CREATE ENERGY PACKETS (Plasmoids along Bezier curves)
    // -------------------------------------------------------------
    this.packetMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
    });

    for (let i = 0; i < 28; i++) {
      const pGeo = new THREE.SphereGeometry(0.042, 12, 12);
      const pMesh = new THREE.Mesh(pGeo, this.packetMaterial);
      const arcIdx = i % this.arcs.length;
      this.packetsGroup.add(pMesh);

      this.packets.push({
        mesh: pMesh,
        arcIndex: arcIdx,
        progress: (i / 28) * 1.0,
        speed: 0.003 + (i % 6) * 0.0014,
        scale: 0.8 + (i % 3) * 0.25,
      });
    }

    // -------------------------------------------------------------
    // 5. CREATE NEUMORPHIC GLASS HUD PANELS (85% Transparency & Raised Controls)
    // -------------------------------------------------------------
    this.buildNeumorphicGlassPanels(themeColors.hex);
  }

  /**
   * Navigational notches around the 18 cm Black Chrome Equatorial Ring
   */
  private addEquatorialAzimuthNotches(ring: THREE.Mesh, radius: number, glowHex: number) {
    const notchGroup = new THREE.Group();
    const notchGeo = new THREE.BoxGeometry(0.03, 0.02, 0.12);
    const notchMat = new THREE.MeshPhysicalMaterial({
      color: 0x020408,
      emissive: new THREE.Color(glowHex),
      emissiveIntensity: 0.7,
      metalness: 0.95,
      roughness: 0.06,
    });

    const totalNotches = 48;
    for (let i = 0; i < totalNotches; i++) {
      const ang = (i / totalNotches) * Math.PI * 2;
      const notch = new THREE.Mesh(notchGeo, notchMat);
      notch.position.set(Math.cos(ang) * radius, Math.sin(ang) * radius, 0);
      notch.rotation.z = ang;
      if (i % 12 === 0) {
        notch.scale.set(1.8, 2.2, 1.6);
      }
      notchGroup.add(notch);
    }
    ring.add(notchGroup);
  }

  /**
   * Bearing pivot spheres at gimbal intersections
   */
  private buildGimbalBearingPivots(glowHex: number) {
    const pivotGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pivotMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2430,
      emissive: new THREE.Color(glowHex),
      emissiveIntensity: 0.5,
      metalness: 0.96,
      roughness: 0.05,
      clearcoat: 1.0,
    });

    const radii = [
      GIMBAL_METRICS.R_INNER,
      GIMBAL_METRICS.R_MIDDLE,
      GIMBAL_METRICS.R_OUTER,
      GIMBAL_METRICS.R_HALO,
    ];

    radii.forEach((r, idx) => {
      for (let a = 0; a < 4; a++) {
        const angle = (a * Math.PI) / 2;
        const pivot = new THREE.Mesh(pivotGeo, pivotMat);
        pivot.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        this.ringsGroup.add(pivot);
        this.ringPivots.push(pivot);
      }
    });
  }

  /**
   * Creates a dynamic Cubic Bezier Lightning Arc
   */
  private createBezierArc(
    startObj: THREE.Object3D,
    endObj: THREE.Object3D,
    color: number,
    speed = 1.5,
    phase = 0
  ) {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    );

    const points = curve.getPoints(32);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    });
    this.arcMaterials.push(material);

    const line = new THREE.Line(geometry, material);
    this.arcGroup.add(line);

    const randAngle1 = Math.random() * Math.PI * 2;
    const randAngle2 = Math.random() * Math.PI * 2;

    this.arcs.push({
      line,
      curve,
      startObj,
      endObj,
      startOffset: new THREE.Vector3(Math.cos(randAngle1) * 0.4, Math.sin(randAngle1) * 0.4, 0),
      endOffset: new THREE.Vector3(Math.cos(randAngle2) * 0.4, 0, Math.sin(randAngle2) * 0.4),
      color,
      speed,
      phase,
      geometry,
      material,
    });
  }

  /**
   * NEUMORPHIC GLASS HUD PANELS (85% Transparency, Refraction, Frosted Edges, Internal Glow):
   * Features:
   * ◈ Data Nodes
   * ◉ Processing Indicators
   * ─── Dynamic Progress Channels ───
   * Hexagonal Neumorphic Controls
   * Raised Control Surfaces, Soft Shadows, Inset Status Wells, Micro-Buttons
   */
  private buildNeumorphicGlassPanels(glowHexStr: string) {
    const panelSpecs = [
      { tag: 'CORE SPHERE', metric: 'Ø 6.7 cm', status: 'FERROFLUID VOID ACTIVE', nodeVal: '99.42%' },
      { tag: 'INNER GIMBAL', metric: 'Ø 18 cm', status: 'BLACK CHROME EQUATOR', nodeVal: 'STABLE' },
      { tag: 'MID GYROSCOPE', metric: 'Ø 26 cm', status: 'TITANIUM PITCH AXIS', nodeVal: '1.42 RAD/S' },
      { tag: 'OUTER GIMBAL', metric: 'Ø 36 cm', status: 'GUNMETAL ROLL AXIS', nodeVal: 'TENSOR OK' },
      { tag: 'HOLO HALO', metric: 'Ø 42 cm', status: 'REFRACTIVE GLASS 85%', nodeVal: 'IOR 1.52' },
      { tag: 'DATA NODES', metric: '◈ QUANTUM', status: '── CHANNELS SYNC ──', nodeVal: '3.84 T' },
      { tag: 'PROCESSING', metric: '◉ 60 FPS', status: 'NEUMORPHIC WELLS OK', nodeVal: 'LOCKED' },
      { tag: 'CYBERNETIC', metric: 'FLUX RIG', status: 'LIVING HARMONIC PULSE', nodeVal: 'ACTIVE' },
    ];

    const panelGeo = new THREE.PlaneGeometry(1.35, 0.58);

    panelSpecs.forEach((spec, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 220;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.renderNeumorphicCanvas(ctx, spec, glowHexStr, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;

      // 85% Transparent Refractive Glass Panel Material
      const panelMat = new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
        opacity: 0.88,
        transmission: 0.85,
        roughness: 0.08,
        metalness: 0.15,
        ior: 1.52,
        thickness: 0.08,
        emissive: new THREE.Color(glowHexStr),
        emissiveIntensity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });

      const panelMesh = new THREE.Mesh(panelGeo, panelMat);
      const angle = (i / panelSpecs.length) * Math.PI * 2;
      // Positioned orbiting between the 36cm outer ring and 42cm halo
      const panelRadius = 5.85;

      const basePos = new THREE.Vector3(
        Math.cos(angle) * panelRadius,
        0.35 + ((i % 3) - 1) * 0.7,
        Math.sin(angle) * panelRadius
      );
      panelMesh.position.copy(basePos);
      panelMesh.lookAt(0, 0, 0);

      this.panelsGroup.add(panelMesh);

      this.panels.push({
        mesh: panelMesh,
        basePos,
        baseAngle: angle,
        radius: panelRadius,
        oscSpeed: 0.7 + (i % 3) * 0.35,
        phase: i * 0.8,
        canvas,
        ctx,
        texture,
      });
    });
  }

  /**
   * Paints high-contrast Neumorphic Glass UI on canvas:
   * Raised control surfaces, soft inset status wells, micro-buttons, hexagonal controls,
   * ◈ Data nodes, ◉ Processing indicators, and dynamic progress channels.
   */
  private renderNeumorphicCanvas(
    ctx: CanvasRenderingContext2D,
    spec: { tag: string; metric: string; status: string; nodeVal: string },
    glowHexStr: string,
    tick: number
  ) {
    const w = 512;
    const h = 220;
    ctx.clearRect(0, 0, w, h);

    // 1. Frosted Glass Backing with Soft Inner Shadow
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(10, 18, 28, 0.88)');
    grad.addColorStop(1, 'rgba(4, 8, 14, 0.94)');
    ctx.fillStyle = grad;
    this.drawRoundedRect(ctx, 4, 4, w - 8, h - 8, 16);
    ctx.fill();

    // 2. Frosted Edges & Specular Chamfer Rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, 4, 4, w - 8, h - 8, 16);
    ctx.stroke();

    ctx.strokeStyle = glowHexStr;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // 3. Header: Glass HUD Panel banner & Micro-Buttons
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(10, 10, w - 20, 36);

    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = glowHexStr;
    ctx.fillText(`███ ${spec.tag} // ${spec.metric} ███`, 22, 34);

    // Top-Right Raised Micro-Buttons
    for (let b = 0; b < 3; b++) {
      const bx = w - 80 + b * 20;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(bx + 1, 19 + 1, 14, 14); // soft drop shadow
      ctx.fillStyle = b === 0 ? glowHexStr : 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(bx, 19, 14, 14); // raised button
    }

    // 4. ◈ Data Node & ◉ Processing Indicator
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`◈ DATA NODE: ${spec.nodeVal}`, 22, 75);

    ctx.fillStyle = glowHexStr;
    ctx.fillText(`◉ PROCESSING: ${spec.status}`, 22, 105);

    // 5. ─── Dynamic Progress Channels ───
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('─── DYNAMIC PROGRESS CHANNELS ───', 22, 134);

    // Channel Track (Inset Status Well)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this.drawRoundedRect(ctx, 22, 144, 320, 14, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Active Segmented Channel Fill
    const fillW = 120 + Math.sin(tick * 2 + spec.tag.length) * 80 + 80;
    const channelGrad = ctx.createLinearGradient(22, 0, 22 + fillW, 0);
    channelGrad.addColorStop(0, glowHexStr);
    channelGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = channelGrad;
    this.drawRoundedRect(ctx, 24, 146, Math.max(8, fillW), 10, 4);
    ctx.fill();

    // 6. Hexagonal Neumorphic Controls (Raised control surfaces with soft bevels)
    const hexX = w - 90;
    const hexY = 135;
    const hexRadius = 38;
    this.drawHexagon(ctx, hexX + 2, hexY + 2, hexRadius, 'rgba(0,0,0,0.5)', null); // soft shadow
    this.drawHexagon(ctx, hexX, hexY, hexRadius, 'rgba(15, 26, 38, 0.95)', glowHexStr); // raised hex
    this.drawHexagon(ctx, hexX, hexY, hexRadius - 10, 'rgba(4, 8, 14, 0.9)', 'rgba(255,255,255,0.2)'); // inset well

    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = glowHexStr;
    ctx.textAlign = 'center';
    ctx.fillText('CTRL', hexX, hexY + 4);
    ctx.textAlign = 'left';

    // 7. Micro-Telemetry Footer
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('HEX NEUMORPHIC SURFACE • INSET WELL ACTIVE', 22, 185);
    ctx.fillText('GIMBAL LOCK: PASS • SYSTEM RESONANCE: 1.4 HZ', 22, 202);
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private drawHexagon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    fillColor: string,
    strokeColor: string | null
  ) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
  }

  /**
   * Updates glow theme colors across physical rings, arcs, panels, and pivots
   */
  public updateTheme(glowTheme: GlowTheme) {
    const themeColors = getGlowColors(glowTheme);
    const themeColor = new THREE.Color(themeColors.hex);

    this.blackChromeMaterial.emissive.copy(themeColor);
    this.titaniumMaterial.emissive.copy(themeColor);
    this.gunmetalMaterial.emissive.copy(themeColor);
    this.haloGlassMaterial.emissive.copy(themeColor);

    this.arcMaterials.forEach((mat) => {
      mat.color.copy(themeColor);
    });

    this.packetMaterial.color.copy(themeColor);
  }

  /**
   * Per-frame animation tick:
   * 1. Gyroscopic rotations:
   *    - Ring 1 (18cm Inner): ONLY spins around sphere equator (Y axis)
   *    - Ring 2 (26cm Middle): Pitch spin on X axis
   *    - Ring 3 (36cm Outer): Roll spin on Z axis
   *    - Ring 4 (42cm Halo): Compound inclined 3D spin
   * 2. Kinetic Living Architecture Pulse:
   *    AI Core drives the assembly, causing rings to subtly adapt, pulse, and scale:
   *    const pulse = 1 + Math.sin(time * 2.0) * 0.08;
   *    ring1.scale.setScalar(1 + (pulse - 1) * 0.6);
   *    ring2.scale.setScalar(1 + (pulse - 1) * 0.35);
   *    ring3.scale.setScalar(1 + (pulse - 1) * 0.2);
   *    ring4.scale.setScalar(1 + (pulse - 1) * 0.12);
   */
  public update(
    time: number,
    speedMultiplier = 1.0,
    isSurging = false,
    ringSpeeds?: { r1?: number; r2?: number; r3?: number; r4?: number },
    motionStyle: 'fluid' | 'rigid' | 'oscillating' | 'locked' = 'fluid'
  ) {
    const effSpeed = speedMultiplier;
    const isLocked = motionStyle === 'locked';
    const r1Factor = (ringSpeeds?.r1 ?? 1.0) * (isLocked ? 0 : 1);
    const r2Factor = (ringSpeeds?.r2 ?? 1.0) * (isLocked ? 0 : 1);
    const r3Factor = (ringSpeeds?.r3 ?? 1.0) * (isLocked ? 0 : 1);
    const r4Factor = (ringSpeeds?.r4 ?? 1.0) * (isLocked ? 0 : 1);
    const oscFactor = motionStyle === 'oscillating' ? Math.sin(time * 2.2) * 1.5 : 1.0;

    // -------------------------------------------------------------
    // 1. GIMBAL ROTATION
    // -------------------------------------------------------------
    // Ring 1 (18cm Black Chrome): ONLY spins around the sphere equator!
    this.ring1Inner.rotation.z += 0.007 * effSpeed * r1Factor * oscFactor;

    // Ring 2 (26cm Titanium): Continuous pitch spin on X axis
    this.ring2Middle.rotation.x -= 0.012 * effSpeed * r2Factor * oscFactor;

    // Ring 3 (36cm Gunmetal): Continuous roll spin on Z axis
    this.ring3Outer.rotation.z += 0.009 * effSpeed * r3Factor * oscFactor;

    // Ring 4 (42cm Halo): Compound inclined 3D rotation
    this.ring4Halo.rotation.y += 0.005 * effSpeed * r4Factor * oscFactor;
    this.ring4Halo.rotation.x += 0.004 * effSpeed * r4Factor * oscFactor;

    // Bearing pivots rotation
    this.ringPivots.forEach((p, idx) => {
      p.rotation.y += 0.01 * (idx % 2 === 0 ? 1 : -1) * effSpeed * (isLocked ? 0 : 1) * oscFactor;
    });

    // -------------------------------------------------------------
    // 2. GYROSCOPIC RIGIDITY: RINGS REMAIN UNAFFECTED BY FLUID DYNAMICS
    // -------------------------------------------------------------
    // Per user specification: Gimbal rings maintain strictly unwarped,
    // rigid physical dimensions (18cm, 26cm, 36cm, 42cm) and are completely
    // decoupled from ferrofluid surface displacement and dynamic scaling pulses.
    this.ring1Inner.scale.set(1, 1, 1);
    this.ring2Middle.scale.set(1, 1, 1);
    this.ring3Outer.scale.set(1, 1, 1);
    this.ring4Halo.scale.set(1, 1, 1);

    // -------------------------------------------------------------
    // 3. FLOATING NEUMORPHIC GLASS PANELS ANIMATION
    // -------------------------------------------------------------
    this.panels.forEach((p, idx) => {
      p.mesh.position.y = p.basePos.y + Math.sin(time * p.oscSpeed + p.phase) * 0.22;
      p.mesh.rotation.z = Math.sin(time * 0.5 + p.phase) * 0.08;
      // Subtle floating harmonic scale
      const panelPulse = 1 + Math.sin(time * 2.0 + p.phase) * 0.015;
      p.mesh.scale.set(panelPulse, panelPulse, panelPulse);
    });

    // -------------------------------------------------------------
    // 4. BEZIER LIGHTNING ARCS DYNAMIC UPDATE
    // -------------------------------------------------------------
    const startV = new THREE.Vector3();
    const endV = new THREE.Vector3();

    this.arcs.forEach((arc, index) => {
      arc.startObj.getWorldPosition(startV);
      arc.endObj.getWorldPosition(endV);

      this.arcGroup.worldToLocal(startV);
      this.arcGroup.worldToLocal(endV);

      const mid1 = startV.clone().lerp(endV, 0.33);
      const mid2 = startV.clone().lerp(endV, 0.66);

      const dir = endV.clone().sub(startV);
      const len = dir.length();
      if (len > 0.001) {
        dir.normalize();
        const perp1 = new THREE.Vector3(-dir.y, dir.x, dir.z).normalize();
        const perp2 = dir.clone().cross(perp1).normalize();

        const jitterFactor = (isSurging ? 0.38 : 0.2) * Math.min(2.0, len * 0.4);
        const j1 = Math.sin(time * 28 + index * 4.3) * jitterFactor + (Math.sin(time * 60 + index) * 0.05);
        const j2 = Math.cos(time * 24 + index * 3.7) * jitterFactor + (Math.cos(time * 54 + index) * 0.05);

        mid1.addScaledVector(perp1, j1).addScaledVector(perp2, j2);
        mid2.addScaledVector(perp1, -j2).addScaledVector(perp2, j1);
      }

      arc.curve.v0.copy(startV);
      arc.curve.v1.copy(mid1);
      arc.curve.v2.copy(mid2);
      arc.curve.v3.copy(endV);

      const points = arc.curve.getPoints(32);
      arc.geometry.setFromPoints(points);

      const flicker = 0.55 + Math.sin(time * 35 + index * 8) * 0.25 + (isSurging ? 0.25 : 0);
      arc.material.opacity = Math.max(0.2, Math.min(1.0, flicker));
    });

    // -------------------------------------------------------------
    // 5. ENERGY PACKETS TRAVERSING BEZIER CURVES
    // -------------------------------------------------------------
    this.packets.forEach((packet) => {
      const arc = this.arcs[packet.arcIndex];
      if (!arc) return;

      packet.progress += packet.speed * effSpeed;
      if (packet.progress >= 1.0) {
        packet.progress = 0;
        if (Math.random() < 0.25) {
          packet.arcIndex = Math.floor(Math.random() * this.arcs.length);
        }
      }

      const pt = arc.curve.getPointAt(packet.progress);
      packet.mesh.position.copy(pt);

      const pulseScale = packet.scale * (0.85 + Math.sin(time * 12 + packet.progress * Math.PI) * 0.25);
      packet.mesh.scale.set(pulseScale, pulseScale, pulseScale);
    });
  }

  /**
   * Visibility toggle
   */
  public setVisible(
    ringsVisible: boolean,
    arcsVisible: boolean,
    panelsVisible: boolean
  ) {
    this.ringsGroup.visible = ringsVisible;
    this.arcGroup.visible = arcsVisible;
    this.packetsGroup.visible = arcsVisible;
    this.panelsGroup.visible = panelsVisible;
  }

  /**
   * Cleanup memory
   */
  public dispose() {
    this.blackChromeMaterial.dispose();
    this.titaniumMaterial.dispose();
    this.gunmetalMaterial.dispose();
    this.haloGlassMaterial.dispose();
    this.arcMaterials.forEach((m) => m.dispose());
    this.panels.forEach((p) => {
      (p.mesh.material as THREE.Material).dispose();
      p.texture.dispose();
    });
    this.packetMaterial.dispose();
  }
}
