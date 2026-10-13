/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FerrofluidConfig, MagnetNode, InteractionMode } from '../../types';
import { Magnet, Plus, Trash2, Zap, Compass, Move3d } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
  magnets: MagnetNode[];
  onAddMagnet: (x: number, z: number, polarity: 'north' | 'south') => void;
  onRemoveMagnet: (id: string) => void;
  onClearMagnets: () => void;
}

const MODES: Array<{ id: InteractionMode; label: string; desc: string; icon: any }> = [
  { id: 'orbit', label: 'Orbit 3D', desc: 'Drag to tumble camera view', icon: Move3d },
  { id: 'magnet', label: 'Magnet Node', desc: 'Drag active magnetic poles', icon: Magnet },
  { id: 'stir', label: 'Stir Ink', desc: 'Viscous rotational vortex wake', icon: Compass },
  { id: 'cymatics', label: 'Cymatics', desc: 'Acoustic wave standing ripples', icon: Zap },
];

export const PolesPanel: React.FC<Props> = ({
  config,
  onChangeConfig,
  magnets,
  onAddMagnet,
  onRemoveMagnet,
  onClearMagnets,
}) => {
  const triggerSurge = () => {
    audioEngine.playMagneticPulse(1.0);
    // Surge magnetic strength momentarily
    const prev = config.magneticStrength;
    onChangeConfig((p) => ({ ...p, magneticStrength: Math.min(p.magneticStrength + 0.8, 3.0) }));
    setTimeout(() => {
      onChangeConfig((p) => ({ ...p, magneticStrength: prev }));
    }, 450);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Interaction Mode */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
          <span>Interaction Mode</span>
          <span className="text-cyan-400 font-semibold">{config.interactionMode}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((mode) => {
            const isSelected = config.interactionMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onChangeConfig((p) => ({ ...p, interactionMode: mode.id }))}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'bg-stone-900/40 border-white/5 text-stone-400 hover:text-stone-200 hover:border-white/20'
                }`}
              >
                <Icon size={16} className={isSelected ? 'text-cyan-300' : 'text-stone-400'} />
                <div>
                  <div className="font-mono text-xs font-semibold">{mode.label}</div>
                  <div className="text-[9px] text-stone-400 truncate">{mode.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Pole & Pulse Actions */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Magnet size={13} className="text-cyan-400" />
            Active Dipole Poles ({magnets.length})
          </span>

          <button
            onClick={triggerSurge}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 transition-all font-mono text-[10px] font-bold cursor-pointer"
          >
            <Zap size={11} />
            <span>Surge Pulse</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddMagnet((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 'north')}
            className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 transition-all font-mono text-[11px] flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            <Plus size={13} />
            <span>Add North (N)</span>
          </button>

          <button
            onClick={() => onAddMagnet((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 'south')}
            className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 text-blue-300 transition-all font-mono text-[11px] flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            <Plus size={13} />
            <span>Add South (S)</span>
          </button>
        </div>

        {/* Dipoles List */}
        {magnets.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {magnets.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                      m.polarity === 'north' ? 'bg-rose-500/30 text-rose-300' : 'bg-blue-500/30 text-blue-300'
                    }`}
                  >
                    {m.polarity === 'north' ? 'N' : 'S'}
                  </span>
                  <span className="text-stone-300">Pole #{idx + 1}</span>
                  <span className="text-stone-400">
                    ({m.x.toFixed(1)}, {m.z.toFixed(1)})
                  </span>
                </div>

                <button
                  onClick={() => onRemoveMagnet(m.id)}
                  className="p-1 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove dipole"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            <button
              onClick={onClearMagnets}
              className="w-full py-1 text-center font-mono text-[10px] text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear All Dipoles
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-stone-400 font-mono text-center py-2 bg-black/30 rounded-lg border border-white/5">
            Shift+Click canvas to place a magnetic pole at mouse point
          </p>
        )}
      </div>

      {/* Dual Cyclone & Light Fiber Spherical Polar Dynamics */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Compass size={13} className="text-cyan-400" />
            Cyclone Polar Vortex Systems
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            Tilted 25.2°
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-stone-300">Cyclone 1 (Inner Sphere)</span>
            </div>
            <span className="text-amber-400 text-[9px]">Pole Axis [0, 1, 0] • N→S</span>
          </div>

          <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-stone-300">Cyclone 2 (Changed Poles)</span>
            </div>
            <span className="text-cyan-400 text-[9px]">+62° Tilt • Inverted S→N</span>
          </div>

          <div className="text-[9px] text-stone-400 leading-relaxed pt-1">
            Rotating light fibers trace spherical coordinates (<code className="text-cyan-300">x²+y²+z²=R²</code>), tilted at an axial angle with precessing orbital poles.
          </div>
        </div>
      </div>
    </div>
  );
};
