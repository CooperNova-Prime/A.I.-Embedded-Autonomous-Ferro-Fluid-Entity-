/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import {
  Sparkles,
  Search,
  X,
  ExternalLink,
  ChevronRight,
  Minimize2,
  Clock,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { SearchResultData, voiceAIService } from '../services/voiceAIService';

interface Props {
  result: SearchResultData | null;
  onDismiss: () => void;
  scale?: number;
}

export const RingSearchDisplay: React.FC<Props> = ({ result, onDismiss, scale = 1.0 }) => {
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    if (!result) return;
    setTimeLeft(8);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  if (!result) return null;

  return (
    <Html
      position={[0, 2.85, 0]}
      center
      distanceFactor={6.5}
      style={{
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <div className="w-[380px] max-w-[92vw] bg-[#050910]/90 backdrop-blur-2xl border-2 border-cyan-400/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,240,255,0.35)] text-stone-200 font-sans animate-in fade-in zoom-in-95 duration-300">
        {/* Top Arcane Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-300 font-bold flex items-center gap-1">
              <Search size={11} />
              RING DISPLAY // SEARCH RESULT
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
              REVERT IN {timeLeft}S
            </span>
            <button
              onClick={onDismiss}
              title="Convert Rings Back to Normal Size"
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <Minimize2 size={13} />
            </button>
          </div>
        </div>

        {/* Query & Title */}
        <div className="pt-3 pb-2 space-y-1">
          <div className="text-[11px] font-mono text-cyan-200/70 truncate">
            QUERY: &ldquo;{result.query}&rdquo;
          </div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400 shrink-0" />
            <span>{result.title}</span>
          </h3>
        </div>

        {/* Conversational Summary */}
        <p className="text-xs text-stone-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5 my-2">
          {result.summary}
        </p>

        {/* Structured Key Points */}
        {result.keyPoints && result.keyPoints.length > 0 && (
          <div className="space-y-1.5 my-2.5">
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-stone-400">
              Key Neural Telemetry:
            </div>
            <div className="grid grid-cols-1 gap-1">
              {result.keyPoints.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-cyan-100/90 font-mono bg-cyan-950/20 px-2 py-1 rounded-xl border border-cyan-500/10"
                >
                  <ChevronRight size={12} className="text-cyan-400 mt-0.5 shrink-0" />
                  <span className="leading-snug">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer with Source & Convert Action */}
        <div className="pt-2.5 mt-2 border-t border-cyan-500/15 flex items-center justify-between text-[9px] font-mono text-stone-400">
          <div className="flex items-center gap-1 truncate max-w-[190px]">
            <Radio size={10} className="text-cyan-400" />
            <span className="truncate">{result.source}</span>
          </div>

          <button
            onClick={onDismiss}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 transition-all font-bold cursor-pointer"
          >
            <span>NORMAL SIZE</span>
            <Minimize2 size={10} />
          </button>
        </div>
      </div>
    </Html>
  );
};
