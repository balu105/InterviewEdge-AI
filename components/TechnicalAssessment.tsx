import React, { useState, useEffect } from 'react';
import { generateCodingRound, evaluateCodeSubmission } from '../services/geminiService';
import { CodingChallenge } from '../types';
import './TechnicalAssessment.css';

interface TechnicalAssessmentProps {
  targetRole: string;
  onComplete: (score: number, cheated: boolean, challenges: CodingChallenge[], submissions: Record<string, string>) => void;
}

export const TechnicalAssessment: React.FC<TechnicalAssessmentProps> = ({ targetRole, onComplete }) => {
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { isCorrect: boolean; feedback: string } | null>>({});
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [consoleLog, setConsoleLog] = useState<string>("> Innovation Forge v4.0 Active...");

  useEffect(() => {
    const init = async () => {
      try {
        const data = await generateCodingRound(targetRole);
        const finalChallenges = data.slice(0, 3);
        setChallenges(finalChallenges);
        
        const initialSubmissions: Record<string, string> = {};
        finalChallenges.forEach(c => {
          initialSubmissions[c.id] = c.boilerplate || "";
        });
        setSubmissions(initialSubmissions);
      } catch (err) {
        setConsoleLog("> Error: Failed to connect to Neural Registry.");
      } finally {
        setLoading(false);
      }
    };
    init();
    
    const handleVisibility = () => {
      if (document.hidden) setTabSwitches(prev => prev + 1);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [targetRole]);

  const handleCodeChange = (val: string) => {
    if (isSubmitting) return;
    setSubmissions(prev => ({ ...prev, [challenges[currentIdx].id]: val }));
  };

  const runCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setConsoleLog(`> Testing module logic: ${challenges[currentIdx].title}...`);
    try {
      const evaluation = await evaluateCodeSubmission(challenges[currentIdx], submissions[challenges[currentIdx].id]);
      setConsoleLog(`> Result: ${evaluation.isCorrect ? 'SUCCESS' : 'FAILED'}\n> Analysis: ${evaluation.feedback}`);
    } catch (err) {
      setConsoleLog("> Runtime Interrupted.");
    } finally { setIsRunning(false); }
  };

  const submitChallenge = async () => {
    if (isSubmitting || isRunning) return;
    setIsSubmitting(true);
    setConsoleLog(`> Committing module 0${currentIdx + 1}...`);
    try {
      const evaluation = await evaluateCodeSubmission(challenges[currentIdx], submissions[challenges[currentIdx].id]);
      const newResults = { ...results, [challenges[currentIdx].id]: evaluation };
      setResults(newResults);
      if (currentIdx < challenges.length - 1) {
        setTimeout(() => { setCurrentIdx(prev => prev + 1); setIsSubmitting(false); }, 800);
      } else {
        const correctCount = Object.values(newResults).filter((r: any) => r?.isCorrect).length;
        onComplete(Math.round((correctCount / challenges.length) * 100), tabSwitches > 0, challenges, submissions);
      }
    } catch (err) { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className="forge-light-theme fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="w-12 h-12 border-4 border-[#0EA5A4]/20 border-t-[#0EA5A4] rounded-full animate-spin"></div>
      <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initializing Innovation Forge</p>
    </div>
  );

  const cur = challenges[currentIdx];
  const isCheating = tabSwitches > 0;

  return (
    <div className="forge-light-theme min-h-screen">
      <div className="max-w-[1500px] mx-auto px-8 pt-4 pb-20 flex flex-col gap-6 animate-fadeIn">
        
        {/* Sub-Header Module Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between forge-glass-card p-6 rounded-[2.5rem] border border-white">
          <div className="flex items-center gap-8">
            <div className="flex gap-3">
              {challenges.map((c, i) => (
                <button 
                  key={c.id} 
                  onClick={() => setCurrentIdx(i)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all border ${
                    currentIdx === i 
                      ? 'bg-[#0EA5A4] border-[#0EA5A4] text-white shadow-[0_4px_12px_rgba(14,165,164,0.3)]' 
                      : results[c.id]?.isCorrect 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  0{i + 1}
                </button>
              ))}
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight">{cur.title}</h1>
              <p className="text-[9px] font-black text-[#0EA5A4] uppercase tracking-widest">{cur.topic}</p>
            </div>
          </div>
          <div className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${isCheating ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            <i className={`fas ${isCheating ? 'fa-triangle-exclamation' : 'fa-shield-halved'}`}></i>
            {isCheating ? 'Integrity Breach' : 'Performance Secure'}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 h-[720px]">
          {/* Left Sidebar: Problem Constraints */}
          <div className="lg:w-[32%] space-y-6 flex flex-col">
            <div className="flex-1 forge-glass-card p-10 rounded-[3rem] border border-white overflow-y-auto custom-scrollbar-light">
              <div className="space-y-10">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-[#0EA5A4] uppercase tracking-widest">Logic Constraint</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-semibold opacity-90">{cur.problemStatement}</p>
                </section>
                
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vector Samples</h3>
                  <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Input</p>
                      <code className="text-[13px] text-[#0EA5A4] font-mono font-bold">{cur.exampleInput}</code>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Output</p>
                      <code className="text-[13px] text-emerald-600 font-mono font-bold">{cur.exampleOutput}</code>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Main Content: Editor & Console */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Code Editor Panel */}
            <div className="flex-1 forge-glass-card rounded-[3rem] border border-white overflow-hidden flex flex-col shadow-xl shadow-slate-200/50">
              <div className="bg-white/60 px-10 py-5 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-[#0EA5A4] uppercase tracking-[0.2em] italic">neural_forge.py</span>
                <div className="flex gap-4">
                  <button 
                    onClick={runCode} 
                    disabled={isRunning} 
                    className="px-8 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#0EA5A4] hover:text-[#0EA5A4] transition-all"
                  >
                    Test Run
                  </button>
                  <button 
                    onClick={submitChallenge} 
                    disabled={isSubmitting} 
                    className="px-10 py-2.5 bg-[#0EA5A4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0EA5A4]/20 hover:scale-[1.02] transition-transform"
                  >
                    Commit
                  </button>
                </div>
              </div>
              <textarea
                className="flex-1 w-full p-12 outline-none text-slate-700 font-mono text-sm leading-[1.8] resize-none bg-white/40 forge-editor-light"
                spellCheck={false}
                value={submissions[cur.id] || ""}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="// Initialize neural logic..."
              />
            </div>
            
            {/* Terminal Panel */}
            <div className="h-48 forge-glass-card p-8 rounded-[2.5rem] border border-white overflow-y-auto custom-scrollbar-light bg-white/40">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-500 font-bold opacity-80">{consoleLog}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};