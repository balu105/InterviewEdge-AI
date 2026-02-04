import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ReadinessScore, ResumeAnalysisResult } from '../types';
import './Dashboard.css';

interface DashboardProps {
  score: ReadinessScore;
  resumeData: ResumeAnalysisResult;
  onRestart: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ score, resumeData, onRestart }) => {
  const radarData = [
    { subject: 'Audit', A: score.resume, fullMark: 100 },
    { subject: 'Logic', A: score.technical, fullMark: 100 },
    { subject: 'Clarity', A: score.communication, fullMark: 100 },
    { subject: 'Precision', A: 85, fullMark: 100 }, 
    { subject: 'Yield', A: score.overall, fullMark: 100 },
  ];

  return (
    <div className="dashboard-theme-container min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fadeIn pb-32">
        
        {/* Header Branding */}
        <div className="text-center space-y-4 mb-8">
           <div className="inline-flex items-center px-6 py-2 bg-[#f0f9f9] rounded-full text-[9px] font-black text-[#0EA5A4] uppercase tracking-[0.4em] border border-[#0EA5A4]/10">
              Readiness Verdict
           </div>
           <h1 className="text-5xl font-black text-[#1E293B] tracking-tighter">Analysis Complete</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Master Coefficient Card (Hero) */}
          <div className="lg:col-span-5 glass-card dashboard-main-card p-12 md:p-16 rounded-[3.5rem] flex flex-col items-center justify-center text-center space-y-10">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Master Coefficient</h3>
              <div className="text-[120px] font-black text-[#1E293B] tracking-tighter leading-none">{score.overall}%</div>
            </div>
            
            <div className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-lg transition-all ${
              score.isEligible 
                ? 'bg-white border-[#0EA5A4]/20 text-[#0EA5A4] shadow-[#0EA5A4]/5' 
                : 'bg-white border-rose-100 text-rose-500 shadow-rose-100'
            }`}>
              {score.isEligible ? 'Protocol Optimized' : 'Recalibration Advised'}
            </div>

            <div className="pt-6 w-full space-y-4">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Neural Signature Validated</p>
              <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#0EA5A4] to-[#38BDF8]" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* Intelligence Matrix Chart */}
          <div className="lg:col-span-7 glass-card dashboard-matrix-card p-12 rounded-[3.5rem] flex flex-col space-y-10 min-h-[500px]">
            <div className="flex justify-between items-center">
              <h3 className="text-[#1E293B] font-black text-2xl tracking-tight">Intelligence Matrix</h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vector Mapping v4.0</span>
            </div>
            
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#0EA5A4" strokeOpacity={0.05} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} />
                  <Radar 
                    name="Candidate" 
                    dataKey="A" 
                    stroke="#5832D8" 
                    strokeWidth={4} 
                    fill="#5832D8" 
                    fillOpacity={0.08} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Feedback & Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 glass-card dashboard-feedback-card p-14 rounded-[3.5rem] space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-8xl font-black italic pointer-events-none">DISPOSITION</div>
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-[#5832D8] uppercase tracking-[0.4em] flex items-center gap-3">
                  <i className="fas fa-brain text-xs"></i>
                  Neural Feedback Log
               </h4>
               <p className="text-lg text-[#1E293B] leading-relaxed font-semibold opacity-90 max-w-3xl">
                 {score.feedback}
               </p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
               {['Strategic Logic', 'Vector Clarity', 'Yield Optimized'].map((tag, i) => (
                 <span key={i} className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   {tag}
                 </span>
               ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 justify-center">
            <button 
              onClick={onRestart}
              className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-[#1D7BFF] to-[#5832D8] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200/50 hover:scale-[1.02] transition-transform"
            >
              Initiate Resync
            </button>
            <button 
              className="w-full py-6 rounded-[2rem] bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-indigo-600 hover:border-indigo-100 transition-all"
            >
              Export Assessment Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};