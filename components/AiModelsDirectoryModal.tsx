/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Brain,
  Cpu,
  Zap,
  Check,
  Sparkles,
  Bot,
  Activity,
  Layers,
  Mic,
  Eye,
  Radio,
  FileCode,
  Volume2,
  Ear,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { AiModelNode, FerrofluidConfig } from '../types';
import { DISCOVERED_AI_MODELS, assimilateAiModelIntoEntity } from '../services/aiModelsRegistry';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: FerrofluidConfig;
  onUpdateConfig: (partial: Partial<FerrofluidConfig>) => void;
  onAssimilationSuccess?: (model: AiModelNode) => void;
}

export const AiModelsDirectoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onAssimilationSuccess,
}) => {
  const [selectedModel, setSelectedModel] = useState<AiModelNode | null>(
    DISCOVERED_AI_MODELS.find((m) => m.id === config.activeAiModelId) || DISCOVERED_AI_MODELS[0]
  );
  const [assimilatingId, setAssimilatingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const handleAssimilate = (model: AiModelNode) => {
    setAssimilatingId(model.id);
    audioEngine.playMagneticPulse(1.4);

    setTimeout(() => {
      const updates = assimilateAiModelIntoEntity(model, config);
      onUpdateConfig(updates);
      setAssimilatingId(null);
      if (onAssimilationSuccess) {
        onAssimilationSuccess(model);
      }
    }, 400);
  };

  const filteredModels = DISCOVERED_AI_MODELS.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 font-mono">
      <div className="relative w-full max-w-4xl bg-[#07090f]/90 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.18)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Tactical Status Border */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-violet-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Brain size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wider text-white">
                  AI MODELS PRESENT IN VICINITY
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {DISCOVERED_AI_MODELS.length} DISCOVERED CORES
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Local directory and active neural models ready to assimilate into this 3D entity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Navigation & Surveillance Toggle Bar */}
        <div className="px-6 py-2.5 border-b border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All Cores' },
              { id: 'slm_phi3', label: 'Microsoft Phi-3' },
              { id: 'conversational', label: 'Conversational' },
              { id: 'locomotion_rl', label: 'Levitation Flight' },
              { id: 'harmonic_mind', label: 'Harmonic Mind' },
              { id: 'speech_tts', label: 'Voice TTS' },
              { id: 'vision_sensor', label: 'Vision Sensor' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold whitespace-nowrap text-[11px] ${
                  filterType === f.id
                    ? 'bg-cyan-500/25 border border-cyan-400/60 text-cyan-200'
                    : 'text-stone-400 hover:text-white border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick Acoustic Surveillance Toggle */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <Ear size={13} className={config.acousticCameraAutoTrigger ? 'text-cyan-300' : 'text-stone-500'} />
            <span className="text-[11px] text-stone-300">Acoustic Auto-Cam:</span>
            <button
              onClick={() => onUpdateConfig({ acousticCameraAutoTrigger: !config.acousticCameraAutoTrigger })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                config.acousticCameraAutoTrigger
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {config.acousticCameraAutoTrigger ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Column Tactical Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
          {/* Models List Column */}
          <div className="md:col-span-7 space-y-3">
            {filteredModels.map((model) => {
              const isAssimilated = config.activeAiModelId === model.id;
              const isSelected = selectedModel?.id === model.id;
              const isProcessing = assimilatingId === model.id;

              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-cyan-950/25 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'bg-[#0b0e17] border-white/10 hover:border-cyan-500/30 hover:bg-[#0e121d]'
                  }`}
                >
                  {isAssimilated && (
                    <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl bg-emerald-500/20 border-b border-l border-emerald-400/40 text-emerald-300 text-[9px] font-bold flex items-center gap-1">
                      <Check size={10} /> ASSIMILATED INTO ENTITY
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                          {model.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 border border-white/10 text-cyan-300">
                          {model.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 pt-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {model.badge}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-stone-400 font-mono">Provider: <strong className="text-stone-200">{model.provider}</strong></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssimilate(model);
                      }}
                      disabled={isProcessing}
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        isAssimilated
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      }`}
                    >
                      {isProcessing ? (
                        <span className="animate-pulse">Assimilating...</span>
                      ) : isAssimilated ? (
                        <>
                          <Check size={12} /> Active in Entity
                        </>
                      ) : (
                        <>
                          <Zap size={12} /> Assimilate Model
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Specification & Assimilation Inspector Column */}
          {selectedModel && (
            <div className="md:col-span-5 p-5 rounded-2xl bg-[#090c14] border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-xs text-stone-400 uppercase tracking-widest text-[9px]">Model Core Detail</span>
                    <h3 className="text-sm font-bold text-white">{selectedModel.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {selectedModel.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] text-stone-400">Architecture Directive:</div>
                  <p className="text-[11px] text-stone-300 bg-black/40 p-3 rounded-xl border border-white/5 leading-relaxed">
                    {selectedModel.description}
                  </p>
                </div>

                {/* Capabilities Chips */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-stone-400">Assimilated Capabilities:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModel.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[10px]"
                      >
                        ✓ {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                    <div className="text-stone-500">Latency</div>
                    <div className="font-bold text-white">{selectedModel.specs.latency}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                    <div className="text-stone-500">Throughput</div>
                    <div className="font-bold text-white">{selectedModel.specs.throughput}</div>
                  </div>
                </div>
              </div>

              {/* Assimilate Button */}
              <button
                onClick={() => handleAssimilate(selectedModel)}
                disabled={assimilatingId !== null}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600/30 via-cyan-500/40 to-emerald-500/30 hover:from-cyan-600/40 hover:to-emerald-500/40 border border-cyan-400/60 text-cyan-100 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.35)] active:scale-98"
              >
                <Sparkles size={14} className="text-cyan-300" />
                <span>
                  {config.activeAiModelId === selectedModel.id
                    ? 'Re-Sync Entity Dynamics'
                    : `Make ${selectedModel.name.split(' ')[0]} Part of Ferrofluid`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
