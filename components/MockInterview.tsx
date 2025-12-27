
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { MockInterviewTurn } from '../types';

// Utility for Base64 encoding/decoding
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
  
  // Audio handling refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const liveSessionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'TEXT' && turns.length === 0) {
      startTextInterview();
    }
    return () => {
      cleanupLive();
    };
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
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
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
        contents: `You are an interviewer for a ${targetRole} position. Start by introducing yourself and asking the first question.`,
      });
      setTurns([{ role: 'interviewer', content: response.text || '' }]);
    } catch (err) {
      console.error("Initial prompt failed", err);
    } finally {
      setIsTyping(false);
    }
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
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
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
                  if (last && last.role === 'interviewer') {
                    return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                  } else {
                    return [...prev, { role: 'interviewer', content: text }];
                  }
                });
              }
            }

            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) {
                setTurns(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'student') {
                    return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                  } else {
                    return [...prev, { role: 'student', content: text }];
                  }
                });
              }
            }

            if (message.serverContent?.turnComplete) {
               setTurns(prev => {
                 if (prev.length >= 12 && !hasCompletedRef.current) {
                   handleStopInterview();
                 }
                 return prev;
               });
            }
          },
          onerror: (e) => console.error("Live Error:", e),
          onclose: () => console.log("Live Closed"),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are an elite AI interviewer for a ${targetRole} position. Give short, direct responses. When you think the interview has reached a natural conclusion after 5-6 questions, wrap up clearly.`,
        }
      });

      liveSessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to initialize voice mode:", err);
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
        contents: `Interview History:\n${history}\n\nContinue the interview for a ${targetRole} role. Be critical and professional.`,
      });
      
      const newTurns = [...turns, studentTurn, { role: 'interviewer', content: response.text || '' }] as MockInterviewTurn[];
      setTurns(newTurns);
      
      if (newTurns.length >= 12 && !hasCompletedRef.current) {
        handleStopInterview();
      }
    } catch (err) {
      console.error("Chat failure", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-stagger-1">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-black text-white glow-text uppercase tracking-tighter">Interview Arena</h2>
          <div className="flex items-center gap-3 mt-1">
             <div className="flex gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:200ms]"></div>
             </div>
             <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
               Session Protocol: {targetRole} • Syncing I/O
             </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={isLive}
            onClick={() => { setMode('TEXT'); }}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all border ${mode === 'TEXT' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/10 opacity-50'}`}
          >
            TERMINAL
          </button>
          <button 
            onClick={handleVoiceToggle}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all flex items-center gap-3 border ${mode === 'VOICE' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/10'}`}
          >
            <i className={`fas ${isLive ? 'fa-stop-circle animate-pulse' : 'fa-microphone'}`}></i>
            {isLive ? 'DISCONNECT' : 'LIVE LINK'}
          </button>
          <button 
            onClick={handleStopInterview}
            className="px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all bg-rose-600/10 border border-rose-500/30 text-rose-500 hover:bg-rose-600 hover:text-white flex items-center gap-2 shadow-lg shadow-rose-900/20"
          >
            <i className="fas fa-power-off"></i>
            STOP
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-[3rem] h-[640px] flex flex-col overflow-hidden relative border border-white/5 shadow-inner">
        {mode === 'VOICE' ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-12 pointer-events-none">
                <div className="relative">
                  <div className="w-56 h-56 bg-indigo-500/5 rounded-full border border-indigo-500/10 flex items-center justify-center">
                    <div className="w-36 h-36 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center justify-center relative">
                       <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-40"></div>
                       <div className="absolute inset-4 bg-indigo-500/30 rounded-full animate-pulse"></div>
                       <i className="fas fa-headset text-4xl text-indigo-400 z-10"></i>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Neural Bridge Active</h3>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">Capturing voice to session memory</p>
                </div>
                <div className="flex gap-3 h-16 items-end">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="w-2 bg-indigo-500/40 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 150}ms` }}></div>
                  ))}
                </div>
             </div>
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar z-10 bg-black/40">
                <div className="sticky top-0 pb-4 mb-4 border-b border-white/5 text-center">
                   <span className="px-4 py-1.5 bg-indigo-600/10 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest">Live Transcript Feed</span>
                </div>
                {turns.map((t, i) => (
                  <div key={i} className={`flex ${t.role === 'interviewer' ? 'justify-start' : 'justify-end'} animate-fadeInUp`}>
                    <div className={`max-w-[80%] p-6 rounded-[2.5rem] border ${t.role === 'interviewer' ? 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none' : 'bg-indigo-600/20 border-indigo-500/30 text-white rounded-tr-none shadow-xl'}`}>
                      <p className="text-sm leading-relaxed font-medium italic">"{t.content}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {turns.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'interviewer' ? 'justify-start' : 'justify-end'} animate-fadeInUp`}>
                  <div className={`max-w-[85%] p-7 rounded-[2.5rem] border ${t.role === 'interviewer' ? 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none' : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none shadow-2xl shadow-indigo-600/10'}`}>
                    <p className="text-sm leading-relaxed font-medium">{t.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:200ms]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:400ms]"></span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4 backdrop-blur-xl">
              <input 
                type="text"
                className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium text-white transition-all placeholder:text-slate-700"
                placeholder="Synchronize technical response..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!userInput.trim() || isTyping} className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30">
                <i className="fas fa-paper-plane text-white text-lg"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
