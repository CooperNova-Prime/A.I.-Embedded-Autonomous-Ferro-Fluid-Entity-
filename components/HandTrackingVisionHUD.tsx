/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Sparkles, Hand, Eye, Move, CheckCircle2 } from 'lucide-react';
import type { HandLandmarker } from '@mediapipe/tasks-vision';

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onPinchPoint: (midX: number, midY: number, pinchDist: number, isPinching: boolean) => void;
}

export const HandTrackingVisionHUD: React.FC<Props> = ({
  enabled,
  onToggle,
  onPinchPoint,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchDistanceVal, setPinchDistanceVal] = useState<number>(1.0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize MediaPipe HandLandmarker dynamically on demand
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      if (!enabled) return;
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const { FilesetResolver, HandLandmarker: HandLandmarkerClass } = await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (isCancelled) return;

        const landmarker = await HandLandmarkerClass.createFromOptions(vision, {
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

        if (isCancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
      } catch (err: unknown) {
        if (isCancelled) return;
        console.warn('Failed to load MediaPipe HandLandmarker:', err);
        setErrorMsg('Neural landmarker model loading. Using camera vision & screen pinch fallback.');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    if (enabled) {
      startWebcam();
      initMediaPipe();
    } else {
      stopWebcam();
    }

    return () => {
      isCancelled = true;
      stopWebcam();
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // ignore
        }
        landmarkerRef.current = null;
      }
    };
  }, [enabled]);

  const startWebcam = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMsg('Webcam is not supported or permitted in this environment.');
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
          videoRef.current?.play().then(() => {
            startDetectionLoop();
          }).catch(() => {});
        };
      }
    } catch (err) {
      console.warn('Webcam permission denied or camera not found:', err);
      setErrorMsg('Camera access denied or device unavailable.');
    }
  };

  const stopWebcam = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHandDetected(false);
    setIsPinching(false);
  };

  // Tracking loop
  const startDetectionLoop = useCallback(() => {
    let lastVideoTime = -1;

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !landmarker) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();

        try {
          const results = landmarker.detectForVideo(video, startTimeMs);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.landmarks && results.landmarks.length > 0) {
              setHandDetected(true);
              const landmarks = results.landmarks[0];

              // Thumb tip (index 4) and Index finger tip (index 8)
              const thumb = landmarks[4];
              const index = landmarks[8];

              // Normalized pinch distance in screen coordinates
              const pinchDist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
              setPinchDistanceVal(pinchDist);

              // Pinch midpoint (x is mirrored for intuitive selfie webcam control)
              const midX = (thumb.x + index.x) / 2;
              const midY = (thumb.y + index.y) / 2;

              const pinched = pinchDist < 0.08;
              setIsPinching(pinched);

              // Notify canvas to glide sphere:
              // Inside the pinch detection logic:
              // if (pinchDistance < 0.08) {
              //   const targetWorldPos = screenToWorld(midX, midY, 0);
              //   sphere.position.lerp(targetWorldPos, 0.15);
              // }
              onPinchPoint(midX, midY, pinchDist, pinched);

              // Draw minimal futuristic HUD skeleton
              ctx.lineWidth = 2;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              // Draw connecting line between pinch fingers
              ctx.beginPath();
              ctx.moveTo(thumb.x * canvas.width, thumb.y * canvas.height);
              ctx.lineTo(index.x * canvas.width, index.y * canvas.height);
              ctx.strokeStyle = pinched ? 'rgba(0, 240, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)';
              ctx.lineWidth = pinched ? 3 : 1.5;
              ctx.stroke();

              // Draw pinch midpoint target reticle
              ctx.beginPath();
              ctx.arc(midX * canvas.width, midY * canvas.height, Math.max(1, pinched ? 8 : 4), 0, Math.PI * 2);
              ctx.fillStyle = pinched ? '#00f0ff' : 'rgba(255, 255, 255, 0.6)';
              ctx.fill();

              // Draw index and thumb nodes
              [thumb, index].forEach((pt, i) => {
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 5, 0, Math.PI * 2);
                ctx.fillStyle = i === 0 ? '#8b5cf6' : '#00f0ff';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
              });
            } else {
              setHandDetected(false);
              setIsPinching(false);
            }
          }
        } catch {
          // ignore detection tick drop
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    animationFrameRef.current = requestAnimationFrame(detect);
  }, [onPinchPoint]);

  if (!enabled) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="fixed bottom-5 left-5 z-40 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
        title="Enable real-time webcam hand tracking & pinch-to-glide"
        id="enable-hand-tracking-btn"
      >
        <Hand size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
        <span>Hand Vision / Pinch Glide</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-16 sm:bottom-16 left-3 sm:left-5 z-40 transition-all duration-300 rounded-2xl overflow-hidden border border-cyan-500/40 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)] ${
        isMinimized ? 'w-56 h-12' : 'w-72 sm:w-80'
      }`}
      id="hand-vision-hud"
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-cyan-400 animate-pulse' : 'bg-stone-600'}`} />
          <span className="font-mono text-[11px] font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
            <Hand size={13} />
            Hand Landmark Vision
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-stone-400 hover:text-white text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10"
            title={isMinimized ? 'Expand Tracker' : 'Minimize'}
          >
            {isMinimized ? 'Expand' : 'Hide'}
          </button>
          <button
            onClick={() => onToggle(false)}
            className="text-stone-400 hover:text-rose-400 p-1 rounded hover:bg-white/5"
            title="Close camera tracker"
          >
            <CameraOff size={13} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 space-y-2.5">
          {/* Video Feed & Landmark Overlay */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/90 border border-white/10">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/80 font-mono text-xs text-cyan-300">
                <Sparkles size={18} className="animate-spin text-cyan-400" />
                <span>Calibrating Neural Vision...</span>
              </div>
            )}

            {errorMsg && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-black/90 font-mono text-[11px] text-amber-300 leading-relaxed">
                <span>{errorMsg}</span>
                <span className="text-[10px] text-stone-400 mt-2">
                  (Tip: Pinch and drag with mouse/touch to glide the sphere in 3D!)
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              className="w-full h-full object-cover -scale-x-100 opacity-70 filter contrast-125"
              autoPlay
              playsInline
              muted
            />

            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10"
            />

            {/* Pinch indicator badge */}
            <div className="absolute top-2 left-2 z-20 pointer-events-none">
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider backdrop-blur-md transition-all ${
                  isPinching
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : handDetected
                    ? 'bg-stone-900/80 border-white/20 text-stone-300'
                    : 'bg-black/60 border-white/10 text-stone-500'
                }`}
              >
                {isPinching ? '⚡ PINCH LOCKED (GLIDING)' : handDetected ? 'Hand Tracked' : 'Awaiting Hand'}
              </span>
            </div>
          </div>

          {/* Metric telemetry */}
          <div className="bg-black/40 rounded-xl p-2 border border-white/5 space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between items-center text-stone-400">
              <span>Pinch Proximity</span>
              <span className={isPinching ? 'text-cyan-300 font-bold' : 'text-stone-300'}>
                {pinchDistanceVal < 1.0 ? pinchDistanceVal.toFixed(3) : '--'} / 0.080
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  isPinching ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-stone-600'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, (1.0 - pinchDistanceVal / 0.25) * 100))}%`,
                }}
              />
            </div>

            <p className="text-[9px] text-stone-500 leading-tight">
              Bring thumb & index finger together (&lt;0.08) to pinch-grab the ferrofluid sphere and glide it freely in 3D void.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
