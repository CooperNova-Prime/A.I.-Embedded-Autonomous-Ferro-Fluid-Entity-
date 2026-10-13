/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Sparkles,
  Hand,
  Eye,
  Move,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Radio,
  Compass,
  Magnet,
  Shield,
  Zap,
} from 'lucide-react';
import type { VisionTrackingData, HandGesture } from '../types';

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onTrackingUpdate: (data: VisionTrackingData) => void;
  movementMode?: string;
  onSelectMovementMode?: (mode: 'autonomous_roam' | 'follow_face' | 'follow_hand' | 'magnetic_tether' | 'anchor') => void;
}

export const VisionTrackingHUD: React.FC<Props> = ({
  enabled,
  onToggle,
  onTrackingUpdate,
  movementMode = 'autonomous_roam',
  onSelectMovementMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [useVirtualSimulation, setUseVirtualSimulation] = useState(false);

  // Live Tracking Stats for HUD
  const [stats, setStats] = useState({
    faceLocked: false,
    faceCoords: { x: 0, y: 0, z: 1.0 },
    handLocked: false,
    handGesture: 'none' as HandGesture,
    pinchDist: 1.0,
  });

  // Start webcam
  const startWebcam = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMsg('Webcam API is not available in this environment.');
      setUseVirtualSimulation(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              startTrackingLoop();
            })
            .catch(() => {});
        };
      }
    } catch (err) {
      console.warn('Webcam permission denied or camera unavailable:', err);
      setErrorMsg('Camera access denied. Virtual tracking simulation activated.');
      setUseVirtualSimulation(true);
    }
  };

  const stopWebcam = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStats({
      faceLocked: false,
      faceCoords: { x: 0, y: 0, z: 1.0 },
      handLocked: false,
      handGesture: 'none',
      pinchDist: 1.0,
    });
    onTrackingUpdate({
      active: false,
      faceDetected: false,
      faceX: 0,
      faceY: 0,
      faceDist: 1.0,
      facePitch: 0,
      faceYaw: 0,
      faceRoll: 0,
      mouthOpen: false,
      handDetected: false,
      handX: 0,
      handY: 0,
      handDist: 1.0,
      gesture: 'none',
      pinchDistance: 1.0,
      isPinching: false,
      isOpenPalm: false,
    });
  };

  // Initialize MediaPipe Vision Tasks
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      if (!enabled) return;
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const { FilesetResolver, HandLandmarker, FaceLandmarker } = await import(
          '@mediapipe/tasks-vision'
        );

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (isCancelled) return;

        // 1. Hand Landmarker
        try {
          const handLm = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          if (!isCancelled) handLandmarkerRef.current = handLm;
        } catch (e) {
          console.warn('HandLandmarker init fallback:', e);
        }

        // 2. Face Landmarker
        try {
          const faceLm = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
            outputFaceBlendshapes: false,
          });
          if (!isCancelled) faceLandmarkerRef.current = faceLm;
        } catch (e) {
          console.warn('FaceLandmarker init fallback:', e);
        }

        if (!isCancelled) {
          await startWebcam();
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('MediaPipe initialization error:', err);
          setErrorMsg('Vision models offline. Using virtual tracking.');
          setUseVirtualSimulation(true);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    if (enabled) {
      initMediaPipe();
    } else {
      stopWebcam();
    }

    return () => {
      isCancelled = true;
      stopWebcam();
      if (handLandmarkerRef.current) {
        try {
          handLandmarkerRef.current.close();
        } catch (_) {}
        handLandmarkerRef.current = null;
      }
      if (faceLandmarkerRef.current) {
        try {
          faceLandmarkerRef.current.close();
        } catch (_) {}
        faceLandmarkerRef.current = null;
      }
    };
  }, [enabled]);

  // Main Detection Loop
  const startTrackingLoop = useCallback(() => {
    let lastVideoTime = -1;

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const handLm = handLandmarkerRef.current;
      const faceLm = faceLandmarkerRef.current;

      if (!video || !canvas) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const nowMs = performance.now();

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Mirror preview horizontally for natural mirror behavior
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);

          let faceDetected = false;
          let faceX = 0,
            faceY = 0,
            faceDist = 1.0;
          let facePitch = 0,
            faceYaw = 0,
            faceRoll = 0;
          let mouthOpen = false;

          let handDetected = false;
          let handX = 0,
            handY = 0,
            handDist = 1.0;
          let gesture: HandGesture = 'none';
          let pinchDistance = 1.0;
          let isPinching = false;
          let isOpenPalm = false;

          // 1. Face Detection & Tracking
          if (faceLm) {
            try {
              const faceResult = faceLm.detectForVideo(video, nowMs);
              if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
                faceDetected = true;
                const landmarks = faceResult.faceLandmarks[0];

                // Nose tip (index 1), Eye left (index 33), Eye right (index 263)
                const nose = landmarks[1];
                const eyeL = landmarks[33];
                const eyeR = landmarks[263];
                const lipTop = landmarks[13];
                const lipBot = landmarks[14];

                // Mirrored coordinates for intuitive interaction: -1 (left) to +1 (right)
                faceX = (0.5 - nose.x) * 2.0;
                faceY = (0.5 - nose.y) * 2.0;

                const eyeSpan = Math.hypot(eyeR.x - eyeL.x, eyeR.y - eyeL.y);
                faceDist = Math.max(0.4, Math.min(2.5, 0.28 / Math.max(0.01, eyeSpan)));

                // Head Yaw (turning), Pitch (nodding), Roll (tilting)
                faceYaw = (eyeL.z - eyeR.z) * 4.0;
                facePitch = (nose.y - (eyeL.y + eyeR.y) / 2) * 5.0;
                faceRoll = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);

                // Mouth openness check
                const lipSpan = Math.hypot(lipBot.x - lipTop.x, lipBot.y - lipTop.y);
                mouthOpen = lipSpan > 0.045;

                // Draw Cybernetic Reticle on Face
                const nx = nose.x * canvas.width;
                const ny = nose.y * canvas.height;
                const eyeLx = eyeL.x * canvas.width;
                const eyeLy = eyeL.y * canvas.height;
                const eyeRx = eyeR.x * canvas.width;
                const eyeRy = eyeR.y * canvas.height;

                ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
                ctx.lineWidth = 1.5;

                // Eye tracking axis
                ctx.beginPath();
                ctx.moveTo(eyeLx, eyeLy);
                ctx.lineTo(eyeRx, eyeRy);
                ctx.stroke();

                // Nose reticle
                ctx.beginPath();
                ctx.arc(nx, ny, 6, 0, Math.PI * 2);
                ctx.strokeStyle = '#00f0ff';
                ctx.stroke();

                // Crosshairs
                ctx.beginPath();
                ctx.moveTo(nx - 12, ny);
                ctx.lineTo(nx + 12, ny);
                ctx.moveTo(nx, ny - 12);
                ctx.lineTo(nx, ny + 12);
                ctx.stroke();
              }
            } catch (_) {}
          }

          // 2. Hand Detection & Gesture Tracking
          if (handLm) {
            try {
              const handResult = handLm.detectForVideo(video, nowMs);
              if (handResult.landmarks && handResult.landmarks.length > 0) {
                handDetected = true;
                const lm = handResult.landmarks[0];

                const thumb = lm[4];
                const index = lm[8];
                const middle = lm[12];
                const ring = lm[16];
                const pinky = lm[20];
                const wrist = lm[0];

                // Mirrored Hand Center
                const midX = (thumb.x + index.x) / 2;
                const midY = (thumb.y + index.y) / 2;
                handX = (0.5 - midX) * 2.0;
                handY = (0.5 - midY) * 2.0;

                pinchDistance = Math.hypot(thumb.x - index.x, thumb.y - index.y);
                isPinching = pinchDistance < 0.085;

                // Open palm check: all fingertips extended away from wrist
                const palmSpan =
                  Math.hypot(index.x - wrist.x, index.y - wrist.y) +
                  Math.hypot(middle.x - wrist.x, middle.y - wrist.y) +
                  Math.hypot(pinky.x - wrist.x, pinky.y - wrist.y);

                if (isPinching) {
                  gesture = 'pinch';
                } else if (palmSpan > 1.25) {
                  gesture = 'open_palm';
                  isOpenPalm = true;
                } else {
                  gesture = 'point';
                }

                // Draw Hand Skeleton
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';

                // Connect thumb to index
                ctx.beginPath();
                ctx.moveTo(thumb.x * canvas.width, thumb.y * canvas.height);
                ctx.lineTo(index.x * canvas.width, index.y * canvas.height);
                ctx.strokeStyle = isPinching ? '#00f0ff' : 'rgba(168, 85, 247, 0.7)';
                ctx.lineWidth = isPinching ? 3 : 1.5;
                ctx.stroke();

                // Draw fingertips nodes
                [thumb, index, middle, ring, pinky].forEach((pt, i) => {
                  ctx.beginPath();
                  ctx.arc(pt.x * canvas.width, pt.y * canvas.height, i < 2 ? 4 : 2.5, 0, Math.PI * 2);
                  ctx.fillStyle = isPinching && i < 2 ? '#00f0ff' : '#a855f7';
                  ctx.fill();
                });
              }
            } catch (_) {}
          }

          ctx.restore();

          setStats({
            faceLocked: faceDetected,
            faceCoords: { x: Number(faceX.toFixed(2)), y: Number(faceY.toFixed(2)), z: Number(faceDist.toFixed(2)) },
            handLocked: handDetected,
            handGesture: gesture,
            pinchDist: Number(pinchDistance.toFixed(2)),
          });

          onTrackingUpdate({
            active: true,
            faceDetected,
            faceX,
            faceY,
            faceDist,
            facePitch,
            faceYaw,
            faceRoll,
            mouthOpen,
            handDetected,
            handX,
            handY,
            handDist,
            gesture,
            pinchDistance,
            isPinching,
            isOpenPalm,
          });
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [onTrackingUpdate]);

  // Virtual Tracking Pointer Fallback
  useEffect(() => {
    if (!enabled || !useVirtualSimulation) return;

    const handlePointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2.0;
      const y = -(e.clientY / window.innerHeight - 0.5) * 2.0;
      const isDown = e.buttons > 0;

      const gesture: HandGesture = isDown ? 'pinch' : 'point';

      setStats({
        faceLocked: true,
        faceCoords: { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), z: 1.0 },
        handLocked: true,
        handGesture: gesture,
        pinchDist: isDown ? 0.04 : 0.25,
      });

      onTrackingUpdate({
        active: true,
        faceDetected: true,
        faceX: x * 0.7,
        faceY: y * 0.7,
        faceDist: 1.0,
        facePitch: y * 0.4,
        faceYaw: x * 0.4,
        faceRoll: 0,
        mouthOpen: false,
        handDetected: true,
        handX: x,
        handY: y,
        handDist: 1.0,
        gesture,
        pinchDistance: isDown ? 0.04 : 0.25,
        isPinching: isDown,
        isOpenPalm: !isDown,
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [enabled, useVirtualSimulation, onTrackingUpdate]);

  if (!enabled) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="fixed bottom-5 left-5 z-40 px-3.5 py-2 rounded-2xl bg-black/70 hover:bg-black/90 backdrop-blur-xl border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 text-xs font-mono font-medium flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:scale-105 active:scale-95 cursor-pointer group"
        title="Activate real-time Face & Hand tracking for 3D free-range movement"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <div className="flex items-center gap-1.5">
          <Eye size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <Hand size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
          <span>VISION TRACKING</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2">
      {/* Floating Cybernetic Vision Monitor */}
      <div className="rounded-2xl bg-[#090b12]/90 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 w-64 select-none">
        {/* Header Bar */}
        <div className="px-3.5 py-2 border-b border-cyan-500/20 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <Radio size={12} className="text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300">
              CYBERNETIC VISION
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-stone-400 hover:text-white transition-colors"
              title={isMinimized ? 'Expand HUD' : 'Minimize HUD'}
            >
              {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
            <button
              onClick={() => onToggle(false)}
              className="p-1 rounded text-stone-400 hover:text-red-400 transition-colors"
              title="Deactivate Vision Tracker"
            >
              <CameraOff size={12} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-3 space-y-2.5">
            {/* Real-time Video Viewport */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/80 border border-cyan-500/30 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-cyan-400 font-mono text-[10px]">
                  <Sparkles size={16} className="animate-spin text-cyan-400" />
                  <span>CALIBRATING SENSORS...</span>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover opacity-35 scale-x-[-1]"
                  />
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={240}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />

                  {/* Corner Target Accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />
                </>
              )}

              {/* Status Badge overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10">
                <span className={stats.faceLocked ? 'text-cyan-400 font-bold' : 'text-stone-500'}>
                  FACE: {stats.faceLocked ? 'LOCKED' : 'SEEKING'}
                </span>
                <span className={stats.handLocked ? 'text-purple-400 font-bold' : 'text-stone-500'}>
                  HAND: {stats.handGesture.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Live Tracking Telemetry Readouts */}
            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex justify-between text-stone-400">
                <span>Face Gaze:</span>
                <span className="text-cyan-300">
                  {stats.faceLocked ? `[${stats.faceCoords.x}, ${stats.faceCoords.y}]` : 'Scanning...'}
                </span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Gestural Field:</span>
                <span className="text-purple-300">
                  {stats.handGesture === 'pinch'
                    ? 'MAGNETIC TETHER (PULL)'
                    : stats.handGesture === 'open_palm'
                    ? 'SHIELD (REPULSE)'
                    : stats.handGesture === 'point'
                    ? 'GUIDE / STEER'
                    : 'PASSIVE FLOAT'}
                </span>
              </div>
            </div>

            {/* Movement Mode Selector */}
            {onSelectMovementMode && (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="text-[9px] font-mono text-stone-400 tracking-wider flex items-center justify-between">
                  <span>FREE RANGE MODE</span>
                  <Compass size={10} className="text-cyan-400" />
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                  <button
                    onClick={() => onSelectMovementMode('autonomous_roam')}
                    className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                      movementMode === 'autonomous_roam'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    1. ROAM VOID
                  </button>
                  <button
                    onClick={() => onSelectMovementMode('follow_face')}
                    className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                      movementMode === 'follow_face'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    2. TRACK FACE
                  </button>
                  <button
                    onClick={() => onSelectMovementMode('follow_hand')}
                    className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                      movementMode === 'follow_hand'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    3. TRACK HAND
                  </button>
                  <button
                    onClick={() => onSelectMovementMode('magnetic_tether')}
                    className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                      movementMode === 'magnetic_tether'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    4. TETHER PINCH
                  </button>
                </div>
              </div>
            )}

            {/* Error or Fallback notice */}
            {errorMsg && (
              <div className="text-[9px] font-mono text-amber-400/90 pt-1 border-t border-amber-500/20">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
