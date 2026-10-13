/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FerrofluidConfig, BallSkin } from '../../types';
import { CircleDot, Waves, Sparkles, Layers, Eye, RefreshCw } from 'lucide-react';
import { calculateTennisBallMetrics } from '../../services/geminiService';

export const BALL_SKINS: Array<{
  id: BallSkin;
  label: string;
  tag: string;
  desc: string;
  icon: string;
}> = [
  {
    id: 'void-refraction',
    label: 'Void Black Refraction',
    tag: 'Prismatic',
    desc: 'Deep cosmic event-horizon ink with shifting prismatic caustics and light refraction.',
    icon: '✨',
  },
  {
    id: 'liquid-ink',
    label: 'Colloidal Ferro-Ink',
    tag: 'Viscous Gloss',
    desc: 'Dense oil-suspended magnetite with dynamic surface fluid ripples and specular wet shine.',
    icon: '💧',
  },
  {
    id: 'black-matte',
    label: 'Obsidian Matte',
    tag: 'Pure Dark',
    desc: 'Ultra-low reflectivity velvet darkness with razor-sharp physical boundary lines.',
    icon: '🌑',
  },
  {
    id: 'quicksilver',
    label: 'Alchemist Quicksilver',
    tag: 'Chrome Mirror',
    desc: 'Hyper-reflective liquid mercury alloy with iridescent silver chromatic dispersion.',
    icon: '🪞',
  },
  {
    id: 'supernova',
    label: 'Solar Corona Flare',
    tag: 'Radiant Heat',
    desc: 'Thermonuclear stellar plasma fluid with amber-gold thermal dissipation halos.',
    icon: '☀️',
  },
  {
    id: 'emerald-abyss',
    label: 'Superconductive Jade',
    tag: 'Quantum Flux',
    desc: 'Bio-luminescent crystalline fluid shimmering with auroral green photon emission.',
    icon: '💎',
  },
];

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
  onOpenTennisModal?: () => void;
}

export const SubstancePanel: React.FC<Props> = ({
  config,
  onChangeConfig,
  onOpenTennisModal,
}) => {
  const isSphere = config.meshShape === 'sphere';
  const diameter = config.tennisBallDiameter || 6.7;
  const metrics = calculateTennisBallMetrics(diameter);

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Geometry / Substance Form Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
          <span>Substance Geometry</span>
          <span className="text-cyan-400 font-semibold">{isSphere ? '3D Spherical Orb' : 'Circular Abyss Basin'}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChangeConfig((p) => ({ ...p, meshShape: 'sphere' }))}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              isSphere
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-stone-900/60 border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 font-mono font-bold text-xs text-cyan-300">
              <CircleDot size={14} />
              <span>Tennis Ball Orb</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1 leading-tight">
              Regulation scale (Ø 6.70 cm) with fluidic body morphing & light refraction
            </p>
          </button>

          <button
            onClick={() => onChangeConfig((p) => ({ ...p, meshShape: 'basin' }))}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              !isSphere
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-stone-900/60 border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 font-mono font-bold text-xs text-cyan-300">
              <Waves size={14} />
              <span>Abyss Basin</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1 leading-tight">
              Horizontal planar pool with Rosensweig spikes and cymatic ripples
            </p>
          </button>
        </div>
      </div>

      {/* Spherical Scale & Regulation Metric Controls */}
      {isSphere && (
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyan-300 font-bold text-[11px] flex items-center gap-1.5">
              <CircleDot size={13} />
              Regulation Diameter Scale
            </span>
            <span className="font-mono text-[11px] font-bold text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/30">
              {diameter.toFixed(2)} cm
            </span>
          </div>

          <input
            type="range"
            min="5.5"
            max="8.5"
            step="0.05"
            value={diameter}
            onChange={(e) => {
              const d = parseFloat(e.target.value);
              onChangeConfig((p) => ({ ...p, tennisBallDiameter: d }));
            }}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
          />

          <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[9.5px]">
            <div className="p-1.5 rounded bg-black/50 border border-white/5">
              <div className="text-stone-400">Circumference</div>
              <div className="text-amber-300 font-bold">{metrics.circumference_cm.toFixed(1)} cm</div>
            </div>
            <div className="p-1.5 rounded bg-black/50 border border-white/5">
              <div className="text-stone-400">Surface Area</div>
              <div className="text-emerald-300 font-bold">{metrics.surface_area_cm2.toFixed(0)} cm²</div>
            </div>
            <div className="p-1.5 rounded bg-black/50 border border-white/5">
              <div className="text-stone-400">Volume</div>
              <div className="text-purple-300 font-bold">{metrics.volume_cm3.toFixed(0)} cm³</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-cyan-500/20">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300 text-[11px]">
              <input
                type="checkbox"
                checked={config.showTennisBallSeam ?? true}
                onChange={(e) => onChangeConfig((p) => ({ ...p, showTennisBallSeam: e.target.checked }))}
                className="rounded accent-cyan-400 cursor-pointer w-3.5 h-3.5"
              />
              <span>Curved Seam Glowing Halo</span>
            </label>

            {onOpenTennisModal && (
              <button
                onClick={onOpenTennisModal}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 border border-cyan-400/50 transition-all cursor-pointer font-semibold"
              >
                <Sparkles size={11} />
                <span>AI Breakdown</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Substance Skins Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
          <span>Substance Skin Shimmer</span>
          <span className="text-cyan-400 font-semibold">{config.ballSkin || 'void-refraction'}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BALL_SKINS.map((skin) => {
            const isSelected = (config.ballSkin || 'void-refraction') === skin.id;
            return (
              <button
                key={skin.id}
                onClick={() => onChangeConfig((p) => ({ ...p, ballSkin: skin.id }))}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-stone-900/50 border-white/5 text-stone-400 hover:text-stone-200 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{skin.icon}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-stone-300">
                    {skin.tag}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-xs text-stone-200 truncate">{skin.label}</div>
                  <p className="text-[9.5px] text-stone-400 line-clamp-2 leading-tight mt-0.5">{skin.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Morphing & Refraction Controls (for spherical orb) */}
      {isSphere && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
              <RefreshCw size={12} className="text-cyan-400" />
              Body Morphing & Refraction Dynamics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Morph Squash</span>
                <span className="text-cyan-300 font-bold">{(config.morphIntensity ?? 1.25).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={config.morphIntensity ?? 1.25}
                onChange={(e) => onChangeConfig((p) => ({ ...p, morphIntensity: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer h-1 bg-stone-800 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Morph Velocity</span>
                <span className="text-cyan-300 font-bold">{(config.morphSpeed ?? 1.0).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={config.morphSpeed ?? 1.0}
                onChange={(e) => onChangeConfig((p) => ({ ...p, morphSpeed: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer h-1 bg-stone-800 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Light Refraction</span>
                <span className="text-amber-300 font-bold">{(config.refractionIntensity ?? 1.7).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.05"
                value={config.refractionIntensity ?? 1.7}
                onChange={(e) => onChangeConfig((p) => ({ ...p, refractionIntensity: parseFloat(e.target.value) }))}
                className="w-full accent-amber-400 cursor-pointer h-1 bg-stone-800 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Void Absorption</span>
                <span className="text-purple-300 font-bold">{Math.round((config.voidAbsorption ?? 0.95) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.01"
                value={config.voidAbsorption ?? 0.95}
                onChange={(e) => onChangeConfig((p) => ({ ...p, voidAbsorption: parseFloat(e.target.value) }))}
                className="w-full accent-purple-400 cursor-pointer h-1 bg-stone-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
