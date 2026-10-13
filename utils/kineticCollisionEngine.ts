/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { audioEngine } from './audioEngine';
import { getGlowColors } from './arcaneTextures';
import { GlowTheme } from '../types';

export interface KineticProbe {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  radius: number;
  life: number;
  maxLife: number;
  bounceCount: number;
  trailLine: THREE.Line;
  trailPositions: Float32Array;
  trailGeo: THREE.BufferGeometry;
}

/**
 * Calculates local mathematical surface radius of the ferrofluid in direction dir
 */
export function getFerrofluidSurfaceRadius(
  dir: THREE.Vector3,
  baseRadius: number,
  time: number,
  magneticStrength: number,
  spikeDensity: number,
  spikeHeight: number,
  morphIntensity: number,
  isSolidSurface = true
): number {
  let disp = 0.0;

  // Quadrupole morphing body
  if (morphIntensity > 0.001) {
    const cosT = dir.y;
    const p2 = 0.5 * (3.0 * cosT * cosT - 1.0);
    const bodyStretch = Math.sin(time * 1.8) * p2 * 0.44;
    const phiAngle = Math.atan2(dir.z, dir.x);
    const eqSqueeze = Math.cos(2.0 * phiAngle + time * 1.4) * (1.0 - cosT * cosT) * 0.32;
    disp += (bodyStretch + eqSqueeze) * morphIntensity * 0.3;
  }

  // Cymatic standing ripple
  const waveK = spikeDensity * 0.75;
  const h1 = Math.sin(dir.x * waveK + time * 2.0);
  const h2 = Math.cos(dir.y * waveK * 1.15 - time * 1.6);
  const cymatic = (h1 * h2) * (magneticStrength * 0.22 + 0.06);
  disp += cymatic * spikeHeight;

  // Solid surface constraint: surface displacement cannot collapse below the solid base
  if (isSolidSurface) {
    disp = Math.max(0.0, disp);
  }

  return baseRadius + disp;
}

/**
 * High-performance Collision Sparks System
 * Spawns incandescent glowing sparks radiating outward along reflection normals on impact
 */
export class CollisionSparksSystem {
  public group: THREE.Group;
  private maxSparks = 180;
  private positions: Float32Array;
  private colors: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private maxLifetimes: Float32Array;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private activeCount = 0;

  constructor(glowTheme: GlowTheme = 'cyan') {
    this.group = new THREE.Group();
    this.positions = new Float32Array(this.maxSparks * 3);
    this.colors = new Float32Array(this.maxSparks * 3);
    this.velocities = new Float32Array(this.maxSparks * 3);
    this.lifetimes = new Float32Array(this.maxSparks);
    this.maxLifetimes = new Float32Array(this.maxSparks);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const themeColor = new THREE.Color(getGlowColors(glowTheme).hex);
    this.material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);
  }

  public emit(point: THREE.Vector3, normal: THREE.Vector3, count = 8, themeHex = '#00ffff') {
    const baseCol = new THREE.Color(themeHex);
    const hotWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      const idx = (this.activeCount + i) % this.maxSparks;
      this.positions[idx * 3] = point.x + (Math.random() - 0.5) * 0.05;
      this.positions[idx * 3 + 1] = point.y + (Math.random() - 0.5) * 0.05;
      this.positions[idx * 3 + 2] = point.z + (Math.random() - 0.5) * 0.05;

      // Cone emission along reflection normal with tangent scatter
      const spread = 0.65;
      const vx = normal.x + (Math.random() - 0.5) * spread;
      const vy = normal.y + (Math.random() - 0.5) * spread;
      const vz = normal.z + (Math.random() - 0.5) * spread;
      const speed = 0.08 + Math.random() * 0.14;

      const v = new THREE.Vector3(vx, vy, vz).normalize().multiplyScalar(speed);
      this.velocities[idx * 3] = v.x;
      this.velocities[idx * 3 + 1] = v.y;
      this.velocities[idx * 3 + 2] = v.z;

      this.lifetimes[idx] = 0;
      this.maxLifetimes[idx] = 0.35 + Math.random() * 0.35;

      // Hot core spark color
      const c = Math.random() > 0.4 ? hotWhite : baseCol;
      this.colors[idx * 3] = c.r;
      this.colors[idx * 3 + 1] = c.g;
      this.colors[idx * 3 + 2] = c.b;
    }

    this.activeCount = (this.activeCount + count) % this.maxSparks;
  }

  public update(dt: number) {
    let hasLive = false;
    for (let i = 0; i < this.maxSparks; i++) {
      if (this.lifetimes[i] < this.maxLifetimes[i]) {
        this.lifetimes[i] += dt;
        hasLive = true;

        // Position update
        this.positions[i * 3] += this.velocities[i * 3];
        this.positions[i * 3 + 1] += this.velocities[i * 3 + 1];
        this.positions[i * 3 + 2] += this.velocities[i * 3 + 2];

        // Deceleration & subtle gravity
        this.velocities[i * 3] *= 0.94;
        this.velocities[i * 3 + 1] *= 0.94;
        this.velocities[i * 3 + 2] *= 0.94;

        // Fade brightness
        const progress = this.lifetimes[i] / this.maxLifetimes[i];
        const fade = Math.max(0, 1.0 - progress);
        this.colors[i * 3] *= fade;
        this.colors[i * 3 + 1] *= fade;
        this.colors[i * 3 + 2] *= fade;
      } else {
        this.positions[i * 3 + 1] = -999;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

/**
 * Interactive Kinetic Bouncing Probe Swarm
 * Luminous orbital collider spheres that bounce vigorously off the solid ferrofluid surface
 */
export class KineticProbeSystem {
  public group: THREE.Group;
  public probes: KineticProbe[] = [];
  public sparks: CollisionSparksSystem;
  private sphereGeo: THREE.SphereGeometry;
  private probeMat: THREE.MeshPhysicalMaterial;
  private themeHex: string;

  constructor(count = 14, glowTheme: GlowTheme = 'cyan') {
    this.group = new THREE.Group();
    this.themeHex = getGlowColors(glowTheme).hex;
    this.sparks = new CollisionSparksSystem(glowTheme);
    this.group.add(this.sparks.group);

    this.sphereGeo = new THREE.SphereGeometry(0.09, 16, 16);
    this.probeMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070a,
      emissive: new THREE.Color(this.themeHex),
      emissiveIntensity: 1.2,
      metalness: 0.95,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    for (let i = 0; i < count; i++) {
      this.spawnProbe(i, count);
    }
  }

  public spawnProbe(index: number, total: number) {
    const mesh = new THREE.Mesh(this.sphereGeo, this.probeMat);
    const ang = (index / total) * Math.PI * 2;
    const dist = 5.2 + Math.random() * 2.5;
    const y = (Math.random() - 0.5) * 3.5;

    mesh.position.set(Math.cos(ang) * dist, y, Math.sin(ang) * dist);

    // Initial orbital velocity tangential to center
    const speed = 0.035 + Math.random() * 0.03;
    const tanX = -Math.sin(ang) * speed + (Math.random() - 0.5) * 0.015;
    const tanY = (Math.random() - 0.5) * 0.02;
    const tanZ = Math.cos(ang) * speed + (Math.random() - 0.5) * 0.015;

    // Trail line
    const trailSegments = 16;
    const trailPositions = new Float32Array(trailSegments * 3);
    for (let t = 0; t < trailSegments; t++) {
      trailPositions[t * 3] = mesh.position.x;
      trailPositions[t * 3 + 1] = mesh.position.y;
      trailPositions[t * 3 + 2] = mesh.position.z;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.themeHex),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);

    this.group.add(mesh);
    this.group.add(trailLine);

    this.probes.push({
      mesh,
      vel: new THREE.Vector3(tanX, tanY, tanZ),
      radius: 0.09,
      life: 0,
      maxLife: 60,
      bounceCount: 0,
      trailLine,
      trailPositions,
      trailGeo,
    });
  }

  /**
   * Launch an intentional high-speed kinetic probe directly at the ferrofluid to watch it bounce
   */
  public launchUserProbe(fromPos: THREE.Vector3, targetPos: THREE.Vector3, speed = 0.32) {
    const mesh = new THREE.Mesh(this.sphereGeo, this.probeMat);
    mesh.position.copy(fromPos);

    const dir = targetPos.clone().sub(fromPos).normalize();
    const vel = dir.multiplyScalar(speed);

    // Trail
    const trailSegments = 20;
    const trailPositions = new Float32Array(trailSegments * 3);
    for (let t = 0; t < trailSegments; t++) {
      trailPositions[t * 3] = fromPos.x;
      trailPositions[t * 3 + 1] = fromPos.y;
      trailPositions[t * 3 + 2] = fromPos.z;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);

    this.group.add(mesh);
    this.group.add(trailLine);

    this.probes.push({
      mesh,
      vel,
      radius: 0.12,
      life: 0,
      maxLife: 25,
      bounceCount: 0,
      trailLine,
      trailPositions,
      trailGeo,
    });

    audioEngine.playMagneticPulse(0.8);
  }

  /**
   * Physics loop: checks collision and performs true elastic rebound bounce off solid ferrofluid surface
   */
  public update(
    dt: number,
    orbCenter: THREE.Vector3,
    baseRadius: number,
    time: number,
    magneticStrength: number,
    spikeDensity: number,
    spikeHeight: number,
    morphIntensity: number,
    restitution = 1.35,
    soundEnabled = true
  ) {
    this.sparks.update(dt);

    const probeCount = this.probes.length;
    for (let i = 0; i < probeCount; i++) {
      const probe = this.probes[i];
      probe.life += dt;

      // 1. Centripetal Magnetic Attraction toward the Ferrofluid Core
      const toCenter = orbCenter.clone().sub(probe.mesh.position);
      const distToCenter = toCenter.length();
      if (distToCenter > 0.001) {
        const pullDir = toCenter.clone().normalize();
        // Magnetic pull law ~ 1/r^1.5
        const pullStrength = (0.0028 * (magneticStrength + 0.5)) / Math.max(1.2, distToCenter * 0.8);
        probe.vel.addScaledVector(pullDir, pullStrength);
      }

      // Update position
      probe.mesh.position.add(probe.vel);

      // 2. Continuous Solid Surface Collision & Elastic Rebound Check
      const fromCenter = probe.mesh.position.clone().sub(orbCenter);
      const curDist = fromCenter.length();

      if (curDist > 0.001) {
        const normDir = fromCenter.clone().normalize();

        // Calculate exact mathematical solid surface boundary at this angular coordinate
        const solidSurfRadius = getFerrofluidSurfaceRadius(
          normDir,
          baseRadius,
          time,
          magneticStrength,
          spikeDensity,
          spikeHeight,
          morphIntensity,
          true
        );

        const collisionDist = solidSurfRadius + probe.radius;

        // COLLISION DETECTION: Has entity struck the solid surface boundary?
        if (curDist <= collisionDist) {
          // --- TRUE ELASTIC KINETIC REBOUND BOUNCE ---
          const collisionNormal = normDir.clone();
          const vDotN = probe.vel.dot(collisionNormal);

          // Only bounce if velocity is directed toward the core (inward)
          if (vDotN < 0) {
            // Elastic reflection formula: v' = v - (1 + e) * (v . n) * n
            const e = restitution; // rebound coefficient
            probe.vel.sub(collisionNormal.clone().multiplyScalar((1.0 + e) * vDotN));

            // Tangential deflection scatter
            const tangentScatter = new THREE.Vector3(
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            );
            probe.vel.add(tangentScatter);

            // Firmly position outside the solid surface boundary
            probe.mesh.position.copy(orbCenter).add(collisionNormal.clone().multiplyScalar(collisionDist + 0.04));

            probe.bounceCount++;

            // Emit incandescent collision sparks on impact
            const impactPt = probe.mesh.position.clone();
            this.sparks.emit(impactPt, collisionNormal, 8 + Math.floor(Math.random() * 6), this.themeHex);

            // Play elastic bounce acoustic ping
            if (soundEnabled) {
              const impactSpeed = Math.abs(vDotN) * 12.0;
              audioEngine.playSurfaceBounce(Math.min(2.0, Math.max(0.5, impactSpeed)));
            }
          }
        }
      }

      // 3. Update trail line behind probe
      const tp = probe.trailPositions;
      const tLen = tp.length / 3;
      for (let t = tLen - 1; t > 0; t--) {
        tp[t * 3] = tp[(t - 1) * 3];
        tp[t * 3 + 1] = tp[(t - 1) * 3 + 1];
        tp[t * 3 + 2] = tp[(t - 1) * 3 + 2];
      }
      tp[0] = probe.mesh.position.x;
      tp[1] = probe.mesh.position.y;
      tp[2] = probe.mesh.position.z;
      probe.trailGeo.attributes.position.needsUpdate = true;

      // Keep probes inside outer domain
      if (curDist > 16.0) {
        probe.vel.reflect(fromCenter.normalize()).multiplyScalar(0.7);
      }
    }
  }

  public updateTheme(glowTheme: GlowTheme) {
    this.themeHex = getGlowColors(glowTheme).hex;
    this.probeMat.emissive.set(new THREE.Color(this.themeHex));
  }

  public dispose() {
    this.sparks.dispose();
    this.sphereGeo.dispose();
    this.probeMat.dispose();
    this.probes.forEach((p) => {
      p.trailGeo.dispose();
      (p.trailLine.material as THREE.Material).dispose();
    });
  }
}
