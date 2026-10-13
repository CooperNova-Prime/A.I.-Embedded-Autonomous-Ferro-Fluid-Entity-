/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FerrofluidConfig } from '../../types';
import { Mic, MicOff, Zap, Volume2, VolumeX, Sparkles, Feather } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
}

export const AnomaliesPanel: React.FC<Props> = ({ config, onChangeConfig }) => {
  const [isVoiceActive, setIsVoiceActive] = useState(
    audioEngine.getIsVoiceActive() || !!config.voiceReactive
  );

  const toggleVoice = async () => {
    if (isVoiceActive) {
      audioEngine.stopVoiceInput();
      setIsVoiceActive(false);
      onChangeConfig((p) => ({ ...p, voiceReactive: false }));
    } else {
      try {
        await audioEngine.startVoiceInput();
        setIsVoiceActive(true);
        onChangeConfig((p) => ({ ...p, voiceReactive: true }));
      } catch (err) {
        console.warn('Microphone access denied:', err);
      }
    }
  };

  const toggleAudio = () => {
    const next = !config.soundEnabled;
    onChangeConfig((p) => ({ ...p, soundEnabled: next }));
    if (next) {
      audioEngine.start();
      audioEngine.setVolume(config.soundVolume);
    } else {
      audioEngine.stop();
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Voice / Acoustic Instability */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                isVoiceActive ? 'bg-cyan-500 text-black animate-pulse' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {isVoiceActive ? <Mic size={14} /> : <MicOff size={14} />}
            </div>
            <div>
              <div className="font-mono text-cyan-300 font-bold text-xs">Speech Reactive Spikes</div>
              <div className="text-[10px] text-stone-400">Microphone voice amplitude generates spike ripples</div>
            </div>
          </div>

          <button
            onClick={toggleVoice}
            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {isVoiceActive ? 'LIVE ACTIVE' : 'ENABLE MIC'}
          </button>
        </div>

        {isVoiceActive && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cyan-500/20">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Mic Sensitivity</span>
                <span className="text-cyan-300 font-bold">{(config.voiceSensitivity ?? 1.5).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.voiceSensitivity ?? 1.5}
                onChange={(e) => onChangeConfig((p) => ({ ...p, voiceSensitivity: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Ripple Boost</span>
                <span className="text-cyan-300 font-bold">{(config.voiceSpikeBoost ?? 1.8).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.voiceSpikeBoost ?? 1.8}
                onChange={(e) => onChangeConfig((p) => ({ ...p, voiceSpikeBoost: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Electrical Plasma Arcing Tendrils */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" />
            Arcing Plasma Filaments
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.arcingTendrilsEnabled}
              onChange={(e) => onChangeConfig((p) => ({ ...p, arcingTendrilsEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {config.arcingTendrilsEnabled && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Arc Filaments</span>
                <span className="text-amber-300 font-bold">{config.tendrilCount}</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={config.tendrilCount}
                onChange={(e) => onChangeConfig((p) => ({ ...p, tendrilCount: parseInt(e.target.value) }))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Arc Intensity</span>
                <span className="text-amber-300 font-bold">{config.tendrilArcIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.tendrilArcIntensity}
                onChange={(e) => onChangeConfig((p) => ({ ...p, tendrilArcIntensity: parseFloat(e.target.value) }))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Void Levitation & Upper Half Drift */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Feather size={13} className="text-purple-400" />
            Void Levitation & Screen Drift
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.upperHalfFloating}
              onChange={(e) => onChangeConfig((p) => ({ ...p, upperHalfFloating: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        {config.upperHalfFloating && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-stone-400">Drift Speed</span>
              <span className="text-purple-300 font-bold">{(config.floatDriftSpeed ?? 0.8).toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.floatDriftSpeed ?? 0.8}
              onChange={(e) => onChangeConfig((p) => ({ ...p, floatDriftSpeed: parseFloat(e.target.value) }))}
              className="w-full accent-purple-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Harmonic Audio Synthesizer */}
      <div className="p-3.5 rounded-xl bg-stone-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-stone-300 text-[11px] font-semibold flex items-center gap-1.5">
            {config.soundEnabled ? <Volume2 size={13} className="text-emerald-400" /> : <VolumeX size={13} className="text-stone-400" />}
            Harmonic Audio Synthesizer
          </span>
          <button
            onClick={toggleAudio}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer transition-all ${
              config.soundEnabled
                ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300'
                : 'bg-stone-800 border border-white/10 text-stone-400'
            }`}
          >
            {config.soundEnabled ? 'ACTIVE' : 'MUTED'}
          </button>
        </div>

        {config.soundEnabled && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Volume</span>
                <span className="text-emerald-300 font-bold">{Math.round(config.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.soundVolume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  onChangeConfig((p) => ({ ...p, soundVolume: v }));
                  audioEngine.setVolume(v);
                }}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-stone-400">Base Pitch</span>
                <span className="text-emerald-300 font-bold">{Math.round(config.soundFrequency)} Hz</span>
              </div>
              <input
                type="range"
                min="40"
                max="240"
                step="2"
                value={config.soundFrequency}
                onChange={(e) => {
                  const f = parseFloat(e.target.value);
                  onChangeConfig((p) => ({ ...p, soundFrequency: f }));
                  audioEngine.updateFrequency(f);
                }}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
