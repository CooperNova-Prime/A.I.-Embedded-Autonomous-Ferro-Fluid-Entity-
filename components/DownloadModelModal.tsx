/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Box,
  Monitor,
  Camera,
  Check,
  Copy,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import * as THREE from 'three';
import { export3DModel } from '../utils/export3D';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  getExportTarget?: () => THREE.Object3D | null;
  onTakeSnapshot?: () => void;
}

export const DownloadModelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  getExportTarget,
  onTakeSnapshot,
}) => {
  const [activeTab, setActiveTab] = useState<'3d-asset' | 'desktop-app' | 'source-code'>('3d-asset');
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: 'glb' | 'gltf' | 'fbx' | 'obj') => {
    setExporting(format);
    setExportSuccess(null);
    try {
      audioEngine.playMagneticPulse(0.9);
      // Retrieve target scene or object from window or callback
      const target =
        getExportTarget?.() ||
        (window as any).__FERROFLUID_EXPORT_TARGET__ ||
        (window as any).__FERROFLUID_SCENE__ ||
        (window as any).__FERROFLUID_ORB_GROUP__;

      if (!target) {
        throw new Error('3D scene target is not yet initialized.');
      }

      await export3DModel(target, format, 'ferrofluid-embodied-ai-model');
      setExportSuccess(format.toUpperCase());
    } catch (err: any) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExporting(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090b10] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-white">
                DOWNLOAD TO DESKTOP
              </h2>
              <p className="text-[11px] font-mono text-stone-400">
                Export 3D Model Assets, Desktop Companion App, or Project Files
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

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-black/40">
          <button
            onClick={() => setActiveTab('3d-asset')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === '3d-asset'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Box size={14} />
            <span>3D Model Files (.GLTF / .GLB / .FBX / .OBJ)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop-app')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'desktop-app'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Monitor size={14} />
            <span>Desktop Floating App (Electron)</span>
          </button>

          <button
            onClick={() => setActiveTab('source-code')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'source-code'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal size={14} />
            <span>Source Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: 3D MODEL FILES */}
          {activeTab === '3d-asset' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-cyan-200/90 leading-relaxed">
                Download the real-time pure free-floating 3D geometry and 4 concentric gyroscopic gimbal rings directly to your computer (pure aerial entity without any legs or feet). Fully compatible with{' '}
                <strong className="text-white">Unreal Engine 5, Unity 6, Blender, Maya, Godot, Windows 3D Viewer, Apple QuickLook, and 3D printing slicers</strong>.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GLB Download Card */}
                <div className="p-4 rounded-2xl bg-[#0e121a] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <Box size={14} className="text-cyan-400" />
                        GLB (glTF 2.0 Binary)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        PURE FLOATING CORE
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-400 leading-normal">
                      High-performance binary 3D model containing complete ferrofluid geometry, 4 concentric gimbal rings, PBR materials, and embedded buffers (zero legs/feet).
                    </p>
                  </div>
                  <button
                    onClick={() => handleExport('glb')}
                    disabled={exporting !== null}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
                  >
                    {exporting === 'glb' ? (
                      <span className="animate-spin">⏳ Exporting GLB...</span>
                    ) : exportSuccess === 'GLB' ? (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Check size={14} /> Downloaded GLB!
                      </span>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download .GLB Model</span>
                      </>
                    )}
                  </button>
                </div>

                {/* FBX Download Card */}
                <div className="p-4 rounded-2xl bg-[#0e121a] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <Layers size={14} className="text-emerald-400" />
                        Autodesk FBX (.FBX)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        RIG & ENGINES
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-400 leading-normal">
                      Autodesk FBX format with full joint hierarchy, node meshes, PBR material nodes, and transform tracks. Ready for Unreal Engine, Unity, and Maya.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExport('fbx')}
                    disabled={exporting !== null}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {exporting === 'fbx' ? (
                      <span className="animate-spin">⏳ Exporting FBX...</span>
                    ) : exportSuccess === 'FBX' ? (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Check size={14} /> Downloaded FBX!
                      </span>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download .FBX Model</span>
                      </>
                    )}
                  </button>
                </div>

                {/* GLTF JSON Download Card */}
                <div className="p-4 rounded-2xl bg-[#0e121a] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3 group">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <FileCode size={14} className="text-blue-400" />
                        glTF 2.0 (.gltf)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        WEB 3D / OPEN
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-400 leading-normal">
                      Open standard glTF format with JSON structure and embedded buffers, ideal for WebGL, Babylon.js, Three.js, and custom shaders.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExport('gltf')}
                    disabled={exporting !== null}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                  >
                    {exporting === 'gltf' ? (
                      <span className="animate-spin">⏳ Exporting glTF...</span>
                    ) : exportSuccess === 'GLTF' ? (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Check size={14} /> Downloaded glTF!
                      </span>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download .glTF JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* OBJ Download Card */}
                <div className="p-4 rounded-2xl bg-[#0e121a] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-400" />
                        Wavefront OBJ
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        3D PRINT / CAD
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-400 leading-normal">
                      Universal raw 3D polygon mesh file. Ideal for 3D slicing software (Cura, PrusaSlicer) and CAD tool import.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExport('obj')}
                    disabled={exporting !== null}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(255,191,0,0.3)] disabled:opacity-50"
                  >
                    {exporting === 'obj' ? (
                      <span className="animate-spin">⏳ Exporting OBJ...</span>
                    ) : exportSuccess === 'OBJ' ? (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Check size={14} /> Downloaded OBJ!
                      </span>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download .OBJ Mesh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Snapshot Button */}
              {onTakeSnapshot && (
                <div className="p-4 rounded-2xl bg-[#0e121a] border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <Camera size={14} className="text-purple-400" />
                      Ultra High-Res Render Snapshot (.PNG)
                    </div>
                    <p className="text-[11px] font-mono text-stone-400">
                      Instantly renders current canvas state to high-resolution PNG image on your desktop.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onTakeSnapshot();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Save PNG</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DESKTOP APP (ELECTRON) */}
          {activeTab === 'desktop-app' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-cyan-200 leading-relaxed space-y-2">
                <p>
                  This project includes a native <strong className="text-white">Electron Desktop Companion App</strong> configured in{' '}
                  <code className="text-cyan-300">electron.cjs</code>.
                </p>
                <p className="text-[11px] text-stone-400">
                  When launched on your computer, it runs as a borderless, transparent floating entity that hovers over your desktop windows and follows your cursor or roams autonomously.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1.5">
                  <span className="text-stone-300 font-bold">1. Launch Desktop Companion:</span>
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>npm run dev:electron</code>
                    <button
                      onClick={() => copyToClipboard('npm run dev:electron', 'cmd1')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'cmd1' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-stone-300 font-bold">2. Run Dev Server + Desktop App concurrently:</span>
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>npm run desktop</code>
                    <button
                      onClick={() => copyToClipboard('npm run desktop', 'cmd2')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'cmd2' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-stone-300 font-bold">3. Build Standalone Desktop Installer (.exe / .dmg / .deb):</span>
                  <p className="text-[11px] text-stone-400">
                    Install <code className="text-cyan-300">electron-builder</code> to produce a double-clickable native installer for Windows or Mac:
                  </p>
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>npx electron-builder build</code>
                    <button
                      onClick={() => copyToClipboard('npx electron-builder build', 'cmd3')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'cmd3' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOURCE CODE */}
          {activeTab === 'source-code' && (
            <div className="space-y-4 font-mono text-xs">
              <p className="text-stone-300 text-xs">
                To download and run this entire repository on your local computer:
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-stone-400 text-[11px]">1. Clone or download project files:</span>
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>git clone &lt;repo-url&gt; &amp;&amp; cd ferrofluid-arcana</code>
                    <button
                      onClick={() => copyToClipboard('git clone <repo-url> && cd ferrofluid-arcana', 'cmd4')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'cmd4' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-400 text-[11px]">2. Install dependencies:</span>
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>npm install</code>
                    <button
                      onClick={() => copyToClipboard('npm install', 'cmd5')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'cmd5' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-400 text-[11px]">3. Start local development server:</span>
                  <div className="flex items-center justify-between bg-black/60 border border-white/10 px-3 py-2 rounded-xl text-cyan-300">
                    <code>npm run dev</code>
                    <button
                      onClick={() => copyToClipboard('npm run dev', 'cmd6')}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      {copiedCmd === 'cmd6' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex justify-between items-center text-xs font-mono">
          <span className="text-[11px] text-stone-500">
            Formats: glTF 2.0 Binary (.glb) • Wavefront (.obj) • PNG 4K
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
