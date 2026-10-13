/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FerrofluidConfig } from '../../types';
import { Sparkles, Check } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

export interface PresetArchetype {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  config: Partial<FerrofluidConfig>;
}

export const PRESETS: PresetArchetype[] = [
  {
    id: 'void-black-refraction',
    name: 'Tennis Ball Void Shimmer',
    subtitle: 'Regulation Ø 6.70 cm Scale',
    description: 'Black event-horizon fluid with shifting prismatic caustics, body morphing, and curved seam glow.',
    config: {
      meshShape: 'sphere',
      tennisBallDiameter: 6.7,
      showTennisBallSeam: true,
      ballSkin: 'void-refraction',
      morphIntensity: 1.25,
      morphSpeed: 1.0,
      refractionIntensity: 1.7,
      voidAbsorption: 0.95,
      magneticStrength: 1.8,
      viscosity: 0.5,
      surfaceTension: 1.4,
      oscillationFreq: 1.4,
      spikeDensity: 14,
      spikeHeight: 1.6,
      glowTheme: 'cyan',
      wireframeVisible: true,
      wireframeGlowIntensity: 1.6,
      showGimbalRings: true,
      showBezierArcs: true,
      showHoloPanels: true,
      arcingTendrilsEnabled: true,
      upperHalfFloating: false,
    },
  },
  {
    id: 'liquid-ink-viscous',
    name: 'Colloidal Ferro-Ink',
    subtitle: 'Liquid Fluid Viscosity',
    description: 'Deep glossy black liquid with hydrodynamic damping, oily specular highlights, and fluidic surface ripples.',
    config: {
      meshShape: 'sphere',
      tennisBallDiameter: 6.7,
      showTennisBallSeam: true,
      ballSkin: 'liquid-ink',
      morphIntensity: 1.6,
      morphSpeed: 1.3,
      refractionIntensity: 0.8,
      voidAbsorption: 0.9,
      magneticStrength: 1.4,
      viscosity: 0.85,
      surfaceTension: 1.2,
      oscillationFreq: 0.9,
      spikeDensity: 10,
      spikeHeight: 1.2,
      glowTheme: 'cyan',
      wireframeVisible: false,
    },
  },
  {
    id: 'black-matte-obsidian',
    name: 'Black Matte Velvet',
    subtitle: 'Pure Non-Reflective Void',
    description: 'Absolute light absorption with ultra-low reflectivity, architectural geometry, and glowing aura.',
    config: {
      meshShape: 'sphere',
      tennisBallDiameter: 6.7,
      showTennisBallSeam: true,
      ballSkin: 'black-matte',
      morphIntensity: 0.8,
      morphSpeed: 0.7,
      refractionIntensity: 0.2,
      voidAbsorption: 0.99,
      magneticStrength: 2.2,
      viscosity: 0.6,
      surfaceTension: 1.8,
      spikeDensity: 16,
      spikeHeight: 2.0,
      glowTheme: 'gold',
      wireframeVisible: true,
      wireframeGlowIntensity: 2.4,
    },
  },
  {
    id: 'quicksilver-alloy',
    name: 'Alchemist Quicksilver',
    subtitle: 'Liquid Mercury Mirror',
    description: 'Hyper-reflective chrome liquid with iridescent silver chromatic dispersion and standing wave nodes.',
    config: {
      meshShape: 'sphere',
      tennisBallDiameter: 6.7,
      showTennisBallSeam: false,
      ballSkin: 'quicksilver',
      morphIntensity: 1.4,
      morphSpeed: 1.8,
      refractionIntensity: 2.2,
      voidAbsorption: 0.5,
      magneticStrength: 1.9,
      viscosity: 0.35,
      surfaceTension: 1.6,
      spikeDensity: 18,
      spikeHeight: 1.7,
      glowTheme: 'mercury',
      wireframeVisible: true,
      wireframeGlowIntensity: 2.0,
    },
  },
  {
    id: 'supernova-flare',
    name: 'Solar Supernova Corona',
    subtitle: 'Thermonuclear Plasma Core',
    description: 'Amber-gold radiant energy fluid with blistering thermal dissipation and high-frequency cymatic flutter.',
    config: {
      meshShape: 'sphere',
      tennisBallDiameter: 6.7,
      ballSkin: 'supernova',
      morphIntensity: 1.8,
      morphSpeed: 2.2,
      refractionIntensity: 2.0,
      magneticStrength: 2.5,
      viscosity: 0.25,
      surfaceTension: 1.7,
      spikeDensity: 20,
      spikeHeight: 2.2,
      glowTheme: 'gold',
      wireframeVisible: true,
      arcingTendrilsEnabled: true,
    },
  },
  {
    id: 'emerald-superconductive',
    name: 'Superconductive Jade',
    subtitle: 'Quantum Levitating Core',
    description: 'Auroral jade standing waves with levitating upper void drift and harmonic acoustic resonance.',
    config: {
      meshShape: 'sphere',
      tennisBallDiameter: 6.7,
      ballSkin: 'emerald-abyss',
      morphIntensity: 1.3,
      morphSpeed: 1.1,
      refractionIntensity: 1.9,
      magneticStrength: 1.8,
      viscosity: 0.3,
      surfaceTension: 1.5,
      spikeDensity: 18,
      spikeHeight: 1.5,
      glowTheme: 'emerald',
      wireframeVisible: true,
      upperHalfFloating: true,
      floatDriftSpeed: 1.2,
    },
  },
  {
    id: 'abyss-basin-rosensweig',
    name: 'Rosensweig Planar Abyss',
    subtitle: 'Horizontal Colloidal Pool',
    description: 'Classic horizontal laboratory petri-dish ferrofluid pool with hexagonal conical spike arrays.',
    config: {
      meshShape: 'basin',
      magneticStrength: 2.0,
      viscosity: 0.5,
      surfaceTension: 1.3,
      spikeDensity: 16,
      spikeHeight: 1.8,
      glowTheme: 'cyan',
      wireframeVisible: true,
      showGimbalRings: false,
    },
  },
];

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
}

export const PresetsPanel: React.FC<Props> = ({ config, onChangeConfig }) => {
  const handleApply = (preset: PresetArchetype) => {
    audioEngine.playMagneticPulse(1.0);
    onChangeConfig((prev) => ({
      ...prev,
      ...preset.config,
    }));
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
        <span>Curated Archetype Presets</span>
        <span className="text-cyan-400 font-semibold">{PRESETS.length} Profiles</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {PRESETS.map((preset) => {
          const isActive =
            (preset.config.ballSkin ? config.ballSkin === preset.config.ballSkin : true) &&
            (preset.config.meshShape ? config.meshShape === preset.config.meshShape : true);

          return (
            <button
              key={preset.id}
              onClick={() => handleApply(preset)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-cyan-500/15 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-stone-900/50 border-white/5 hover:border-white/20 hover:bg-stone-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={12} className={isActive ? 'text-cyan-400' : 'text-stone-400'} />
                  <span>{preset.name}</span>
                </div>
                {isActive && (
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-400/40">
                    <Check size={10} /> Active
                  </span>
                )}
              </div>

              <div className="text-[10px] font-mono text-cyan-400/80 mb-1">{preset.subtitle}</div>
              <p className="text-[10px] text-stone-400 leading-relaxed">{preset.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
