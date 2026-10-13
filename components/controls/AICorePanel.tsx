import React, { useState, useEffect, useRef } from 'react';
import { FerrofluidConfig } from '../../types';
import { Brain, Mic, MicOff, Power, Activity } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface Props {
  config: FerrofluidConfig;
  onChangeConfig: (updater: (prev: FerrofluidConfig) => FerrofluidConfig) => void;
}

export const AICorePanel: React.FC<Props> = ({ config, onChangeConfig }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const outputFilterRef = useRef<BiquadFilterNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper for audio encoding
  const pcmToBase64 = (buffer: Float32Array) => {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
    }
    const bytes = new Uint8Array(buf.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const safeCloseAudioContext = (ctx: AudioContext | null) => {
    if (!ctx) return;
    try {
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    } catch (_) {
      // AudioContext already closed or closing
    }
  };

  const playAudioChunk = (ctx: AudioContext, base64Audio: string) => {
    if (!ctx || ctx.state === 'closed') return;
    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const binary = window.atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const buffer = bytes.buffer;
      // The audio from the model is 16-bit PCM at 24kHz
      const view = new Int16Array(buffer);
      const float32Array = new Float32Array(view.length);
      for (let i = 0; i < view.length; i++) {
        float32Array[i] = view[i] / 0x8000;
      }
      
      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      // Feed audio samples into audioEngine so the 3D ferrofluid surface dynamically ripples when the AI speaks
      try {
        audioEngine.feedExternalAudioChunk(float32Array);
      } catch (_) {}
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (outputFilterRef.current) {
        source.connect(outputFilterRef.current);
      } else if (outputGainRef.current) {
        source.connect(outputGainRef.current);
      } else {
        source.connect(ctx.destination);
      }

      activeSourcesRef.current.add(source);

      // Sequential playback scheduling
      const now = ctx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0) {
          nextPlayTimeRef.current = 0;
        }
      };
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  const disconnectAI = () => {
    activeSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch (_) {}
    });
    activeSourcesRef.current.clear();
    nextPlayTimeRef.current = 0;

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      ws.onclose = null;
      ws.onerror = null;
      try {
        ws.close();
      } catch (_) {}
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (_) {}
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch (_) {}
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      const ctx = inputAudioCtxRef.current;
      inputAudioCtxRef.current = null;
      safeCloseAudioContext(ctx);
    }
    if (outputAudioCtxRef.current) {
      const ctx = outputAudioCtxRef.current;
      outputAudioCtxRef.current = null;
      safeCloseAudioContext(ctx);
    }
    outputFilterRef.current = null;
    outputGainRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    onChangeConfig((p) => ({ ...p, aiCoreEnabled: false }));
  };

  const connectAI = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputAudioCtx;

      // Low-pass filter to soften AI voice, reducing high-frequency harshness and unnatural artifacts
      const lowPassFilter = outputAudioCtx.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.setValueAtTime(5400, outputAudioCtx.currentTime);
      lowPassFilter.Q.setValueAtTime(0.707, outputAudioCtx.currentTime);
      outputFilterRef.current = lowPassFilter;

      // Gain node for smooth output headroom and preventing clipping
      const outputGain = outputAudioCtx.createGain();
      outputGain.gain.setValueAtTime(0.92, outputAudioCtx.currentTime);
      outputGainRef.current = outputGain;

      lowPassFilter.connect(outputGain);
      outputGain.connect(outputAudioCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        onChangeConfig((p) => ({ ...p, aiCoreEnabled: true }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.error) {
          setError(msg.error);
          disconnectAI();
        }
        if (msg.audio && outputAudioCtxRef.current) {
          playAudioChunk(outputAudioCtxRef.current, msg.audio);
        }
        if (msg.toolCall) {
          const { name, args } = msg.toolCall;
          if (name === 'changeFerrofluidConfig') {
            onChangeConfig((p) => {
              const next = { ...p };
              if (args.magneticStrength !== undefined) next.magneticStrength = args.magneticStrength;
              if (args.glowTheme !== undefined) next.glowTheme = args.glowTheme;
              if (args.morphIntensity !== undefined) next.morphIntensity = args.morphIntensity;
              return next;
            });
          } else if (name === 'adjustGimbalDynamics') {
            onChangeConfig((p) => {
              const next = { ...p };
              const target = (args.targetRing || 'all').toLowerCase();
              const mult = args.speedMultiplier !== undefined ? args.speedMultiplier : 1.0;
              const style = args.motionStyle;

              if (style) {
                next.gimbalMotionStyle = style;
              }

              if (target === 'all') {
                next.gimbalSpeed = mult;
                next.ring1Speed = mult;
                next.ring2Speed = mult;
                next.ring3Speed = mult;
                next.ring4Speed = mult;
              } else if (target === 'inner' || target === 'ring1') {
                next.ring1Speed = mult;
              } else if (target === 'ring2' || target === 'middle') {
                next.ring2Speed = mult;
              } else if (target === 'ring3' || target === 'outer') {
                next.ring3Speed = mult;
              } else if (target === 'halo' || target === 'ring4') {
                next.ring4Speed = mult;
              }
              return next;
            });
          }
        }
      };

      ws.onclose = () => {
        disconnectAI();
      };
      
      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        setError("WebSocket connection failed.");
        disconnectAI();
      };
      
    } catch (err: any) {
      setError(err.message || "Failed to initialize AI session.");
      disconnectAI();
    }
  };

  useEffect(() => {
    return () => disconnectAI();
  }, []);

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isConnected ? 'bg-indigo-500 text-white animate-pulse' : 'bg-stone-800 text-stone-400'}`}>
              <Brain size={14} />
            </div>
            <div>
              <div className="font-mono text-indigo-300 font-bold text-xs">Autonomous AI Core</div>
              <div className="text-[10px] text-stone-400">Gemini Live API Voice Interaction</div>
            </div>
          </div>
          
          <button
            onClick={isConnected ? disconnectAI : connectAI}
            disabled={isConnecting}
            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
              isConnected
                ? 'bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isConnecting ? 'CONNECTING...' : isConnected ? 'DISCONNECT' : 'INITIATE LINK'}
          </button>
        </div>
        
        {error && (
          <div className="text-red-400 text-[10px] font-mono mt-2 bg-red-950/30 p-2 rounded border border-red-900/50">
            {error}
          </div>
        )}

        {isConnected && (
          <div className="pt-2 flex items-center justify-center space-x-2 text-indigo-400">
            <Activity size={12} className="animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest">NEURAL LINK ESTABLISHED</span>
            <Activity size={12} className="animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
