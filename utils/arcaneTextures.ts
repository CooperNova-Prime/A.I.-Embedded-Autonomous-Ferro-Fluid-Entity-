/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Generates an ultra-crisp circular arcane ring texture with concentric rings,
 * compass ticks, mathematical vector formulas, and alchemical symbols.
 */
export function createArcaneRingTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.48;
  const s = size / 2048; // Proportional scaling relative to 2048px design master

  ctx.clearRect(0, 0, size, size);

  // Helper for drawing circles with strict positive radius guard
  const drawRing = (r: number, lineWidth = 1.5, strokeStyle = 'rgba(255, 255, 255, 0.4)', dash?: number[]) => {
    if (r <= 0 || !isFinite(r)) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(0.1, r), 0, Math.PI * 2);
    ctx.lineWidth = Math.max(0.5, lineWidth * s);
    ctx.strokeStyle = strokeStyle;
    if (dash) ctx.setLineDash(dash.map((d) => Math.max(1, d * s)));
    ctx.stroke();
    ctx.restore();
  };

  // Outer concentric boundaries
  drawRing(maxR, 3, 'rgba(255, 255, 255, 0.9)');
  drawRing(maxR - 12 * s, 1, 'rgba(255, 255, 255, 0.4)');
  drawRing(maxR - 24 * s, 1.5, 'rgba(255, 255, 255, 0.7)', [4, 4]);
  drawRing(maxR - 60 * s, 2, 'rgba(255, 255, 255, 0.8)');

  // 360-degree ticks & subdivisions
  for (let i = 0; i < 360; i += 2) {
    const rad = (i * Math.PI) / 180;
    const isMajor = i % 30 === 0;
    const isMedium = i % 10 === 0;
    const tickLen = (isMajor ? 32 : isMedium ? 18 : 8) * s;
    const r1 = maxR - 24 * s;
    const r2 = r1 - tickLen;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
    ctx.lineWidth = Math.max(0.5, (isMajor ? 2.5 : isMedium ? 1.5 : 0.8) * s);
    ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();

    // Degree numbers at major intervals
    if (isMajor && s >= 0.3) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad + Math.PI / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = `${Math.max(7, Math.round(16 * s))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i}°`, 0, -(r2 - 16 * s));
      ctx.restore();
    }
  }

  // Ring for Hermetic Alchemical Axioms
  const axiomRadius = maxR - 110 * s;
  drawRing(axiomRadius + 25 * s, 1, 'rgba(255, 255, 255, 0.3)');
  drawRing(axiomRadius - 25 * s, 1, 'rgba(255, 255, 255, 0.3)');

  if (axiomRadius > 20) {
    const textAxiom = 'QUOD EST SUPERIUS EST SICUT QUOD EST INFERIUS • VISITA INTERIORA TERRAE RECTIFICANDO INVENIES OCCULTUM LAPIDEM •';
    drawCurvedText(ctx, textAxiom, cx, cy, axiomRadius, `${Math.max(7, Math.round(18 * s))}px "Cinzel", serif`, 'rgba(255, 255, 255, 0.85)', 1.0);
  }

  // Mathematical Vector equations ring
  const mathRadius = maxR - 170 * s;
  drawRing(mathRadius + 22 * s, 1, 'rgba(255, 255, 255, 0.25)', [6, 4]);
  drawRing(mathRadius - 22 * s, 1, 'rgba(255, 255, 255, 0.25)', [6, 4]);

  if (mathRadius > 20) {
    const mathFormulaString = '∇ × B = μ₀J + μ₀ε₀∂E/∂t  ✦  ρ(∂u/∂t + u·∇u) = -∇p + μ∇²u + (M·∇)B  ✦  λ_c = 2π√(γ / (ρg + μ₀M²/2))  ✦  ∮ B·dA = 0  ✦  ĤΨ = iℏ∂Ψ/∂t  ✦  ';
    drawCurvedText(ctx, mathFormulaString, cx, cy, mathRadius, `${Math.max(6, Math.round(15 * s))}px "JetBrains Mono", monospace`, 'rgba(255, 255, 255, 0.75)', -1.0);
  }

  // Planetary & Elemental Alchemy Glyphs ring
  const glyphRadius = maxR - 240 * s;
  drawRing(glyphRadius + 26 * s, 1.5, 'rgba(255, 255, 255, 0.6)');
  drawRing(glyphRadius - 26 * s, 1.5, 'rgba(255, 255, 255, 0.6)');

  if (glyphRadius > 20) {
    const alchemicalSymbols = [
      { glyph: '☿', label: 'MERCURIUS' },
      { glyph: '🜍', label: 'SULFUR' },
      { glyph: '🜔', label: 'SAL' },
      { glyph: '☉', label: 'SOL' },
      { glyph: '☽', label: 'LUNA' },
      { glyph: '🜂', label: 'IGNIS' },
      { glyph: '🜄', label: 'AQUA' },
      { glyph: '🜁', label: 'AER' },
      { glyph: '🜃', label: 'TERRA' },
      { glyph: '♃', label: 'JUPITER' },
      { glyph: '♄', label: 'SATURNUS' },
      { glyph: '♂', label: 'MARS' },
    ];

    const stepRad = (Math.PI * 2) / alchemicalSymbols.length;
    for (let i = 0; i < alchemicalSymbols.length; i++) {
      const angle = i * stepRad;
      const sym = alchemicalSymbols[i];

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = `${Math.max(10, Math.round(32 * s))}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sym.glyph, 0, -glyphRadius);

      if (s >= 0.35) {
        ctx.font = `${Math.max(6, Math.round(10 * s))}px "JetBrains Mono", monospace`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(sym.label, 0, -glyphRadius + 18 * s);
      }
      ctx.restore();
    }
  }

  // Sacred Geometry Inscription (Hexagram & Metatron concentric polygons)
  const innerPolyRadius = maxR - 330 * s;
  if (innerPolyRadius > 10) {
    drawSacredGeometry(ctx, cx, cy, innerPolyRadius);
  }

  // Inner deep vortex ring
  const abyssR = maxR - 460 * s;
  drawRing(abyssR, 2, 'rgba(255, 255, 255, 0.9)');
  drawRing(abyssR - 15 * s, 1, 'rgba(255, 255, 255, 0.5)', [3, 3]);
  drawRing(abyssR - 40 * s, 1.5, 'rgba(255, 255, 255, 0.7)');

  // Center focal crosshairs & radial lines
  if (abyssR > 40 * s) {
    for (let a = 0; a < 12; a++) {
      const rad = (a * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * Math.max(0, abyssR - 40 * s), cy + Math.sin(rad) * Math.max(0, abyssR - 40 * s));
      ctx.lineTo(cx + Math.cos(rad) * Math.max(0, maxR - 60 * s), cy + Math.sin(rad) * Math.max(0, maxR - 60 * s));
      ctx.lineWidth = Math.max(0.5, 0.75 * s);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Draws curved text around a circular path
 */
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  font: string,
  color: string,
  direction = 1
) {
  if (radius <= 0 || !isFinite(radius)) return;
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = text.split('');
  const totalLength = ctx.measureText(text).width;
  const circumference = 2 * Math.PI * radius;
  if (circumference <= 0) {
    ctx.restore();
    return;
  }
  const angularSpread = (totalLength / circumference) * (Math.PI * 2);
  let currentAngle = -angularSpread / 2;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const charWidth = ctx.measureText(char).width;
    const charAngle = (charWidth / circumference) * (Math.PI * 2);

    ctx.save();
    ctx.translate(cx, cy);
    const angleToRotate = (currentAngle + charAngle / 2) * direction;
    ctx.rotate(angleToRotate);
    ctx.fillText(char, 0, direction === 1 ? -radius : radius);
    ctx.restore();

    currentAngle += charAngle;
  }
  ctx.restore();
}

/**
 * Draws sacred geometry interlocking triangles, concentric circles & Metatron lines
 */
function drawSacredGeometry(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  if (r <= 0 || !isFinite(r)) return;
  ctx.save();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

  // Upward triangle
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 - 90) * (Math.PI / 180);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Downward triangle (Seal of Solomon / Hexagram)
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 + 90) * (Math.PI / 180);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // 12-point star rays
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * (Math.PI / 180);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.stroke();

  ctx.restore();
}

/**
 * Returns color values and RGB triplets based on selected theme
 */
export function getGlowColors(theme: string) {
  switch (theme) {
    case 'gold':
      return {
        hex: '#f59e0b',
        rgbVec: new THREE.Vector3(0.96, 0.62, 0.04),
        ambient: '#78350f',
        accent: '#fef08a'
      };
    case 'purple':
      return {
        hex: '#a855f7',
        rgbVec: new THREE.Vector3(0.66, 0.33, 0.97),
        ambient: '#4c1d95',
        accent: '#f3e8ff'
      };
    case 'crimson':
      return {
        hex: '#ef4444',
        rgbVec: new THREE.Vector3(0.94, 0.27, 0.27),
        ambient: '#7f1d1d',
        accent: '#fecaca'
      };
    case 'emerald':
      return {
        hex: '#10b981',
        rgbVec: new THREE.Vector3(0.06, 0.72, 0.51),
        ambient: '#064e3b',
        accent: '#a7f3d0'
      };
    case 'mercury':
      return {
        hex: '#e2e8f0',
        rgbVec: new THREE.Vector3(0.88, 0.91, 0.94),
        ambient: '#334155',
        accent: '#ffffff'
      };
    case 'cyan':
    default:
      return {
        hex: '#06b6d4',
        rgbVec: new THREE.Vector3(0.02, 0.71, 0.83),
        ambient: '#164e63',
        accent: '#cffafe'
      };
  }
}

/**
 * Generates an equirectangular texture mapping the iconic tennis ball curvilinear seam
 * alongside subtle arcane glyphs and regulation dimension markings.
 */
export function createTennisBallSeamTexture(width = 2048, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep dark backing with subtle fibrous texture
  ctx.fillStyle = '#010204';
  ctx.fillRect(0, 0, width, height);

  // Trace the classic 3D tennis ball seam onto (u, v) equirectangular coordinates
  // Tennis ball parametric curve:
  // x(t) = a*cos(t) + b*cos(3t)
  // y(t) = a*sin(t) - b*sin(3t)
  // z(t) = 2*sqrt(a*b)*sin(2t)
  const a = 0.65;
  const b = 0.35;
  const sqrtab2 = 2 * Math.sqrt(a * b);
  const steps = 6000;

  // Draw wide ethereal glow behind seam
  ctx.save();
  ctx.shadowColor = 'rgba(34, 211, 238, 0.65)';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
  ctx.lineWidth = 14;
  ctx.beginPath();

  let lastU = -1;
  let lastV = -1;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    let x = a * Math.cos(t) + b * Math.cos(3 * t);
    let y = a * Math.sin(t) - b * Math.sin(3 * t);
    let z = sqrtab2 * Math.sin(2 * t);

    const len = Math.sqrt(x * x + y * y + z * z);
    x /= len;
    y /= len;
    z /= len;

    // Equirectangular mapping
    const u = 0.5 + Math.atan2(x, z) / (Math.PI * 2);
    const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, y))) / Math.PI;

    const px = u * width;
    const py = v * height;

    if (i === 0 || Math.abs(u - lastU) > 0.4) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
    lastU = u;
    lastV = v;
  }
  ctx.stroke();
  ctx.restore();

  // Draw sharp bright luminous seam core
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  lastU = -1;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    let x = a * Math.cos(t) + b * Math.cos(3 * t);
    let y = a * Math.sin(t) - b * Math.sin(3 * t);
    let z = sqrtab2 * Math.sin(2 * t);

    const len = Math.sqrt(x * x + y * y + z * z);
    x /= len;
    y /= len;
    z /= len;

    const u = 0.5 + Math.atan2(x, z) / (Math.PI * 2);
    const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, y))) / Math.PI;

    const px = u * width;
    const py = v * height;

    if (i === 0 || Math.abs(u - lastU) > 0.4) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
    lastU = u;
  }
  ctx.stroke();
  ctx.restore();

  // Add subtle technical stamp
  ctx.save();
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillText('FERROFLUID 6.70cm Ø - REGULATION TENNIS BALL SCALE', width * 0.15, height * 0.48);
  ctx.fillText('r=3.35cm | C=21.05cm | A=141.03cm² | V=157.48cm³', width * 0.15, height * 0.52);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

