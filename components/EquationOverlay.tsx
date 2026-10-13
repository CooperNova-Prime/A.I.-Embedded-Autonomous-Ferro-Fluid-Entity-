/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FerrofluidConfig } from '../types';
import { Info, BookOpen, Atom, Sparkles, X, ChevronRight, CircleDot } from 'lucide-react';
import { calculateTennisBallMetrics } from '../services/geminiService';

interface Props {
  config: FerrofluidConfig;
  onOpenTennisModal?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const EquationOverlay: React.FC<Props> = ({ config, onOpenTennisModal, isOpen, onClose }) => {
  const [internalShowCodex, setInternalShowCodex] = useState(false);
  const [codexTab, setCodexTab] = useState<'physics' | 'alchemy' | 'tennis'>('physics');

  const showCodex = isOpen !== undefined ? isOpen : internalShowCodex;
  const handleCloseCodex = () => {
    if (onClose) onClose();
    setInternalShowCodex(false);
  };

  // Compute live physics telemetry
  const criticalFieldBc = (Math.sqrt(config.surfaceTension * 9.81 * 1.25)).toFixed(2);
  const wavelengthLambda = ((2 * Math.PI) / config.spikeDensity * 10).toFixed(1);
  const reynoldsNumber = ((1.2 * (config.oscillationFreq * 1.5) * 0.1) / (config.viscosity * 0.1)).toFixed(1);

  // Tennis Ball live metrics
  const tennisMetrics = calculateTennisBallMetrics(config.tennisBallDiameter || 6.7);

  return (
    <>
      {/* Arcane Codex & Physics Matrix Modal */}
      {showCodex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b0e14] border border-cyan-500/30 rounded-2xl w-full max-w-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Atom size={18} />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-white tracking-wide">
                    The Ferrofluid Codex & Alchemical Matrix
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    Rosensweig Instability • Navier-Stokes • Hermetic Axioms
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseCodex}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10 px-6 bg-black/30 font-mono text-xs overflow-x-auto">
              <button
                onClick={() => setCodexTab('physics')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  codexTab === 'physics'
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Atom size={14} /> Mathematical Physics
              </button>
              <button
                onClick={() => setCodexTab('tennis')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  codexTab === 'tennis'
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <CircleDot size={14} /> Tennis Ball Orb Scale (6.70 cm)
              </button>
              <button
                onClick={() => setCodexTab('alchemy')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  codexTab === 'alchemy'
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles size={14} /> Arcana & Alchemy
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-stone-300 font-sans text-xs leading-relaxed">
              {codexTab === 'physics' ? (
                <>
                  <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="font-mono text-cyan-400 font-bold text-sm block">
                      1. Rosensweig Normal-Field Instability Threshold ($B_c$)
                    </span>
                    <div className="p-3 bg-black/60 rounded-lg font-mono text-cyan-200 text-center text-xs tracking-wider border border-white/5">
                      B_c = [ 4ρgγ · μ₀² / (1 + χ)² ]^(1/4)
                    </div>
                    <p className="text-stone-400 text-[11px]">
                      When the applied perpendicular magnetic field $B$ exceeds the critical threshold $B_c$, the flat surface of the colloidal ferrofluid becomes unstable. Surface tension $\gamma$ and gravity $g$ are overwhelmed by magnetic body forces, spontaneously crystallizing into sharp hexagonal arrays of conical spikes along magnetic flux lines.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="font-mono text-cyan-400 font-bold text-sm block">
                      2. Ferrohydrodynamic Navier-Stokes Momentum Equation
                    </span>
                    <div className="p-3 bg-black/60 rounded-lg font-mono text-cyan-200 text-center text-xs tracking-wider border border-white/5">
                      ρ ( ∂u/∂t + u · ∇u ) = -∇p + μ ∇²u + (M · ∇)B + ρ g
                    </div>
                    <p className="text-stone-400 text-[11px]">
                      Ferrofluids consist of single-domain magnetic nanoparticles (magnetite $Fe_3O_4$, ~10nm) coated with surfactants and suspended in carrier fluid. The Kelvin magnetic force $(M \cdot \nabla)B$ acts directly as a distributed volume force on the fluid fluidic parcel, generating viscous vortex currents and magnetic wakes.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="font-mono text-cyan-400 font-bold text-sm block">
                      3. Maxwell Magnetostatic Boundary Conditions
                    </span>
                    <div className="p-3 bg-black/60 rounded-lg font-mono text-cyan-200 text-center text-xs tracking-wider border border-white/5">
                      ∇ · B = 0  ✦  ∇ × H = J_f  ✦  n × (H₂ - H₁) = K_f
                    </div>
                    <p className="text-stone-400 text-[11px]">
                      Magnetic flux density $B$ satisfies continuity across the fluid-air interface: $B_{1n} = B_{2n}$. The magnetic stress tensor creates an upward normal suction at the peaks, self-sharpening the spikes until balanced by Laplace capillary pressure.
                    </p>
                  </div>
                </>
              ) : codexTab === 'tennis' ? (
                <>
                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-bold text-sm">
                        Regulation Tennis Ball Metric Constants
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        ITF Official Standard
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/5">
                        <div className="text-[10px] text-stone-400">Diameter ($d$)</div>
                        <div className="text-sm font-bold text-cyan-300">{tennisMetrics.diameter_cm.toFixed(2)} cm</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/5">
                        <div className="text-[10px] text-stone-400">Circumference ($C$)</div>
                        <div className="text-sm font-bold text-amber-300">{tennisMetrics.circumference_cm.toFixed(2)} cm</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/5">
                        <div className="text-[10px] text-stone-400">Surface Area ($A$)</div>
                        <div className="text-sm font-bold text-emerald-300">{tennisMetrics.surface_area_cm2.toFixed(1)} cm²</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/60 border border-white/5">
                        <div className="text-[10px] text-stone-400">Volume ($V$)</div>
                        <div className="text-sm font-bold text-purple-300">{tennisMetrics.volume_cm3.toFixed(1)} cm³</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-stone-400 text-[11px]">
                      <p>
                        • <strong className="text-stone-200">Perimeter Equation:</strong> C = 2πr = πd ≈ 21.05 cm
                      </p>
                      <p>
                        • <strong className="text-stone-200">Surface Area Equation:</strong> A = 4πr² = πd² ≈ 141.03 cm²
                      </p>
                      <p>
                        • <strong className="text-stone-200">Enclosed Volume Equation:</strong> V = (4/3)πr³ ≈ 157.08 cm³
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs block">
                      Spherical Ferrofluid Instability (Cowley-Rosensweig on Curved Shells)
                    </span>
                    <p className="text-stone-400 text-[11px]">
                      When ferrofluid coats a spherical core of radius R = 3.35 cm, the Rosensweig instability transforms from planar hexagonal lattices into tessellated spherical harmonics (Y_l^m). Radial magnetic flux lines shoot outward normal to the sphere surface, forming a stellated crown of magnetic obsidian spines.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="font-mono text-stone-300 font-bold text-xs block">
                      Python Mathematical Specification
                    </span>
                    <pre className="p-3 bg-black/70 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto border border-white/5">
{`import math
from google import genai

diameter_cm = 6.7
radius_cm = diameter_cm / 2

circumference_cm = 2 * math.pi * radius_cm
surface_area_cm2 = 4 * math.pi * (radius_cm**2)
volume_cm3 = (4 / 3) * math.pi * (radius_cm**3)`}
                    </pre>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                    <span className="font-cinzel text-amber-300 font-bold text-sm block">
                      The Emerald Tablet of Hermes Trismegistus
                    </span>
                    <p className="italic text-amber-100/90 font-serif text-[12px] border-l-2 border-amber-500/50 pl-3">
                      "Quod est superius est sicut quod est inferius, et quod est inferius est sicut quod est superius, ad perpetranda miracula rei unius."
                      <br />
                      <span className="text-[11px] text-stone-400 not-italic">
                        (That which is above is like that which is below, to accomplish the miracles of the One Thing.)
                      </span>
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-2">
                    <span className="font-cinzel text-stone-200 font-bold text-sm block">
                      V.I.T.R.I.O.L. & Nigredo (The Black Stage)
                    </span>
                    <p className="text-stone-400 text-[11px]">
                      The deep dark ink represents <span className="text-white font-semibold">Nigredo</span>, the prima materia of alchemy: total dissolution, void contemplation, and the obsidian mirror where hidden geometric matrices are summoned into physical form.
                    </p>
                    <div className="p-2.5 bg-black/50 rounded-lg font-mono text-amber-400/90 text-center text-[10px] tracking-widest border border-white/5">
                      VISITA INTERIORA TERRAE RECTIFICANDO INVENIES OCCULTUM LAPIDEM
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5">
                      <div className="flex items-center gap-2 text-stone-200 font-mono text-xs mb-1">
                        <span className="text-amber-400 text-lg">☿</span>
                        <span className="font-bold">Mercurius (Quicksilver)</span>
                      </div>
                      <p className="text-stone-400 text-[10px]">
                        The fluid mediator bridging volatile and fixed states; mirrored liquid metal flowing between dimensions.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5">
                      <div className="flex items-center gap-2 text-stone-200 font-mono text-xs mb-1">
                        <span className="text-cyan-400 text-lg">🜔</span>
                        <span className="font-bold">Sal & Sulfur (Fixation)</span>
                      </div>
                      <p className="text-stone-400 text-[10px]">
                        The crystallizing principle that forms conical spikes from chaotic liquid under celestial magnetism.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex justify-end">
              <button
                onClick={handleCloseCodex}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                Close Codex
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
