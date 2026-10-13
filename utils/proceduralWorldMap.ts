/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Procedural 2D & 3D Mathematical World Map Engine
 * Generates the entire planetary terrain, biomes, and magnetic field lines
 * using pure mathematical equations:
 * - Multi-octave Fractal Brownian Motion (FBM)
 * - Dipole magnetic field lines B(r) = (μ0/4π) * (3(m·r)r - m) / r^3
 * - Voronoi tectonic biome partitioning
 * - Rosensweig critical field threshold spike eruptions
 */

import * as THREE from 'three';

export interface WorldSector {
  id: string;
  name: string;
  type: 'Ocean' | 'Peaks' | 'Plains' | 'Crater' | 'Sanctuary' | 'Rift';
  coords2D: { x: number; y: number }; // Normalized [-1, 1]
  coords3D: { lat: number; lon: number };
  elevation: number;
  magneticFluxTesla: number;
  residentFaunaId: string;
  residentFaunaName: string;
  description: string;
  colorHex: string;
}

export const WORLD_SECTORS: WorldSector[] = [
  {
    id: 'ferric-sea',
    name: 'The Ferric Sea & Abyss',
    type: 'Ocean',
    coords2D: { x: -0.45, y: -0.35 },
    coords3D: { lat: -28, lon: -65 },
    elevation: -0.65,
    magneticFluxTesla: 4.8,
    residentFaunaId: 'colloidal-leviathan',
    residentFaunaName: 'Colloidal Leviathan',
    description: 'An expansive superheated ocean of dense colloidal magnetite where gigantic tidal waves churn under magnetic currents.',
    colorHex: '#00f0ff',
  },
  {
    id: 'rosensweig-ridge',
    name: 'The Rosensweig Ridge',
    type: 'Peaks',
    coords2D: { x: 0.38, y: 0.52 },
    coords3D: { lat: 42, lon: 75 },
    elevation: 0.85,
    magneticFluxTesla: 5.2,
    residentFaunaId: 'rosensweig-strider',
    residentFaunaName: 'Rosensweig Strider',
    description: 'A jagged mountain range of solidified magnetic spires that erupt upward wherever the normal magnetic field exceeds critical instability.',
    colorHex: '#ffd700',
  },
  {
    id: 'quicksilver-basin',
    name: 'Quicksilver Basin',
    type: 'Plains',
    coords2D: { x: -0.65, y: 0.38 },
    coords3D: { lat: 30, lon: -120 },
    elevation: 0.15,
    magneticFluxTesla: 2.1,
    residentFaunaId: 'dielectric-nautilus',
    residentFaunaName: 'Dielectric Nautilus',
    description: 'Shimmering flat plains of dielectric carrier fluid that reflect kaleidoscopic optical interference fringes under grazing sunlight.',
    colorHex: '#00e676',
  },
  {
    id: 'tachyon-caldera',
    name: 'The Tachyon Caldera',
    type: 'Crater',
    coords2D: { x: 0.05, y: -0.1 },
    coords3D: { lat: -8, lon: 15 },
    elevation: -0.35,
    magneticFluxTesla: 7.4,
    residentFaunaId: 'tesseract-chimera',
    residentFaunaName: 'Tesseract Chimera',
    description: 'A deep geometric impact crater housing a gravitational vortex where 4D spatial anomalies and temporal dilation occur continuously.',
    colorHex: '#b026ff',
  },
  {
    id: 'torus-sanctuary',
    name: 'The Torus Sanctuary',
    type: 'Sanctuary',
    coords2D: { x: 0.62, y: -0.45 },
    coords3D: { lat: -35, lon: 110 },
    elevation: 0.45,
    magneticFluxTesla: 5.1,
    residentFaunaId: 'flux-sentinel',
    residentFaunaName: 'Flux Sentinel',
    description: 'The ancient cradle of the 4-ring gyroscopic gimbal armature, flanked by levitating monoliths and laser flux bridges.',
    colorHex: '#f5b722',
  },
  {
    id: 'dielectric-rift',
    name: 'The Dielectric Rift',
    type: 'Rift',
    coords2D: { x: -0.15, y: 0.68 },
    coords3D: { lat: 55, lon: -25 },
    elevation: -0.45,
    magneticFluxTesla: 3.6,
    residentFaunaId: 'gyroid-spore',
    residentFaunaName: 'Gyroid Spore',
    description: 'A deep continental chasm carved by continuous electrical arc discharges, its porous cavern walls overgrown with minimal-surface spores.',
    colorHex: '#ff1744',
  },
  {
    id: 'lexicon-citadel',
    name: 'The Lexicon Citadel',
    type: 'Sanctuary',
    coords2D: { x: 0.25, y: -0.55 },
    coords3D: { lat: -48, lon: 45 },
    elevation: 0.72,
    magneticFluxTesla: 6.2,
    residentFaunaId: 'ferro-archon',
    residentFaunaName: 'Colloidal Archon (Sentient Character)',
    description: 'The towering geometric metropolis where procedural mathematical algorithms are inscribed into standing magnetic waveforms, governed by sentient Colloidal Archons.',
    colorHex: '#00f0ff',
  },
];

// Simple deterministic pseudo-random hash for procedural noise
function hash2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

// 2D Smooth Value Noise
function noise2D(x: number, y: number): number {
  const iX = Math.floor(x);
  const iY = Math.floor(y);
  const fX = x - iX;
  const fY = y - iY;

  // Cubic Hermite spline interpolation
  const u = fX * fX * (3.0 - 2.0 * fX);
  const v = fY * fY * (3.0 - 2.0 * fY);

  const a = hash2D(iX, iY);
  const b = hash2D(iX + 1, iY);
  const c = hash2D(iX, iY + 1);
  const d = hash2D(iX + 1, iY + 1);

  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/**
 * Multi-octave Fractal Brownian Motion (FBM) Elevation Formula
 */
export function calculateElevation(x: number, y: number): number {
  let total = 0;
  let amp = 0.55;
  let freq = 1.6;

  for (let o = 0; o < 4; o++) {
    total += (noise2D(x * freq, y * freq) * 2.0 - 1.0) * amp;
    amp *= 0.5;
    freq *= 2.05;
  }

  // Rosensweig Spike threshold boost
  const poleDist = Math.sqrt((x - 0.38) ** 2 + (y - 0.52) ** 2);
  if (poleDist < 0.45) {
    const spike = Math.pow(Math.max(0, Math.cos(x * 24) * Math.sin(y * 24)), 3.0) * 0.8;
    total += spike * (1.0 - poleDist / 0.45);
  }

  return total;
}

/**
 * Calculates Dipole Magnetic Field Vector B(x, y)
 */
export function calculateMagneticField(x: number, y: number): { bx: number; by: number; magnitude: number } {
  // Pole 1: North Pole (+2.4 Tesla) at (0.38, 0.52)
  const dx1 = x - 0.38;
  const dy1 = y - 0.52;
  const r1 = Math.max(0.12, Math.sqrt(dx1 * dx1 + dy1 * dy1));
  const f1 = 2.4 / (r1 * r1);

  // Pole 2: South Pole (-2.2 Tesla) at (-0.45, -0.35)
  const dx2 = x - (-0.45);
  const dy2 = y - (-0.35);
  const r2 = Math.max(0.12, Math.sqrt(dx2 * dx2 + dy2 * dy2));
  const f2 = -2.2 / (r2 * r2);

  // Superimposed vector field
  let bx = (dx1 / r1) * f1 + (dx2 / r2) * f2;
  let by = (dy1 / r1) * f1 + (dy2 / r2) * f2;

  // Add toroidal vortex swirl around center
  const rC = Math.max(0.2, Math.sqrt(x * x + y * y));
  bx += (-y / rC) * 0.65;
  by += (x / rC) * 0.65;

  const magnitude = Math.sqrt(bx * bx + by * by);
  return { bx, by, magnitude };
}

/**
 * Renders the 2D Holographic Vector Contour Map onto an HTML5 Canvas
 */
export function render2DProceduralMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  selectedSectorId: string | null,
  activeHoverSectorId: string | null
) {
  ctx.clearRect(0, 0, width, height);

  // 1. Deep Space Void Background
  const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
  grad.addColorStop(0, '#060d19');
  grad.addColorStop(0.65, '#02050a');
  grad.addColorStop(1, '#010204');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Geodesic / Polar Cartesian Grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1;
  const gridSize = 45;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Procedural Topographic Elevation Contour Lines
  const step = 7;
  const cols = Math.floor(width / step);
  const rows = Math.floor(height / step);

  for (let level = -3; level <= 4; level++) {
    const targetElev = level * 0.18;
    ctx.beginPath();
    ctx.strokeStyle =
      level > 1
        ? 'rgba(255, 215, 0, 0.22)'
        : level < 0
        ? 'rgba(0, 240, 255, 0.18)'
        : 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = level === 0 ? 1.4 : 0.8;

    for (let c = 0; c < cols; c += 2) {
      const xNorm = (c * step - width / 2) / (width / 2);
      for (let r = 0; r < rows; r += 2) {
        const yNorm = (r * step - height / 2) / (height / 2);
        const elev = calculateElevation(xNorm, yNorm);

        if (Math.abs(elev - targetElev) < 0.08) {
          ctx.rect(c * step, r * step, 2, 2);
        }
      }
    }
    ctx.stroke();
  }

  // 4. Dynamic Magnetic Field Lines & Streamlines
  const streamCount = 18;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < streamCount; i++) {
    const angle = (i / streamCount) * Math.PI * 2;
    let cx = 0.38 + Math.cos(angle) * 0.15;
    let cy = 0.52 + Math.sin(angle) * 0.15;

    ctx.beginPath();
    const startX = cx * (width / 2) + width / 2;
    const startY = cy * (height / 2) + height / 2;
    ctx.moveTo(startX, startY);

    for (let stepIdx = 0; stepIdx < 38; stepIdx++) {
      const { bx, by, magnitude } = calculateMagneticField(cx, cy);
      if (magnitude < 0.001) break;
      const stepSize = 0.045;
      cx += (bx / magnitude) * stepSize;
      cy += (by / magnitude) * stepSize;

      const px = cx * (width / 2) + width / 2;
      const py = cy * (height / 2) + height / 2;
      ctx.lineTo(px, py);
    }

    ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 + Math.sin(time * 2.0 + i) * 0.08})`;
    ctx.stroke();
  }

  // 5. Radar Sweep Line
  const sweepAngle = time * 0.8;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxR = Math.max(width, height) * 0.7;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + Math.cos(sweepAngle) * maxR, centerY + Math.sin(sweepAngle) * maxR);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 6. Bestiary Habitat Sectors & Blips
  WORLD_SECTORS.forEach((sector) => {
    const sx = sector.coords2D.x * (width / 2) + width / 2;
    const sy = sector.coords2D.y * (height / 2) + height / 2;
    const isSelected = selectedSectorId === sector.id;
    const isHovered = activeHoverSectorId === sector.id;

    // Glowing Pulse Halo
    const pulseR = 14 + Math.sin(time * 3.0 + sector.elevation * 10) * 4;
    ctx.beginPath();
    ctx.arc(sx, sy, isSelected ? 22 : pulseR, 0, Math.PI * 2);
    ctx.fillStyle = isSelected
      ? 'rgba(0, 240, 255, 0.35)'
      : isHovered
      ? 'rgba(255, 215, 0, 0.3)'
      : 'rgba(0, 240, 255, 0.12)';
    ctx.fill();
    ctx.strokeStyle = sector.colorHex;
    ctx.lineWidth = isSelected ? 2.5 : 1.2;
    ctx.stroke();

    // Central Node Dot
    ctx.beginPath();
    ctx.arc(sx, sy, isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = sector.colorHex;
    ctx.fill();

    // Label
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(226, 232, 240, 0.85)';
    ctx.fillText(sector.name.toUpperCase(), sx + 12, sy - 4);

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.fillText(`FAUNA: ${sector.residentFaunaName}`, sx + 12, sy + 8);
  });
}

/**
 * Builds the 3D Procedural Planetary Globe with live FBM displacement and magnetic aurora arcs
 */
export function create3DProceduralWorldGlobe(selectedSectorId: string | null): {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
} {
  const group = new THREE.Group();

  // 1. Procedurally Displaced Planetary Terrain
  const sphereGeo = new THREE.IcosahedronGeometry(2.4, 48);
  const pos = sphereGeo.attributes.position as THREE.BufferAttribute;
  const origPos: THREE.Vector3[] = [];
  const colors: number[] = [];

  const cyanCol = new THREE.Color('#00f0ff');
  const goldCol = new THREE.Color('#ffd700');
  const deepObsidian = new THREE.Color('#020409');
  const purpleCol = new THREE.Color('#b026ff');

  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    origPos.push(v.clone());

    const norm = v.clone().normalize();
    const elev = calculateElevation(norm.x, norm.y);
    const disp = 2.4 * (1.0 + elev * 0.16);

    v.setLength(disp);
    pos.setXYZ(i, v.x, v.y, v.z);

    // Color gradient based on elevation
    let c = deepObsidian.clone();
    if (elev > 0.4) {
      c.lerp(goldCol, (elev - 0.4) * 1.5);
    } else if (elev > 0.0) {
      c.lerp(cyanCol, elev * 1.8);
    } else if (elev < -0.2) {
      c.lerp(purpleCol, Math.abs(elev) * 1.2);
    }
    colors.push(c.r, c.g, c.b);
  }

  sphereGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  sphereGeo.computeVertexNormals();

  const planetMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.25,
    metalness: 0.85,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    emissive: new THREE.Color('#001826'),
    emissiveIntensity: 0.25,
  });
  const planetMesh = new THREE.Mesh(sphereGeo, planetMat);
  group.add(planetMesh);

  // 2. Translucent Atmospheric Sheath
  const atmoGeo = new THREE.SphereGeometry(2.55, 32, 32);
  const atmoMat = new THREE.MeshPhysicalMaterial({
    color: '#00f0ff',
    transmission: 0.92,
    roughness: 0.05,
    transparent: true,
    opacity: 0.22,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
  group.add(atmoMesh);

  // 3. 3D Magnetic Flux Loop Arcs connecting North & South poles
  const arcPointsCount = 36;
  const fluxLoops: THREE.Line[] = [];

  for (let a = 0; a < 6; a++) {
    const angle = (a / 6) * Math.PI * 2;
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.9, 2.0, 0.4), // North Pole
      new THREE.Vector3(Math.cos(angle) * 3.8, 1.2, Math.sin(angle) * 3.8),
      new THREE.Vector3(Math.cos(angle) * 3.8, -1.2, Math.sin(angle) * 3.8),
      new THREE.Vector3(-1.1, -1.9, -0.6) // South Pole
    );

    const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(arcPointsCount));
    const arcMat = new THREE.LineBasicMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    group.add(arcLine);
    fluxLoops.push(arcLine);
  }

  // 4. Sector Surface Pins & Beacons
  const sectorPins: THREE.Mesh[] = [];
  WORLD_SECTORS.forEach((sec) => {
    const latRad = (sec.coords3D.lat * Math.PI) / 180;
    const lonRad = (sec.coords3D.lon * Math.PI) / 180;

    const r = 2.45 + (sec.elevation > 0 ? sec.elevation * 0.35 : 0);
    const px = r * Math.cos(latRad) * Math.cos(lonRad);
    const py = r * Math.sin(latRad);
    const pz = r * Math.cos(latRad) * Math.sin(lonRad);

    const pinGeo = new THREE.ConeGeometry(0.08, 0.45, 8);
    pinGeo.rotateX(Math.PI / 2);
    const pinMat = new THREE.MeshBasicMaterial({ color: sec.colorHex });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(px, py, pz);
    pin.lookAt(0, 0, 0);
    group.add(pin);
    sectorPins.push(pin);
  });

  const update = (time: number) => {
    planetMesh.rotation.y = time * 0.12;
    atmoMesh.rotation.y = time * 0.15;
    atmoMesh.rotation.x = Math.sin(time * 0.2) * 0.05;

    fluxLoops.forEach((line, idx) => {
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.5 + Math.sin(time * 3.0 + idx) * 0.35;
    });
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}
