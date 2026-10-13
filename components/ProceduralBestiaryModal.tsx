/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive Lexicon & Bestiary Modal
 * Features live 3D procedural mathematical rendering of all fauna,
 * real-time equation parameter deformation sliders, and lore telemetry.
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  X,
  Sparkles,
  Compass,
  Sliders,
  ChevronRight,
  RotateCw,
  Atom,
  Shield,
  Layers,
  MapPin,
  Activity,
  Maximize2
} from 'lucide-react';
import { BESTIARY_SPECS, ProceduralFaunaSpec, createProceduralFaunaObject } from '../utils/proceduralFauna';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSector?: (sectorId: string) => void;
}

export const ProceduralBestiaryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateToSector,
}) => {
  const [selectedId, setSelectedId] = useState<string>(BESTIARY_SPECS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'character' | 'fauna' | 'cosmic'>('all');
  const selectedSpec = BESTIARY_SPECS.find((s) => s.id === selectedId) || BESTIARY_SPECS[0];

  const filteredSpecs = BESTIARY_SPECS.filter((s) => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  // Mathematical parameter deformation values
  const [paramValues, setParamValues] = useState<Record<string, number>>({});

  // Reset param values when switching fauna
  useEffect(() => {
    const defaults: Record<string, number> = {};
    selectedSpec.mathematicalBasis.variables.forEach((v) => {
      defaults[v.name] = v.default;
    });
    setParamValues(defaults);
  }, [selectedSpec]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    faunaObj?: { group: THREE.Group; update: (t: number, dt: number) => void; dispose: () => void };
    animFrameId?: number;
    clock?: THREE.Clock;
  }>({});

  // Setup Three.js 3D Procedural Viewport
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio Lighting for metallic ferrofluid sheen
    const amb = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(amb);
    const dirKey = new THREE.DirectionalLight(0xffffff, 1.8);
    dirKey.position.set(4, 5, 4);
    scene.add(dirKey);
    const dirFill = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirFill.position.set(-4, -2, -3);
    scene.add(dirFill);

    // Build initial procedural fauna
    const faunaObj = createProceduralFaunaObject(selectedSpec.id, paramValues);
    scene.add(faunaObj.group);

    const clock = new THREE.Clock();

    // Mouse drag interaction for orbiting
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0;
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
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    const animate = () => {
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      faunaObj.update(t, dt);

      // Smooth orbital camera tracking
      camera.position.x = 4.5 * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = 4.5 * Math.sin(rotX);
      camera.position.z = 4.5 * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      threeStateRef.current.animFrameId = requestAnimationFrame(animate);
    };

    threeStateRef.current = { renderer, scene, camera, faunaObj, clock };
    animate();

    return () => {
      if (threeStateRef.current.animFrameId) {
        cancelAnimationFrame(threeStateRef.current.animFrameId);
      }
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      faunaObj.dispose();
      renderer.dispose();
    };
  }, [isOpen, selectedSpec.id]);

  // Re-build procedural object when user modifies mathematical parameter sliders
  const handleParamChange = (name: string, val: number) => {
    const updated = { ...paramValues, [name]: val };
    setParamValues(updated);

    if (threeStateRef.current.scene && threeStateRef.current.faunaObj) {
      threeStateRef.current.scene.remove(threeStateRef.current.faunaObj.group);
      threeStateRef.current.faunaObj.dispose();
      const newObj = createProceduralFaunaObject(selectedSpec.id, updated);
      threeStateRef.current.scene.add(newObj.group);
      threeStateRef.current.faunaObj = newObj;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#060913]/95 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-stone-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Atom size={20} className="animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold tracking-wider text-white">
                  LEXICON & BESTIARY // MATHEMATICAL PROCEDURAL FAUNA
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  PURE PROCEDURAL ALGORITHMS
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300/70">
                Parametric kinematic curves • Superellipsoids • 4D rotations • Minimal surfaces
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 sm:p-6">
          {/* Left Column: Fauna & Characters Selector */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 px-1 pb-0.5 flex items-center justify-between">
              <span>Lexicon & Procedural Models:</span>
              <span className="text-cyan-400 font-bold">{filteredSpecs.length} / {BESTIARY_SPECS.length}</span>
            </div>

            {/* Category Filter Chips */}
            <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
              {[
                { id: 'all', label: 'ALL MODELS', count: BESTIARY_SPECS.length },
                { id: 'character', label: 'CHARACTERS', count: BESTIARY_SPECS.filter((s) => s.category === 'character').length },
                { id: 'fauna', label: 'BESTIARY FAUNA', count: BESTIARY_SPECS.filter((s) => s.category === 'fauna').length },
                { id: 'cosmic', label: 'COSMIC / 4D', count: BESTIARY_SPECS.filter((s) => s.category === 'cosmic').length },
              ].map((cat) => {
                const isCatActive = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`py-1 px-2 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                      isCatActive
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-black/50 border-white/10 text-stone-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
              {filteredSpecs.map((spec) => {
                const isSelected = selectedId === spec.id;
                return (
                  <button
                    key={spec.id}
                    onClick={() => {
                      setSelectedId(spec.id);
                      try {
                        audioEngine.playMagneticPulse(0.9);
                      } catch (_) {}
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.25)] text-white'
                        : 'bg-black/50 border-white/10 hover:border-cyan-500/40 text-stone-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono">{spec.name}</span>
                      <span
                        className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded-full border ${
                          spec.threatLevel === 'Cosmic'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                            : spec.threatLevel === 'Predatory'
                            ? 'bg-red-500/20 text-red-300 border-red-400/40'
                            : spec.threatLevel === 'Resonant'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        }`}
                      >
                        {spec.threatLevel}
                      </span>
                    </div>

                    <div className="text-[10px] italic text-stone-400 truncate">
                      {spec.scientificName}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-cyan-300/80">
                      <span>{spec.habitatName}</span>
                      <span>{spec.magneticResonanceTesla}T</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: 3D Procedural Viewport, Equations & Mutation Sliders */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* 3D Interactive Procedural Viewport */}
            <div className="relative w-full h-[280px] sm:h-[320px] rounded-3xl bg-black/70 border border-cyan-500/30 overflow-hidden shadow-inner flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Viewport Overlay Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                <div className="text-white font-mono font-bold text-xs flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                  <Activity size={12} className="text-cyan-400" />
                  <span>{selectedSpec.name}</span>
                </div>
                <div className="text-[9px] font-mono text-cyan-300/80 bg-black/60 px-2.5 py-0.5 rounded-lg border border-white/5">
                  Drag to rotate • Real-time procedural rendering
                </div>
              </div>

              {/* Habitat Jump Action */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToSector?.(selectedSpec.habitatRegionId);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-[10px] font-mono font-bold transition-all shadow-md cursor-pointer"
                >
                  <MapPin size={12} />
                  <span>Locate on World Map</span>
                </button>
              </div>

              <div className="absolute bottom-3 left-3 text-[9px] font-mono text-stone-400 bg-black/60 px-2.5 py-1 rounded-xl border border-white/10">
                Magnetic Resonance: <span className="text-cyan-300 font-bold">{selectedSpec.magneticResonanceTesla} Tesla</span>
              </div>
            </div>

            {/* Mathematical Basis Card */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                  <Atom size={13} className="text-cyan-400" />
                  Mathematical Formulation: {selectedSpec.mathematicalBasis.title}
                </span>
                <span className="text-[9px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  PARAMETRIC FORMULA
                </span>
              </div>

              {/* Formula code block */}
              <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-cyan-200 text-xs tracking-wide overflow-x-auto">
                <code>{selectedSpec.mathematicalBasis.formula}</code>
              </div>

              <p className="text-[11px] text-stone-300 leading-relaxed">
                {selectedSpec.mathematicalBasis.explanation}
              </p>
            </div>

            {/* Interactive Mathematical Mutation Sliders */}
            <div className="p-4 rounded-2xl bg-[#080d19] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                  <Sliders size={13} className="text-cyan-400" />
                  Real-Time Mathematical Parameters (Deform Algorithm):
                </span>
                <button
                  onClick={() => {
                    const defaults: Record<string, number> = {};
                    selectedSpec.mathematicalBasis.variables.forEach((v) => {
                      defaults[v.name] = v.default;
                    });
                    setParamValues(defaults);
                  }}
                  className="text-[9px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw size={10} />
                  <span>Reset Variables</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {selectedSpec.mathematicalBasis.variables.map((variable) => {
                  const currentVal = paramValues[variable.name] ?? variable.default;
                  return (
                    <div key={variable.name} className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-stone-300">
                          {variable.name} ({variable.symbol}):
                        </span>
                        <span className="text-cyan-300 font-bold">{currentVal.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={variable.min}
                        max={variable.max}
                        step={variable.step}
                        value={currentVal}
                        onChange={(e) => handleParamChange(variable.name, parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lore and Behavior */}
            <div className="p-4 rounded-2xl bg-[#080d19] border border-white/10 space-y-2">
              <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Sparkles size={12} className="text-cyan-400" />
                Biological & Arcane Telemetry:
              </h4>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {selectedSpec.lore}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-cyan-500/20 bg-black/60 flex items-center justify-between text-[10px] font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Active Subject: {selectedSpec.scientificName}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            Close Lexicon
          </button>
        </div>
      </div>
    </div>
  );
};
