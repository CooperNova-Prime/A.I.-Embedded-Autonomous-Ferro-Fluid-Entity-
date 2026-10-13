/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bot,
  Compass,
  Footprints,
  Gauge,
  Layers,
  Move,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
  Volume2,
  Hand,
  MousePointer,
  Download,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import {
  FerrofluidConfig,
  LocomotionTelemetryData,
  VirtualJointState,
  GroundContactState
} from '../types';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  config: FerrofluidConfig;
  onUpdateConfig: (partial: Partial<FerrofluidConfig>) => void;
  getTelemetry?: () => LocomotionTelemetryData | null;
  onApplyImpulse?: (forceX: number, forceZ: number) => void;
  onOpenExportModal?: () => void;
}

export const LocomotionTelemetryHUD: React.FC<Props> = ({
  config,
  onUpdateConfig,
  getTelemetry,
  onApplyImpulse,
  onOpenExportModal,
}) => {
  const [telemetry, setTelemetry] = useState<LocomotionTelemetryData | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'navigation' | 'gait'>('telemetry');

  // Poll telemetry at ~30Hz
  useEffect(() => {
    const timer = setInterval(() => {
      if (getTelemetry) {
        const data = getTelemetry();
        if (data) setTelemetry(data);
      }
    }, 33);
    return () => clearInterval(timer);
  }, [getTelemetry]);

  const enabled = config.embodiedLocomotionEnabled ?? false;
  const gaitType = config.locomotionGaitType ?? 'quadruped';
  const navMode = config.locomotionNavTarget ?? 'autonomous_wander';

  const handleToggleLocomotion = () => {
    audioEngine.playMagneticPulse(0.9);
    onUpdateConfig({ embodiedLocomotionEnabled: !enabled });
  };

  const handleTriggerKick = () => {
    audioEngine.playMagneticPulse(1.5);
    const fx = (Math.random() - 0.5) * 45;
    const fz = (Math.random() - 0.5) * 45;
    if (onApplyImpulse) {
      onApplyImpulse(fx, fz);
    } else {
      (window as any).__LOCOMOTION_APPLY_IMPULSE__?.(fx, fz);
    }
  };

  if (!enabled && !config.showLocomotionTelemetry) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-40 w-84 sm:w-96 select-none font-mono">
      <div className="relative rounded-2xl bg-[#07090e]/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.12)] overflow-hidden transition-all duration-300">
        {/* Glow Header Accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500" />

        {/* Panel Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-gradient-to-r from-cyan-950/30 to-transparent">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${
              enabled
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 animate-pulse'
                : 'bg-stone-800/40 border-stone-700 text-stone-400'
            }`}>
              <Bot size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-white">EMBODIED AI LOCOMOTION</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                  telemetry?.locomotionState === 'IMPULSE_ABSORB'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : telemetry?.locomotionState === 'TROTTING' || telemetry?.locomotionState === 'WALKING'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  {telemetry?.locomotionState || (enabled ? 'ACTIVE' : 'STANDBY')}
                </span>
              </div>
              <p className="text-[10px] text-stone-400">Physics Virtual Joints & RL Policy</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={isMinimized ? 'Expand HUD' : 'Minimize HUD'}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button
              onClick={() => onUpdateConfig({ showLocomotionTelemetry: false, embodiedLocomotionEnabled: false })}
              className="p-1 rounded text-stone-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Minimized Quick Bar */}
        {isMinimized ? (
          <div className="px-3 py-2 flex items-center justify-between text-[11px] bg-black/40">
            <div className="flex items-center gap-3">
              <span className="text-stone-400">Gait: <strong className="text-cyan-300 capitalize">{gaitType}</strong></span>
              <span className="text-stone-400">Stability: <strong className="text-emerald-300">{telemetry?.stabilityScore ?? 95}%</strong></span>
            </div>
            <button
              onClick={handleTriggerKick}
              className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-[10px] cursor-pointer"
            >
              Kick / Impulse
            </button>
          </div>
        ) : (
          <div className="p-3.5 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {/* Primary Toggle & Locomotion Mode Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLocomotion}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  enabled
                    ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/25'
                }`}
              >
                <Zap size={14} className={enabled ? 'text-emerald-300' : 'text-cyan-400'} />
                <span>{enabled ? 'Locomotion Active' : 'Engage Physics Walker'}</span>
              </button>

              <button
                onClick={handleTriggerKick}
                className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Apply Physical Push / Kick Impulse to test RL dynamic balance recovery"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span>Kick / Push</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-xl bg-black/50 p-1 border border-white/5">
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'telemetry'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Gauge size={12} />
                <span>Telemetry</span>
              </button>
              <button
                onClick={() => setActiveTab('navigation')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'navigation'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Compass size={12} />
                <span>Navigation</span>
              </button>
              <button
                onClick={() => setActiveTab('gait')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'gait'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Footprints size={12} />
                <span>Gait & Rig</span>
              </button>
            </div>

            {/* TAB 1: TELEMETRY & BALANCE (ZMP / COM) */}
            {activeTab === 'telemetry' && (
              <div className="space-y-3">
                {/* Dynamic Balance Visualizer (Zero Moment Point vs Center of Mass) */}
                <div className="p-3 rounded-xl bg-[#0b0e16] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Activity size={12} className="text-cyan-400" />
                      Dynamic Stability & ZMP
                    </span>
                    <span className="font-bold text-emerald-400">
                      {telemetry?.stabilityScore ?? 95}% (STABLE)
                    </span>
                  </div>

                  <div className="relative h-16 rounded-lg bg-black/60 border border-white/5 flex items-center justify-center overflow-hidden">
                    {/* Support Polygon Footprint Overlay */}
                    <div className="absolute inset-2 border border-dashed border-cyan-500/30 rounded-md pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full border border-cyan-500/10" />
                    </div>

                    {/* COM Marker */}
                    <div
                      className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)] border border-white transition-all duration-75 flex items-center justify-center"
                      style={{
                        transform: `translate(${((telemetry?.com?.x || 0) * 8).toFixed(1)}px, ${((telemetry?.com?.z || 0) * 8).toFixed(1)}px)`
                      }}
                      title="Center of Mass (COM)"
                    >
                      <div className="w-1 h-1 bg-white rounded-full" />
                    </div>

                    {/* ZMP Marker */}
                    <div
                      className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(255,191,0,0.8)] transition-all duration-75"
                      style={{
                        transform: `translate(${((telemetry?.zmp?.x || 0) * 8).toFixed(1)}px, ${((telemetry?.zmp?.z || 0) * 8).toFixed(1)}px)`
                      }}
                      title="Zero Moment Point (ZMP)"
                    />

                    <div className="absolute bottom-1 right-2 text-[9px] text-stone-500 flex gap-2">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"/> COM</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"/> ZMP</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                    <div className="p-1.5 rounded bg-black/40 border border-white/5 text-center">
                      <div className="text-stone-500">RL Reward</div>
                      <div className="font-bold text-cyan-300">+{telemetry?.rlReward ?? 142.5}</div>
                    </div>
                    <div className="p-1.5 rounded bg-black/40 border border-white/5 text-center">
                      <div className="text-stone-500">Velocity</div>
                      <div className="font-bold text-white">{(telemetry?.velocity?.speed ?? 0).toFixed(2)} m/s</div>
                    </div>
                    <div className="p-1.5 rounded bg-black/40 border border-white/5 text-center">
                      <div className="text-stone-500">Margin</div>
                      <div className="font-bold text-emerald-300">{((telemetry?.balanceMargin ?? 0.88) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>

                {/* Ground Contact Sensors */}
                <div className="p-3 rounded-xl bg-[#0b0e16] border border-white/10 space-y-2">
                  <div className="text-[11px] text-stone-400 flex items-center justify-between">
                    <span>Ground Contact Reactions</span>
                    <span className="text-[10px] text-stone-500">Spring-Damper 180N</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {telemetry?.contacts?.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          contact.inContact
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-black/40 border-white/5 text-stone-500'
                        }`}
                      >
                        <div className="text-[9px] font-bold">{contact.name.split(' ')[0]}</div>
                        <div className="text-[10px] font-mono">
                          {contact.inContact ? `${Math.round(contact.normalForce)}N` : 'SWING'}
                        </div>
                      </div>
                    )) || (
                      <div className="col-span-4 text-center text-[10px] text-stone-500 py-1">Contact sensors calibrating...</div>
                    )}
                  </div>
                </div>

                {/* Virtual Joint Actuator Loads */}
                <div className="p-3 rounded-xl bg-[#0b0e16] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Virtual Joint Torques (PD Motor)</span>
                    <span className="text-[10px] text-cyan-400">12 Active Joints</span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {telemetry?.joints?.slice(0, 6).map((j) => (
                      <div key={j.id} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-stone-300">
                          <span>{j.name}</span>
                          <span className="font-mono text-cyan-400">{Math.round(j.torque)} N·m</span>
                        </div>
                        <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-75 ${
                              j.load > 0.8 ? 'bg-rose-500' : j.load > 0.5 ? 'bg-amber-400' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.round(j.load * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUTONOMOUS ENVIRONMENT NAVIGATION */}
            {activeTab === 'navigation' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#0b0e16] border border-white/10 space-y-2.5">
                  <div className="text-[11px] text-stone-400 flex items-center justify-between">
                    <span>Autonomous Navigation Target</span>
                    <span className="text-[9px] text-cyan-400">{telemetry?.navTarget.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateConfig({ locomotionNavTarget: 'autonomous_wander' })}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        navMode === 'autonomous_wander'
                          ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
                          : 'bg-black/40 border-white/10 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Compass size={13} />
                      <span>Auto Roam</span>
                    </button>

                    <button
                      onClick={() => onUpdateConfig({ locomotionNavTarget: 'follow_pointer' })}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        navMode === 'follow_pointer'
                          ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
                          : 'bg-black/40 border-white/10 text-stone-400 hover:text-white'
                      }`}
                    >
                      <MousePointer size={13} />
                      <span>Follow Cursor</span>
                    </button>

                    <button
                      onClick={() => onUpdateConfig({ locomotionNavTarget: 'follow_hand' })}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        navMode === 'follow_hand'
                          ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
                          : 'bg-black/40 border-white/10 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Hand size={13} />
                      <span>Follow Hand</span>
                    </button>

                    <button
                      onClick={() => onUpdateConfig({ locomotionNavTarget: 'follow_voice' })}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        navMode === 'follow_voice'
                          ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
                          : 'bg-black/40 border-white/10 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Volume2 size={13} />
                      <span>Voice Resonance</span>
                    </button>
                  </div>
                </div>

                {/* Speed & Agility Sliders */}
                <div className="p-3 rounded-xl bg-[#0b0e16] border border-white/10 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-300">
                      <span>Locomotion Speed</span>
                      <span className="text-cyan-400 font-mono">{(config.locomotionSpeed ?? 1.0).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={config.locomotionSpeed ?? 1.0}
                      onChange={(e) => onUpdateConfig({ locomotionSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-black/60 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-300">
                      <span>Turning Agility</span>
                      <span className="text-cyan-400 font-mono">{(config.locomotionAgility ?? 1.0).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.4"
                      max="2.5"
                      step="0.1"
                      value={config.locomotionAgility ?? 1.0}
                      onChange={(e) => onUpdateConfig({ locomotionAgility: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-black/60 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GAIT SELECTION & 3D RIG VISUALIZER */}
            {activeTab === 'gait' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#0b0e16] border border-white/10 space-y-2">
                  <div className="text-[11px] text-stone-400">Locomotion Morphology</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'quadruped', name: 'Quadruped Runner', desc: '4-leg dynamic trot' },
                      { id: 'hexapod', name: 'Hexapod Arachnid', desc: '6-leg tripod stability' },
                      { id: 'biped_strider', name: 'Biped Strider', desc: '2-leg inverted pendulum' },
                      { id: 'biomech_crawler', name: 'Biomech Crawler', desc: 'Low-gravity traction' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          audioEngine.playMagneticPulse(0.7);
                          onUpdateConfig({ locomotionGaitType: g.id as any });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          gaitType === g.id
                            ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                            : 'bg-black/40 border-white/10 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white">{g.name}</div>
                        <div className="text-[9px] text-stone-400">{g.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e16] border border-white/10 flex items-center justify-between">
                  <div className="text-[11px] text-stone-300">
                    <div>Visual Joint Servo Rig</div>
                    <div className="text-[9px] text-stone-500">Show bones & hydraulic actuators</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showVirtualJointRig ?? true}
                    onChange={(e) => onUpdateConfig({ showVirtualJointRig: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Bottom Export Bar */}
            <div className="pt-1 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-mono">Export 3D Model:</span>
              <button
                onClick={onOpenExportModal}
                className="py-1 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(0,240,255,0.25)]"
              >
                <Download size={11} />
                <span>Export GLTF / FBX</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
