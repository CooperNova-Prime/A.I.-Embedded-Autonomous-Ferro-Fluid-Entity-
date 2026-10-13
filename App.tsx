/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { FerrofluidConfig, MagnetNode, CaudexCoordinateTelemetry } from './types';
import { FerrofluidCanvas } from './components/FerrofluidCanvas';
import { ArcaneControls } from './components/ArcaneControls';
import { TennisBallModal } from './components/TennisBallModal';
import { EquationOverlay } from './components/EquationOverlay';
import { HandTrackingVisionHUD } from './components/HandTrackingVisionHUD';
import FerrofluidR3FApp from './components/FerrofluidR3FApp';
import { DownloadModelModal } from './components/DownloadModelModal';
import { LocomotionTelemetryHUD } from './components/LocomotionTelemetryHUD';
import { TacticalGhostOS } from './components/TacticalGhostOS';
import { AiModelsDirectoryModal } from './components/AiModelsDirectoryModal';
import { UnifiedAiVoiceCodeModal } from './components/UnifiedAiVoiceCodeModal';
import { PlatformCoordinateTracker } from './components/PlatformCoordinateTracker';
import { CaudexDesktopPluginModal } from './components/CaudexDesktopPluginModal';
import { PRESETS } from './components/controls/PresetsPanel';
import { Sparkles, Bot, Layers, Download, Footprints, Check, Compass } from 'lucide-react';

const DEFAULT_CONFIG: FerrofluidConfig = {
  meshShape: 'sphere',
  tennisBallDiameter: 6.7,
  showTennisBallSeam: true,
  ballSkin: 'void-refraction',
  morphIntensity: 1.25,
  morphSpeed: 1.0,
  refractionIntensity: 1.7,
  voidAbsorption: 0.95,
  shimmerSpeed: 1.0,
  magneticStrength: 1.8,
  viscosity: 0.5,
  surfaceTension: 1.4,
  oscillationFreq: 1.4,
  spikeDensity: 14,
  spikeHeight: 1.6,
  fluidDepth: 1.2,
  wireframeVisible: true,
  wireframeDensity: 16,
  wireframeGlowIntensity: 1.6,
  glowTheme: 'cyan',
  showEquations: true,
  showArcaneRings: true,
  showGimbalRings: true,
  gimbalSpeed: 1.0,
  ring1Speed: 1.0,
  ring2Speed: 1.0,
  ring3Speed: 1.0,
  ring4Speed: 1.0,
  gimbalMotionStyle: 'fluid',
  showBezierArcs: true,
  showHoloPanels: true,
  symbolSet: 'all',
  symbolRotationSpeed: 1.0,
  iridescence: 0.85,
  reflectivity: 0.92,
  abyssDarkness: 0.98,
  autoRotate: false,
  rotationSpeed: 0.5,
  zoomPreset: 'core',
  cameraDistance: 13.5,
  interactionMode: 'orbit',
  soundEnabled: true,
  soundVolume: 0.5,
  soundFrequency: 220,
  arcingTendrilsEnabled: true,
  tendrilCount: 6,
  tendrilArcIntensity: 1.5,
  timeAnomalyFrequency: 1.0,
  voiceReactive: true,
  voiceSensitivity: 1.6,
  voiceSpikeBoost: 1.5,
  upperHalfFloating: true,
  floatDriftSpeed: 1.0,
  floatRange: 1.2,
  voidParticlesEnabled: true,
  lowLightMode: false,
  solidSurfaceEnabled: true,
  solidCoreHardness: 1.0,
  particleBounceRestitution: 1.2,
  kineticCollidersEnabled: true,
  showCollisionSparks: true,
  handTrackingEnabled: false,
  autonomousLevitationEnabled: true,
  acousticCameraAutoTrigger: true,
  acousticAnomalyThreshold: 0.58,
  ghostUiOpacity: 0.85,
  ghostUiMode: 'tactical',
  modelScaleFactor: 1.0,
  activeAiModelId: 'phi-3-mini',
};

const INITIAL_MAGNETS: MagnetNode[] = [
  { id: 'mag-1', x: -1.6, z: 0.8, strength: 1.4, polarity: 'north', pulsing: true },
  { id: 'mag-2', x: 1.6, z: -0.8, strength: 1.2, polarity: 'south', pulsing: false },
];

export const App: React.FC = () => {
  // Model selection: defaults to original first model ('arcane-original')
  const [activeModel, setActiveModel] = useState<'arcane-original' | 'embodied-ai'>('arcane-original');

  // Original Model State
  const [config, setConfig] = useState<FerrofluidConfig>(DEFAULT_CONFIG);
  const [magnets, setMagnets] = useState<MagnetNode[]>(INITIAL_MAGNETS);
  const [showTennisModal, setShowTennisModal] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAiDirectoryModal, setShowAiDirectoryModal] = useState(false);
  const [showUnifiedCodeModal, setShowUnifiedCodeModal] = useState(false);
  const [showDesktopPluginModal, setShowDesktopPluginModal] = useState(false);
  const [showCoordinatesPanel, setShowCoordinatesPanel] = useState(true);
  const [coordinateTelemetry, setCoordinateTelemetry] = useState<CaudexCoordinateTelemetry | null>(null);
  const [isDesktopOverlayActive, setIsDesktopOverlayActive] = useState(false);
  const [assimilationToast, setAssimilationToast] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pinchMidpoint, setPinchMidpoint] = useState<{
    x: number;
    y: number;
    dist: number;
    active: boolean;
  } | null>(null);

  // CAUDEX Dedicated Actions & Curiosity Destination Controls
  const handleSetDestination = useCallback((x: number, y: number, z: number, label?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('caudex-set-destination', {
          detail: { x, y, z, label, source: 'manual_waypoint' },
        })
      );
    }
  }, []);

  const handleSetEntityScale = useCallback((scale: number) => {
    setConfig((prev) => ({ ...prev, modelScaleFactor: scale }));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('caudex-set-scale', {
          detail: { scale },
        })
      );
    }
  }, []);

  const handleTriggerSarcasm = useCallback(() => {
    if (typeof window !== 'undefined') {
      (window as any).__CAUDEX_TRIGGER_SARCASM__?.();
    }
  }, []);

  // Add magnet node
  const handleAddMagnet = useCallback((x: number, z: number, polarity: 'north' | 'south' = 'north') => {
    setMagnets((prev) => [
      ...prev,
      {
        id: `mag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        x,
        z,
        strength: 1.5,
        polarity,
        pulsing: true,
      },
    ]);
  }, []);

  // Update magnet node position
  const handleUpdateMagnetPosition = useCallback((id: string, x: number, z: number) => {
    setMagnets((prev) =>
      prev.map((m) => (m.id === id ? { ...m, x, z } : m))
    );
  }, []);

  // Remove magnet node
  const handleRemoveMagnet = useCallback((id: string) => {
    setMagnets((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Clear all magnet nodes
  const handleClearMagnets = useCallback(() => {
    setMagnets([]);
  }, []);

  // Fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Snapshot capture
  const handleTakeSnapshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ferrofluid-arcana-${Date.now()}.png`;
      a.click();
    } catch (e) {
      console.warn('Snapshot capture failed:', e);
    }
  }, []);

  // If user toggles to the Embodied AI view
  if (activeModel === 'embodied-ai') {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        {/* Model switcher pill */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setActiveModel('arcane-original')}
            className="px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-black text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-mono font-bold tracking-wider shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={13} className="text-cyan-400" />
            <span>ORIGINAL FIRST MODEL</span>
          </button>
        </div>
        <FerrofluidR3FApp />
      </div>
    );
  }

  // Original First Model View (FerrofluidCanvas + Tactical Ghost OS)
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020306] select-none touch-none">
      {/* 1. Main 3D Interactive WebGL Ferrofluid Canvas (Touch Pinch, Orbit & Stretch) */}
      <FerrofluidCanvas
        config={config}
        magnets={magnets}
        onAddMagnet={(x, z) => handleAddMagnet(x, z, 'north')}
        onUpdateMagnetPosition={handleUpdateMagnetPosition}
        pinchMidpoint={pinchMidpoint}
        onCoordinateTelemetry={setCoordinateTelemetry}
      />

      {/* 2. Tactical Ghost OS Interface (Header Status Rail + Anti-Clutter Drawer + Mobile/Desktop Rail) */}
      <TacticalGhostOS
        config={config}
        onUpdateConfig={setConfig}
        magnets={magnets}
        onAddMagnet={handleAddMagnet}
        onRemoveMagnet={handleRemoveMagnet}
        onClearMagnets={handleClearMagnets}
        onOpenTennisModal={() => setShowTennisModal(true)}
        onOpenCodex={() => setShowCodex(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        onOpenAiDirectoryModal={() => setShowAiDirectoryModal(true)}
        onOpenUnifiedCodeModal={() => setShowUnifiedCodeModal(true)}
        onOpenDesktopPluginModal={() => setShowDesktopPluginModal(true)}
        onToggleCoordinatesPanel={() => setShowCoordinatesPanel((prev) => !prev)}
        showCoordinatesPanel={showCoordinatesPanel}
        onTakeSnapshot={handleTakeSnapshot}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        getLocomotionTelemetry={() => (window as any).__LOCOMOTION_SYSTEM__?.getTelemetry?.() || null}
        onApplyImpulse={(fx, fz) => (window as any).__LOCOMOTION_APPLY_IMPULSE__?.(fx, fz)}
      />

      {/* 3. AI Assimilation Success Notification Toast */}
      {assimilationToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-950/90 backdrop-blur-2xl border border-emerald-400 text-emerald-200 text-xs font-mono font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <Check size={15} className="text-emerald-300" />
            <span>{assimilationToast}</span>
          </div>
        </div>
      )}

      {/* 4. AI Models Directory Modal (Shows All Available Cores in Vicinity) */}
      <AiModelsDirectoryModal
        isOpen={showAiDirectoryModal}
        onClose={() => setShowAiDirectoryModal(false)}
        config={config}
        onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
        onAssimilationSuccess={(model) => {
          setAssimilationToast(`AI MODEL [${model.name.toUpperCase()}] ASSIMILATED INTO ENTITY`);
          setTimeout(() => setAssimilationToast(null), 4000);
        }}
      />

      {/* 5. MediaPipe Hand & Face Tracking Vision HUD */}
      {config.handTrackingEnabled && (
        <HandTrackingVisionHUD
          enabled={config.handTrackingEnabled}
          onToggle={(enabled) => setConfig((prev) => ({ ...prev, handTrackingEnabled: enabled }))}
          onPinchPoint={(midX, midY, pinchDist, isPinching) => {
            setPinchMidpoint({ x: midX, y: midY, dist: pinchDist, active: isPinching });
          }}
        />
      )}

      {/* 6. Regulation Tennis Ball Metric Modal */}
      <TennisBallModal
        isOpen={showTennisModal}
        onClose={() => setShowTennisModal(false)}
        diameter={config.tennisBallDiameter}
        onDiameterChange={(d) => setConfig((prev) => ({ ...prev, tennisBallDiameter: d }))}
        showSeam={config.showTennisBallSeam}
        onToggleSeam={(show) => setConfig((prev) => ({ ...prev, showTennisBallSeam: show }))}
      />

      {/* 7. The Ferrofluid Codex & Alchemical Matrix Modal */}
      <EquationOverlay
        config={config}
        onOpenTennisModal={() => {
          setShowCodex(false);
          setShowTennisModal(true);
        }}
        isOpen={showCodex}
        onClose={() => setShowCodex(false)}
      />

      {/* 8. Download Model Modal (GLTF, GLB, FBX with Virtual Joint Rig, OBJ) */}
      <DownloadModelModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        getExportTarget={() => (window as any).__FERROFLUID_EXPORT_TARGET__ || (window as any).__FERROFLUID_SCENE__}
        onTakeSnapshot={handleTakeSnapshot}
      />

      {/* 9. Unified AI · Voice · Ferrofluid 3D Open Source Code Repository & Live Sandbox */}
      <UnifiedAiVoiceCodeModal
        isOpen={showUnifiedCodeModal}
        onClose={() => setShowUnifiedCodeModal(false)}
        config={config}
        onUpdateConfig={setConfig}
      />

      {/* 10. CAUDEX Dedicated Platform Coordinate Tracking & Curiosity HUD */}
      {showCoordinatesPanel && (
        <PlatformCoordinateTracker
          telemetry={coordinateTelemetry}
          onSetDestination={handleSetDestination}
          onToggleCuriosityRoaming={(enabled) => {
            if (typeof window !== 'undefined') {
              (window as any).__CAUDEX_AUTO_ROAM__ = enabled;
            }
          }}
          onSetEntityScale={handleSetEntityScale}
          onTriggerSarcasm={handleTriggerSarcasm}
          onOpenDesktopPluginModal={() => setShowDesktopPluginModal(true)}
        />
      )}

      {/* 11. CAUDEX Desktop Companion Plugin & Exporter Modal */}
      <CaudexDesktopPluginModal
        isOpen={showDesktopPluginModal}
        onClose={() => setShowDesktopPluginModal(false)}
        isDesktopOverlayActive={isDesktopOverlayActive}
        onToggleDesktopOverlay={() => setIsDesktopOverlayActive((prev) => !prev)}
      />
    </div>
  );
};

export default App;
