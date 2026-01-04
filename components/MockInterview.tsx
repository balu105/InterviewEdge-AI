
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { MockInterviewTurn } from '../types';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface MockInterviewProps {
  targetRole: string;
  onComplete: (transcript: string) => void;
}

export const MockInterview: React.FC<MockInterviewProps> = ({ targetRole, onComplete }) => {
  const [mode, setMode] = useState<'TEXT' | 'VOICE'>('TEXT');
  const [turns, setTurns] = useState<MockInterviewTurn[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasCompletedRef = useRef(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'TEXT' && turns.length === 0) {
      startTextInterview();
    }
    return () => cleanupLive();
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, isTyping]);

  const cleanupLive = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsLive(false);
  };

  const startTextInterview = async () => {
    setIsTyping(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an elite corporate interviewer for a ${targetRole} position. Professional, focused. Start by introducing yourself and asking the first question.`,
      });
      setTurns([{ role: 'interviewer', content: response.text || '' }]);
    } catch (err) {
      console.error("Session failed", err);
    } finally { setIsTyping(false); }
  };

  const handleStopInterview = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    cleanupLive();
    const history = turns.map(t => `${t.role}: ${t.content}`).join('\n');
    onComplete(history);
  };

  const handleVoiceToggle = async () => {
    if (isLive) {
      cleanupLive();
      setMode('TEXT');
      return;
    }

    try {
      setMode('VOICE');
      setIsLive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = inputAudioContext;
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (hasCompletedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (hasCompletedRef.current) return;
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              if (text) {
                setTurns(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'interviewer') return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                  else return [...prev, { role: 'interviewer', content: text }];
                });
              }
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) {
                setTurns(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'student') return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                  else return [...prev, { role: 'student', content: text }];
                });
              }
            }
            if (message.serverContent?.turnComplete) {
               if (turns.length >= 10 && !hasCompletedRef.current) handleStopInterview();
            }
          },
          onerror: (e) => console.error("Live Error:", e),
          onclose: () => setIsLive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are an elite corporate interviewer for a ${targetRole} position. Professional, high standards. Ask 5-6 deep questions.`,
        }
      });
    } catch (err) {
      console.error("Voice mode failed", err);
      setIsLive(false);
      setMode('TEXT');
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || hasCompletedRef.current) return;
    const studentTurn: MockInterviewTurn = { role: 'student', content: userInput };
    setTurns(prev => [...prev, studentTurn]);
    const currentInput = userInput;
    setUserInput('');
    setIsTyping(true);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const history = [...turns, studentTurn].map(t => `${t.role}: ${t.content}`).join('\n');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Interview Context: ${targetRole}\n\nHistory:\n${history}\n\nRespond as the interviewer. Be critical, professional, and seek specific evidence of skills.`,
      });
      const newTurns = [...turns, studentTurn, { role: 'interviewer', content: response.text || '' }] as MockInterviewTurn[];
      setTurns(newTurns);
      if (newTurns.length >= 10 && !hasCompletedRef.current) handleStopInterview();
    } catch (err) {
      console.error("Chat Error", err);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/40 p-8 rounded-[3rem] border border-white shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Interview Session</h2>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: {targetRole} • Analysis Engine Active</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setMode('TEXT')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${mode === 'TEXT' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/80 text-slate-400 border border-slate-100 hover:bg-white'}`}
          >
            TERMINAL
          </button>
          <button 
            onClick={handleVoiceToggle}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center gap-3 ${mode === 'VOICE' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/80 text-slate-400 border border-slate-100 hover:bg-white'}`}
          >
            <i className={`fas ${isLive ? 'fa-square animate-pulse' : 'fa-microphone'}`}></i>
            {isLive ? 'TERMINATE VOICE' : 'INITIATE VOICE LINK'}
          </button>
          <button 
            onClick={handleStopInterview}
            className="px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all"
          >
            FINALIZE
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[4rem] h-[700px] flex flex-col overflow-hidden relative border border-white shadow-2xl">
        {mode === 'VOICE' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-12 bg-indigo-50/20">
             <div className="relative">
                <div className="w-48 h-48 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
                   <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 relative z-10">
                      <i className="fas fa-headset text-4xl text-indigo-600"></i>
                   </div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                  LIVE NEURAL LINK
                </div>
             </div>
             
             <div className="text-center space-y-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Capturing Voice Metadata</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Speak naturally to provide behavioral responses</p>
             </div>

             <div className="flex gap-3 h-16 items-end">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-indigo-200 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 100}ms` }}></div>
                ))}
             </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar bg-slate-50/20">
              {turns.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'interviewer' ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
                  <div className={`max-w-[80%] p-8 rounded-[3rem] border ${t.role === 'interviewer' ? 'bg-white border-slate-100 text-slate-700 rounded-tl-none shadow-sm' : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none shadow-lg'}`}>
                    <p className="text-sm leading-relaxed font-medium italic">"{t.content}"</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-5 rounded-3xl flex gap-2 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:200ms]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:400ms]"></span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-10 bg-white/60 border-t border-white flex gap-4 backdrop-blur-md">
              <input 
                type="text"
                className="flex-1 bg-white border border-slate-100 rounded-2xl px-8 py-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 text-sm font-medium text-slate-900 placeholder:text-slate-300 transition-all"
                placeholder="Compose behavioral response..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!userInput.trim() || isTyping} className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl group">
                <i className="fas fa-paper-plane text-white text-xl group-hover:scale-110 transition-transform"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
