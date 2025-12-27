
import React, { useState, useEffect } from 'react';
import { generateCodingRound, evaluateCodeSubmission } from '../services/geminiService';
import { CodingChallenge } from '../types';

interface TechnicalAssessmentProps {
  targetRole: string;
  onComplete: (score: number, cheated: boolean, challenges: CodingChallenge[], submissions: Record<string, string>) => void;
}

export const TechnicalAssessment: React.FC<TechnicalAssessmentProps> = ({ targetRole, onComplete }) => {
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await generateCodingRound(targetRole);
        setChallenges(data);
        const initialSubmissions: Record<string, string> = {};
        data.forEach(c => initialSubmissions[c.id] = c.boilerplate || "");
        setSubmissions(initialSubmissions);
      } catch (err) {
        console.error("Forge Init Error:", err);
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
    setSubmissions(prev => ({ ...prev, [challenges[currentIdx].id]: val }));
  };

  const submitSolution = async () => {
    setEvaluating(true);
    try {
      const challenge = challenges[currentIdx];
      const code = submissions[challenge.id];
      const evaluation = await evaluateCodeSubmission(challenge, code);
      
      const newResults = { ...results, [challenge.id]: evaluation.isCorrect };
      setResults(newResults);
      
      if (currentIdx < challenges.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        const correctCount = Object.values(newResults).filter(Boolean).length;
        const finalScore = Math.round((correctCount / challenges.length) * 100);
        onComplete(finalScore, tabSwitches > 0, challenges, submissions);
      }
    } catch (err) {
      alert("Submission channel interrupted. Retrying...");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Forging Coding Challenges</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-4 italic">Target: {targetRole}</p>
      </div>
    );
  }

  const currentQ = challenges[currentIdx];
  const isCheating = tabSwitches > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#141721] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Challenge {currentIdx + 1} of 3</span>
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{currentQ.topic}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{currentQ.title}</h1>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 ${isCheating ? 'bg-rose-950/20 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${isCheating ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 glow-indigo'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isCheating ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isCheating ? `INTEGRITY BREACH (${tabSwitches})` : 'SECURE SESSION'}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        <div className="bg-[#141721] rounded-[2.5rem] border border-white/5 p-10 overflow-y-auto custom-scrollbar flex flex-col">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] mb-6">Instruction Set</h3>
          <p className="text-slate-300 font-medium leading-relaxed mb-8">{currentQ.problemStatement}</p>
          <div className="space-y-6">
            <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Constraints</div>
              <ul className="space-y-2 text-xs text-slate-500">
                {currentQ.constraints?.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Example Input</div>
                  <code className="text-xs text-indigo-300 font-mono-tech">{currentQ.exampleInput}</code>
               </div>
               <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Example Output</div>
                  <code className="text-xs text-emerald-400 font-mono-tech">{currentQ.exampleOutput}</code>
               </div>
            </div>
          </div>
        </div>
        <div className="bg-[#141721] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden relative shadow-inner">
           <textarea
             className="w-full flex-1 p-8 bg-[#0c0e14] outline-none text-indigo-100 font-mono-tech text-sm leading-relaxed resize-none"
             spellCheck={false}
             value={submissions[currentQ.id]}
             onChange={(e) => handleCodeChange(e.target.value)}
           />
           <div className="p-8 bg-black/40 border-t border-white/5 flex justify-end">
             <button onClick={submitSolution} disabled={evaluating} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
               {currentIdx === 2 ? 'Finalize Forge' : 'Next Challenge'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
