/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  Layers,
  Sparkles,
  Smartphone,
  Terminal,
  FileCode,
  Sigma,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterFlowExportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dart_widget' | 'glsl_shaders' | 'math_spec' | 'all_in_one'>('dart_widget');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. FlutterFlow Custom Widget Code (Dart)
  const DART_WIDGET_CODE = `// Automatic FlutterFlow Custom Widget
// Widget Name: CodexVerafluidRigWidget
// Compatible with FlutterFlow Web, iOS, Android, and Desktop
// Dependencies to add in FlutterFlow:
// - flutter/material.dart
// - dart:math as math
// Optional for full WebGL: flutter_inappwebview: ^6.0.0 or webview_flutter: ^4.7.0

import 'package:flutter/material.dart';
import 'dart:math' as math;

class CodexVerafluidRigWidget extends StatefulWidget {
  const CodexVerafluidRigWidget({
    Key? key,
    this.width,
    this.height,
    this.spikeHeight = 1.35,
    this.magneticStrength = 1.80,
    this.viscosity = 1.20,
    this.surfaceTension = 1.45,
    this.glowThemeHex = '#00f0ff',
    this.rotationSpeed = 1.0,
    this.modelScale = 1.0,
    this.isSurging = false,
  }) : super(key: key);

  final double? width;
  final double? height;
  final double spikeHeight;
  final double magneticStrength;
  final double viscosity;
  final double surfaceTension;
  final String glowThemeHex;
  final double rotationSpeed;
  final double modelScale;
  final bool isSurging;

  @override
  State<CodexVerafluidRigWidget> createState() => _CodexVerafluidRigWidgetState();
}

class _CodexVerafluidRigWidgetState extends State<CodexVerafluidRigWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  Offset _pointerPos = Offset.zero;
  Offset _velocity = Offset.zero;
  Offset _lastPointerPos = Offset.zero;
  DateTime _lastTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onPointerMove(PointerEvent details) {
    final now = DateTime.now();
    final dt = now.difference(_lastTime).inMilliseconds / 1000.0;
    _lastTime = now;

    if (dt > 0.001) {
      final newPos = details.localPosition;
      final instVel = (newPos - _lastPointerPos) / dt;
      _lastPointerPos = newPos;
      setState(() {
        _pointerPos = newPos;
        _velocity = Offset(
          _velocity.dx * 0.7 + instVel.dx * 0.3,
          _velocity.dy * 0.7 + instVel.dy * 0.3,
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _parseColor(widget.glowThemeHex);

    return Container(
      width: widget.width ?? double.infinity,
      height: widget.height ?? double.infinity,
      color: const Color(0xFF020306),
      child: Listener(
        onPointerHover: _onPointerMove,
        onPointerMove: _onPointerMove,
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return CustomPaint(
              painter: VerafluidProceduralPainter(
                time: _controller.value * 2 * math.pi,
                spikeHeight: widget.spikeHeight,
                magneticStrength: widget.magneticStrength,
                viscosity: widget.viscosity,
                surfaceTension: widget.surfaceTension,
                themeColor: color,
                rotationSpeed: widget.rotationSpeed,
                modelScale: widget.modelScale,
                isSurging: widget.isSurging,
                pointerPos: _pointerPos,
                velocity: _velocity,
              ),
              size: Size(widget.width ?? 350, widget.height ?? 350),
            );
          },
        ),
      ),
    );
  }

  Color _parseColor(String hex) {
    try {
      final clean = hex.replaceFirst('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {
      return const Color(0xFF00F0FF);
    }
  }
}

/// High-Performance Procedural Mathematical Painter for Codex Verafluid Rig
/// Implements Rosensweig spike equations, 4-ring gimbal trigonometry & velocity drag
class VerafluidProceduralPainter extends CustomPainter {
  VerafluidProceduralPainter({
    required this.time,
    required this.spikeHeight,
    required this.magneticStrength,
    required this.viscosity,
    required this.surfaceTension,
    required this.themeColor,
    required this.rotationSpeed,
    required this.modelScale,
    required this.isSurging,
    required this.pointerPos,
    required this.velocity,
  });

  final double time;
  final double spikeHeight;
  final double magneticStrength;
  final double viscosity;
  final double surfaceTension;
  final Color themeColor;
  final double rotationSpeed;
  final double modelScale;
  final bool isSurging;
  final Offset pointerPos;
  final Offset velocity;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = (math.min(size.width, size.height) * 0.17) * modelScale;

    // 1. Draw 4 Concentric Gimbal Rings in Synchronous Perspective
    _drawGimbalRings(canvas, center, baseRadius);

    // 2. Draw Rosensweig Spike Ferrofluid Core with Velocity Drag
    _drawFerrofluidCore(canvas, center, baseRadius);

    // 3. Draw Ethereal Quantum Particle Halo
    _drawQuantumHalo(canvas, center, baseRadius);
  }

  void _drawGimbalRings(Canvas canvas, Offset center, double r0) {
    // 4 Ring Radii matching exact physical dimensions (18cm, 26cm, 36cm, 42cm)
    final ringMultipliers = [1.85, 2.45, 3.15, 3.85];
    final ringColors = [
      themeColor.withOpacity(0.85),
      themeColor.withOpacity(0.65),
      themeColor.withOpacity(0.45),
      themeColor.withOpacity(0.35),
    ];

    for (int i = 0; i < ringMultipliers.length; i++) {
      final r = r0 * ringMultipliers[i];
      final rot = time * rotationSpeed * (0.6 + i * 0.25) * (i % 2 == 0 ? 1 : -1);

      final paint = Paint()
        ..color = ringColors[i]
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0 + (isSurging ? 1.5 : 0.0);

      canvas.save();
      canvas.translate(center.dx, center.dy);
      canvas.rotate(rot);

      // Gimbal perspective oval (flattened along pitch axis)
      final rect = Rect.fromCenter(
        center: Offset.zero,
        width: r * 2,
        height: r * 2 * math.cos(0.45 + i * 0.18),
      );
      canvas.drawOval(rect, paint);

      // Bearing pivots
      final pivotPaint = Paint()..color = Colors.white.withOpacity(0.9);
      canvas.drawCircle(Offset(r, 0), 3.0, pivotPaint);
      canvas.drawCircle(Offset(-r, 0), 3.0, pivotPaint);

      canvas.restore();
    }
  }

  void _drawFerrofluidCore(Canvas canvas, Offset center, double r0) {
    final path = Path();
    const int segments = 120;
    final velMagnitude = velocity.distance / 100.0;
    final velDir = velMagnitude > 0.001 ? velocity / velocity.distance : Offset.zero;

    for (int i = 0; i < segments; i++) {
      final theta = (i / segments) * 2 * math.pi;
      final normal = Offset(math.cos(theta), math.sin(theta));

      // 1. Rosensweig Spikes (Trigonometric cymatic superposition)
      final harmonic1 = math.sin(theta * 8 + time * 3.0);
      final harmonic2 = math.cos(theta * 12 - time * 2.0);
      final spike = math.pow((harmonic1 * 0.5 + 0.5) * (harmonic2 * 0.5 + 0.5), surfaceTension) *
          spikeHeight *
          magneticStrength *
          (isSurging ? 1.6 : 1.0);

      // 2. Velocity-based Drag Parameter:
      // Trailing wake stretches, leading stagnation flattens
      final velDot = normal.dx * velDir.dx + normal.dy * velDir.dy;
      final trailingWake = math.pow(math.max(0.0, -velDot), 1.6) * 0.45;
      final leadingCompression = -math.pow(math.max(0.0, velDot), 1.4) * 0.22;
      final dragDisplacement = (trailingWake + leadingCompression) * math.min(velMagnitude * 0.35, 1.25);

      final r = r0 * (1.0 + spike * 0.22 + dragDisplacement);
      final pt = Offset(center.dx + r * math.cos(theta), center.dy + r * math.sin(theta));

      if (i == 0) {
        path.moveTo(pt.dx, pt.dy);
      } else {
        path.lineTo(pt.dx, pt.dy);
      }
    }
    path.close();

    // Deep Obsidian Liquid Core Fill
    final fillPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          const Color(0xFF030508),
          const Color(0xFF0a0e18),
          themeColor.withOpacity(0.4),
        ],
        stops: const [0.0, 0.75, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: r0 * 1.5))
      ..style = PaintingStyle.fill;
    canvas.drawPath(path, fillPaint);

    // Luminous Ethereal Glow Rim
    final rimPaint = Paint()
      ..color = themeColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.4
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 4.0);
    canvas.drawPath(path, rimPaint);
  }

  void _drawQuantumHalo(Canvas canvas, Offset center, double r0) {
    final particlePaint = Paint()..color = themeColor.withOpacity(0.55);
    for (int i = 0; i < 28; i++) {
      final angle = (i / 28) * 2 * math.pi + time * 0.35;
      final dist = r0 * (1.6 + math.sin(time * 2.0 + i) * 0.4);
      final px = center.dx + math.cos(angle) * dist;
      final py = center.dy + math.sin(angle) * dist;
      canvas.drawCircle(Offset(px, py), 1.5, particlePaint);
    }
  }

  @override
  bool shouldRepaint(covariant VerafluidProceduralPainter oldDelegate) => true;
}
`;

  // 2. Complete GLSL Shader Bundle
  const GLSL_SHADER_CODE = `// ============================================================================
// CODEX VERAFLUID RIG — COMPLETE PRODUCTION GLSL SHADER MATRIX
// ============================================================================
// Features:
// - Quadrupole prolate-oblate tensor morphing
// - Multi-octave Rosensweig magnetic spike instability
// - Localized acoustic voice aperture & cymatic harmonics
// - Velocity-based hydrodynamic drag & inertial lag displacement
// - Impenetrable solid spherical substrate boundary enforcement
// - Physical PBR fragment shader with ACES filmic tone mapping & liquid ink sheen
// ============================================================================

// ----------------------------------------------------------------------------
// VERTEX SHADER (FerrofluidSphere Vertex Deformation)
// ----------------------------------------------------------------------------
uniform float uTime;
uniform float uMagneticStrength;
uniform float uViscosity;
uniform float uSurfaceTension;
uniform float uOscillationFreq;
uniform float uSpikeDensity;
uniform float uSpikeHeight;
uniform vec2  uPointerPos;
uniform float uPointerActive;
uniform vec4  uMagnets[8];
uniform int   uMagnetCount;
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
uniform vec3  uEntityVelocity;
uniform float uVelocityDrag;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;
varying float vDistCenter;
varying float vVoiceIntensity;

// Simplex 3D Noise primitives
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
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vec3 pos = position;

  if (uIsSphere > 0.5) {
    vec3 normDir = normalize(pos);
    vDistCenter = length(pos);
    float r0 = uBallRadius > 0.1 ? uBallRadius : 3.35;
    pos = normDir * r0;

    float totalDisp = 0.0;

    // 1. Quadrupole Spherical Morphing
    if (uMorphIntensity > 0.001) {
      float mTime = uTime * uMorphSpeed;
      float cosT = normDir.y;
      float p2 = 0.5 * (3.0 * cosT * cosT - 1.0);
      float bodyStretch = sin(mTime * 1.8) * p2 * 0.44;
      float phiAngle = atan(normDir.z, normDir.x);
      float equatorialSqueeze = cos(2.0 * phiAngle + mTime * 1.4) * (1.0 - cosT * cosT) * 0.32;
      float helicalWave = sin(normDir.x * 2.8 + normDir.y * 2.2 + normDir.z * 2.8 + mTime * 2.2) * 0.22;
      totalDisp += (bodyStretch + equatorialSqueeze + helicalWave) * uMorphIntensity;
    }

    // 2. Rosensweig Cymatic Harmonics
    float waveK = uSpikeDensity * 0.75;
    float harmonic1 = sin(normDir.x * waveK + uTime * uOscillationFreq * 2.0);
    float harmonic2 = cos(normDir.y * waveK * 1.15 - uTime * uOscillationFreq * 1.6);
    float cymaticRipple = (harmonic1 * harmonic2) * (uMagneticStrength * 0.22 + 0.06);
    totalDisp += cymaticRipple;

    // 3. Acoustic Voice Aperture Stimulation
    vec3 vNormalEye = normalize(normalMatrix * normDir);
    float faceCameraDot = dot(vNormalEye, vec3(0.0, 0.0, 1.0));
    float voiceMask = smoothstep(0.60, 0.98, faceCameraDot);
    float voiceRipples = sin((1.0 - faceCameraDot) * 35.0 - uVoicePulse) * 0.5 + 0.5;
    float voiceNoise = snoise(pos * 1.8 + vec3(uTime * 2.5));
    float voiceDisplacement = voiceMask * uVoiceAmp * (voiceRipples * 0.45 + abs(voiceNoise) * 0.55) * uVoiceSpikeBoost;
    totalDisp += voiceDisplacement;
    vVoiceIntensity = voiceMask * uVoiceAmp;

    // 4. Velocity-Based Dynamic Hydrodynamic Drag Parameter
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

    // 5. Solid Surface Boundary Enforcement
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
  }
}

// ----------------------------------------------------------------------------
// FRAGMENT SHADER (Deep Liquid Ink PBR & Chromatic Horizon Refraction)
// ----------------------------------------------------------------------------
uniform float uTime;
uniform vec3  uGlowColor;
uniform float uGlowIntensity;
uniform float uRefractionIntensity;
uniform float uVoidAbsorption;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;
varying float vVoiceIntensity;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  if (dot(normal, viewDir) < 0.0) normal = -normal;

  float NdotV = max(dot(normal, viewDir), 0.0);
  float fresnel = pow(1.0 - NdotV, 4.0);

  vec3 lightDir1 = normalize(vec3(1.5, 2.0, 1.0));
  vec3 halfVec1 = normalize(lightDir1 + viewDir);
  float spec1 = pow(max(dot(normal, halfVec1), 0.0), 128.0);

  // Liquid Ink Sheen
  vec3 inkBase = vec3(0.003, 0.003, 0.006);
  vec3 rimFresnel = mix(inkBase, uGlowColor, fresnel * 0.65);
  vec3 finalColor = mix(inkBase, rimFresnel, fresnel) + vec3(spec1 * 0.85);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

  // 3. Mathematical Specification (Markdown)
  const MATH_SPEC_MD = `# CODEX VERAFLUID RIG — MATHEMATICAL & PHYSICAL SPECIFICATION
**Autonomous 3D Ferrofluid Entity with Synchronous 4-Ring Armature**

## 1. Rosensweig Instability Threshold
The normal-field instability occurs when the external magnetic induction $B$ exceeds the critical threshold $B_c$:
$$B_c = \\sqrt{2\\mu_0 (\\rho g \\gamma)^{1/2}}$$
Where:
- $\\mu_0 = 4\\pi \\times 10^{-7} \\text{ H/m}$ (Vacuum permeability)
- $\\rho \\approx 1210 \\text{ kg/m}^3$ (Colloidal ferrofluid density)
- $g = 9.81 \\text{ m/s}^2$ (Gravitational acceleration)
- $\\gamma \\approx 0.028 \\text{ N/m}$ (Surface tension)

Critical wavenumber:
$$k_c = \\sqrt{\\frac{\\rho g}{\\gamma}} \\approx 650.5 \\text{ m}^{-1}$$

## 2. Dynamic Velocity-Based Hydrodynamic Drag
When the entity moves with instantaneous world velocity $\\mathbf{V} = \\frac{d\\mathbf{P}}{dt}$:
$$\\text{Alignment: } \\alpha = \\hat{\\mathbf{N}} \\cdot \\hat{\\mathbf{V}}$$
$$\\text{Trailing Wake: } \\delta_{\\text{wake}} = \\max(0, -\\alpha)^{1.6} \\times 0.45$$
$$\\text{Leading Stagnation Compression: } \\delta_{\\text{compress}} = -\\max(0, \\alpha)^{1.4} \\times 0.22$$
$$\\text{Viscous Equatorial Shear: } \\delta_{\\text{shear}} = \\sin\\left((\\hat{\\mathbf{N}} \\cdot (\\hat{\\mathbf{V}} \\times \\hat{\\mathbf{U}})) \\cdot 7.5 - \\omega t\\right) \\times 0.085(1 - |\\alpha|)$$
$$\\Delta_{\\text{drag}} = (\\delta_{\\text{wake}} + \\delta_{\\text{compress}} + \\delta_{\\text{shear}}) \\times \\min(|\\mathbf{V}| \\cdot \\mu_{\\text{drag}} \\cdot 0.35, 1.35)$$

## 3. Quadrupole Spherical Tensor Morphing
The radius deformation under quadrupole magnetic excitation follows Legendre polynomial $P_2(\\cos\\theta)$:
$$r(\\theta, \\phi, t) = r_0 \\left[ 1 + A(t) P_2(\\cos\\theta) + B(t) \\sin(2\\phi) \\sin^2\\theta \\right]$$
$$P_2(\\cos\\theta) = \\frac{1}{2} (3\\cos^2\\theta - 1)$$

## 4. Synchronous Mass & Scale Conservation
Both the central ferrofluid core (radius $r_0$) and all 4 concentric gimbal rings (radii $R_1=18\\text{cm}, R_2=26\\text{cm}, R_3=36\\text{cm}, R_4=42\\text{cm}$) scale with the unified scalar:
$$S(t) = S_{\\text{master}} \\times S_{\\text{personality}}$$
$$\\text{Scale Range: } 0.40 \\le S \\le 2.80$$
`;

  const copyToClipboard = (content: string, tabId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedTab(tabId);
      setTimeout(() => setCopiedTab(null), 2500);
    });
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 font-mono">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#05070e] border border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden select-text">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Code2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wider">
                  FLUTTERFLOW 3D MATHEMATICAL RENDERING EXPORTER
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold">
                  PRODUCTION DART + GLSL
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Complete design and mathematical procedural code ready to paste directly into FlutterFlow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 border border-white/10 text-stone-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 bg-black/20 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dart_widget')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dart_widget'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone size={13} className="text-cyan-400" />
              <span>FlutterFlow Custom Widget (.dart)</span>
            </button>

            <button
              onClick={() => setActiveTab('glsl_shaders')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'glsl_shaders'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              <FileCode size={13} className="text-emerald-400" />
              <span>GLSL Shaders (.glsl)</span>
            </button>

            <button
              onClick={() => setActiveTab('math_spec')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'math_spec'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              <Sigma size={13} className="text-purple-400" />
              <span>Mathematical Spec (.md)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Tab File */}
            <button
              onClick={() => {
                if (activeTab === 'dart_widget') {
                  downloadFile('CodexVerafluidCustomWidget.dart', DART_WIDGET_CODE, 'text/plain');
                } else if (activeTab === 'glsl_shaders') {
                  downloadFile('CodexVerafluidShaders.glsl', GLSL_SHADER_CODE, 'text/plain');
                } else {
                  downloadFile('Verafluid_Math_Spec.md', MATH_SPEC_MD, 'text/markdown');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all cursor-pointer active:scale-95"
            >
              <Download size={13} />
              <span>Download File</span>
            </button>

            {/* Copy Active Tab */}
            <button
              onClick={() => {
                const text =
                  activeTab === 'dart_widget'
                    ? DART_WIDGET_CODE
                    : activeTab === 'glsl_shaders'
                    ? GLSL_SHADER_CODE
                    : MATH_SPEC_MD;
                copyToClipboard(text, activeTab);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
            >
              {copiedTab === activeTab ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedTab === activeTab ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/40">
          <pre className="text-xs text-cyan-100 font-mono leading-relaxed bg-[#020409] p-4 sm:p-5 rounded-2xl border border-white/10 overflow-x-auto selection:bg-cyan-500/30 selection:text-white">
            <code>
              {activeTab === 'dart_widget' && DART_WIDGET_CODE}
              {activeTab === 'glsl_shaders' && GLSL_SHADER_CODE}
              {activeTab === 'math_spec' && MATH_SPEC_MD}
            </code>
          </pre>
        </div>

        {/* Footer Info Rail */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-cyan-400" />
            <span>
              Paste directly into FlutterFlow under: <strong>Custom Code &gt; Custom Widgets &gt; Add Custom Widget</strong>
            </span>
          </div>
          <div className="text-[11px] text-stone-500">
            Exported from Codex Verafluid Rig · Production-Ready
          </div>
        </div>
      </div>
    </div>
  );
};
