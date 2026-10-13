/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  FerrofluidConfig,
  LocomotionTelemetryData,
  VirtualJointState,
  GroundContactState,
} from '../types';
import { getGlowColors } from './arcaneTextures';

export interface LocomotionOptions {
  gaitType?: 'quadruped' | 'hexapod' | 'biped_strider' | 'biomech_crawler';
  speed?: number;
  agility?: number;
  balanceRecovery?: number;
}

interface VirtualJointNode {
  id: string;
  name: string;
  object: THREE.Object3D;
  axis: 'x' | 'y' | 'z';
  minAngle: number;
  maxAngle: number;
  currentAngle: number;
  targetAngle: number;
  velocity: number;
  torque: number;
  load: number;
  maxTorque: number;
  kp: number;
  kd: number;
}

interface LegPhysics {
  id: string;
  name: string;
  phaseOffset: number;
  hipJoint: VirtualJointNode;
  kneeJoint: VirtualJointNode;
  ankleJoint: VirtualJointNode;
  footMesh: THREE.Mesh;
  footWorldPos: THREE.Vector3;
  footTargetPos: THREE.Vector3;
  inContact: boolean;
  normalForce: number;
  slip: boolean;
  isStance: boolean;
  restOffset: THREE.Vector3;
}

export class EmbodiedLocomotionSystem {
  public group: THREE.Group;
  public chassisGroup: THREE.Group;
  public legsGroup: THREE.Group;
  public rigDebugGroup: THREE.Group;

  // State
  private enabled = false;
  private gaitType: 'quadruped' | 'hexapod' | 'biped_strider' | 'biomech_crawler' = 'quadruped';
  private glowTheme = 'void-cyan';

  // Physical Body Dynamics
  public bodyPos = new THREE.Vector3(0, 1.8, 0);
  public bodyVel = new THREE.Vector3(0, 0, 0);
  public bodyRot = new THREE.Euler(0, 0, 0, 'YXZ');
  public bodyAngVel = new THREE.Vector3(0, 0, 0);
  public heading = 0; // facing direction radians
  public targetHeading = 0;

  // Navigation & AI Trajectory
  public navMode: 'autonomous_wander' | 'follow_pointer' | 'follow_hand' | 'follow_voice' | 'patrol' = 'autonomous_wander';
  public navTarget = new THREE.Vector3(0, 0, 0);
  private wanderTimer = 0;
  private wanderTarget = new THREE.Vector3(0, 0, 0);

  // RL & Gait Controller State
  private gaitPhase = 0;
  private stepFrequency = 1.6; // Hz
  private baseHeight = 1.75;
  private com = new THREE.Vector3(0, 1.8, 0);
  private zmp = new THREE.Vector2(0, 0);
  private stabilityScore = 95;
  private rlReward = 142.5;
  private locomotionState: LocomotionTelemetryData['locomotionState'] = 'WALKING';
  private isRecoveringFromImpulse = false;
  private impulseRecoveryTimer = 0;

  // Virtual Joints & Legs
  private legs: LegPhysics[] = [];
  private joints: VirtualJointNode[] = [];
  private floorGridMesh: THREE.GridHelper | null = null;
  private contactRings: THREE.Mesh[] = [];

  constructor(glowTheme = 'void-cyan', gaitType: 'quadruped' | 'hexapod' | 'biped_strider' | 'biomech_crawler' = 'quadruped') {
    this.glowTheme = glowTheme;
    this.gaitType = gaitType;

    this.group = new THREE.Group();
    this.group.name = 'EmbodiedLocomotionRig';

    this.chassisGroup = new THREE.Group();
    this.chassisGroup.name = 'LocomotionChassis';
    this.group.add(this.chassisGroup);

    this.legsGroup = new THREE.Group();
    this.legsGroup.name = 'LocomotionLegs';
    this.chassisGroup.add(this.legsGroup);

    this.rigDebugGroup = new THREE.Group();
    this.rigDebugGroup.name = 'LocomotionRigDebug';
    this.group.add(this.rigDebugGroup);

    this.buildGroundGrid();
    this.buildLegsForGait(this.gaitType);
    this.pickNextWanderTarget();
  }

  public setEnabled(active: boolean) {
    this.enabled = active;
    this.group.visible = active;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setGaitType(type: 'quadruped' | 'hexapod' | 'biped_strider' | 'biomech_crawler') {
    if (this.gaitType === type) return;
    this.gaitType = type;
    this.buildLegsForGait(type);
  }

  public updateTheme(theme: string) {
    this.glowTheme = theme;
    const colorHex = getGlowColors(theme).hex;
    const color = new THREE.Color(colorHex);

    this.chassisGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat && mat.emissive) {
          mat.emissive.copy(color);
        }
      }
    });

    this.contactRings.forEach((ring) => {
      ((ring.material as THREE.MeshBasicMaterial)).color.copy(color);
    });
  }

  private buildGroundGrid() {
    const grid = new THREE.GridHelper(30, 30, 0x00f0ff, 0x112233);
    grid.position.y = 0.005;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    this.group.add(grid);
    this.floorGridMesh = grid;
  }

  private buildLegsForGait(gait: 'quadruped' | 'hexapod' | 'biped_strider' | 'biomech_crawler') {
    // Clear previous legs
    while (this.legsGroup.children.length > 0) {
      this.legsGroup.remove(this.legsGroup.children[0]);
    }
    this.legs = [];
    this.joints = [];
    this.contactRings.forEach((r) => this.group.remove(r));
    this.contactRings = [];

    const glowColor = new THREE.Color(getGlowColors(this.glowTheme).hex);

    // Build biomechanical chassis body
    while (this.chassisGroup.children.length > 0) {
      this.chassisGroup.remove(this.chassisGroup.children[0]);
    }
    this.chassisGroup.add(this.legsGroup);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      metalness: 0.95,
      roughness: 0.15,
      emissive: glowColor,
      emissiveIntensity: 0.25,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      metalness: 0.9,
      roughness: 0.2,
      emissive: glowColor,
      emissiveIntensity: 0.45,
    });

    const glowRingMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.85,
      wireframe: true,
    });

    // Central pelvic cradle connector (where the ferrofluid core docks)
    const pelvisGeo = new THREE.CylinderGeometry(1.4, 1.1, 0.4, 16);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, bodyMat);
    pelvisMesh.position.y = -0.3;
    this.chassisGroup.add(pelvisMesh);

    // Dynamic configuration of limbs
    interface LegSpec {
      id: string;
      name: string;
      mountOffset: THREE.Vector3;
      restFootOffset: THREE.Vector3;
      phase: number;
    }

    let legSpecs: LegSpec[] = [];

    if (gait === 'quadruped') {
      this.baseHeight = 1.7;
      this.stepFrequency = 1.8;
      legSpecs = [
        { id: 'FL', name: 'Front Left', mountOffset: new THREE.Vector3(-0.9, -0.3, 0.9), restFootOffset: new THREE.Vector3(-1.4, 0, 1.3), phase: 0 },
        { id: 'FR', name: 'Front Right', mountOffset: new THREE.Vector3(0.9, -0.3, 0.9), restFootOffset: new THREE.Vector3(1.4, 0, 1.3), phase: Math.PI },
        { id: 'RL', name: 'Rear Left', mountOffset: new THREE.Vector3(-0.9, -0.3, -0.9), restFootOffset: new THREE.Vector3(-1.4, 0, -1.3), phase: Math.PI },
        { id: 'RR', name: 'Rear Right', mountOffset: new THREE.Vector3(0.9, -0.3, -0.9), restFootOffset: new THREE.Vector3(1.4, 0, -1.3), phase: 0 },
      ];
    } else if (gait === 'hexapod') {
      this.baseHeight = 1.45;
      this.stepFrequency = 2.0;
      legSpecs = [
        { id: 'L1', name: 'Left Front', mountOffset: new THREE.Vector3(-0.9, -0.3, 1.0), restFootOffset: new THREE.Vector3(-1.6, 0, 1.2), phase: 0 },
        { id: 'L2', name: 'Left Mid', mountOffset: new THREE.Vector3(-1.1, -0.3, 0.0), restFootOffset: new THREE.Vector3(-1.8, 0, 0.0), phase: Math.PI },
        { id: 'L3', name: 'Left Rear', mountOffset: new THREE.Vector3(-0.9, -0.3, -1.0), restFootOffset: new THREE.Vector3(-1.6, 0, -1.2), phase: 0 },
        { id: 'R1', name: 'Right Front', mountOffset: new THREE.Vector3(0.9, -0.3, 1.0), restFootOffset: new THREE.Vector3(1.6, 0, 1.2), phase: Math.PI },
        { id: 'R2', name: 'Right Mid', mountOffset: new THREE.Vector3(1.1, -0.3, 0.0), restFootOffset: new THREE.Vector3(1.8, 0, 0.0), phase: 0 },
        { id: 'R3', name: 'Right Rear', mountOffset: new THREE.Vector3(0.9, -0.3, -1.0), restFootOffset: new THREE.Vector3(1.6, 0, -1.2), phase: Math.PI },
      ];
    } else if (gait === 'biped_strider') {
      this.baseHeight = 2.2;
      this.stepFrequency = 1.4;
      legSpecs = [
        { id: 'L', name: 'Left Strider', mountOffset: new THREE.Vector3(-0.7, -0.3, 0), restFootOffset: new THREE.Vector3(-1.0, 0, 0.2), phase: 0 },
        { id: 'R', name: 'Right Strider', mountOffset: new THREE.Vector3(0.7, -0.3, 0), restFootOffset: new THREE.Vector3(1.0, 0, -0.2), phase: Math.PI },
      ];
    } else {
      // biomech_crawler
      this.baseHeight = 1.35;
      this.stepFrequency = 1.5;
      legSpecs = [
        { id: 'C1', name: 'Crawler FL', mountOffset: new THREE.Vector3(-1.1, -0.25, 1.0), restFootOffset: new THREE.Vector3(-2.0, 0, 1.6), phase: 0 },
        { id: 'C2', name: 'Crawler FR', mountOffset: new THREE.Vector3(1.1, -0.25, 1.0), restFootOffset: new THREE.Vector3(2.0, 0, 1.6), phase: Math.PI * 0.5 },
        { id: 'C3', name: 'Crawler RL', mountOffset: new THREE.Vector3(-1.1, -0.25, -1.0), restFootOffset: new THREE.Vector3(-2.0, 0, -1.6), phase: Math.PI },
        { id: 'C4', name: 'Crawler RR', mountOffset: new THREE.Vector3(1.1, -0.25, -1.0), restFootOffset: new THREE.Vector3(2.0, 0, -1.6), phase: Math.PI * 1.5 },
      ];
    }

    legSpecs.forEach((spec) => {
      // Hip group at mount offset
      const hipGroup = new THREE.Group();
      hipGroup.name = `Hip_${spec.id}`;
      hipGroup.position.copy(spec.mountOffset);
      this.legsGroup.add(hipGroup);

      // Hip Servo Sphere
      const hipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), jointMat);
      hipGroup.add(hipMesh);

      // Femur (Upper Leg)
      const femurLen = this.baseHeight * 0.52;
      const femurGroup = new THREE.Group();
      femurGroup.name = `Femur_${spec.id}`;
      hipGroup.add(femurGroup);

      const femurCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, femurLen, 12), bodyMat);
      femurCylinder.position.y = -femurLen * 0.5;
      femurGroup.add(femurCylinder);

      // Hydraulic piston decorative rod
      const pistonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, femurLen * 0.75, 8), jointMat);
      pistonMesh.position.set(0.1, -femurLen * 0.45, 0.05);
      femurGroup.add(pistonMesh);

      // Knee Joint Group at end of Femur
      const kneeGroup = new THREE.Group();
      kneeGroup.name = `Knee_${spec.id}`;
      kneeGroup.position.y = -femurLen;
      femurGroup.add(kneeGroup);

      const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), jointMat);
      kneeGroup.add(kneeMesh);

      // Tibia (Lower Leg)
      const tibiaLen = this.baseHeight * 0.55;
      const tibiaGroup = new THREE.Group();
      tibiaGroup.name = `Tibia_${spec.id}`;
      kneeGroup.add(tibiaGroup);

      const tibiaCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, tibiaLen, 12), bodyMat);
      tibiaCylinder.position.y = -tibiaLen * 0.5;
      tibiaGroup.add(tibiaCylinder);

      // Ankle & Foot Contact Sensor
      const ankleGroup = new THREE.Group();
      ankleGroup.name = `Ankle_${spec.id}`;
      ankleGroup.position.y = -tibiaLen;
      tibiaGroup.add(ankleGroup);

      const footGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.12, 12);
      const footMat = new THREE.MeshStandardMaterial({
        color: 0x05070a,
        metalness: 0.95,
        roughness: 0.1,
        emissive: glowColor,
        emissiveIntensity: 0.6,
      });
      const footMesh = new THREE.Mesh(footGeo, footMat);
      footMesh.position.y = -0.06;
      ankleGroup.add(footMesh);

      // Contact Ring Visualizer on Ground
      const contactRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.32, 16), glowRingMat);
      contactRing.rotation.x = -Math.PI / 2;
      contactRing.position.y = 0.01;
      this.group.add(contactRing);
      this.contactRings.push(contactRing);

      // Virtual Joint Controllers
      const hipJoint: VirtualJointNode = {
        id: `${spec.id}_hip`,
        name: `${spec.name} Hip`,
        object: hipGroup,
        axis: 'z',
        minAngle: -0.7,
        maxAngle: 0.7,
        currentAngle: 0,
        targetAngle: 0,
        velocity: 0,
        torque: 0,
        load: 0,
        maxTorque: 85,
        kp: 180,
        kd: 16,
      };

      const kneeJoint: VirtualJointNode = {
        id: `${spec.id}_knee`,
        name: `${spec.name} Knee`,
        object: kneeGroup,
        axis: 'x',
        minAngle: -1.2,
        maxAngle: 0.6,
        currentAngle: 0,
        targetAngle: 0,
        velocity: 0,
        torque: 0,
        load: 0,
        maxTorque: 120,
        kp: 210,
        kd: 18,
      };

      const ankleJoint: VirtualJointNode = {
        id: `${spec.id}_ankle`,
        name: `${spec.name} Ankle`,
        object: ankleGroup,
        axis: 'x',
        minAngle: -0.6,
        maxAngle: 0.6,
        currentAngle: 0,
        targetAngle: 0,
        velocity: 0,
        torque: 0,
        load: 0,
        maxTorque: 60,
        kp: 140,
        kd: 12,
      };

      this.joints.push(hipJoint, kneeJoint, ankleJoint);

      this.legs.push({
        id: spec.id,
        name: spec.name,
        phaseOffset: spec.phase,
        hipJoint,
        kneeJoint,
        ankleJoint,
        footMesh,
        footWorldPos: new THREE.Vector3(),
        footTargetPos: spec.restFootOffset.clone(),
        inContact: true,
        normalForce: 180,
        slip: false,
        isStance: true,
        restOffset: spec.restFootOffset.clone(),
      });
    });
  }

  public setNavMode(mode: 'autonomous_wander' | 'follow_pointer' | 'follow_hand' | 'follow_voice' | 'patrol') {
    this.navMode = mode;
    if (mode === 'autonomous_wander') {
      this.pickNextWanderTarget();
    }
  }

  public setNavTarget(target: THREE.Vector3) {
    this.navTarget.copy(target);
  }

  private pickNextWanderTarget() {
    const rx = (Math.random() - 0.5) * 14.0;
    const rz = (Math.random() - 0.5) * 14.0;
    this.wanderTarget.set(rx, 0, rz);
    this.wanderTimer = 4.0 + Math.random() * 4.0;
  }

  /**
   * Applies an external physical impulse (e.g. mouse drag, push, kick, blast)
   * to test real-time RL balance recovery and dynamic stepping response.
   */
  public applyImpulse(force: THREE.Vector3) {
    this.bodyVel.add(force.clone().multiplyScalar(0.04));
    this.bodyAngVel.x += (Math.random() - 0.5) * 0.8;
    this.bodyAngVel.z += (Math.random() - 0.5) * 0.8;
    this.isRecoveringFromImpulse = true;
    this.impulseRecoveryTimer = 1.8;
    this.locomotionState = 'IMPULSE_ABSORB';
    this.stabilityScore = Math.max(35, this.stabilityScore - 30);
  }

  /**
   * Main Physics & RL Locomotion Loop
   * Called every frame from requestAnimationFrame.
   */
  public update(
    delta: number,
    config: FerrofluidConfig,
    pointerWorldPos?: THREE.Vector3,
    handTrackingPos?: THREE.Vector3,
    voiceAmplitude = 0
  ) {
    if (!this.enabled) return;

    const dt = Math.min(delta, 0.05);

    // 1. Navigation AI: Determine target heading and desired speed
    let targetPos = this.wanderTarget;
    if (this.navMode === 'follow_pointer' && pointerWorldPos) {
      targetPos = pointerWorldPos;
    } else if (this.navMode === 'follow_hand' && handTrackingPos) {
      targetPos = handTrackingPos;
    } else if (this.navMode === 'follow_voice' && voiceAmplitude > 0.1) {
      // Voice acoustic directional tracking
      this.wanderTimer -= dt * 3.0;
      targetPos = this.wanderTarget;
    } else if (this.navMode === 'patrol') {
      const time = performance.now() * 0.0004;
      targetPos = new THREE.Vector3(Math.cos(time) * 5.0, 0, Math.sin(time) * 5.0);
    } else {
      // Autonomous Roam
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.pickNextWanderTarget();
      }
      targetPos = this.wanderTarget;
    }

    this.navTarget.copy(targetPos);

    // Vector to target in XZ plane
    const toTarget = new THREE.Vector2(targetPos.x - this.bodyPos.x, targetPos.z - this.bodyPos.z);
    const distToTarget = toTarget.length();

    let desiredSpeed = 0;
    if (distToTarget > 0.4) {
      this.targetHeading = Math.atan2(toTarget.x, toTarget.y);
      const speedParam = config.locomotionSpeed ?? 1.0;
      desiredSpeed = Math.min(distToTarget * 1.2, 1.8 * speedParam);
    } else {
      if (this.navMode === 'autonomous_wander') {
        this.pickNextWanderTarget();
      }
    }

    // Dynamic Heading Interpolation
    let angleDiff = this.targetHeading - this.heading;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.heading += angleDiff * Math.min(1.0, dt * 3.5 * (config.locomotionAgility ?? 1.0));

    // Impulse recovery management
    if (this.isRecoveringFromImpulse) {
      this.impulseRecoveryTimer -= dt;
      if (this.impulseRecoveryTimer <= 0) {
        this.isRecoveringFromImpulse = false;
        this.locomotionState = desiredSpeed > 0.2 ? 'WALKING' : 'STABILIZING';
      }
    } else {
      this.locomotionState = desiredSpeed > 1.2 ? 'TROTTING' : (desiredSpeed > 0.1 ? 'WALKING' : 'STABILIZING');
      this.stabilityScore = Math.min(100, this.stabilityScore + dt * 15);
    }

    // 2. Body Dynamic Integration (Velocity & Acceleration)
    const forwardDir = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    const targetVel = forwardDir.clone().multiplyScalar(desiredSpeed);

    // Accelerate toward target velocity with ground friction damping
    this.bodyVel.lerp(targetVel, dt * 4.0);
    this.bodyPos.addScaledVector(this.bodyVel, dt);

    // Keep within world boundary bounds
    this.bodyPos.x = THREE.MathUtils.clamp(this.bodyPos.x, -14, 14);
    this.bodyPos.z = THREE.MathUtils.clamp(this.bodyPos.z, -14, 14);

    // Body Height & Dynamic Terrain Hover
    const nominalHeight = this.baseHeight + Math.sin(this.gaitPhase * 2.0) * 0.05 * (desiredSpeed > 0.1 ? 1 : 0);
    this.bodyPos.y = THREE.MathUtils.lerp(this.bodyPos.y, nominalHeight, dt * 6.0);

    // Body Pitch/Roll Dynamic Lean & Inverted Pendulum Balance
    const targetPitch = this.bodyVel.length() * 0.06; // lean into forward motion
    const targetRoll = angleDiff * 0.15; // bank into turns
    this.bodyRot.x = THREE.MathUtils.lerp(this.bodyRot.x, targetPitch, dt * 5.0);
    this.bodyRot.z = THREE.MathUtils.lerp(this.bodyRot.z, targetRoll, dt * 5.0);
    this.bodyRot.y = this.heading;

    // Apply translation & rotation to chassis
    this.chassisGroup.position.copy(this.bodyPos);
    this.chassisGroup.rotation.copy(this.bodyRot);

    // 3. Central Pattern Generator & RL Locomotion Phase Engine
    if (desiredSpeed > 0.05 || this.isRecoveringFromImpulse) {
      const stepRate = this.stepFrequency * Math.max(0.6, desiredSpeed * 0.85);
      this.gaitPhase = (this.gaitPhase + dt * stepRate * Math.PI * 2) % (Math.PI * 2);
    }

    // Calculate Center of Mass (COM) and Zero Moment Point (ZMP)
    this.com.copy(this.bodyPos);
    const g = 9.81;
    const accelX = (targetVel.x - this.bodyVel.x) / Math.max(dt, 0.001);
    const accelZ = (targetVel.z - this.bodyVel.z) / Math.max(dt, 0.001);
    this.zmp.set(
      this.bodyPos.x - (this.bodyPos.y / g) * accelX * 0.15,
      this.bodyPos.z - (this.bodyPos.y / g) * accelZ * 0.15
    );

    // 4. Virtual Joint Simulation for Each Leg (Inverse Kinematics + Dynamic PD)
    const bodyMatrix = this.chassisGroup.matrixWorld;

    this.legs.forEach((leg, index) => {
      // Local Leg Phase
      const legPhase = (this.gaitPhase + leg.phaseOffset) % (Math.PI * 2);
      const isSwing = Math.sin(legPhase) > 0 && desiredSpeed > 0.1;
      leg.isStance = !isSwing;

      // Desired Foot Position in World Space
      // Base rest position relative to current body heading
      const restWorld = leg.restOffset.clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading)
        .add(this.bodyPos);
      restWorld.y = 0; // ground contact height

      // In swing phase: lift foot up and advance forward in direction of motion
      if (isSwing) {
        const swingProgress = Math.sin(legPhase);
        const stepLength = desiredSpeed * 0.45;
        const stepLift = 0.28 * Math.sin(legPhase);

        leg.footTargetPos.copy(restWorld)
          .addScaledVector(forwardDir, stepLength * (swingProgress - 0.5))
          .setY(stepLift);
        leg.inContact = false;
        leg.normalForce = 0;
      } else {
        // Stance phase: foot anchored to ground plane
        leg.footTargetPos.copy(restWorld).setY(0);
        leg.inContact = true;
        leg.normalForce = 160 + Math.cos(legPhase) * 40;
      }

      // Smooth step towards target
      leg.footWorldPos.lerp(leg.footTargetPos, dt * 14.0);

      // Inverse Kinematics to calculate target joint angles
      // Vector from hip mount in world space to foot
      const hipWorldPos = new THREE.Vector3();
      leg.hipJoint.object.getWorldPosition(hipWorldPos);
      const legVec = leg.footWorldPos.clone().sub(hipWorldPos);
      const legDist = legVec.length();

      const femurL = this.baseHeight * 0.52;
      const tibiaL = this.baseHeight * 0.55;

      // Law of Cosines for Knee Angle
      const clampedDist = THREE.MathUtils.clamp(legDist, 0.2, femurL + tibiaL - 0.05);
      const cosKnee = (femurL * femurL + tibiaL * tibiaL - clampedDist * clampedDist) / (2 * femurL * tibiaL);
      const kneeTarget = -Math.acos(THREE.MathUtils.clamp(cosKnee, -1, 1)) + Math.PI * 0.45;

      // Hip pitch angle based on forward displacement
      const hipTarget = Math.sin(legPhase) * 0.35 * (desiredSpeed > 0.1 ? 1 : 0);
      const ankleTarget = -kneeTarget * 0.5;

      leg.hipJoint.targetAngle = THREE.MathUtils.clamp(hipTarget, leg.hipJoint.minAngle, leg.hipJoint.maxAngle);
      leg.kneeJoint.targetAngle = THREE.MathUtils.clamp(kneeTarget, leg.kneeJoint.minAngle, leg.kneeJoint.maxAngle);
      leg.ankleJoint.targetAngle = THREE.MathUtils.clamp(ankleTarget, leg.ankleJoint.minAngle, leg.ankleJoint.maxAngle);

      // Update Contact Ring Indicator position
      if (this.contactRings[index]) {
        this.contactRings[index].position.set(leg.footWorldPos.x, 0.02, leg.footWorldPos.z);
        this.contactRings[index].scale.setScalar(leg.inContact ? 1.0 : 0.4);
      }
    });

    // 5. Dynamic PD Joint Controller Simulation
    this.joints.forEach((j) => {
      const err = j.targetAngle - j.currentAngle;
      // PD controller torque calculation
      j.torque = j.kp * err - j.kd * j.velocity;
      j.torque = THREE.MathUtils.clamp(j.torque, -j.maxTorque, j.maxTorque);
      j.load = Math.abs(j.torque) / j.maxTorque;

      // Numerical acceleration integration
      const accel = j.torque * 0.08;
      j.velocity += accel * dt;
      j.velocity *= 0.94; // damping
      j.currentAngle += j.velocity * dt;

      // Apply angle rotation to joint object
      if (j.axis === 'x') j.object.rotation.x = j.currentAngle;
      if (j.axis === 'y') j.object.rotation.y = j.currentAngle;
      if (j.axis === 'z') j.object.rotation.z = j.currentAngle;
    });

    // RL Policy Cumulative Reward Tracking
    const stabilityReward = this.stabilityScore * 0.01;
    const forwardReward = desiredSpeed * 0.8;
    this.rlReward += (stabilityReward + forwardReward - 0.2) * dt;
  }

  /**
   * Returns live real-time telemetry data for HUD display
   */
  public getTelemetry(): LocomotionTelemetryData {
    const virtualJoints: VirtualJointState[] = this.joints.map((j) => ({
      id: j.id,
      name: j.name,
      angle: j.currentAngle,
      targetAngle: j.targetAngle,
      angularVelocity: j.velocity,
      torque: j.torque,
      load: j.load,
    }));

    const groundContacts: GroundContactState[] = this.legs.map((l) => ({
      id: l.id,
      name: l.name,
      inContact: l.inContact,
      normalForce: l.normalForce,
      slip: l.slip,
    }));

    let targetLabel = 'Autonomous Wander Waypoint';
    if (this.navMode === 'follow_pointer') targetLabel = 'Cursor Target';
    if (this.navMode === 'follow_hand') targetLabel = 'Hand Tracking Coordinates';
    if (this.navMode === 'follow_voice') targetLabel = 'Acoustic Sound Resonance';
    if (this.navMode === 'patrol') targetLabel = 'Patrol Orbit';

    return {
      active: this.enabled,
      gaitType: this.gaitType,
      locomotionState: this.locomotionState,
      velocity: {
        x: this.bodyVel.x,
        y: this.bodyVel.y,
        z: this.bodyVel.z,
        speed: this.bodyVel.length(),
      },
      heading: this.heading,
      com: { x: this.com.x, y: this.com.y, z: this.com.z },
      zmp: { x: this.zmp.x, z: this.zmp.y },
      balanceMargin: THREE.MathUtils.clamp(1.0 - Math.hypot(this.zmp.x - this.com.x, this.zmp.y - this.com.z) * 0.4, 0, 1),
      stabilityScore: Math.round(this.stabilityScore),
      rlReward: Math.round(this.rlReward * 10) / 10,
      joints: virtualJoints,
      contacts: groundContacts,
      navTarget: {
        x: this.navTarget.x,
        y: this.navTarget.y,
        z: this.navTarget.z,
        label: targetLabel,
      },
      isRecoveringFromImpulse: this.isRecoveringFromImpulse,
    };
  }
}
