/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive Procedural 2D & 3D World Map Modal
 * Switchable between:
 * - 2D Holographic Vector Contour & Magnetic Streamline Cartography
 * - 3D Displaced Planetary FBM Globe with Magnetic Aurora Arcs
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  X,
  Compass,
  Globe,
  Map as MapIcon,
  Layers,
  Sparkles,
  MapPin,
  Atom,
  ChevronRight,
  Activity,
  Maximize2
} from 'lucide-react';
import {
  WORLD_SECTORS,
  WorldSector,
  render2DProceduralMap,
  create3DProceduralWorldGlobe
} from '../utils/proceduralWorldMap';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialSectorId?: string | null;
  onOpenFauna?: (faunaId: string) => void;
}

export const ProceduralWorldMapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialSectorId = null,
  onOpenFauna,
}) => {
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('2d');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(initialSectorId || WORLD_SECTORS[0].id);
  const [hoverSectorId, setHoverSectorId] = useState<string | null>(null);

  const selectedSector = WORLD_SECTORS.find((s) => s.id === selectedSectorId) || WORLD_SECTORS[0];

  // 2D Canvas Ref & Animation
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const anim2DRef = useRef<number | null>(null);

  // 3D Canvas Ref & Three.js State
  const canvas3DRef = useRef<HTMLCanvasElement>(null);
  const threeStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    globeObj?: { group: THREE.Group; update: (t: number) => void; dispose: () => void };
    animFrameId?: number;
    clock?: THREE.Clock;
  }>({});

  useEffect(() => {
    if (initialSectorId) {
      setSelectedSectorId(initialSectorId);
    }
  }, [initialSectorId]);

  // 2D Map Animation Loop
  useEffect(() => {
    if (!isOpen || mapMode !== '2d' || !canvas2DRef.current) return;

    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = () => {
      const time = (performance.now() - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      render2DProceduralMap(ctx, width, height, time, selectedSectorId, hoverSectorId);
      anim2DRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (anim2DRef.current) {
        cancelAnimationFrame(anim2DRef.current);
      }
    };
  }, [isOpen, mapMode, selectedSectorId, hoverSectorId]);

  // Handle 2D Canvas Click on Sectors
  const handle2DCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check click distance to sectors
    for (const sec of WORLD_SECTORS) {
      const sx = sec.coords2D.x * (canvas.width / 2) + canvas.width / 2;
      const sy = sec.coords2D.y * (canvas.height / 2) + canvas.height / 2;
      const dist = Math.sqrt((clickX - sx) ** 2 + (clickY - sy) ** 2);
      if (dist < 26) {
        setSelectedSectorId(sec.id);
        try {
          audioEngine.playMagneticPulse(1.0);
        } catch (_) {}
        return;
      }
    }
  };

  // 3D Globe Animation Loop
  useEffect(() => {
    if (!isOpen || mapMode !== '3d' || !canvas3DRef.current) return;

    const canvas = canvas3DRef.current;
    const width = canvas.clientWidth || 500;
    const height = canvas.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const amb = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(5, 6, 4);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x00f0ff, 1.0);
    rim.position.set(-5, -4, -4);
    scene.add(rim);

    const globeObj = create3DProceduralWorldGlobe(selectedSectorId);
    scene.add(globeObj.group);

    const clock = new THREE.Clock();

    // Mouse drag interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0.3;
    let rotY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      rotX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotX));
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      const t = clock.getElapsedTime();
      globeObj.update(t);

      camera.position.x = 6.2 * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = 6.2 * Math.sin(rotX);
      camera.position.z = 6.2 * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      threeStateRef.current.animFrameId = requestAnimationFrame(animate);
    };

    threeStateRef.current = { renderer, scene, camera, globeObj, clock };
    animate();

    return () => {
      if (threeStateRef.current.animFrameId) {
        cancelAnimationFrame(threeStateRef.current.animFrameId);
      }
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      globeObj.dispose();
      renderer.dispose();
    };
  }, [isOpen, mapMode, selectedSectorId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#060913]/95 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-stone-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Compass size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold tracking-wider text-white">
                  PROCEDURAL WORLD CARTOGRAPHY // 2D & 3D MAP
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  MATHEMATICAL TERRAIN GENERATION
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300/70">
                Multi-octave FBM • Dipole magnetic field streamlines • Dynamic Rosensweig peaks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 2D / 3D Mode Toggle */}
            <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
              <button
                onClick={() => setMapMode('2d')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  mapMode === '2d'
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <MapIcon size={12} />
                <span>2D Vector</span>
              </button>
              <button
                onClick={() => setMapMode('3d')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  mapMode === '3d'
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Globe size={12} />
                <span>3D Planet</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 sm:p-6">
          {/* Left Column: Interactive Map Viewport (2D or 3D) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl bg-black/80 border border-cyan-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
              {mapMode === '2d' ? (
                <canvas
                  ref={canvas2DRef}
                  width={680}
                  height={440}
                  onClick={handle2DCanvasClick}
                  className="w-full h-full cursor-crosshair"
                />
              ) : (
                <canvas ref={canvas3DRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              )}

              {/* Viewport Overlay HUD */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                <div className="text-white font-mono font-bold text-xs flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                  <Activity size={12} className="text-cyan-400" />
                  <span>
                    {mapMode === '2d' ? '2D HOLOGRAPHIC CONTOUR GRID' : '3D FBM PLANETARY TERRAIN'}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-cyan-300/80 bg-black/60 px-2.5 py-0.5 rounded-lg border border-white/5">
                  {mapMode === '2d'
                    ? 'Click sector nodes to inspect • Dynamic magnetic stream traces'
                    : 'Drag to orbit globe • Magnetic aurora loops active'}
                </div>
              </div>

              {/* Sector Quick Pill in Bottom Left */}
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-stone-300 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSector.colorHex }} />
                <span className="font-bold text-white">{selectedSector.name}</span>
                <span className="text-cyan-300">[{selectedSector.magneticFluxTesla} Tesla]</span>
              </div>
            </div>

            {/* Mathematical World Generation Theory Card */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-white font-bold">
                <span className="flex items-center gap-1.5">
                  <Atom size={13} className="text-cyan-400" />
                  Mathematical Procedural Algorithms:
                </span>
                <span className="text-[9px] text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20">
                  FBM + DIPOLE B(r)
                </span>
              </div>
              <p className="text-[10.5px] text-stone-300 font-sans leading-relaxed">
                {"Terrain elevation H(x, y) = ∑ 2⁻ᵒ Noise(2ᵒx, 2ᵒy) with critical Rosensweig spike eruptions where |B⃗| > B_c. Streamlines trace the dipole field vector B⃗(r) = (μ₀/4π) · (3(m⃗·r̂)r̂ - m⃗) / r³."}
              </p>
            </div>
          </div>

          {/* Right Column: Sector Inspector & Resident Fauna */}
          <div className="lg:col-span-4 space-y-4">
            {/* Sector Selector List */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 px-1 pb-1 flex items-center justify-between">
                <span>World Sectors & Biomes:</span>
                <span className="text-cyan-400 font-bold">{WORLD_SECTORS.length} REGIONS</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                {WORLD_SECTORS.map((sec) => {
                  const isSelected = selectedSectorId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setSelectedSectorId(sec.id);
                        try {
                          audioEngine.playMagneticPulse(0.9);
                        } catch (_) {}
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/80 shadow-[0_0_15px_rgba(0,240,255,0.25)] text-white'
                          : 'bg-black/50 border-white/10 hover:border-cyan-500/40 text-stone-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.colorHex }} />
                        <span className="font-bold text-[11px] font-mono truncate">{sec.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400 shrink-0">{sec.magneticFluxTesla}T</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Sector Telemetry Detail Card */}
            <div className="p-4 rounded-2xl bg-[#080d19] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                  <MapPin size={13} className="text-cyan-400" />
                  Sector Telemetry: {selectedSector.name}
                </span>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {selectedSector.type}
                </span>
              </div>

              <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                {selectedSector.description}
              </p>

              {/* Coordinate Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-black/50 p-2 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-stone-400">Cartesian Coordinates:</span>
                  <div className="text-cyan-300 font-bold">
                    X: {selectedSector.coords2D.x.toFixed(2)}, Y: {selectedSector.coords2D.y.toFixed(2)}
                  </div>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-stone-400">Geodetic Location:</span>
                  <div className="text-cyan-300 font-bold">
                    {selectedSector.coords3D.lat}° N, {selectedSector.coords3D.lon}° E
                  </div>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-stone-400">Elevation Factor:</span>
                  <div className="text-cyan-300 font-bold">
                    {selectedSector.elevation > 0 ? `+${(selectedSector.elevation * 1000).toFixed(0)}m` : `${(selectedSector.elevation * 1000).toFixed(0)}m (Abyss)`}
                  </div>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-stone-400">Magnetic Gradient:</span>
                  <div className="text-cyan-300 font-bold">{selectedSector.magneticFluxTesla} Tesla</div>
                </div>
              </div>

              {/* Resident Fauna Jump Action */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono text-stone-400 uppercase">Indigenous Mathematical Fauna:</div>
                  <div className="text-white font-bold text-xs font-mono">{selectedSector.residentFaunaName}</div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenFauna?.(selectedSector.residentFaunaId);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Fauna</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-cyan-500/20 bg-black/60 flex items-center justify-between text-[10px] font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Map Coordinates: Lat {selectedSector.coords3D.lat}°, Lon {selectedSector.coords3D.lon}°</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            Close World Map
          </button>
        </div>
      </div>
    </div>
  );
};
