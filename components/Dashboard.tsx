
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
    { subject: 'Comm.', A: score.communication, fullMark: 100 },
    { subject: 'Logic', A: 85, fullMark: 100 }, 
    { subject: 'Fit', A: score.overall > 80 ? 90 : 70, fullMark: 100 },
  ];

  const isEligible = score.isEligible;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-10 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Core Readiness KPI */}
        <div className="lg:col-span-1 glass-card p-12 rounded-[4rem] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full"></div>
          
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">Deployment Verdict</h3>
          
          <div className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center mb-10 transition-all ${isEligible ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'}`}>
             <i className={`fas ${isEligible ? 'fa-check-circle text-emerald-500' : 'fa-times-circle text-rose-500'} text-5xl mb-3`}></i>
             <span className={`text-[10px] font-black uppercase tracking-widest ${isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
               {isEligible ? 'Qualified' : 'Rejected'}
             </span>
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="144" cy="144" r="130" stroke="rgba(0,0,0,0.03)" strokeWidth="16" fill="transparent" />
               <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="16" fill="transparent" 
                       strokeDasharray={816} 
                       strokeDashoffset={816 - (816 * score.overall) / 100}
                       className={`${isEligible ? 'text-indigo-600' : 'text-rose-500'} transition-all duration-1000 ease-out`} 
                       strokeLinecap="round"
               />
             </svg>
             <div className="absolute flex flex-col items-center">
               <span className="text-8xl font-black text-slate-900 tracking-tighter">{score.overall}</span>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Ready Core</span>
             </div>
          </div>
          
          <div className={`mt-12 text-3xl font-black tracking-tighter ${isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isEligible ? 'OPTIMIZED' : 'CALIBRATION ERROR'}
          </div>
        </div>

        {/* Performance Matrix */}
        <div className="lg:col-span-2 glass-card p-12 md:p-16 rounded-[4rem] flex flex-col">
           <div className="flex justify-between items-center mb-12">
             <h3 className="text-slate-900 font-black text-2xl tracking-tight">Skill Vector Matrix</h3>
             <div className="px-4 py-2 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">
               Live Neural Mapping
             </div>
           </div>
           
           <div className="flex-1 min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(0,0,0,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: '800', letterSpacing: '0.1em' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Candidate" dataKey="A" stroke="#6366f1" strokeWidth={4} fill="#6366f1" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
           </div>

           <div className="mt-10 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center gap-6">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-indigo-600">
                <i className="fas fa-microchip"></i>
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Computational Methodology</div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">Integrated cross-modal weighted average (Resume: 30%, Tech: 40%, Comm: 30%).</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="glass-card p-12 rounded-[4rem] flex flex-col h-[550px]">
          <h3 className="text-slate-900 font-black text-2xl mb-10 tracking-tight">Neural Feedback Log</h3>
          <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
            {score.feedback.split('\n').filter(l => l.trim()).map((line, i) => (
              <div key={i} className="flex gap-6 p-6 bg-white/40 rounded-[2rem] border border-white hover:border-indigo-100 transition-all group">
                <div className="w-1 h-auto bg-indigo-100 rounded-full group-hover:bg-indigo-400 transition-colors"></div>
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-12 rounded-[4rem] h-[550px] flex flex-col justify-between">
          <div className="space-y-10">
            <h3 className="text-slate-900 font-black text-2xl tracking-tight">Strategic Protocol</h3>
            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[3rem] flex gap-8">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <i className="fas fa-lightbulb text-2xl"></i>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Growth Vector</div>
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                   {isEligible 
                     ? "High technical aptitude detected. Recommendation: Immediate transition to executive candidate pool." 
                     : "Focus on algorithmic optimization and clarify communication vectors. Minimum 20% growth required."}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={onRestart}
            className="btn-crystal w-full py-6 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl"
          >
            Initiate New Cycle
          </button>
        </div>
      </div>
    </div>
  );
};
