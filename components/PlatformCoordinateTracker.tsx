/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Crosshair,
  Radio,
  Eye,
  Mic,
  Sparkles,
  Bot,
  Zap,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronDown,
  Navigation,
  Activity,
  Sliders,
  Smile,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import type { CaudexCoordinateTelemetry, CaudexMood } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  telemetry: CaudexCoordinateTelemetry | null;
  onSetDestination: (x: number, y: number, z: number, label?: string) => void;
  onToggleCuriosityRoaming: (enabled: boolean) => void;
  onSetEntityScale: (scale: number) => void;
  onTriggerSarcasm: () => void;
  onOpenDesktopPluginModal: () => void;
}

export const PlatformCoordinateTracker: React.FC<Props> = ({
  telemetry,
  onSetDestination,
  onToggleCuriosityRoaming,
  onSetEntityScale,
  onTriggerSarcasm,
  onOpenDesktopPluginModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [targetX, setTargetX] = useState<string>('0.0');
  const [targetY, setTargetY] = useState<string>('1.35');
  const [targetZ, setTargetZ] = useState<string>('0.0');
  const [customScale, setCustomScale] = useState<number>(telemetry?.masterEntityScale || 1.0);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Sync custom scale if telemetry changes
  useEffect(() => {
    if (telemetry?.masterEntityScale && Math.abs(telemetry.masterEntityScale - customScale) > 0.05) {
      setCustomScale(telemetry.masterEntityScale);
    }
  }, [telemetry?.masterEntityScale]);

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const x = parseFloat(targetX) || 0;
    const y = parseFloat(targetY) || 1.35;
    const z = parseFloat(targetZ) || 0;
    onSetDestination(x, y, z, 'Manual Spatial Waypoint');
    audioEngine.playMagneticPulse(1.2);
  };

  const handleCopyCoords = () => {
    if (!telemetry) return;
    const text = `CAUDEX Spatial Coordinates:\nWorld: [X: ${telemetry.worldCoords.x.toFixed(3)}m, Y: ${telemetry.worldCoords.y.toFixed(3)}m, Z: ${telemetry.worldCoords.z.toFixed(3)}m]\nScreen: [${Math.round(telemetry.screenCoords.x)}px, ${Math.round(telemetry.screenCoords.y)}px]\nDestination: [X: ${telemetry.destinationTarget.x.toFixed(3)}m, Y: ${telemetry.destinationTarget.y.toFixed(3)}m, Z: ${telemetry.destinationTarget.z.toFixed(3)}m] (${telemetry.destinationTarget.label})\nCuriosity: ${Math.round(telemetry.curiosityIndex)}%\nScale: ${telemetry.masterEntityScale.toFixed(2)}x\nMood: ${telemetry.personalityMood}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const currentMood = telemetry?.personalityMood || 'curious';
  const curiosityPct = Math.round(telemetry?.curiosityIndex || 85);
  const worldX = telemetry?.worldCoords.x.toFixed(2) || '0.00';
  const worldY = telemetry?.worldCoords.y.toFixed(2) || '1.35';
  const worldZ = telemetry?.worldCoords.z.toFixed(2) || '0.00';
  const destX = telemetry?.destinationTarget.x.toFixed(2) || '0.00';
  const destY = telemetry?.destinationTarget.y.toFixed(2) || '1.35';
  const destZ = telemetry?.destinationTarget.z.toFixed(2) || '0.00';
  const distanceDelta = telemetry?.distanceToTarget.toFixed(2) || '0.00';
  const currentScale = telemetry?.masterEntityScale?.toFixed(2) || '1.00';

  const moodColors: Record<CaudexMood, { border: string; text: string; bg: string; label: string }> = {
    sarcastic: {
      border: 'border-amber-400/50',
      text: 'text-amber-300',
      bg: 'bg-amber-950/40',
      label: 'SARCASTIC · SKEPTIC',
    },
    curious: {
      border: 'border-cyan-400/50',
      text: 'text-cyan-300',
      bg: 'bg-cyan-950/40',
      label: 'CURIOUS · EXPLORING',
    },
    analytical: {
      border: 'border-emerald-400/50',
      text: 'text-emerald-300',
      bg: 'bg-emerald-950/40',
      label: 'ANALYTICAL · SCANNING',
    },
    protective: {
      border: 'border-purple-400/50',
      text: 'text-purple-300',
      bg: 'bg-purple-950/40',
      label: 'DEFENSIVE · SURGING',
    },
    roaming: {
      border: 'border-blue-400/50',
      text: 'text-blue-300',
      bg: 'bg-blue-950/40',
      label: 'AUTONOMOUS · ROAMING',
    },
  };

  const activeMoodStyle = moodColors[currentMood];

  return (
    <div className="fixed top-14 left-3 z-30 pointer-events-auto max-w-[320px] w-full transition-all">
      <div className="rounded-2xl bg-black/60 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden font-mono">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-cyan-950/50 via-black/40 to-black/60 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Compass size={15} className="text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider text-white">CAUDEX</span>
                <span className="text-[10px] text-cyan-400 font-semibold">COORDINATES</span>
              </div>
              <span className="text-[9px] text-stone-400 block -mt-0.5">Platform Tracking &amp; Curiosity</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyCoords}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-cyan-300 transition-colors"
              title="Copy current telemetry coordinates"
            >
              {copiedCoords ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3 text-[11px]">
            {/* Personality Mood & Sarcasm Badge */}
            <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border ${activeMoodStyle.border} ${activeMoodStyle.bg}`}>
              <div className="flex items-center gap-1.5">
                <Smile size={13} className={activeMoodStyle.text} />
                <span className={`text-[10px] font-bold tracking-wide ${activeMoodStyle.text}`}>
                  {activeMoodStyle.label}
                </span>
              </div>
              <span className="text-[9px] text-stone-300">
                Sarcasm: {telemetry?.sarcasticScalingMultiplier ? `${telemetry.sarcasticScalingMultiplier.toFixed(2)}x` : '1.00x'}
              </span>
            </div>

            {/* Live 3D Spatial Vector Coordinates */}
            <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-stone-400 pb-1 border-b border-white/5">
                <span className="flex items-center gap-1 font-semibold text-cyan-300">
                  <Crosshair size={11} />
                  <span>3D ENTITY POSITION</span>
                </span>
                <span className="text-[9px] text-stone-500">World Origin: (0,0,0)</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center font-bold">
                <div className="bg-cyan-950/30 p-1 rounded-lg border border-cyan-500/20">
                  <span className="text-[9px] text-cyan-400 block font-normal">X (LAT)</span>
                  <span className="text-white text-xs">{worldX}m</span>
                </div>
                <div className="bg-cyan-950/30 p-1 rounded-lg border border-cyan-500/20">
                  <span className="text-[9px] text-cyan-400 block font-normal">Y (ALT)</span>
                  <span className="text-white text-xs">{worldY}m</span>
                </div>
                <div className="bg-cyan-950/30 p-1 rounded-lg border border-cyan-500/20">
                  <span className="text-[9px] text-cyan-400 block font-normal">Z (DEPTH)</span>
                  <span className="text-white text-xs">{worldZ}m</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-stone-400 pt-1">
                <span>Screen Projection:</span>
                <span className="text-cyan-300 font-bold">
                  {Math.round(telemetry?.screenCoords.x || 0)}px, {Math.round(telemetry?.screenCoords.y || 0)}px
                </span>
              </div>
            </div>

            {/* Destination Target & Real-Time Observer Tracking */}
            <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 font-semibold text-emerald-300">
                  <Navigation size={11} />
                  <span>CURIOUS DESTINATION</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                  Δ {distanceDelta}m
                </span>
              </div>

              <div className="text-[10px] text-stone-300 flex items-center justify-between">
                <span className="truncate max-w-[190px] text-stone-400">
                  Source: <strong className="text-white">{telemetry?.destinationTarget.label || 'Autonomous Curiosity'}</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  [{destX}, {destY}, {destZ}]
                </span>
              </div>

              {/* Curiosity Level Meter */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-stone-400">Curiosity Excitation:</span>
                  <span className="text-cyan-300 font-bold">{curiosityPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/70 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                    style={{ width: `${Math.min(100, Math.max(5, curiosityPct))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Synchronous Master Scale (Gimbal Rings + Ferrofluid Core expand together) */}
            <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <Sliders size={11} />
                  <span>SYNCHRONOUS SCALE</span>
                </span>
                <span className="text-white font-bold">{currentScale}x</span>
              </div>
              <p className="text-[9px] text-stone-400 leading-tight">
                Gimbal rings and ferrofluid core expand and decrease in lockstep with equal mass.
              </p>

              <div className="flex items-center gap-1.5">
                {[0.7, 1.0, 1.4, 1.9].map((scaleVal) => (
                  <button
                    key={scaleVal}
                    onClick={() => onSetEntityScale(scaleVal)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      Math.abs(customScale - scaleVal) < 0.15
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {scaleVal}x
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={customScale}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomScale(val);
                  onSetEntityScale(val);
                }}
                className="w-full accent-amber-400 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Actions: Sarcasm, Camera Seek, Desktop Plugin */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={onTriggerSarcasm}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-black/60 hover:from-amber-900/60 border border-amber-500/40 text-amber-200 text-[10px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Trigger CAUDEX's sarcastic dynamic scale response"
              >
                <Zap size={11} className="text-amber-400" />
                <span>PROVOKE SARCASM</span>
              </button>

              <button
                onClick={() => {
                  // Direct coordinate seek toward camera vantage point
                  onSetDestination(0.0, 1.4, 2.2, 'Observer Camera Vantage');
                  audioEngine.playMagneticPulse(1.4);
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-black/60 hover:from-cyan-900/60 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Set destination coordinates directly towards the camera observer"
              >
                <Eye size={11} className="text-cyan-400" />
                <span>SEEK CAMERA</span>
              </button>
            </div>

            {/* 1-Click Desktop Plugin & Desktop Copy Launcher */}
            <button
              onClick={onOpenDesktopPluginModal}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-cyan-900/40 via-purple-950/40 to-cyan-900/40 hover:from-cyan-800/50 hover:to-purple-900/50 border border-cyan-400/40 text-cyan-200 text-[11px] font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-95 cursor-pointer"
            >
              <Bot size={13} className="text-cyan-300" />
              <span>COPY CAUDEX TO DESKTOP / PLUGIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
