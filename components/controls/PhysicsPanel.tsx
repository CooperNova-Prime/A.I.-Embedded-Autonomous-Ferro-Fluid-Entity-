/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FerrofluidConfig } from '../../types';
import { Zap, Activity, Waves, Droplet, Sparkles, Gauge } from 'lucide-react';

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
}

export const PhysicsPanel: React.FC<Props> = ({ config, onChangeConfig }) => {
  const getFieldState = (strength: number) => {
    if (strength < 0.6) return { label: 'Paramagnetic Pool', color: 'text-stone-400' };
    if (strength < 1.4) return { label: 'Rosensweig Instability', color: 'text-cyan-400 font-bold' };
    if (strength < 2.3) return { label: 'Hyper-Conical Spikes', color: 'text-amber-400 font-bold' };
    return { label: 'Magnetic Flux Saturation', color: 'text-rose-400 font-bold' };
  };

  const fieldState = getFieldState(config.magneticStrength);

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Magnetic Flux Density B_0 */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between font-mono">
          <span className="text-[11px] text-stone-300 font-semibold flex items-center gap-1.5">
            <Zap size={13} className="text-cyan-400" />
            Magnetic Flux Density ($B_0$)
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] ${fieldState.color}`}>{fieldState.label}</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-[11px] font-bold">
              {config.magneticStrength.toFixed(2)} T
            </span>
          </div>
        </div>

        <input
          type="range"
          min="0.0"
          max="3.0"
          step="0.05"
          value={config.magneticStrength}
          onChange={(e) => onChangeConfig((p) => ({ ...p, magneticStrength: parseFloat(e.target.value) }))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-stone-800 rounded-lg"
        />

        <div className="flex justify-between text-[9px] font-mono text-stone-400">
          <span>0.0 T (Flat)</span>
          <span>Critical Threshold (1.0 T)</span>
          <span>3.0 T (Saturated)</span>
        </div>
      </div>

      {/* Grid of Core Wave & Instability Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Rosensweig Spike Height */}
        <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] font-mono">
            <span className="text-stone-300 flex items-center gap-1">
              <Activity size={12} className="text-cyan-400" />
              Spike Height (h_max)
            </span>
            <span className="text-cyan-300 font-bold">{config.spikeHeight.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={config.spikeHeight}
            onChange={(e) => onChangeConfig((p) => ({ ...p, spikeHeight: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>

        {/* Spike Density */}
        <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] font-mono">
            <span className="text-stone-300 flex items-center gap-1">
              <Waves size={12} className="text-amber-400" />
              Spike Wavenumber ($k_c$)
            </span>
            <span className="text-amber-300 font-bold">{config.spikeDensity}</span>
          </div>
          <input
            type="range"
            min="4"
            max="24"
            step="1"
            value={config.spikeDensity}
            onChange={(e) => onChangeConfig((p) => ({ ...p, spikeDensity: parseInt(e.target.value) }))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>

        {/* Surface Tension */}
        <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] font-mono">
            <span className="text-stone-300 flex items-center gap-1">
              <Droplet size={12} className="text-emerald-400" />
              Surface Tension ($\gamma$)
            </span>
            <span className="text-emerald-300 font-bold">{config.surfaceTension.toFixed(2)} N/m</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.05"
            value={config.surfaceTension}
            onChange={(e) => onChangeConfig((p) => ({ ...p, surfaceTension: parseFloat(e.target.value) }))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
          <div className="flex justify-between text-[8.5px] text-stone-400 font-mono">
            <span>Sharp needle</span>
            <span>Smooth dome</span>
          </div>
        </div>

        {/* Kinematic Viscosity */}
        <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] font-mono">
            <span className="text-stone-300 flex items-center gap-1">
              <Gauge size={12} className="text-purple-400" />
              Kinematic Viscosity ($\eta$)
            </span>
            <span className="text-purple-300 font-bold">{config.viscosity.toFixed(2)} Pa·s</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.viscosity}
            onChange={(e) => onChangeConfig((p) => ({ ...p, viscosity: parseFloat(e.target.value) }))}
            className="w-full accent-purple-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
          <div className="flex justify-between text-[8.5px] text-stone-400 font-mono">
            <span>Fast ripple</span>
            <span>Heavy fluid</span>
          </div>
        </div>

        {/* Cymatic Oscillation Frequency */}
        <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] font-mono">
            <span className="text-stone-300 flex items-center gap-1">
              <Activity size={12} className="text-cyan-400" />
              Cymatic Resonance ($\omega$)
            </span>
            <span className="text-cyan-300 font-bold">{config.oscillationFreq.toFixed(2)} Hz</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={config.oscillationFreq}
            onChange={(e) => onChangeConfig((p) => ({ ...p, oscillationFreq: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>

        {/* Chromatic Iridescence */}
        <div className="p-3 rounded-xl bg-stone-900/40 border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] font-mono">
            <span className="text-stone-300 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              Iridescent Chromatic Sheen
            </span>
            <span className="text-amber-300 font-bold">{Math.round(config.iridescence * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.iridescence}
            onChange={(e) => onChangeConfig((p) => ({ ...p, iridescence: parseFloat(e.target.value) }))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
