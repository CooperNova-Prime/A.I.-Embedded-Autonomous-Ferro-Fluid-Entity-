/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GlowTheme = 'cyan' | 'gold' | 'purple' | 'crimson' | 'emerald' | 'mercury';

export type ArcaneSymbolSet = 'all' | 'hermetic' | 'quantum' | 'celestial' | 'enochian';

export type InteractionMode = 'orbit' | 'magnet' | 'stir' | 'cymatics' | 'pulse';

export type CameraPreset = 'perspective' | 'scrying-top' | 'spike-profile' | 'abyss-core';

export type MeshShape = 'sphere' | 'basin';

export type BallSkin = 'void-refraction' | 'liquid-ink' | 'black-matte' | 'alchemical-ink' | 'quicksilver' | 'supernova' | 'emerald-abyss';

export interface TennisBallMetrics {
  diameter_cm: number;
  radius_cm: number;
  circumference_cm: number;
  surface_area_cm2: number;
  volume_cm3: number;
}

export interface MagnetNode {
  id: string;
  x: number; // in world coords [-3, 3]
  z: number; // in world coords [-3, 3]
  strength: number; // 0 to 2
  polarity: 'north' | 'south';
  pulsing: boolean;
}

export interface FerrofluidConfig {
  // Shape & Scale (Regulation Tennis Ball: 6.70 cm diameter)
  meshShape: MeshShape;
  tennisBallDiameter: number;   // default: 6.70 cm (regulation average)
  showTennisBallSeam: boolean;  // highlight iconic curvilinear tennis ball seam

  // Tennis Ball Morphing & Shimmering Skin (Void Black Refraction)
  ballSkin: BallSkin;
  morphIntensity: number;       // 0.0 to 2.5 (fluidic body morphing / quadrupole pulse)
  morphSpeed: number;           // 0.2 to 3.0 (temporal morphing velocity)
  refractionIntensity: number;  // 0.0 to 2.5 (prismatic shimmering dispersion & caustics)
  voidAbsorption: number;       // 0.5 to 1.0 (event horizon void blackness)
  shimmerSpeed: number;         // 0.2 to 3.0 (moving refraction speed)

  // Physical parameters
  magneticStrength: number;     // 0.0 to 3.0 (B_0 field)
  viscosity: number;            // 0.1 to 1.0 (damping and inertia)
  surfaceTension: number;       // 0.2 to 2.0 (spike sharpening vs smoothing)
  oscillationFreq: number;      // 0.1 to 5.0 Hz
  spikeDensity: number;         // 4 to 24 (Rosensweig instability wave number)
  spikeHeight: number;          // 0.2 to 2.5
  fluidDepth: number;           // Circular abyss depth scale
  
  // Mesh & Ethereal String parameters
  wireframeVisible: boolean;
  wireframeDensity: number;     // String line density
  wireframeGlowIntensity: number;// 0.2 to 3.0
  glowTheme: GlowTheme;
  showEquations: boolean;
  showArcaneRings: boolean;
  showGimbalRings?: boolean;        // 4-ring gyroscope gimbal armature (equatorial + 3 outer rings)
  gimbalSpeed?: number;             // 0.1 to 3.0 (gimbal rotation speed multiplier)
  ring1Speed?: number;              // individual ring 1 speed factor (default 1.0)
  ring2Speed?: number;              // individual ring 2 speed factor (default 1.0)
  ring3Speed?: number;              // individual ring 3 speed factor (default 1.0)
  ring4Speed?: number;              // individual ring 4 speed factor (default 1.0)
  gimbalMotionStyle?: 'fluid' | 'rigid' | 'oscillating' | 'locked';
  showBezierArcs?: boolean;         // dynamic Bezier lightning arcs connecting core and rings
  showHoloPanels?: boolean;         // floating holographic quantum diagnostic panels
  symbolSet: ArcaneSymbolSet;
  symbolRotationSpeed: number;
  
  // Optical & Substance parameters
  iridescence: number;          // 0.0 to 1.0 (oil-slick chromatic sheen on ink edge)
  reflectivity: number;         // 0.5 to 1.0 (metallic gloss)
  abyssDarkness: number;        // ink blackness
  
  // Camera & Interaction
  autoRotate: boolean;
  rotationSpeed: number;
  zoomPreset?: 'core' | 'inner' | 'middle' | 'outer' | 'halo' | 'custom';
  cameraDistance?: number;        // 3.2 (macro core) to 25.0 (full halo rig)
  interactionMode: InteractionMode;
  soundEnabled: boolean;
  soundVolume: number;
  soundFrequency: number;

  // Time-Based Anomalies & Arcing Tendrils
  arcingTendrilsEnabled: boolean;
  tendrilCount: number;         // 3 to 12 plasma arc tendrils
  tendrilArcIntensity: number;  // 0.5 to 3.0
  timeAnomalyFrequency: number; // 0.2 to 3.0 (temporal rift & flux surge cadence)

  // Voice & Speech Reactive Spike Waves & Ripples
  voiceReactive: boolean;
  voiceSensitivity: number;     // 0.5 to 3.0
  voiceSpikeBoost: number;      // 0.5 to 3.0 (voice amplitude to spike ripple multiplier)

  // Free Floating in Void & Upper Screen Drift
  upperHalfFloating: boolean;   // wander freely across upper half of screen in 3D void
  floatDriftSpeed: number;      // 0.2 to 2.5
  floatRange: number;           // 0.5 to 2.5
  voidParticlesEnabled: boolean;// weightless quantum stardust motes drifting in the void

  // Low Light & Dynamic Refraction Mode
  lowLightMode?: boolean;       // remove excessive lighting, keep real-time dynamic refractions

  // Solid Surface & Elastic Collision Bounce Physics
  solidSurfaceEnabled?: boolean;     // provides an impenetrable solid core/surface substrate beneath the fluid
  solidCoreHardness?: number;        // 0.2 to 2.0 (surface hardness and tactile rigidity)
  particleBounceRestitution?: number;// 0.5 to 1.8 (rebound elasticity for entities bouncing off solid surface)
  kineticCollidersEnabled?: boolean; // dynamic particles & probes bounce off the ferrofluid surface
  showCollisionSparks?: boolean;     // incandescent sparks and impact ripples upon surface collision

  // Vision, Hand Tracking & MediaPipe Pinch Glide
  handTrackingEnabled?: boolean;// pinch detection to glide sphere
  faceTrackingEnabled?: boolean;// face detection to follow gaze & movement
  freeRangeMovementEnabled?: boolean;// full 3D free-range roaming & navigation
  aiCoreEnabled?: boolean;      // Autonomous Ferrofluid AI Core
  aiCoreName?: string;
  aiCoreDirective?: string;

  // Autonomous 3D Free-Floating Levitation & Spatial AI Navigation (Pure Legless Aerial Entity)
  autonomousLevitationEnabled?: boolean; // Autonomous levitation & free 3D floating without legs/feet
  levitationAltitude?: number;           // base levitation height
  levitationDriftAgility?: number;       // 0.2 to 3.0 autonomous drift speed
  
  // Backward compatibility keys
  embodiedLocomotionEnabled?: boolean;
  locomotionGaitType?: 'quadruped' | 'hexapod' | 'biped_strider' | 'biomech_crawler';
  locomotionPhysicsMode?: 'reinforcement_learning' | 'dynamic_pd' | 'hybrid_ik';
  locomotionSpeed?: number;
  locomotionAgility?: number;
  locomotionBalanceRecovery?: number;
  locomotionAutonomousNav?: boolean;
  locomotionNavTarget?: 'autonomous_wander' | 'follow_pointer' | 'follow_hand' | 'follow_voice' | 'patrol';
  showVirtualJointRig?: boolean;
  showLocomotionTelemetry?: boolean;
  
  // Tactical Ghost OS & Mobile UX
  ghostUiOpacity?: number;             // 0.2 to 0.95 glassmorphic ghost transparency
  ghostUiMode?: 'tactical' | 'minimal' | 'stealth';
  acousticCameraAutoTrigger?: boolean; // automatically activates webcam vision when extraordinary acoustic noise is heard
  acousticAnomalyThreshold?: number;  // 0.3 to 0.9 noise burst threshold
  modelScaleFactor?: number;           // 0.5 to 3.0 touch pinch & stretch scaling
  activeAiModelId?: string;            // ID of currently merged AI model core
}

export interface AiModelNode {
  id: string;
  name: string;
  version: string;
  provider: string;
  type: 'conversational' | 'slm_phi3' | 'locomotion_rl' | 'vision_sensor' | 'harmonic_mind' | 'speech_tts' | 'vector_codex' | 'custom_llm';
  description: string;
  badge: string;
  glowTheme: GlowTheme;
  capabilities: string[];
  active: boolean;
  status: 'ONLINE' | 'STANDBY' | 'ENGAGED';
  specs: {
    latency: string;
    throughput: string;
    contextLength?: string;
    jointDofs?: number;
  };
}

export interface VirtualJointState {
  id: string;
  name: string;
  angle: number; // current angle in radians
  targetAngle: number;
  angularVelocity: number;
  torque: number; // N*m
  load: number;   // 0.0 to 1.0
}

export interface GroundContactState {
  id: string;
  name: string;
  inContact: boolean;
  normalForce: number; // Newtons
  slip: boolean;
}

export interface LocomotionTelemetryData {
  active: boolean;
  gaitType: 'quadruped' | 'hexapod' | 'biped_strider' | 'biomech_crawler';
  locomotionState: 'WALKING' | 'TROTTING' | 'BALANCE_RECOVERY' | 'STABILIZING' | 'TURNING' | 'IMPULSE_ABSORB' | 'RESTING';
  velocity: { x: number; y: number; z: number; speed: number };
  heading: number; // radians
  com: { x: number; y: number; z: number }; // Center of Mass
  zmp: { x: number; z: number };            // Zero Moment Point
  balanceMargin: number; // 0 to 1
  stabilityScore: number; // percentage 0 to 100
  rlReward: number;      // cumulative RL policy reward
  joints: VirtualJointState[];
  contacts: GroundContactState[];
  navTarget: { x: number; y: number; z: number; label: string };
  isRecoveringFromImpulse: boolean;
}

export type HandGesture = 'none' | 'pinch' | 'open_palm' | 'point' | 'fist';

export interface VisionTrackingData {
  active: boolean;
  // Face Tracking
  faceDetected: boolean;
  faceX: number; // -1 (left) to 1 (right)
  faceY: number; // -1 (bottom) to 1 (top)
  faceDist: number; // normalized estimated distance (0.5 close, 1.5 far)
  facePitch: number;
  faceYaw: number;
  faceRoll: number;
  mouthOpen: boolean;

  // Hand Tracking
  handDetected: boolean;
  handX: number; // -1 to 1
  handY: number; // -1 to 1
  handDist: number;
  gesture: HandGesture;
  pinchDistance: number;
  isPinching: boolean;
  isOpenPalm: boolean;
}

export interface FreeRangeOrganismState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  bankRoll: number;
  pitch: number;
  yaw: number;
  mode: 'autonomous_roam' | 'follow_face' | 'follow_hand' | 'magnetic_tether' | 'anchor';
  mood: 'curious' | 'attentive' | 'resonating' | 'defensive' | 'quiescent';
}

export interface PresetArchetype {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  config: Partial<FerrofluidConfig>;
}

export type CaudexMood = 'sarcastic' | 'curious' | 'analytical' | 'protective' | 'roaming';

export interface CaudexCoordinateTelemetry {
  worldCoords: { x: number; y: number; z: number };
  screenCoords: { x: number; y: number; nx: number; ny: number };
  destinationTarget: {
    x: number;
    y: number;
    z: number;
    source: 'curiosity' | 'camera_face' | 'camera_hand' | 'voice_acoustic' | 'manual_waypoint' | 'desktop_boundary';
    label: string;
  };
  distanceToTarget: number;
  curiosityIndex: number; // 0 to 100%
  personalityMood: CaudexMood;
  sarcasticScalingMultiplier: number;
  masterEntityScale: number; // synchronized scale of gimbal rings + ferrofluid center
  autoCuriosityRoaming: boolean;
  trackingCameraActive: boolean;
}
