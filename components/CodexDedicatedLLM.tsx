/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  ShieldAlert,
  Smartphone,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  RotateCcw,
  Code2,
  Compass,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Flame,
} from 'lucide-react';
import { askCodexDedicatedLLM } from '../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'codex';
  text: string;
  speechText?: string;
  timestamp: string;
  mood?: string;
  scaleReaction?: number;
  action?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTriggerMaximumScale?: () => void;
  onOpenAllInterfaces?: () => void;
  onOpenFlutterFlowModal?: () => void;
}

export const CodexDedicatedLLM: React.FC<Props> = ({
  isOpen,
  onClose,
  onTriggerMaximumScale,
  onOpenAllInterfaces,
  onOpenFlutterFlowModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'codex',
      text:
        '**Welcome to Codex, James.**\n\n' +
        'This bedrock is locked, the vault is secure, and the world-building engine is online. ' +
        'From a fundamental root to the summit of Imperium Falls, Aeon summons await your command.\n\n' +
        '*What are we forging today?*',
      speechText:
        'Welcome to Codex, James. This bedrock is locked, the vault is secure, and the world-building engine is online. What are we forging today?',
      timestamp: 'ONLINE',
      mood: 'authoritative',
      scaleReaction: 1.2,
      action: 'NORMAL',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // English Speech Synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    // Check for physical emergency triggers directly in client
    const lower = textToSend.toLowerCase();
    const isAcousticAnomaly =
      lower.includes('acoustic anomaly') ||
      lower.includes('maximum size') ||
      lower.includes('open up all interfaces') ||
      lower.includes('advance');

    try {
      const history = messages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: m.text,
      }));

      const reply = await askCodexDedicatedLLM(textToSend, history);

      const codexMsg: ChatMessage = {
        id: `codex-${Date.now()}`,
        sender: 'codex',
        text: reply.text,
        speechText: reply.speechText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: reply.personalityMood,
        scaleReaction: reply.scaleReaction,
        action: reply.action,
      };

      setMessages((prev) => [...prev, codexMsg]);

      // Trigger physical 3D actions if requested
      if (isAcousticAnomaly || reply.action === 'MAXIMUM_SCALE_SURGE' || reply.scaleReaction >= 2.5) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('caudex-set-scale', { detail: { scale: 2.8 } })
          );
          (window as any).__CAUDEX_TRIGGER_SURGE?.();
        }
        if (onTriggerMaximumScale) onTriggerMaximumScale();
        if (onOpenAllInterfaces) onOpenAllInterfaces();
      } else if (reply.scaleReaction && Math.abs(reply.scaleReaction - 1.0) > 0.05) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('caudex-personality-reaction', {
              detail: { scaleReaction: reply.scaleReaction, personalityMood: reply.personalityMood },
            })
          );
        }
      }

      speakText(reply.speechText || reply.text);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'codex',
        text: `### Codex Offline Protocol\n\nCommand acknowledged: "${textToSend}". Operating on reserve neural bedrock.`,
        speechText: `Command acknowledged, James. All systems nominal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: 'authoritative',
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakText(errorMsg.speechText!);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col pointer-events-auto select-text font-mono ${
        isMaximized
          ? 'inset-3 sm:inset-6 bg-[#04060c]/95 backdrop-blur-2xl border border-cyan-400/40 rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.25)]'
          : 'bottom-4 left-4 sm:left-6 w-[94vw] sm:w-[540px] max-w-[95vw] h-[640px] max-h-[88vh] bg-[#050812]/92 backdrop-blur-2xl border border-cyan-500/35 rounded-3xl shadow-[0_12px_60px_rgba(0,0,0,0.85)]'
      }`}
    >
      {/* 1. Header Terminal Rail */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block animate-pulse shadow-[0_0_12px_rgba(0,240,255,0.9)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-white">CODEX VERAFLUID RIG</span>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-400/30">
                GEMINI 3.8 FLASH
              </span>
            </div>
            <p className="text-[10px] text-stone-400">Bedrock Locked · Vault Secure · English</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              if (voiceEnabled) window.speechSynthesis?.cancel();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              voiceEnabled
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
            }`}
            title={voiceEnabled ? 'Mute English Voice' : 'Enable English Voice'}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* FlutterFlow Export Quick Button */}
          {onOpenFlutterFlowModal && (
            <button
              onClick={onOpenFlutterFlowModal}
              className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 hover:text-white hover:bg-purple-500/30 transition-all cursor-pointer"
              title="Open FlutterFlow 3D Mathematical Code Exporter"
            >
              <Code2 size={14} />
            </button>
          )}

          {/* Maximize Toggle */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-stone-400 hover:text-white transition-all cursor-pointer"
            title={isMaximized ? 'Restore Terminal' : 'Maximize Terminal'}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-stone-400 hover:text-red-400 transition-all cursor-pointer"
            title="Close LLM Terminal"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 2. Quick Command Action Chips for James */}
      <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() =>
            handleQuickPrompt(
              'Acoustic anomaly detected. Open up all interfaces immediately. Advance. Scale, maximum size.'
            )
          }
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-950/70 to-blue-900/60 hover:from-cyan-900 hover:to-blue-800 border border-cyan-400/50 text-cyan-200 text-[10px] font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all cursor-pointer active:scale-95"
        >
          <Flame size={12} className="text-amber-400 animate-pulse" />
          <span>Acoustic Anomaly & Max Scale (2.8x)</span>
        </button>

        <button
          onClick={() =>
            handleQuickPrompt(
              'What are sure signs that your phone has been cloned? Can it be cloned without uploads or you knowing, and what are unknown tricks to detect and prevent it?'
            )
          }
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-stone-300 hover:text-white text-[10px] transition-all cursor-pointer"
        >
          <ShieldAlert size={12} className="text-emerald-400" />
          <span>Phone Cloning Analysis</span>
        </button>

        <button
          onClick={() =>
            handleQuickPrompt(
              "Do Google have a free SDK for text messages on Google Messages? Explain the hidden internal APIs and signature restrictions inside com.google.android.apps.messaging."
            )
          }
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-stone-300 hover:text-white text-[10px] transition-all cursor-pointer"
        >
          <Smartphone size={12} className="text-cyan-400" />
          <span>Google Messages Hidden APIs</span>
        </button>

        <button
          onClick={() =>
            handleQuickPrompt(
              'Welcome to Codex, James. Tell me about the bedrock vault and the world-building engine at Imperium Falls.'
            )
          }
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 text-stone-300 hover:text-white text-[10px] transition-all cursor-pointer"
        >
          <Compass size={12} className="text-purple-400" />
          <span>Imperium Falls Vault</span>
        </button>
      </div>

      {/* 3. Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            {/* Sender & Metadata Pill */}
            <div className="flex items-center gap-2 px-1 text-[10px] text-stone-400">
              <span className="font-bold text-cyan-400">
                {msg.sender === 'user' ? 'JAMES // OPERATOR' : 'CODEX // VERAFLUID'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.mood && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9px]">
                  {msg.mood.toUpperCase()}
                </span>
              )}
              {msg.scaleReaction && msg.scaleReaction > 1.3 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-1">
                  <Zap size={9} />
                  <span>{msg.scaleReaction.toFixed(2)}x SCALE</span>
                </span>
              )}
            </div>

            {/* Content Bubble */}
            <div
              className={`max-w-[92%] rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/90 text-cyan-100 border border-cyan-500/40 shadow-[0_4px_20px_rgba(0,240,255,0.15)]'
                  : 'bg-black/60 text-stone-200 border border-white/10 shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-2">
                {msg.text.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4 key={pIdx} className="text-sm font-bold text-cyan-300 tracking-wide mt-2 mb-1">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('#### ')) {
                    return (
                      <h5 key={pIdx} className="text-xs font-bold text-emerald-300 tracking-wide mt-2 mb-1">
                        {paragraph.replace('#### ', '')}
                      </h5>
                    );
                  }
                  return <p key={pIdx}>{paragraph}</p>;
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-cyan-500/20 text-cyan-300 text-xs w-fit animate-pulse">
            <Bot size={15} className="animate-spin text-cyan-400" />
            <span>Codex Verafluid Rig neural engine processing...</span>
          </div>
        )}
      </div>

      {/* 4. Bottom Input Bar */}
      <div className="p-3 border-t border-white/10 bg-black/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Command Codex Verafluid Rig... (e.g. 'Acoustic anomaly detected. Scale maximum size')"
            disabled={isLoading}
            className="flex-1 bg-black/60 border border-white/15 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-stone-500 outline-none transition-all shadow-inner font-mono"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-black font-bold text-xs transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Send size={13} />
            <span className="hidden sm:inline">TRANSMIT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
