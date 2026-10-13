/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Procedural Mathematical Fauna & Bestiary Engine
 * Every character and fauna model is synthesized using pure mathematical procedural algorithms:
 * - Parametric trigonometric curves & inverse kinematics
 * - Logarithmic spirals & superellipsoids
 * - 4D SO(4) rotation stereographic projections
 * - Triply periodic minimal surfaces (Gyroid)
 * - Kepler-Poinsot polyhedral lattices
 */

import * as THREE from 'three';

export interface ProceduralFaunaSpec {
  id: string;
  name: string;
  scientificName: string;
  classification: string;
  category: 'character' | 'fauna' | 'cosmic';
  habitatRegionId: string;
  habitatName: string;
  threatLevel: 'Docile' | 'Resonant' | 'Predatory' | 'Cosmic';
  magneticResonanceTesla: number;
  description: string;
  lore: string;
  mathematicalBasis: {
    title: string;
    formula: string;
    explanation: string;
    variables: { name: string; symbol: string; default: number; min: number; max: number; step: number }[];
  };
}

export const BESTIARY_SPECS: ProceduralFaunaSpec[] = [
  {
    id: 'ferro-archon',
    name: 'Colloidal Archon (Sentient Character)',
    scientificName: 'Homo Colloidalis Mathematicus',
    classification: 'Sentient Procedural Character Model',
    category: 'character',
    habitatRegionId: 'torus-sanctuary',
    habitatName: 'The Lexicon Citadel & Torus Sanctuary',
    threatLevel: 'Resonant',
    magneticResonanceTesla: 6.2,
    description: 'A sentient bipedal humanoid synthesized through mathematical procedural kinematics: a harmonic travelling-wave spine, inverse-kinematic arms, floating magnetic hand nodes, and an oscillating dipole core.',
    lore: 'Custodians of the Lexicon archives. Possessing no internal skeleton, their bipedal form is held in dynamic equilibrium by standing wave nodal interference and localized Lorentz forces.',
    mathematicalBasis: {
      title: 'Kinematic Harmonic Spine & Superellipsoid Anatomy',
      formula: 'S(z, t) = (A \\sin(\\omega t + k z), A \\cos(\\omega t + k z), z), \\quad \\theta_{\\text{arm}}(t) = \\theta_0 \\sin(\\omega_a t + \\phi)',
      explanation: 'Vertebral nodes follow dual traveling sinusoidal spines with tapering toroidal ribbing. Arms calculate two-link inverse kinematics with floating magnetic hand nodes and a crowning halo of Rosensweig spikes.',
      variables: [
        { name: 'Spine Undulation', symbol: 'ω', default: 1.8, min: 0.5, max: 4.0, step: 0.1 },
        { name: 'Limb Articulation', symbol: 'L', default: 1.25, min: 0.6, max: 2.2, step: 0.1 },
        { name: 'Crown Spikes', symbol: 'N_c', default: 8, min: 4, max: 16, step: 1 },
        { name: 'Core Dipole Flux', symbol: 'B_0', default: 1.6, min: 0.5, max: 3.0, step: 0.1 },
      ],
    },
  },
  {
    id: 'chronos-oracle',
    name: 'Chronos Oracle (Spatial Lexicon Sentinel)',
    scientificName: 'Oraculum Chronometricus',
    classification: 'Procedural Character / Spatial Oracle',
    category: 'character',
    habitatRegionId: 'tachyon-caldera',
    habitatName: 'The Tachyon Caldera',
    threatLevel: 'Cosmic',
    magneticResonanceTesla: 7.8,
    description: 'A floating holographic character model crowned by concentric celestial rings and draped in procedural ribbon splines that twist along dynamic spherical harmonics.',
    lore: 'Ancient guardian of the tachyon horizon. It translates quantum wavefunctions into audible speech harmonics, predicting magnetic flux shifts across the planetary grid.',
    mathematicalBasis: {
      title: 'Spherical Harmonic Cranium & Cloth Splines',
      formula: 'Y_l^m(\\theta, \\phi) = \\sqrt{\\frac{(2l+1)}{4\\pi}\\frac{(l-m)!}{(l+m)!}} P_l^m(\\cos\\theta) e^{i m \\phi}',
      explanation: 'Cranial surface coordinates deform dynamically using order-4 spherical harmonics. Flowing vestments follow parametric Hermite spline ribbons with buoyant hydrodynamic drag.',
      variables: [
        { name: 'Harmonic Degree', symbol: 'l', default: 3, min: 1, max: 6, step: 1 },
        { name: 'Vestment Flurry', symbol: 'v_f', default: 2.1, min: 0.5, max: 4.5, step: 0.1 },
        { name: 'Ring Gyro Precession', symbol: 'Ω_o', default: 1.5, min: 0.4, max: 3.5, step: 0.1 },
        { name: 'Oracle Radiance', symbol: 'I_o', default: 2.0, min: 0.5, max: 3.5, step: 0.1 },
      ],
    },
  },
  {
    id: 'colloidal-leviathan',
    name: 'Colloidal Leviathan (Ferro-Wyrm)',
    scientificName: 'Draco Magnetohydrodynamica',
    classification: 'Macro-Colloidal Apex Organism',
    category: 'fauna',
    habitatRegionId: 'ferric-sea',
    habitatName: 'The Ferric Sea & Deep Abyss',
    threatLevel: 'Cosmic',
    magneticResonanceTesla: 4.8,
    description: 'A colossal serpent of viscous ferrofluid navigating the deep magnetic trenches, composed of articulated magnetic vertebrae held together by surface tension.',
    lore: 'Ancient explorers believed the Leviathan was the living circulatory system of the magnetic core. Its movements induce localized magnetic storms, churning the ferric sea into cresting Rosensweig tidal waves.',
    mathematicalBasis: {
      title: 'Parametric Sinusoidal Kinematic Spline',
      formula: 'x(s, t) = A_1 \\sin(\\omega_1 t + k_1 s), \\quad y(s, t) = A_2 \\cos(\\omega_2 t + k_2 s), \\quad R(s) = R_0 \\sin(\\pi s / L)^{0.75}',
      explanation: 'Vertebral coordinates follow dual orthogonal harmonic traveling waves. Each segment radius tapers according to a fractional-power sine envelope with parametric ribbed rings.',
      variables: [
        { name: 'Wave Frequency', symbol: 'ω', default: 2.2, min: 0.5, max: 5.0, step: 0.1 },
        { name: 'Undulation Amplitude', symbol: 'A', default: 0.65, min: 0.1, max: 1.5, step: 0.05 },
        { name: 'Vertebrae Segments', symbol: 'N', default: 36, min: 16, max: 64, step: 2 },
        { name: 'Spike Eruption', symbol: 'σ', default: 1.4, min: 0.2, max: 3.0, step: 0.1 },
      ],
    },
  },
  {
    id: 'rosensweig-strider',
    name: 'Rosensweig Strider (Magnetic Arachnid)',
    scientificName: 'Arachnida Ferro-Resonantia',
    classification: 'Hexapodal Magnetic Arthropod',
    category: 'fauna',
    habitatRegionId: 'rosensweig-ridge',
    habitatName: 'The Rosensweig Ridge',
    threatLevel: 'Predatory',
    magneticResonanceTesla: 3.2,
    description: 'An agile, predatory entity that skitters across high magnetic gradient peaks. Its 6 articulated legs are powered by inverse-kinematic flux coils.',
    lore: 'Striders hunt by sensing micro-fluctuations in localized magnetic field lines. When prey approaches, their thorax erupts in dense needle-sharp spikes before pouncing.',
    mathematicalBasis: {
      title: 'Inverse-Kinematic Superellipsoid & Gait Trigonometry',
      formula: '\\left(|x/a|^r + |y/b|^r\\right)^{s/r} + |z/c|^s = 1, \\quad \\theta_k(t) = \\theta_0 \\sin(\\omega t + \\phi_k)',
      explanation: 'The cephalothorax is modeled by a superellipsoid with pinching exponent s/r = 2.4. Six jointed legs calculate footfall positions using cyclical phase-shifted gait harmonics.',
      variables: [
        { name: 'Gait Speed', symbol: 'v', default: 3.0, min: 0.8, max: 6.0, step: 0.2 },
        { name: 'Leg Reach', symbol: 'L', default: 1.2, min: 0.6, max: 2.0, step: 0.1 },
        { name: 'Cephalic Spikes', symbol: 'N_s', default: 12, min: 4, max: 24, step: 1 },
        { name: 'Thorax Bulge', symbol: 'r', default: 2.4, min: 1.0, max: 4.0, step: 0.2 },
      ],
    },
  },
  {
    id: 'dielectric-nautilus',
    name: 'Dielectric Nautilus (Void Jelly)',
    scientificName: 'Nautilus Dielectricus',
    classification: 'Hydrodynamic Void Pelagic',
    category: 'fauna',
    habitatRegionId: 'quicksilver-basin',
    habitatName: 'Quicksilver Basin & Shimmer Lakes',
    threatLevel: 'Docile',
    magneticResonanceTesla: 1.9,
    description: 'A graceful, translucent aquatic organism featuring a logarithmic spiral shell and undulating bioluminescent cilia that shimmer with thin-film iridescence.',
    lore: 'Schools of Dielectric Nautili drift through carrier fluid currents like living prisms. Their outer mantle decomposes incoming light into pure spectral interference fringes.',
    mathematicalBasis: {
      title: 'Parametric Logarithmic Spiral & Bessel Mantle',
      formula: 'r(\\theta) = a \\cdot e^{b \\theta}, \\quad z(r, \\theta, t) = J_0(k r) \\cdot \\cos(\\omega t) + \\sin(m \\theta)',
      explanation: 'Shell chambers follow the golden logarithmic spiral ratio. The bell executes radial contractions driven by zero-order Bessel harmonic standing waves, trailing 8 spline tentacles.',
      variables: [
        { name: 'Spiral Factor', symbol: 'b', default: 0.175, min: 0.1, max: 0.35, step: 0.01 },
        { name: 'Pulse Resonance', symbol: 'ω', default: 1.8, min: 0.5, max: 4.0, step: 0.1 },
        { name: 'Tentacle Sweep', symbol: 'L_t', default: 1.8, min: 0.8, max: 3.0, step: 0.1 },
        { name: 'Thin-Film Sheen', symbol: 'η', default: 1.6, min: 0.5, max: 3.0, step: 0.1 },
      ],
    },
  },
  {
    id: 'tesseract-chimera',
    name: 'Tesseract Chimera (Hyper-Spatial Entity)',
    scientificName: 'Polychoron Quaternio',
    classification: '4D Hyper-Spatial Manifestation',
    category: 'cosmic',
    habitatRegionId: 'tachyon-caldera',
    habitatName: 'The Tachyon Caldera',
    threatLevel: 'Cosmic',
    magneticResonanceTesla: 7.4,
    description: 'A trans-dimensional entity whose 4D hypercube lattice rotates continuously through 4-space, casting 3D shadow projections into the physical world.',
    lore: 'Observed near the tachyon event horizon. Touching its projected vertices causes temporal anomalies, as its inner and outer cells periodically turn themselves inside-out.',
    mathematicalBasis: {
      title: '4D SO(4) Double Rotation & Stereographic Projection',
      formula: 'P_{3D}(x, y, z, w) = \\frac{d}{d - w} \\cdot (x, y, z), \\quad \\begin{pmatrix} x\' \\\\ w\' \\end{pmatrix} = R(\\alpha) \\begin{pmatrix} x \\\\ w \\end{pmatrix}',
      explanation: 'All 16 vertices of a 4-dimensional tesseract undergo compound rotations in XW and YZ planes before stereographic projection onto 3D coordinates with dynamic magnetic nodal joints.',
      variables: [
        { name: '4D Rotation Speed', symbol: 'α_t', default: 1.2, min: 0.2, max: 3.5, step: 0.1 },
        { name: 'Projection Depth', symbol: 'd', default: 2.8, min: 1.8, max: 5.0, step: 0.1 },
        { name: 'Node Radiance', symbol: 'I_n', default: 1.5, min: 0.5, max: 3.0, step: 0.1 },
        { name: 'Flux Struts', symbol: 'k_s', default: 1.2, min: 0.5, max: 2.5, step: 0.1 },
      ],
    },
  },
  {
    id: 'flux-sentinel',
    name: 'Pyramidal Flux Sentinel (Geometric Guardian)',
    scientificName: 'Custos Polyhedricus',
    classification: 'Resonant Crystalline Automaton',
    category: 'character',
    habitatRegionId: 'torus-sanctuary',
    habitatName: 'The Torus Sanctuary',
    threatLevel: 'Resonant',
    magneticResonanceTesla: 5.1,
    description: 'A levitating guardian formed from stellated Kepler-Poinsot polyhedra surrounded by nested orbital gyroscopic rings that channel pure magnetic flux lasers.',
    lore: 'Constructed by the ancient Ring-Makers to protect the central gimbal axis. It emits resonant acoustic frequencies that align stray ferrofluid particles into perfect geometric crystals.',
    mathematicalBasis: {
      title: 'Stellated Kepler-Poinsot Polyhedra & Euler Gimbal Equations',
      formula: 'V_k = R \\cdot (\\pm 1, \\pm \\phi, \\pm 1/\\phi), \\quad \\phi = \\frac{1+\\sqrt{5}}{2}, \\quad \\vec{\\Omega} = (\\omega_1, \\omega_2, \\omega_3)',
      explanation: 'Compound icosahedral geometry based on the golden ratio φ. Three concentric gold gimbal rings orbit along orthogonal Euler angles, projecting Hermite laser arcs between apex points.',
      variables: [
        { name: 'Ring Gyro Precession', symbol: 'Ω', default: 1.6, min: 0.5, max: 4.0, step: 0.1 },
        { name: 'Stellation Depth', symbol: 'h_s', default: 1.3, min: 0.5, max: 2.5, step: 0.1 },
        { name: 'Laser Flux Arc', symbol: 'E_a', default: 1.8, min: 0.4, max: 3.0, step: 0.1 },
        { name: 'Core Levitron', symbol: 'z_0', default: 1.0, min: 0.2, max: 2.0, step: 0.1 },
      ],
    },
  },
  {
    id: 'gyroid-spore',
    name: 'Gyroid Spore (Minimal Surface Colony)',
    scientificName: 'Gyroidis Cellularis',
    classification: 'Triply-Periodic Bio-Crystalline Colony',
    category: 'fauna',
    habitatRegionId: 'dielectric-rift',
    habitatName: 'The Dielectric Rift',
    threatLevel: 'Docile',
    magneticResonanceTesla: 2.4,
    description: 'A labyrinthine living sponge shaped like a Schoen Gyroid triply periodic minimal surface, hosting pulsating symbiotic ferro-spores in its infinite non-intersecting channels.',
    lore: 'The Gyroid Spore possesses infinite internal surface area within a finite volume. It breathes in ionized carrier gas and condenses it into pure, super-paramagnetic nectar.',
    mathematicalBasis: {
      title: 'Schoen Gyroid Minimal Surface Level Set',
      formula: 'f(x, y, z) = \\sin(x) \\cos(y) + \\sin(y) \\cos(z) + \\sin(z) \\cos(x) = C(t)',
      explanation: 'Evaluates the zero-mean-curvature gyroid isosurface across a discrete 3D spatial grid, with dynamic boundary iso-value C(t) simulating cellular respiration.',
      variables: [
        { name: 'Cellular Frequency', symbol: 'k_g', default: 2.2, min: 1.0, max: 4.5, step: 0.1 },
        { name: 'Breathing Oscillation', symbol: 'C_0', default: 0.35, min: 0.05, max: 0.8, step: 0.05 },
        { name: 'Membrane Glow', symbol: 'I_g', default: 1.6, min: 0.5, max: 3.0, step: 0.1 },
        { name: 'Tachyon Drift', symbol: 'v_d', default: 1.0, min: 0.2, max: 2.5, step: 0.1 },
      ],
    },
  },
];

/**
 * Creates the live procedural Three.js 3D entity group for any fauna in the Bestiary
 */
export function createProceduralFaunaObject(specId: string, params: Record<string, number> = {}): {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
  dispose: () => void;
} {
  const group = new THREE.Group();

  switch (specId) {
    case 'ferro-archon':
      return buildFerroArchon(group, params);
    case 'chronos-oracle':
      return buildChronosOracle(group, params);
    case 'colloidal-leviathan':
      return buildColloidalLeviathan(group, params);
    case 'rosensweig-strider':
      return buildRosensweigStrider(group, params);
    case 'dielectric-nautilus':
      return buildDielectricNautilus(group, params);
    case 'tesseract-chimera':
      return buildTesseractChimera(group, params);
    case 'flux-sentinel':
      return buildFluxSentinel(group, params);
    case 'gyroid-spore':
    default:
      return buildGyroidSpore(group, params);
  }
}

// ============================================================================
// 1. COLLOIDAL LEVIATHAN (FERRO-WYRM)
// ============================================================================
function buildColloidalLeviathan(group: THREE.Group, params: Record<string, number>) {
  const segments = Math.floor(params['Vertebrae Segments'] || 32);
  const freq = params['Wave Frequency'] || 2.2;
  const amp = params['Undulation Amplitude'] || 0.65;
  const spikeBoost = params['Spike Eruption'] || 1.4;

  const segmentMeshes: THREE.Mesh[] = [];
  const spikeLines: THREE.Line[] = [];

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: '#020408',
    roughness: 0.12,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.15,
  });

  const goldRibMat = new THREE.MeshPhysicalMaterial({
    color: '#f5b722',
    roughness: 0.2,
    metalness: 0.9,
    emissive: new THREE.Color('#ffd700'),
    emissiveIntensity: 0.25,
  });

  for (let i = 0; i < segments; i++) {
    const tNorm = i / segments;
    // Fractional-power sine radius envelope
    const radius = 0.55 * Math.pow(Math.sin(tNorm * Math.PI), 0.72) + 0.08;

    // Segment orb
    const geo = new THREE.SphereGeometry(radius, 16, 16);
    const mesh = new THREE.Mesh(geo, bodyMat);
    group.add(mesh);
    segmentMeshes.push(mesh);

    // Ribbed gold ring around every second vertebra
    if (i % 2 === 0) {
      const ringGeo = new THREE.TorusGeometry(radius * 1.25, 0.025, 8, 24);
      const ringMesh = new THREE.Mesh(ringGeo, goldRibMat);
      mesh.add(ringMesh);
    }
  }

  // Head Spikes (Rosensweig horns)
  const hornGeo = new THREE.ConeGeometry(0.08, 0.65, 8);
  const hornMat = new THREE.MeshPhysicalMaterial({
    color: '#00f0ff',
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const hornL = new THREE.Mesh(hornGeo, hornMat);
  hornL.position.set(-0.25, 0.35, 0.2);
  hornL.rotation.z = -0.5;
  const hornR = new THREE.Mesh(hornGeo, hornMat);
  hornR.position.set(0.25, 0.35, 0.2);
  hornR.rotation.z = 0.5;
  if (segmentMeshes[0]) {
    segmentMeshes[0].add(hornL);
    segmentMeshes[0].add(hornR);
  }

  const update = (time: number) => {
    segmentMeshes.forEach((mesh, idx) => {
      const s = idx * 0.12;
      const x = Math.sin(time * freq + s * 1.5) * amp;
      const y = Math.cos(time * (freq * 0.75) + s * 1.2) * (amp * 0.6);
      const z = (idx - segments / 2) * 0.18;
      mesh.position.set(x, y, z);

      // Banking rotation along tangent
      const nextX = Math.sin(time * freq + (s + 0.12) * 1.5) * amp;
      const nextY = Math.cos(time * (freq * 0.75) + (s + 0.12) * 1.2) * (amp * 0.6);
      mesh.rotation.y = (nextX - x) * 1.8;
      mesh.rotation.x = (nextY - y) * 1.4;
      mesh.rotation.z = Math.sin(time * 3.0 + idx) * 0.2;
    });
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}

// ============================================================================
// 2. ROSENSWEIG STRIDER (MAGNETIC ARACHNID)
// ============================================================================
function buildRosensweigStrider(group: THREE.Group, params: Record<string, number>) {
  const legSpeed = params['Gait Speed'] || 3.0;
  const legReach = params['Leg Reach'] || 1.2;
  const spikeCount = Math.floor(params['Cephalic Spikes'] || 12);

  // Cephalothorax superellipsoid
  const thoraxGeo = new THREE.SphereGeometry(0.5, 24, 24);
  thoraxGeo.scale(1.2, 0.65, 1.4);
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: '#060a12',
    roughness: 0.15,
    metalness: 0.9,
    clearcoat: 1.0,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.2,
  });
  const thorax = new THREE.Mesh(thoraxGeo, bodyMat);
  group.add(thorax);

  // Abdomen
  const abdomenGeo = new THREE.SphereGeometry(0.7, 24, 24);
  abdomenGeo.scale(1.1, 0.85, 1.6);
  const abdomen = new THREE.Mesh(abdomenGeo, bodyMat);
  abdomen.position.set(0, 0.15, -1.1);
  group.add(abdomen);

  // Spikes protruding from abdomen
  for (let i = 0; i < spikeCount; i++) {
    const theta = (i / spikeCount) * Math.PI * 2;
    const spikeGeo = new THREE.ConeGeometry(0.04, 0.45, 6);
    const spikeMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.position.set(Math.cos(theta) * 0.55, 0.4 + Math.sin(theta) * 0.2, -1.1 + Math.sin(theta) * 0.4);
    spike.rotation.x = Math.PI / 4;
    spike.rotation.z = -Math.cos(theta);
    group.add(spike);
  }

  // 6 Procedural IK Legs (Left & Right)
  const legs: { upper: THREE.Mesh; lower: THREE.Mesh; side: number; phase: number }[] = [];
  const legMat = new THREE.MeshPhysicalMaterial({ color: '#f5b722', metalness: 0.9, roughness: 0.2 });

  for (let l = 0; l < 6; l++) {
    const isLeft = l < 3;
    const legIdx = l % 3;
    const side = isLeft ? 1 : -1;
    const phase = legIdx * (Math.PI / 1.5) + (isLeft ? 0 : Math.PI);

    const upperGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.7);
    const upper = new THREE.Mesh(upperGeo, legMat);
    const lowerGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.85);
    const lower = new THREE.Mesh(lowerGeo, legMat);
    upper.add(lower);
    lower.position.set(0, -0.65, 0);

    const anchorZ = (legIdx - 1) * 0.45;
    upper.position.set(side * 0.5, 0, anchorZ);
    group.add(upper);

    legs.push({ upper, lower, side, phase });
  }

  const update = (time: number) => {
    thorax.position.y = Math.sin(time * legSpeed * 2.0) * 0.06;
    abdomen.position.y = 0.15 + Math.sin(time * legSpeed * 2.0 - 0.5) * 0.08;

    legs.forEach((leg) => {
      const g = Math.sin(time * legSpeed + leg.phase);
      const stepLift = Math.max(0, g) * 0.35;
      leg.upper.rotation.z = leg.side * (0.8 + g * 0.3);
      leg.upper.rotation.x = Math.cos(time * legSpeed + leg.phase) * 0.4;
      leg.upper.position.y = stepLift;
      leg.lower.rotation.z = leg.side * (-1.4 + stepLift * 0.5);
    });
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}

// ============================================================================
// 3. DIELECTRIC NAUTILUS (VOID JELLY)
// ============================================================================
function buildDielectricNautilus(group: THREE.Group, params: Record<string, number>) {
  const spiralFactor = params['Spiral Factor'] || 0.175;
  const pulseFreq = params['Pulse Resonance'] || 1.8;

  // Logarithmic Spiral Shell
  const shellGroup = new THREE.Group();
  group.add(shellGroup);

  const shellSegments = 40;
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: '#081828',
    transmission: 0.85,
    roughness: 0.08,
    ior: 1.54,
    thickness: 0.4,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.88,
  });

  for (let i = 0; i < shellSegments; i++) {
    const theta = (i / shellSegments) * Math.PI * 4;
    const r = 0.25 * Math.exp(spiralFactor * theta);
    const chamberGeo = new THREE.SphereGeometry(r * 0.35, 16, 16);
    const chamber = new THREE.Mesh(chamberGeo, shellMat);
    chamber.position.set(r * Math.cos(theta), r * Math.sin(theta), -i * 0.035);
    shellGroup.add(chamber);
  }

  // Undulating Tentacles
  const tentacleCount = 8;
  const tentacleLines: { line: THREE.Line; baseAngle: number; points: THREE.Vector3[] }[] = [];

  for (let t = 0; t < tentacleCount; t++) {
    const baseAngle = (t / tentacleCount) * Math.PI * 2;
    const pCount = 20;
    const points: THREE.Vector3[] = [];
    for (let p = 0; p < pCount; p++) {
      points.push(new THREE.Vector3(Math.cos(baseAngle) * 0.3, Math.sin(baseAngle) * 0.3, -p * 0.12));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geo, lineMat);
    group.add(line);
    tentacleLines.push({ line, baseAngle, points });
  }

  const update = (time: number) => {
    const pulse = 1.0 + Math.sin(time * pulseFreq) * 0.14;
    shellGroup.scale.set(pulse, pulse, pulse);
    shellGroup.rotation.z = time * 0.25;

    tentacleLines.forEach((t) => {
      const posAttr = t.line.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < t.points.length; i++) {
        const s = i * 0.15;
        const wave = Math.sin(time * 3.0 - s * 2.5) * 0.15 * (i / t.points.length);
        const x = Math.cos(t.baseAngle) * (0.3 + wave * 0.5) + wave;
        const y = Math.sin(t.baseAngle) * (0.3 + wave * 0.5);
        const z = -i * 0.12 + Math.cos(time * 2.0 - s) * 0.05;
        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    });
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}

// ============================================================================
// 4. TESSERACT CHIMERA (4D HYPER-SPATIAL ENTITY)
// ============================================================================
function buildTesseractChimera(group: THREE.Group, params: Record<string, number>) {
  const rotSpeed = params['4D Rotation Speed'] || 1.2;
  const projDist = params['Projection Depth'] || 2.8;

  // 16 4D Vertices: (±1, ±1, ±1, ±1)
  const vertices4D: number[][] = [];
  for (let i = 0; i < 16; i++) {
    vertices4D.push([
      (i & 1 ? 1 : -1) * 0.85,
      (i & 2 ? 1 : -1) * 0.85,
      (i & 4 ? 1 : -1) * 0.85,
      (i & 8 ? 1 : -1) * 0.85,
    ]);
  }

  // 32 4D Edges connecting vertices differing by 1 bit
  const edgePairs: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let bit = 0; bit < 4; bit++) {
      const neighbor = i ^ (1 << bit);
      if (neighbor > i) {
        edgePairs.push([i, neighbor]);
      }
    }
  }

  // 16 Corner Spheres
  const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const nodeMat = new THREE.MeshPhysicalMaterial({
    color: '#00f0ff',
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });
  const nodeMeshes = vertices4D.map(() => {
    const mesh = new THREE.Mesh(nodeGeo, nodeMat);
    group.add(mesh);
    return mesh;
  });

  // 32 Line Segments
  const linePositions = new Float32Array(edgePairs.length * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: '#ffd700',
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const edgeLines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(edgeLines);

  const update = (time: number) => {
    const alpha = time * rotSpeed * 0.7;
    const beta = time * rotSpeed * 0.95;

    const cosA = Math.cos(alpha);
    const sinA = Math.sin(alpha);
    const cosB = Math.cos(beta);
    const sinB = Math.sin(beta);

    const projected: THREE.Vector3[] = [];

    // 4D Rotation in XW and YZ planes
    vertices4D.forEach((v, idx) => {
      // Rotate in X-W plane
      const x1 = v[0] * cosA - v[3] * sinA;
      const w1 = v[0] * sinA + v[3] * cosA;

      // Rotate in Y-Z plane
      const y1 = v[1] * cosB - v[2] * sinB;
      const z1 = v[1] * sinB + v[2] * cosB;

      // Stereographic projection 4D -> 3D
      const factor = projDist / (projDist - w1);
      const p3 = new THREE.Vector3(x1 * factor, y1 * factor, z1 * factor);
      projected.push(p3);

      nodeMeshes[idx].position.copy(p3);
      const scale = THREE.MathUtils.clamp(factor * 0.65, 0.4, 1.8);
      nodeMeshes[idx].scale.setScalar(scale);
    });

    // Update lines
    const pos = edgeLines.geometry.attributes.position as THREE.BufferAttribute;
    edgePairs.forEach(([i, j], pairIdx) => {
      const p1 = projected[i];
      const p2 = projected[j];
      pos.setXYZ(pairIdx * 2, p1.x, p1.y, p1.z);
      pos.setXYZ(pairIdx * 2 + 1, p2.x, p2.y, p2.z);
    });
    pos.needsUpdate = true;

    group.rotation.y = time * 0.2;
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}

// ============================================================================
// 5. FLUX SENTINEL (STELLATED POLYHEDRAL GUARDIAN)
// ============================================================================
function buildFluxSentinel(group: THREE.Group, params: Record<string, number>) {
  const gyroSpeed = params['Ring Gyro Precession'] || 1.6;

  // Central Stellated Octahedron (Merkaba / Star of David in 3D)
  const coreGroup = new THREE.Group();
  group.add(coreGroup);

  const tet1Geo = new THREE.TetrahedronGeometry(0.85);
  const tet2Geo = new THREE.TetrahedronGeometry(0.85);
  tet2Geo.rotateX(Math.PI);
  tet2Geo.rotateZ(Math.PI / 4);

  const starMat = new THREE.MeshPhysicalMaterial({
    color: '#030508',
    roughness: 0.1,
    metalness: 0.95,
    clearcoat: 1.0,
    emissive: new THREE.Color('#ffd700'),
    emissiveIntensity: 0.4,
  });

  const m1 = new THREE.Mesh(tet1Geo, starMat);
  const m2 = new THREE.Mesh(tet2Geo, starMat);
  coreGroup.add(m1);
  coreGroup.add(m2);

  // Inner floating energy pearl
  const pearlGeo = new THREE.SphereGeometry(0.28, 24, 24);
  const pearlMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
  const pearl = new THREE.Mesh(pearlGeo, pearlMat);
  coreGroup.add(pearl);

  // 3 Concentric Orbiting Gold Gimbal Rings
  const ring1Geo = new THREE.TorusGeometry(1.3, 0.03, 16, 64);
  const ring2Geo = new THREE.TorusGeometry(1.6, 0.035, 16, 64);
  const ring3Geo = new THREE.TorusGeometry(1.9, 0.04, 16, 64);
  const ringMat = new THREE.MeshPhysicalMaterial({
    color: '#f5b722',
    roughness: 0.15,
    metalness: 0.96,
    emissive: new THREE.Color('#ffd700'),
    emissiveIntensity: 0.3,
  });

  const ring1 = new THREE.Mesh(ring1Geo, ringMat);
  const ring2 = new THREE.Mesh(ring2Geo, ringMat);
  const ring3 = new THREE.Mesh(ring3Geo, ringMat);
  group.add(ring1);
  group.add(ring2);
  group.add(ring3);

  const update = (time: number) => {
    coreGroup.rotation.x = time * 0.8;
    coreGroup.rotation.y = time * 1.2;
    coreGroup.position.y = Math.sin(time * 2.0) * 0.15;

    ring1.rotation.z += 0.02 * gyroSpeed;
    ring1.rotation.x = Math.sin(time * gyroSpeed * 0.8) * 0.6;

    ring2.rotation.y += 0.025 * gyroSpeed;
    ring2.rotation.z = Math.cos(time * gyroSpeed * 0.7) * 0.7;

    ring3.rotation.x += 0.03 * gyroSpeed;
    ring3.rotation.y = Math.sin(time * gyroSpeed * 0.5) * 0.8;
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}

// ============================================================================
// 6. GYROID SPORE (MINIMAL SURFACE BIO-COLONY)
// ============================================================================
function buildGyroidSpore(group: THREE.Group, params: Record<string, number>) {
  const k = params['Cellular Frequency'] || 2.2;

  // Procedural Gyroid Lattice sampled across 3D sphere points
  const pCount = 380;
  const points: THREE.Vector3[] = [];
  const colors: number[] = [];

  const colA = new THREE.Color('#00f0ff');
  const colB = new THREE.Color('#b026ff');

  for (let i = 0; i < pCount; i++) {
    const phi = Math.acos(1 - 2 * (i / pCount));
    const theta = Math.sqrt(pCount * Math.PI) * phi;
    const r = 1.0 + (Math.sin(phi * 4) * Math.cos(theta * 4)) * 0.28;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    points.push(new THREE.Vector3(x, y, z));
    const mixFactor = (x + y + z + 3) / 6;
    const col = colA.clone().lerp(colB, mixFactor);
    colors.push(col.r, col.g, col.b);
  }

  const pGeo = new THREE.BufferGeometry().setFromPoints(points);
  pGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });

  const pSystem = new THREE.Points(pGeo, pMat);
  group.add(pSystem);

  // Inner pulsating breathing vesicle
  const vesicleGeo = new THREE.IcosahedronGeometry(0.75, 3);
  const vesicleMat = new THREE.MeshPhysicalMaterial({
    color: '#090f1a',
    roughness: 0.1,
    transmission: 0.8,
    ior: 1.45,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.75,
  });
  const vesicle = new THREE.Mesh(vesicleGeo, vesicleMat);
  group.add(vesicle);

  const update = (time: number) => {
    const pulse = 1.0 + Math.sin(time * 2.4) * 0.12;
    vesicle.scale.set(pulse, pulse, pulse);
    pSystem.rotation.y = time * 0.35;
    pSystem.rotation.x = Math.sin(time * 0.4) * 0.25;

    const pos = pGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < points.length; i++) {
      const orig = points[i];
      // Dynamic Schoen Gyroid perturbation: sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x)
      const g = Math.sin(orig.x * k + time) * Math.cos(orig.y * k) +
                Math.sin(orig.y * k + time) * Math.cos(orig.z * k) +
                Math.sin(orig.z * k + time) * Math.cos(orig.x * k);
      const disp = 1.0 + g * 0.18;
      pos.setXYZ(i, orig.x * disp, orig.y * disp, orig.z * disp);
    }
    pos.needsUpdate = true;
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}

// ============================================================================
// 7. COLLOIDAL ARCHON (SENTIENT PROCEDURAL CHARACTER MODEL)
// ============================================================================
function buildFerroArchon(group: THREE.Group, params: Record<string, number>) {
  const undulation = params['Spine Undulation'] || 1.8;
  const reach = params['Limb Articulation'] || 1.25;
  const crownCount = Math.floor(params['Crown Spikes'] || 8);
  const dipoleFlux = params['Core Dipole Flux'] || 1.6;

  const blackFerroMat = new THREE.MeshPhysicalMaterial({
    color: '#010307',
    roughness: 0.1,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.12,
  });

  const goldArmatureMat = new THREE.MeshPhysicalMaterial({
    color: '#ffd700',
    roughness: 0.15,
    metalness: 0.92,
    emissive: new THREE.Color('#ffaa00'),
    emissiveIntensity: 0.35,
  });

  const cyanCoreMat = new THREE.MeshPhysicalMaterial({
    color: '#00f0ff',
    roughness: 0.05,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 1.6,
    transparent: true,
    opacity: 0.95,
  });

  // 1. Head Cranium: Deformed ellipsoid with glowing cyan visor slit
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.4, 0);
  group.add(headGroup);

  const craniumGeo = new THREE.SphereGeometry(0.32, 24, 24);
  craniumGeo.scale(0.85, 1.15, 0.9);
  const craniumMesh = new THREE.Mesh(craniumGeo, blackFerroMat);
  headGroup.add(craniumMesh);

  // Visor slit
  const visorGeo = new THREE.BoxGeometry(0.24, 0.04, 0.12);
  const visorMesh = new THREE.Mesh(visorGeo, cyanCoreMat);
  visorMesh.position.set(0, 0.02, 0.24);
  headGroup.add(visorMesh);

  // Crown Spikes arranged around the head
  const crownMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < crownCount; i++) {
    const angle = (i / crownCount) * Math.PI * 2;
    const spikeGeo = new THREE.ConeGeometry(0.04, 0.28, 8);
    spikeGeo.rotateX(Math.PI / 2);
    const spikeMesh = new THREE.Mesh(spikeGeo, blackFerroMat);
    spikeMesh.position.set(Math.cos(angle) * 0.28, 0.22, Math.sin(angle) * 0.28);
    spikeMesh.lookAt(new THREE.Vector3(Math.cos(angle) * 2, 1.8, Math.sin(angle) * 2));
    headGroup.add(spikeMesh);
    crownMeshes.push(spikeMesh);
  }

  // 2. Harmonic Spine: Segmented vertebrae down the torso
  const spineSegments = 14;
  const spineMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < spineSegments; i++) {
    const tNorm = i / spineSegments;
    const yPos = 1.05 - tNorm * 1.5;
    const radius = 0.22 * Math.sin(tNorm * Math.PI * 0.85 + 0.3) + 0.08;

    const vertGeo = new THREE.SphereGeometry(radius, 16, 16);
    const vertMesh = new THREE.Mesh(vertGeo, blackFerroMat);
    vertMesh.position.set(0, yPos, 0);
    group.add(vertMesh);
    spineMeshes.push(vertMesh);

    // Gold magnetic constraint rings around upper vertebrae
    if (i % 2 === 0 && i < 8) {
      const ringGeo = new THREE.TorusGeometry(radius * 1.35, 0.018, 8, 20);
      const ringMesh = new THREE.Mesh(ringGeo, goldArmatureMat);
      vertMesh.add(ringMesh);
    }
  }

  // 3. Dipole Chest Core (Pulsing Icosahedron inside upper ribcage)
  const coreGeo = new THREE.IcosahedronGeometry(0.16, 1);
  const coreMesh = new THREE.Mesh(coreGeo, cyanCoreMat);
  coreMesh.position.set(0, 0.72, 0.08);
  group.add(coreMesh);

  // Outer gold cage around the heart
  const cageGeo = new THREE.TorusGeometry(0.24, 0.015, 8, 24);
  const cageMesh = new THREE.Mesh(cageGeo, goldArmatureMat);
  cageMesh.position.set(0, 0.72, 0.08);
  group.add(cageMesh);

  // 4. Arms & Inverse-Kinematic Hands
  const armGroups: { upper: THREE.Group; forearm: THREE.Group; hand: THREE.Mesh }[] = [];
  [-1, 1].forEach((side) => {
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(side * 0.42, 0.95, 0);
    group.add(shoulderGroup);

    const shGeo = new THREE.SphereGeometry(0.12, 14, 14);
    const shMesh = new THREE.Mesh(shGeo, goldArmatureMat);
    shoulderGroup.add(shMesh);

    const upperGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.45, 12);
    upperGeo.translate(0, -0.22, 0);
    const upperMesh = new THREE.Mesh(upperGeo, blackFerroMat);
    shoulderGroup.add(upperMesh);

    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -0.44, 0);
    shoulderGroup.add(forearmGroup);

    const elbowGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const elbowMesh = new THREE.Mesh(elbowGeo, goldArmatureMat);
    forearmGroup.add(elbowMesh);

    const lowerGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.42, 12);
    lowerGeo.translate(0, -0.21, 0);
    const lowerMesh = new THREE.Mesh(lowerGeo, blackFerroMat);
    forearmGroup.add(lowerMesh);

    const handGeo = new THREE.IcosahedronGeometry(0.08, 1);
    const handMesh = new THREE.Mesh(handGeo, cyanCoreMat);
    handMesh.position.set(0, -0.48, 0);
    forearmGroup.add(handMesh);

    armGroups.push({ upper: shoulderGroup, forearm: forearmGroup, hand: handMesh });
  });

  // 5. Levitating Base / Magnetic Float Disc
  const floatDiscGeo = new THREE.TorusGeometry(0.65, 0.025, 8, 36);
  const floatDisc = new THREE.Mesh(floatDiscGeo, goldArmatureMat);
  floatDisc.rotation.x = Math.PI / 2;
  floatDisc.position.set(0, -1.2, 0);
  group.add(floatDisc);

  const innerDiscGeo = new THREE.TorusGeometry(0.42, 0.018, 8, 28);
  const innerDisc = new THREE.Mesh(innerDiscGeo, goldArmatureMat);
  innerDisc.rotation.x = Math.PI / 2;
  innerDisc.position.set(0, -1.2, 0);
  group.add(innerDisc);

  // Update Animation Loop
  const update = (time: number) => {
    const sway = Math.sin(time * undulation) * 0.12;
    headGroup.position.x = sway * 0.4;
    headGroup.position.y = 1.4 + Math.sin(time * 2.2) * 0.04;
    headGroup.rotation.y = Math.sin(time * 1.2) * 0.15;
    headGroup.rotation.z = -sway * 0.2;

    for (let i = 0; i < spineSegments; i++) {
      const tNorm = i / spineSegments;
      const waveX = Math.sin(time * undulation + tNorm * 4.0) * (0.08 * (1 - tNorm * 0.5));
      const waveZ = Math.cos(time * (undulation * 0.8) + tNorm * 3.5) * 0.04;
      spineMeshes[i].position.x = waveX;
      spineMeshes[i].position.z = waveZ;
    }

    const pulse = 1.0 + Math.sin(time * 3.6) * 0.18 * dipoleFlux;
    coreMesh.scale.set(pulse, pulse, pulse);
    cageMesh.rotation.y = time * 1.2;
    cageMesh.rotation.x = Math.sin(time * 1.4) * 0.3;

    crownMeshes.forEach((spike, idx) => {
      const sScale = 1.0 + Math.sin(time * 4.0 + idx * 0.8) * 0.25;
      spike.scale.set(1.0, 1.0, sScale);
    });

    armGroups.forEach((arm, idx) => {
      const side = idx === 0 ? -1 : 1;
      arm.upper.rotation.z = side * (0.45 + Math.sin(time * 1.5 + side) * 0.15 * reach);
      arm.upper.rotation.x = Math.sin(time * 1.8 + idx) * 0.2;
      arm.forearm.rotation.x = -0.3 + Math.sin(time * 2.0 + idx * 0.5) * 0.25 * reach;
      arm.forearm.rotation.y = side * 0.2;
      arm.hand.scale.setScalar(1.0 + Math.sin(time * 5.0 + idx) * 0.2);
    });

    floatDisc.rotation.z = time * 0.8;
    innerDisc.rotation.z = -time * 1.2;
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}

// ============================================================================
// 8. CHRONOS ORACLE (SPATIAL PROCEDURAL CHARACTER MODEL)
// ============================================================================
function buildChronosOracle(group: THREE.Group, params: Record<string, number>) {
  const vestmentSpeed = params['Vestment Flurry'] || 2.1;
  const gyroSpeed = params['Ring Gyro Precession'] || 1.5;
  const radiance = params['Oracle Radiance'] || 2.0;

  const violetMat = new THREE.MeshPhysicalMaterial({
    color: '#070311',
    roughness: 0.12,
    metalness: 0.92,
    clearcoat: 1.0,
    emissive: new THREE.Color('#b026ff'),
    emissiveIntensity: 0.25 * radiance,
  });

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: '#ffd700',
    roughness: 0.15,
    metalness: 0.95,
    emissive: new THREE.Color('#ffb700'),
    emissiveIntensity: 0.4,
  });

  const neonVioletMat = new THREE.MeshPhysicalMaterial({
    color: '#b026ff',
    roughness: 0.05,
    emissive: new THREE.Color('#d066ff'),
    emissiveIntensity: 1.8 * radiance,
    transparent: true,
    opacity: 0.9,
  });

  // 1. Cranium with celestial floating ring halo
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.2, 0);
  group.add(headGroup);

  const headGeo = new THREE.IcosahedronGeometry(0.36, 2);
  const headMesh = new THREE.Mesh(headGeo, violetMat);
  headGroup.add(headMesh);

  // Concentric Halo Rings
  const haloRings: THREE.Mesh[] = [];
  [0.55, 0.72].forEach((r, idx) => {
    const ringGeo = new THREE.TorusGeometry(r, 0.015, 8, 36);
    const ringMesh = new THREE.Mesh(ringGeo, idx === 0 ? goldMat : neonVioletMat);
    headGroup.add(ringMesh);
    haloRings.push(ringMesh);
  });

  // 2. Flowing Procedural Ribbon Splines (Vestments)
  const ribbonCount = 8;
  const ribbonGeos: THREE.BufferGeometry[] = [];

  for (let r = 0; r < ribbonCount; r++) {
    const pts: THREE.Vector3[] = [];
    for (let p = 0; p < 20; p++) {
      pts.push(new THREE.Vector3(0, 0, 0));
    }
    const rGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const rMat = new THREE.LineBasicMaterial({
      color: r % 2 === 0 ? '#b026ff' : '#00f0ff',
      transparent: true,
      opacity: 0.85,
    });
    const rLine = new THREE.Line(rGeo, rMat);
    group.add(rLine);
    ribbonGeos.push(rGeo);
  }

  // 3. Central Levitating Tachyon Orb
  const tachyonGeo = new THREE.OctahedronGeometry(0.22, 1);
  const tachyonMesh = new THREE.Mesh(tachyonGeo, neonVioletMat);
  tachyonMesh.position.set(0, 0.45, 0);
  group.add(tachyonMesh);

  const update = (time: number) => {
    headGroup.position.y = 1.2 + Math.sin(time * 2.0) * 0.08;
    headGroup.rotation.y = time * 0.6;

    haloRings[0].rotation.x = time * gyroSpeed;
    haloRings[0].rotation.y = time * (gyroSpeed * 0.7);
    haloRings[1].rotation.z = -time * gyroSpeed * 0.8;
    haloRings[1].rotation.x = Math.sin(time * gyroSpeed) * 0.5;

    tachyonMesh.rotation.y = time * 1.8;
    tachyonMesh.rotation.z = time * 1.2;
    const tScale = 1.0 + Math.sin(time * 4.2) * 0.2;
    tachyonMesh.scale.set(tScale, tScale, tScale);

    // Procedural cloth ribbons waving in dynamic magnetic wind
    ribbonGeos.forEach((geo, rIdx) => {
      const angleOffset = (rIdx / ribbonCount) * Math.PI * 2;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;

      for (let p = 0; p < 20; p++) {
        const tNorm = p / 20;
        const y = 0.9 - tNorm * 2.2;
        const radius = 0.25 + tNorm * 0.65;
        const wave = Math.sin(time * vestmentSpeed + p * 0.45 + angleOffset);
        const x = Math.cos(angleOffset + tNorm * 1.5 + wave * 0.25) * radius;
        const z = Math.sin(angleOffset + tNorm * 1.5 + wave * 0.25) * radius;
        posAttr.setXYZ(p, x, y, z);
      }
      posAttr.needsUpdate = true;
    });
  };

  const dispose = () => {
    group.clear();
  };

  return { group, update, dispose };
}
