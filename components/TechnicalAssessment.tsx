
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
        console.error("Assessment Init Error:", err);
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
      <div className="flex flex-col items-center justify-center py-20 md:py-32">
        <div className="relative w-16 h-16 md:w-20 md:h-20 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest animate-pulse px-4 text-center">Constructing Challenges</h2>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-4 italic">Role: {targetRole}</p>
      </div>
    );
  }

  const currentQ = challenges[currentIdx];
  const isCheating = tabSwitches > 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 md:py-8 flex flex-col gap-6 md:gap-8 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Module {currentIdx + 1} / 3</span>
            <span className="hidden sm:block w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{currentQ.topic}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{currentQ.title}</h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl border transition-all flex items-center gap-3 flex-1 md:flex-none justify-center ${isCheating ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
            <div className={`w-2 h-2 rounded-full ${isCheating ? 'bg-rose-500 animate-ping' : 'bg-indigo-500'}`}></div>
            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isCheating ? 'text-rose-600' : 'text-indigo-600'}`}>
              {isCheating ? `INTEGRITY (${tabSwitches})` : 'SECURE'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 min-h-[400px] lg:h-[650px]">
        {/* Specification Panel */}
        <div className="lg:w-1/2 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col shadow-lg">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Specification Set</h3>
          <p className="text-slate-700 font-medium leading-relaxed mb-8 text-base md:text-lg">{currentQ.problemStatement}</p>
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Constraints</div>
              <ul className="space-y-2 text-sm text-slate-600 font-medium">
                {currentQ.constraints?.map((c, i) => <li key={i} className="flex gap-3"><span className="text-indigo-300 shrink-0">•</span> <span className="text-xs md:text-sm">{c}</span></li>)}
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
               <div className="p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Input</div>
                  <code className="text-[11px] md:text-xs text-indigo-600 font-mono-tech font-bold break-all">{currentQ.exampleInput}</code>
               </div>
               <div className="p-5 md:p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Output</div>
                  <code className="text-[11px] md:text-xs text-emerald-600 font-mono-tech font-bold break-all">{currentQ.exampleOutput}</code>
               </div>
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="lg:w-1/2 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 flex flex-col overflow-hidden relative shadow-xl min-h-[400px]">
           <textarea
             className="w-full flex-1 p-6 md:p-8 bg-slate-50 outline-none text-slate-800 font-mono-tech text-[12px] md:text-sm leading-relaxed resize-none shadow-inner"
             spellCheck={false}
             value={submissions[currentQ.id]}
             onChange={(e) => handleCodeChange(e.target.value)}
             placeholder="// Implement solution logic here..."
           />
           <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Sync Active</span>
             </div>
             <button 
               onClick={submitSolution} 
               disabled={evaluating} 
               className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-100"
             >
               {evaluating ? 'Evaluating...' : (currentIdx === 2 ? 'Finalize Forge' : 'Next Module')}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
