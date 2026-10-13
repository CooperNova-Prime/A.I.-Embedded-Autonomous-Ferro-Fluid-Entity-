/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FerrofluidConfig, GlowTheme } from '../../types';
import { Compass, Zap, Eye, Disc, Orbit, Layers, ZoomIn } from 'lucide-react';

const GLOW_THEMES: Array<{ id: GlowTheme; label: string; color: string; hex: string }> = [
  { id: 'cyan', label: 'Astral Cyan', color: 'bg-cyan-400', hex: '#00ffff' },
  { id: 'gold', label: 'Alchemic Gold', color: 'bg-amber-400', hex: '#ffd700' },
  { id: 'purple', label: 'Void Amethyst', color: 'bg-purple-400', hex: '#9d00ff' },
  { id: 'emerald', label: 'Quantum Jade', color: 'bg-emerald-400', hex: '#00ff88' },
  { id: 'crimson', label: 'Vitriol Crimson', color: 'bg-rose-500', hex: '#ff003c' },
  { id: 'mercury', label: 'Hyper Quicksilver', color: 'bg-stone-300', hex: '#e2e8f0' },
];

const ZOOM_PRESETS = [
  { id: 'core', label: 'Core', diameter: '6.7cm', distance: 4.8 },
  { id: 'inner', label: 'Inner Ring', diameter: '18cm', distance: 7.5 },
  { id: 'middle', label: 'Mid Ring', diameter: '26cm', distance: 10.5 },
  { id: 'outer', label: 'Outer Ring', diameter: '36cm', distance: 14.5 },
  { id: 'halo', label: 'Halo Rig', diameter: '42cm', distance: 18.5 },
];

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
}

export const GimbalPanel: React.FC<Props> = ({ config, onChangeConfig }) => {
  const isSphere = config.meshShape === 'sphere';

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 4-Ring Armature & Bezier Arcs (When spherical orb) */}
      {isSphere && (
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[11px] text-cyan-300 font-bold flex items-center gap-1.5">
              <Compass size={13} />
              4-Ring Gimbal Armature (6.7cm to 42cm)
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showGimbalRings ?? true}
                onChange={(e) => onChangeConfig((p) => ({ ...p, showGimbalRings: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <p className="text-[10px] text-stone-400 leading-tight">
            Independent multi-axis rotation: Inner (18cm Black Chrome), Middle (26cm Titanium), Outer (36cm Gunmetal), Holographic Halo (42cm Glass).
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-cyan-500/20 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={config.showBezierArcs ?? true}
                onChange={(e) => onChangeConfig((p) => ({ ...p, showBezierArcs: e.target.checked }))}
                className="rounded accent-cyan-400 cursor-pointer w-3.5 h-3.5"
              />
              <span>Bezier Lightning Arcs</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={config.showHoloPanels ?? true}
                onChange={(e) => onChangeConfig((p) => ({ ...p, showHoloPanels: e.target.checked }))}
                className="rounded accent-cyan-400 cursor-pointer w-3.5 h-3.5"
              />
              <span>3D Neumorphic Glass HUD</span>
            </label>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-stone-400">Gimbal Gyro Velocity</span>
              <span className="text-cyan-300 font-bold">{(config.gimbalSpeed ?? 1.0).toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={config.gimbalSpeed ?? 1.0}
              onChange={(e) => onChangeConfig((p) => ({ ...p, gimbalSpeed: parseFloat(e.target.value) }))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Ethereal Glow Theme */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
          <span>Ethereal Aura Spectrum</span>
          <span className="text-cyan-400 font-semibold">{config.glowTheme}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GLOW_THEMES.map((theme) => {
            const isSelected = config.glowTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onChangeConfig((p) => ({ ...p, glowTheme: theme.id }))}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white/10 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-stone-900/40 border-white/5 text-stone-400 hover:text-stone-200 hover:border-white/20'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: theme.hex }}
                />
                <span className="font-mono text-[10px] font-semibold truncate">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wireframe Strings & Geometric Sigils */}
      <div className="p-3 rounded-xl bg-stone-900/50 border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Layers size={13} className="text-cyan-400" />
            Luminous Wireframe Lattice
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.wireframeVisible}
              onChange={(e) => onChangeConfig((p) => ({ ...p, wireframeVisible: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {config.wireframeVisible && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-stone-400">Wireframe Glow Intensity</span>
              <span className="text-cyan-300 font-bold">{config.wireframeGlowIntensity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={config.wireframeGlowIntensity}
              onChange={(e) => onChangeConfig((p) => ({ ...p, wireframeGlowIntensity: parseFloat(e.target.value) }))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
          <label className="flex items-center gap-2 cursor-pointer text-stone-300">
            <input
              type="checkbox"
              checked={config.showArcaneRings}
              onChange={(e) => onChangeConfig((p) => ({ ...p, showArcaneRings: e.target.checked }))}
              className="rounded accent-cyan-400 cursor-pointer w-3.5 h-3.5"
            />
            <span>Astrological Depth Rings</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-stone-300">
            <input
              type="checkbox"
              checked={config.showEquations}
              onChange={(e) => onChangeConfig((p) => ({ ...p, showEquations: e.target.checked }))}
              className="rounded accent-cyan-400 cursor-pointer w-3.5 h-3.5"
            />
            <span>3D Vector Math Equations</span>
          </label>
        </div>
      </div>

      {/* Orbit 3D & Tactical Camera Zoom Presets */}
      <div className="p-3 rounded-xl bg-stone-900/50 border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Orbit size={13} className="text-cyan-400" />
            Continuous 3D Orbit
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoRotate}
              onChange={(e) => onChangeConfig((p) => ({ ...p, autoRotate: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Tactical Zoom Presets */}
        <div className="space-y-1.5 pt-1 border-t border-white/5">
          <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
            <ZoomIn size={11} className="text-cyan-400" />
            Tactical Camera Focal Distances
          </span>
          <div className="grid grid-cols-5 gap-1">
            {ZOOM_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  onChangeConfig((prev) => ({
                    ...prev,
                    zoomPreset: p.id as any,
                    cameraDistance: p.distance,
                  }))
                }
                className="p-1 rounded bg-black/40 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-400/40 text-center transition-all cursor-pointer"
              >
                <div className="font-mono text-[9px] text-stone-300 truncate">{p.label}</div>
                <div className="font-mono text-[8px] text-cyan-400 font-bold">{p.diameter}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
