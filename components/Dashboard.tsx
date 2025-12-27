
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ReadinessScore, ResumeAnalysisResult } from '../types';

interface DashboardProps {
  score: ReadinessScore;
  resumeData: ResumeAnalysisResult;
  onRestart: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ score, resumeData, onRestart }) => {
  const radarData = [
    { subject: 'Resume IQ', A: score.resume, fullMark: 100 },
    { subject: 'Technical', A: score.technical, fullMark: 100 },
    { subject: 'Communication', A: score.communication, fullMark: 100 },
    { subject: 'Logic', A: 85, fullMark: 100 }, 
    { subject: 'Industrial Fit', A: score.overall > 80 ? 90 : 70, fullMark: 100 },
  ];

  const isEligible = score.isEligible;

  return (
    <div className="max-w-[1400px] mx-auto py-24 px-6 space-y-8 stagger-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Readiness KPI */}
        <div className="lg:col-span-1 glass-panel p-12 rounded-[48px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full"></div>
          
          <h3 className="text-slate-500 font-black uppercase tracking-[0.3em] text-[9px] mb-12">Deployment Status</h3>
          
          <div className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center mb-8 ${isEligible ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
             <i className={`fas ${isEligible ? 'fa-check-circle text-emerald-500' : 'fa-times-circle text-rose-500'} text-5xl mb-3`}></i>
             <span className={`text-[10px] font-black uppercase tracking-widest ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
               {isEligible ? 'Qualified' : 'Ineligible'}
             </span>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="128" cy="128" r="115" stroke="rgba(255,255,255,0.03)" strokeWidth="18" fill="transparent" />
               <circle cx="128" cy="128" r="115" stroke="currentColor" strokeWidth="18" fill="transparent" 
                       strokeDasharray={722} 
                       strokeDashoffset={722 - (722 * score.overall) / 100}
                       className={`${isEligible ? 'text-indigo-500' : 'text-rose-500'} transition-all duration-1000 ease-out glow-indigo`} 
                       strokeLinecap="round"
               />
             </svg>
             <div className="absolute flex flex-col items-center">
               <span className="text-7xl font-black text-white glow-text">{score.overall}</span>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Coefficient</span>
             </div>
          </div>
          
          <div className={`mt-12 font-black text-2xl tracking-tighter ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isEligible ? 'OPTIMIZED FOR HIRE' : 'CALIBRATION REJECTED'}
          </div>
          {!isEligible && (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 max-w-[200px]">
              {score.technical < 60 ? 'Insufficient technical score (min 2/3).' : 'Integrity breach detected during forge.'}
            </p>
          )}
        </div>

        {/* Vector Performance Matrix */}
        <div className="lg:col-span-2 glass-panel p-12 rounded-[48px] flex flex-col">
           <div className="flex justify-between items-center mb-10">
             <h3 className="text-white font-black text-xl tracking-tight flex items-center gap-3">
               <i className="fas fa-microchip text-indigo-400"></i>
               Vector Performance Matrix
             </h3>
           </div>
           
           <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '800', letterSpacing: '0.1em' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Candidate" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
           </div>

           <div className="mt-8 p-6 bg-black/40 rounded-[2rem] border border-white/5 font-mono-tech">
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Computational Methodology</div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">{score.methodologyNote}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-2">
        <div className="glass-panel p-10 rounded-[40px] flex flex-col h-[500px]">
          <h3 className="text-white font-black text-lg mb-8 flex items-center gap-3">
            <i className="fas fa-terminal text-indigo-400"></i>
            Neural Analysis Log
          </h3>
          <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
            {score.feedback.split('\n').filter(l => l.trim()).map((line, i) => (
              <div key={i} className="flex gap-5 p-5 bg-white/2 rounded-2xl border border-white/5 group hover:bg-white/5 transition-colors">
                <div className="w-1.5 h-auto bg-indigo-500/20 rounded-full group-hover:bg-indigo-500/60 transition-colors"></div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-10 rounded-[40px] h-[500px] flex flex-col">
          <h3 className="text-white font-black text-lg mb-8 flex items-center gap-3">
            <i className="fas fa-list-check text-emerald-400"></i>
            Strategic Recommendations
          </h3>
          <div className="space-y-6">
            <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex gap-6">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                <i className="fas fa-pen-nib"></i>
              </div>
              <div>
                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Critical Insight</div>
                <div className="text-sm text-slate-400 font-medium leading-relaxed">
                   {isEligible 
                     ? "Candidate demonstrates high technical aptitude and ethical compliance. Suggest immediate transition to Phase 2 onboarding." 
                     : "Focus on Data Structures and ensure strict adherence to assessment protocols. Review String and Array fundamentals."}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10">
              <button 
                onClick={onRestart}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
              >
                Initiate New Calibration Cycle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
