/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FerrofluidConfig } from '../../types';
import { BookOpen, Atom, Activity, Sparkles, CircleDot } from 'lucide-react';
import { calculateTennisBallMetrics } from '../../services/geminiService';

interface Props {
  config: FerrofluidConfig;
  onOpenCodex?: () => void;
  onOpenTennisModal?: () => void;
}

export const TelemetryPanel: React.FC<Props> = ({ config, onOpenCodex, onOpenTennisModal }) => {
  const isSphere = config.meshShape === 'sphere';
  const diameter = config.tennisBallDiameter || 6.7;
  const metrics = calculateTennisBallMetrics(diameter);

  // Compute live mathematical physics values
  const criticalFieldBc = (Math.sqrt(config.surfaceTension * 9.81 * 1.25)).toFixed(2);
  const wavelengthLambda = ((2 * Math.PI) / config.spikeDensity * 10).toFixed(1);
  const reynoldsNumber = ((1.2 * (config.oscillationFreq * 1.5) * 0.1) / (config.viscosity * 0.1)).toFixed(1);
  const fluxWb = (config.magneticStrength * 1.4).toFixed(2);

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Primary Mathematical Readouts Grid */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
          <span>Live Magnetohydrodynamic Telemetry</span>
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Active Feed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono">
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
            <div className="text-[10px] text-stone-400">Critical Field ($B_c$)</div>
            <div className="text-sm font-bold text-cyan-300">{criticalFieldBc} T</div>
            <div className="text-[9px] text-stone-400">Instability trigger point</div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
            <div className="text-[10px] text-stone-400">Critical Wavelength ($\lambda_c$)</div>
            <div className="text-sm font-bold text-amber-300">{wavelengthLambda} mm</div>
            <div className="text-[9px] text-stone-400">Inter-spike spacing</div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
            <div className="text-[10px] text-stone-400">Reynolds Number ($Re$)</div>
            <div className="text-sm font-bold text-emerald-300">{reynoldsNumber}</div>
            <div className="text-[9px] text-stone-400">Vortex viscous ratio</div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
            <div className="text-[10px] text-stone-400">Total Flux ($\Phi$)</div>
            <div className="text-sm font-bold text-purple-300">{fluxWb} Wb</div>
            <div className="text-[9px] text-stone-400">Kelvin magnetic density</div>
          </div>
        </div>
      </div>

      {/* Spherical Metrics (when orb) */}
      {isSphere && (
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <CircleDot size={13} />
              Tennis Ball Sphere Constants
            </span>
            <span className="text-stone-300 font-semibold">{diameter.toFixed(2)} cm</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 font-mono text-center text-[9.5px]">
            <div className="p-1.5 rounded bg-black/40 border border-white/5">
              <span className="text-stone-400 block">Perimeter</span>
              <span className="text-amber-300 font-bold">{metrics.circumference_cm.toFixed(1)} cm</span>
            </div>
            <div className="p-1.5 rounded bg-black/40 border border-white/5">
              <span className="text-stone-400 block">Area</span>
              <span className="text-emerald-300 font-bold">{metrics.surface_area_cm2.toFixed(0)} cm²</span>
            </div>
            <div className="p-1.5 rounded bg-black/40 border border-white/5">
              <span className="text-stone-400 block">Volume</span>
              <span className="text-purple-300 font-bold">{metrics.volume_cm3.toFixed(0)} cm³</span>
            </div>
          </div>

          {onOpenTennisModal && (
            <button
              onClick={onOpenTennisModal}
              className="w-full py-1.5 mt-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles size={12} />
              <span>Open Gemini AI Spherical Breakdown</span>
            </button>
          )}
        </div>
      )}

      {/* Open Codex Modal Button */}
      {onOpenCodex && (
        <button
          onClick={onOpenCodex}
          className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-cyan-500/40 hover:border-cyan-400 text-stone-200 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <BookOpen size={14} className="text-cyan-400" />
          <span>Open Full Mathematical Codex & Matrix</span>
        </button>
      )}
    </div>
  );
};
