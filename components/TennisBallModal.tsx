/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TennisBallMetrics } from '../types';
import { calculateTennisBallMetrics, generateTennisBallBreakdown } from '../services/geminiService';
import { Sparkles, X, Copy, Check, Terminal, RefreshCw, CircleDot, Info, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diameter: number;
  onDiameterChange: (d: number) => void;
  showSeam: boolean;
  onToggleSeam: (show: boolean) => void;
}

export const TennisBallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  diameter,
  onDiameterChange,
  showSeam,
  onToggleSeam,
}) => {
  const metrics: TennisBallMetrics = calculateTennisBallMetrics(diameter);
  const [loading, setLoading] = useState(false);
  const [breakdownText, setBreakdownText] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBreakdown, setCopiedBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'code' | 'metrics'>('breakdown');

  if (!isOpen) return null;

  const pythonSnippet = `import math
from google import genai

# Tennis ball metrics (regulation average)
diameter_cm = ${metrics.diameter_cm.toFixed(2)}
radius_cm = diameter_cm / 2

circumference_cm = 2 * math.pi * radius_cm
surface_area_cm2 = 4 * math.pi * (radius_cm**2)
volume_cm3 = (4 / 3) * math.pi * (radius_cm**3)

prompt = f"""
Provide a visual breakdown of a tennis ball with these spherical dimensions:
- Diameter: {diameter_cm:.2f} cm
- Perimeter / Circumference: {circumference_cm:.2f} cm
- Surface Area: {surface_area_cm2:.2f} cm²
- Volume: {volume_cm3:.2f} cm³
"""

client = genai.Client()
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
)

print(response.text)`;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateTennisBallBreakdown(metrics);
      setBreakdownText(res.text);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyBreakdown = () => {
    if (!breakdownText) return;
    navigator.clipboard.writeText(breakdownText);
    setCopiedBreakdown(true);
    setTimeout(() => setCopiedBreakdown(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-text">
      <div className="relative w-full max-w-2xl bg-[#090b10] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-stone-900 to-black">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <CircleDot size={20} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h2 className="text-base font-cinzel font-bold text-white tracking-wide flex items-center gap-2">
                Tennis Ball Visual Breakdown
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  gemini-2.5-flash
                </span>
              </h2>
              <p className="text-[11px] font-mono text-stone-400">
                Spherical Cowley-Rosensweig geometry & dimension breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 px-6">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`py-3 px-4 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'breakdown'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles size={14} />
            Visual Breakdown (Gemini)
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-4 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers size={14} />
            Regulation Dimensions
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal size={14} />
            Python GenAI Script
          </button>
        </div>

        {/* Body Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Metrics Bar across all tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-center">
              <span className="block text-[10px] uppercase font-mono text-stone-400">Diameter</span>
              <span className="font-mono text-sm font-bold text-cyan-300">
                {metrics.diameter_cm.toFixed(2)} cm
              </span>
            </div>
            <div className="text-center border-l border-white/10">
              <span className="block text-[10px] uppercase font-mono text-stone-400">Circumference</span>
              <span className="font-mono text-sm font-bold text-amber-300">
                {metrics.circumference_cm.toFixed(2)} cm
              </span>
            </div>
            <div className="text-center border-l border-white/10">
              <span className="block text-[10px] uppercase font-mono text-stone-400">Surface Area</span>
              <span className="font-mono text-sm font-bold text-emerald-300">
                {metrics.surface_area_cm2.toFixed(2)} cm²
              </span>
            </div>
            <div className="text-center border-l border-white/10">
              <span className="block text-[10px] uppercase font-mono text-stone-400">Volume</span>
              <span className="font-mono text-sm font-bold text-purple-300">
                {metrics.volume_cm3.toFixed(2)} cm³
              </span>
            </div>
          </div>

          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
                <div>
                  <span className="text-xs font-semibold text-white">Generate AI Analysis</span>
                  <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                    Execute Gemini 2.5 Flash model prompt with regulation ball metrics
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>{loading ? 'Analyzing...' : 'Generate Breakdown'}</span>
                </button>
              </div>

              {/* Output Display */}
              <div className="rounded-2xl bg-black/60 border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs font-mono">
                  <span className="text-stone-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-cyan-400" />
                    Gemini 2.5 Flash Response
                  </span>
                  {breakdownText && (
                    <button
                      onClick={handleCopyBreakdown}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer"
                    >
                      {copiedBreakdown ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedBreakdown ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  )}
                </div>

                <div className="p-4 font-sans text-xs text-stone-200 leading-relaxed space-y-3 whitespace-pre-wrap">
                  {breakdownText ? (
                    breakdownText
                  ) : (
                    <div className="py-6 text-center text-stone-400 space-y-2">
                      <Sparkles size={24} className="mx-auto text-cyan-400/60 animate-pulse" />
                      <p className="text-xs">
                        Click <strong className="text-cyan-300">Generate Breakdown</strong> above to query{' '}
                        <code className="text-cyan-400 font-mono">gemini-2.5-flash</code> with the tennis ball dimensions.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* How to use this guide card */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-stone-300 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold font-mono text-[11px]">
                  <Info size={13} />
                  <span>How This Information Is Used in the App</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  <strong className="text-white">You do not need to manually paste this anywhere.</strong> The live 3D ferrofluid simulation is already automatically configured with these exact mathematical metrics (<code className="text-cyan-300">Ø 6.70 cm</code>, <code className="text-amber-300">141 cm²</code>, <code className="text-purple-300">157 cm³</code>) to calculate spike density, surface curvature, and quadrupole morphing.
                </p>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  If you need this data for 3D modeling (e.g. Blender UV mapping), scientific notes, or external Python scripts, you can click <strong className="text-cyan-300">Copy Text</strong> or use the <strong className="text-cyan-300">Python GenAI Script</strong> tab to copy the code.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {/* Diameter Slider */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-300">Diameter Adjuster:</span>
                  <span className="text-cyan-300 font-bold">{diameter.toFixed(2)} cm</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="7.5"
                  step="0.02"
                  value={diameter}
                  onChange={(e) => onDiameterChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-500">
                  <span>6.00 cm</span>
                  <button
                    onClick={() => onDiameterChange(6.7)}
                    className="text-cyan-400 hover:underline cursor-pointer"
                  >
                    Reset to Regulation (6.70 cm)
                  </button>
                  <span>7.50 cm</span>
                </div>
              </div>

              {/* Seam toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2">
                  <CircleDot size={16} className="text-cyan-400" />
                  <div>
                    <span className="text-xs text-white font-medium">Curved Vulcanized Seam</span>
                    <p className="text-[10px] text-stone-400 font-mono">
                      Highlights the 3D non-intersecting spherical curve on the ferrofluid sphere
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleSeam(!showSeam)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    showSeam ? 'bg-cyan-500' : 'bg-stone-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      showSeam ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Mathematical breakdown */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs space-y-2 text-stone-300">
                <div className="text-[11px] text-cyan-300 font-bold uppercase tracking-wider mb-2">
                  Formulas & Derivations
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-stone-400">Radius (r = d / 2):</span>
                  <span className="text-white font-bold">{metrics.radius_cm.toFixed(3)} cm</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-stone-400">Circumference (C = 2πr):</span>
                  <span className="text-white font-bold">{metrics.circumference_cm.toFixed(3)} cm</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-stone-400">Surface Area (A = 4πr²):</span>
                  <span className="text-white font-bold">{metrics.surface_area_cm2.toFixed(3)} cm²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Volume (V = 4/3 πr³):</span>
                  <span className="text-white font-bold">{metrics.volume_cm3.toFixed(3)} cm³</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>Direct Python Google GenAI Integration:</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-black/80 border border-white/10 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                <code>{pythonSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-[11px] font-mono text-stone-400">
          <span>Regulation Diameter: 6.70 cm (ITF Standard)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
