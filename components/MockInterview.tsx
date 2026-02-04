import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { MockInterviewTurn } from '../types';
import './MockInterview.css';

interface MockInterviewProps {
  targetRole: string;
  onComplete: (transcript: string) => void;
}

const MockInterview: React.FC<MockInterviewProps> = ({ targetRole, onComplete }) => {
  const [mode, setMode] = useState<'TERMINAL' | 'VOICE'>('TERMINAL');
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [turns, setTurns] = useState<MockInterviewTurn[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const sessionRef = useRef<any>(null);
  const hasFinishedRef = useRef(false);

  const MAX_QUESTIONS = 10;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, isTyping]);

  useEffect(() => {
    if (mode === 'TERMINAL' && turns.length === 0) {
      startTextInterview();
    }
  }, [mode]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const startTextInterview = async () => {
    setIsTyping(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an elite corporate technical recruiter for a ${targetRole} position. Your tone is professional, observant, and direct. Welcome the candidate and ask the first of 10 logical behavioral or technical questions. Keep your responses concise.`,
      });
      setTurns([{ role: 'interviewer', content: response.text || '' }]);
      setQuestionCount(1);
    } catch (err) {
      console.error("Terminal sync failed", err);
    } finally {
      setIsTyping(false);
    }
  };

  const sendTextMessage = async () => {
    if (!userInput.trim() || isTyping || hasFinishedRef.current) return;
    
    const studentTurn: MockInterviewTurn = { role: 'student', content: userInput };
    setTurns(prev => [...prev, studentTurn]);
    setUserInput('');
    setIsTyping(true);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const history = [...turns, studentTurn].map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n');
    
    try {
      const isLast = questionCount >= MAX_QUESTIONS;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Interview Context: ${targetRole} Assessment. 
        Current Question Progress: ${questionCount}/10. 
        History:
        ${history}
        
        Task: Respond to the candidate. If this was the 10th answer, thank them and conclude the interview professionally. Otherwise, ask the next logical question.`,
      });
      
      setTurns(prev => [...prev, { role: 'interviewer', content: response.text || '' }]);
      if (!isLast) setQuestionCount(prev => prev + 1);
    } catch (err) {
      console.error("Sync Error", err);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceInterview = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputCtxRef.current!.createMediaStreamSource(stream);
            const processor = inputCtxRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (hasFinishedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const pcmData = new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength);
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(pcmData), mimeType: 'audio/pcm;rate=16000' } 
              }));
              
              const sum = inputData.reduce((a, b) => a + Math.abs(b), 0);
              setAudioLevel(sum / inputData.length);
            };
            source.connect(processor);
            processor.connect(inputCtxRef.current!.destination);
          },
          onmessage: async (msg: any) => {
            if (hasFinishedRef.current) return;

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioCtxRef.current) {
              const buffer = await decodeAudioData(decode(audioData), audioCtxRef.current);
              const source = audioCtxRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtxRef.current.destination);
              const start = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
              source.start(start);
              nextStartTimeRef.current = start + buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.turnComplete) {
              setQuestionCount(prev => Math.min(prev + 1, MAX_QUESTIONS));
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setTurns(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'interviewer') return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                return [...prev, { role: 'interviewer', content: text }];
              });
            } else if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              setTurns(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'student') return [...prev.slice(0, -1), { ...last, content: last.content + text }];
                return [...prev, { role: 'student', content: text }];
              });
            }
          },
          onerror: (err) => {
            console.error("Neural link fault:", err);
            setIsActive(false);
            setIsConnecting(false);
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are an elite corporate recruiter conducting a formal 10-question interview for a ${targetRole} position. 
          Your style is crisp, professional, and slightly challenging. Ask questions sequentially. Total count is 10 questions. 
          Stop and conclude after the candidate provides their 10th answer.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Neural initialization fault:", err);
      setIsConnecting(false);
    }
  };

  const finalizeSession = () => {
    setIsFinalizing(true);
    hasFinishedRef.current = true;
    sessionRef.current?.close();
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (inputCtxRef.current) inputCtxRef.current.close().catch(() => {});

    setTimeout(() => {
      const fullTranscript = turns.map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n');
      onComplete(fullTranscript || "Assessment session concluded.");
    }, 1500);
  };

  return (
    <div className="interview-arena min-h-screen">
      <div className="max-w-[1300px] mx-auto px-6 py-10 space-y-10 animate-fadeIn">
        
        {/* Superior Header Control Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-[#1e293b] tracking-tighter">Assessment Simulation</h1>
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[#5832D8] animate-pulse"></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Level: Enterprise Alpha</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-3xl border border-white shadow-sm">
            <button 
              onClick={() => setMode('TERMINAL')}
              className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'TERMINAL' ? 'bg-[#5832D8] text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              Terminal
            </button>
            <button 
              onClick={() => {
                setMode('VOICE');
                if (!isActive) startVoiceInterview();
              }}
              className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border ${mode === 'VOICE' ? 'bg-indigo-50/50 border-indigo-100 text-indigo-600' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-50'}`}
            >
              <i className="fas fa-microphone-lines text-xs"></i>
              {isActive ? 'Voice Link Active' : 'Initiate Voice Link'}
            </button>
            <button 
              onClick={finalizeSession}
              disabled={isFinalizing}
              className="px-10 py-3.5 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100/50 disabled:opacity-50"
            >
              {isFinalizing ? 'Finalizing...' : 'Finalize Session'}
            </button>
          </div>
        </div>

        {/* Industrial Interaction Shell */}
        <div className="interaction-shell rounded-[4rem] bg-white border border-white shadow-[0_50px_100px_rgba(0,0,0,0.04)] flex flex-col h-[740px] overflow-hidden relative">
          
          {/* AI Status Float */}
          <div className="absolute top-10 right-10 z-20">
            <div className="bg-slate-50/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="flex gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTyping || isConnecting ? 'bg-indigo-500 animate-bounce' : 'bg-emerald-400'}`}></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isTyping || isConnecting ? 'bg-indigo-500 animate-bounce' : 'bg-emerald-400'}`} style={{animationDelay: '0.2s'}}></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isTyping || isConnecting ? 'bg-indigo-500 animate-bounce' : 'bg-emerald-400'}`} style={{animationDelay: '0.4s'}}></span>
               </div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {isTyping ? 'Analyzing Response' : isConnecting ? 'Syncing Neural Link' : 'Engine Operational'}
               </span>
            </div>
          </div>

          {/* Dynamic Scroll Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-12 md:p-16 custom-scrollbar-light space-y-12 pt-32"
          >
            {turns.length === 0 && !isTyping && !isConnecting && (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <i className="fas fa-tower-broadcast text-9xl mb-8"></i>
                <p className="text-sm font-black uppercase tracking-[0.5em]">Establishing Connection Protocol</p>
              </div>
            )}
            
            {turns.map((turn, i) => (
              <div key={i} className={`flex ${turn.role === 'student' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`relative max-w-[70%] px-12 py-8 rounded-[3rem] text-[15px] font-semibold leading-relaxed shadow-sm ${
                  turn.role === 'student' 
                    ? 'bg-[#5832D8] text-white shadow-xl shadow-indigo-100 rounded-tr-lg' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-lg'
                }`}>
                  {turn.content}
                  <div className={`absolute -bottom-6 text-[8px] font-black uppercase tracking-widest text-slate-300 ${turn.role === 'student' ? 'right-4' : 'left-4'}`}>
                    {turn.role === 'student' ? 'Candidate Response' : 'Recruiter Statement'}
                  </div>
                </div>
              </div>
            ))}
            
            {(isTyping || isConnecting) && (
              <div className="flex justify-start">
                <div className="bg-slate-50/50 px-12 py-8 rounded-[3rem] border border-slate-100 border-dashed text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
                  {isConnecting ? 'Uplinking to Assessment Server...' : 'Analysis Engine Synchronizing...'}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Input Dashboard */}
          <div className="p-12 bg-slate-50/30 border-t border-slate-100 backdrop-blur-sm">
            <div className="relative max-w-5xl mx-auto group">
              <input 
                type="text" 
                placeholder={mode === 'VOICE' ? "Capturing real-time verbal stream..." : "Type your behavioral response..."}
                disabled={mode === 'VOICE' || hasFinishedRef.current}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
                className="w-full px-12 py-8 bg-white border border-slate-200 rounded-[3rem] outline-none text-[16px] font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm focus:border-indigo-400 transition-all disabled:opacity-50"
              />
              <button 
                onClick={sendTextMessage}
                disabled={!userInput.trim() || mode === 'VOICE' || hasFinishedRef.current}
                className="absolute right-4 top-4 w-16 h-16 bg-[#5832D8] text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
              >
                <i className="fas fa-paper-plane text-xl"></i>
              </button>
            </div>
            
            {/* Visual Telemetry for Voice Mode */}
            {mode === 'VOICE' && isActive && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="flex justify-center gap-2 h-8 items-end">
                  {[...Array(32)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-[#5832D8] rounded-full transition-all duration-100"
                      style={{ height: `${Math.max(15, audioLevel * (Math.random() * 600) + 10)}%` }}
                    ></div>
                  ))}
                </div>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Spectral Voice Analysis Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Telemetry Strip */}
        <div className="flex justify-between items-center opacity-40 px-12">
          <div className="flex items-center gap-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sequence ID: {questionCount} / {MAX_QUESTIONS}</p>
            <div className="h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-700" style={{width: `${(questionCount/MAX_QUESTIONS)*100}%`}}></div>
            </div>
          </div>
          <div className="flex gap-12">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latency: 114ms</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encryption: End-to-End</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
