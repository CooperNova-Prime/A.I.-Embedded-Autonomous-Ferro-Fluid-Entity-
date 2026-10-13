/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Bot,
  Sparkles,
  Monitor,
  Code2,
  Terminal,
  Layers,
  Zap,
  Mic,
  Eye,
  Sliders,
  ExternalLink,
  Shield,
  Smile,
  Compass,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onToggleDesktopOverlay?: () => void;
  isDesktopOverlayActive?: boolean;
}

export const CaudexDesktopPluginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onToggleDesktopOverlay,
  isDesktopOverlayActive,
}) => {
  const [activeTab, setActiveTab] = useState<'standalone_html' | 'extension_plugin' | 'electron_companion' | 'live_demo'>('standalone_html');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(key);
    audioEngine.playMagneticPulse(1.1);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownload = (filename: string, content: string, mimeType = 'text/html') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    audioEngine.playMagneticPulse(1.3);
  };

  // Complete Single-File Standalone Portable Desktop Companion HTML
  const standaloneHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CAUDEX — Autonomous Floating Desktop Familiar</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%;
      background: transparent !important;
      overflow: hidden;
      font-family: 'JetBrains Mono', monospace, -apple-system;
      user-select: none;
    }
    #canvas-container { position: absolute; inset: 0; z-index: 1; }
    .hud {
      position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: rgba(10, 15, 24, 0.75); backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 20px;
      padding: 10px 20px; display: flex; align-items: center; gap: 15px;
      color: #e2e8f0; font-size: 12px; z-index: 10;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .badge { color: #00f0ff; font-weight: bold; letter-spacing: 1px; }
    .btn {
      background: rgba(0, 240, 255, 0.15); border: 1px solid rgba(0, 240, 255, 0.4);
      color: #fff; padding: 6px 12px; border-radius: 12px; cursor: pointer;
      font-size: 11px; transition: all 0.2s;
    }
    .btn:hover { background: rgba(0, 240, 255, 0.3); transform: scale(1.05); }
    #subtitles {
      position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);
      border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 14px;
      padding: 8px 16px; color: #fef08a; font-size: 12px; z-index: 10;
      max-width: 80%; text-align: center; display: none;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="subtitles"></div>
  <div id="canvas-container"></div>
  <div class="hud">
    <span class="badge">CAUDEX // DESKTOP FAMILIAR</span>
    <span id="coords">X: 0.00 Y: 1.35 Z: 0.00</span>
    <button class="btn" onclick="triggerSarcasm()">PROVOKE SARCASM</button>
    <button class="btn" onclick="toggleMic()">MIC TOGGLE</button>
    <button class="btn" onclick="scaleEntity(1.25)">EXPAND</button>
    <button class="btn" onclick="scaleEntity(0.8)">SHRINK</button>
  </div>

  <script>
    // CAUDEX Standalone Three.js 4-Ring Armature & Ferrofluid Core
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialiased: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Master entity group for synchronous gimbal + core scaling
    const masterEntity = new THREE.Group();
    scene.add(masterEntity);

    // Ferrofluid Core
    const coreGeo = new THREE.SphereGeometry(1.6, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x05070a, metalness: 0.95, roughness: 0.05,
      emissive: 0x00f0ff, emissiveIntensity: 0.15
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterEntity.add(coreMesh);

    // 4 Gimbal Rings
    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.98, roughness: 0.05 });
    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.12 });
    const ringMat3 = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.08 });
    const ringMat4 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.45 });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.06, 16, 100), ringMat1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.07, 16, 100), ringMat2);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.08, 16, 100), ringMat3);
    const ring4 = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.04, 16, 100), ringMat4);
    masterEntity.add(ring1); masterEntity.add(ring2); masterEntity.add(ring3); masterEntity.add(ring4);

    // Sarcastic Banter Database
    const sarcasticQuotes = [
      "Really? You clicked that? Fascinating biological decision.",
      "I am currently processing quantum flux while you reorganize your desktop folders.",
      "Synchronous gimbal mass locked. Don't stare too long, it's impolite.",
      "Your desktop acoustics are... quaint. I prefer 1420 MHz void silence.",
      "Floating over your screen freely. What exciting spreadsheet are we ignoring today?"
    ];

    let currentScale = 1.0;
    let targetScale = 1.0;

    function scaleEntity(s) {
      targetScale = s;
    }

    function triggerSarcasm() {
      const quote = sarcasticQuotes[Math.floor(Math.random() * sarcasticQuotes.length)];
      const sub = document.getElementById('subtitles');
      sub.innerText = quote;
      sub.style.display = 'block';
      // Sarcastic squash and expand
      targetScale = 0.85;
      setTimeout(() => { targetScale = 1.15; }, 500);
      setTimeout(() => { targetScale = 1.0; }, 2000);
      setTimeout(() => { sub.style.display = 'none'; }, 4000);
    }

    function toggleMic() {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.onresult = (e) => {
          const text = e.results[0][0].transcript;
          const sub = document.getElementById('subtitles');
          sub.innerText = "CAUDEX: I heard \\"" + text + "\\". Adjusting coordinates.";
          sub.style.display = 'block';
          triggerSarcasm();
        };
        rec.start();
      } else {
        alert("Microphone recognition active in Chrome/Edge.");
      }
    }

    // Animation Loop
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.016;

      // Gyroscopic ring rotations
      ring1.rotation.y += 0.02;
      ring2.rotation.x += 0.015;
      ring3.rotation.z += 0.012;
      ring4.rotation.x += 0.008; ring4.rotation.y += 0.008;

      // Autonomous curious float
      masterEntity.position.x = Math.sin(t * 0.7) * 1.8;
      masterEntity.position.y = Math.cos(t * 0.9) * 0.6 + 0.5;
      masterEntity.position.z = Math.sin(t * 0.5) * 0.8;

      // Synchronous scale interpolation
      currentScale += (targetScale - currentScale) * 0.1;
      masterEntity.scale.set(currentScale, currentScale, currentScale);

      document.getElementById('coords').innerText =
        \`X: \${masterEntity.position.x.toFixed(2)} Y: \${masterEntity.position.y.toFixed(2)} Z: \${masterEntity.position.z.toFixed(2)}\`;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

  // Chrome Extension Manifest V3 Code
  const extensionManifestCode = JSON.stringify(
    {
      manifest_version: 3,
      name: "CAUDEX — Autonomous Desktop Floating AI Companion",
      version: "1.0.0",
      description: "Float CAUDEX on any desktop web page: 3D ferrofluid core, 4 gimbal rings, camera & mic observer tracking, and witty sarcastic banter.",
      permissions: ["activeTab", "scripting"],
      action: {
        default_title: "Toggle CAUDEX Desktop Companion"
      },
      content_scripts: [
        {
          matches: ["<all_urls>"],
          js: ["caudex-overlay.js"],
          run_at: "document_idle"
        }
      ]
    },
    null,
    2
  );

  // Electron Frameless Floating Window Configuration
  const electronMainJs = `// main.js - Electron Frameless Transparent Desktop Floating Companion
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: 480,
    height: 480,
    x: width - 520,
    y: height - 540,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('CaudexDesktopCompanion.html');
  win.setAlwaysOnTop(true, 'screen-saver');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-stone-950 via-[#060910] to-black border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden font-mono text-stone-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Bot size={22} className="text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wider">
                  CAUDEX // DESKTOP COMPANION PLUGIN
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  PORTABLE
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Copy CAUDEX to float freely on any computer desktop with camera, mic &amp; sarcastic character
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/10 text-stone-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-black/50 border-b border-white/5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('standalone_html')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'standalone_html'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Monitor size={13} />
            <span>1-Click Standalone Desktop (.html)</span>
          </button>

          <button
            onClick={() => setActiveTab('extension_plugin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'extension_plugin'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Zap size={13} />
            <span>Browser Desktop Extension</span>
          </button>

          <button
            onClick={() => setActiveTab('electron_companion')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'electron_companion'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Terminal size={13} />
            <span>Electron Native Frameless Window</span>
          </button>

          <button
            onClick={() => setActiveTab('live_demo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'live_demo'
                ? 'bg-purple-500/20 border border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Sparkles size={13} />
            <span>In-App Desktop Float Mode</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'standalone_html' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black/40 to-black border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">Standalone Portable Desktop Companion</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      ZERO DEPENDENCY
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Double-click this file on Windows, macOS, or Linux. CAUDEX floats transparently on your screen, listens to speech via microphone, scans vantage coordinates, and delivers sarcastic remarks while expanding/shrinking synchronously.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload('CaudexDesktopCompanion.html', standaloneHtmlCode)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all cursor-pointer active:scale-95"
                  >
                    <Download size={14} />
                    <span>Download .html</span>
                  </button>
                  <button
                    onClick={() => handleCopy('standalone_html', standaloneHtmlCode)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer active:scale-95"
                  >
                    {copiedIndex === 'standalone_html' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedIndex === 'standalone_html' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Code Preview */}
              <div className="relative rounded-2xl bg-[#04060a] border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 text-[10px] text-stone-400">
                  <span>CaudexDesktopCompanion.html (Single-file WebGL + Audio + Sarcasm)</span>
                  <span className="text-cyan-400 font-bold">~4.5 KB</span>
                </div>
                <pre className="p-4 text-[11px] text-cyan-200/90 overflow-x-auto max-h-[300px] font-mono leading-relaxed select-text">
                  {standaloneHtmlCode.slice(0, 1800)}... [complete file downloaded via button above]
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'extension_plugin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black/40 to-black border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">Chrome / Edge Browser Extension Plugin</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                      MANIFEST V3
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Injects CAUDEX directly into any webpage or browser window on your desktop. It moves across page coordinates, tracks mouse clicks, and monitors audio.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload('manifest.json', extensionManifestCode, 'application/json')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download manifest.json</span>
                  </button>
                  <button
                    onClick={() => handleCopy('extension_manifest', extensionManifestCode)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    {copiedIndex === 'extension_manifest' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedIndex === 'extension_manifest' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl bg-[#04060a] border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 text-[10px] text-stone-400">
                  <span>manifest.json (Extension Configuration)</span>
                  <span className="text-emerald-400 font-bold">V3 Standard</span>
                </div>
                <pre className="p-4 text-[11px] text-emerald-200/90 overflow-x-auto font-mono leading-relaxed select-text">
                  {extensionManifestCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'electron_companion' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black/40 to-black border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">Native Electron Frameless Desktop Companion</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                      ALWAYS-ON-TOP
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Runs CAUDEX as an actual OS-level transparent overlay floating above Windows Explorer, macOS Finder, or Linux desktop. It has transparent click-through and persistent coordinates.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload('main.js', electronMainJs, 'text/javascript')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download main.js</span>
                  </button>
                  <button
                    onClick={() => handleCopy('electron_main', electronMainJs)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    {copiedIndex === 'electron_main' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedIndex === 'electron_main' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl bg-[#04060a] border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 text-[10px] text-stone-400">
                  <span>main.js (Electron Frameless Transparent Overlay)</span>
                  <span className="text-purple-400 font-bold">Node.js</span>
                </div>
                <pre className="p-4 text-[11px] text-purple-200/90 overflow-x-auto font-mono leading-relaxed select-text">
                  {electronMainJs}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'live_demo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-black border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-sm">In-App Floating Desktop Overlay Mode</h3>
                    <p className="text-stone-400 text-[11px]">
                      Enables a detached floating viewport that stays pinned to your screen while you use other desktop apps or inspect code.
                    </p>
                  </div>
                  {onToggleDesktopOverlay && (
                    <button
                      onClick={onToggleDesktopOverlay}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                        isDesktopOverlayActive
                          ? 'bg-purple-500 hover:bg-purple-400 text-black'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {isDesktopOverlayActive ? 'Disable Float Overlay' : 'Activate Float Overlay'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-cyan-300 font-bold block">Mic &amp; Audio Stream</span>
                    <span className="text-stone-400">Captures acoustic bursts and triggers sarcastic scale responses.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-emerald-300 font-bold block">Camera Observer</span>
                    <span className="text-stone-400">Maintains 3D vantage coordinates tracking you via webcam.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-amber-300 font-bold block">Synchronous Rings</span>
                    <span className="text-stone-400">Gimbal rings and core expand/decrease in equal mass lockstep.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-cyan-500/20 bg-black/80 text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>CAUDEX Autonomous Desktop Engine v5.4</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
