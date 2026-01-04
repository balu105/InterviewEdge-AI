
import React from 'react';
import { User, AssessmentRecord } from '../types';

interface PlacementProfileProps {
  user: User;
  history: AssessmentRecord[];
}

export const PlacementProfile: React.FC<PlacementProfileProps> = ({ user, history }) => {
  const latest = history.length > 0 ? history[0] : null;
  const highest = history.reduce((prev, current) => (prev.overall_score > current.overall_score) ? prev : current, { overall_score: 0 } as AssessmentRecord);
  
  const isEligible = latest ? (latest.overall_score >= 70 && !latest.integrity_breach) : false;

  return (
    <div className="max-w-5xl mx-auto px-6 animate-fadeIn pb-20">
      {/* Formal Header */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-900 rounded-full text-[10px] font-black text-white tracking-[0.4em] uppercase shadow-xl">
          Official Placement Portfolio
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Digital Credential ID: {latest?.id?.substring(0, 12) || 'PENDING_SYNC'}</p>
      </div>

      <div className="glass-card rounded-[4rem] p-10 md:p-20 relative overflow-hidden bg-white shadow-2xl border border-white">
        {/* Verified Watermark Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-25deg] pointer-events-none select-none">
          <h2 className="text-[12rem] font-black tracking-tighter uppercase whitespace-nowrap">HIREAI VERIFIED</h2>
        </div>

        {/* Profile Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: ID & Status */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6 text-center lg:text-left">
              <div className="w-32 h-32 md:w-44 md:h-44 bg-slate-100 rounded-[3rem] border-4 border-white shadow-xl mx-auto lg:mx-0 flex items-center justify-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span className="text-5xl md:text-7xl font-black text-indigo-600 uppercase">{user.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{user.name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Institutional Status</div>
                <div className={`text-sm font-black tracking-tight ${isEligible ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {isEligible ? 'VERIFIED JOB-READY' : 'CALIBRATION REQUIRED'}
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Discipline</div>
                <div className="text-sm font-black text-slate-900 tracking-tight uppercase">
                  {latest?.target_role || 'General Engineering'}
                </div>
              </div>
            </div>

            {/* Placement Seal */}
            <div className="pt-8 flex justify-center lg:justify-start">
               <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center transition-all ${isEligible ? 'border-emerald-100 bg-emerald-50 text-emerald-600 scale-110 shadow-lg shadow-emerald-100' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                  <i className="fas fa-shield-check text-2xl"></i>
                  <span className="text-[8px] font-black uppercase mt-1">SEALED</span>
               </div>
            </div>
          </div>

          {/* Right Column: Performance Summary */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Performance Audit</h4>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Highest Readiness</div>
                <div className="text-4xl font-black text-indigo-600 leading-none">{highest.overall_score}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technical Vector</span>
                  <span className="text-xs font-black text-slate-900">{latest?.technical_score || 0}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${latest?.technical_score || 0}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resume Affinity</span>
                  <span className="text-xs font-black text-slate-900">{latest?.resume_score || 0}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${latest?.resume_score || 0}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comm. Clarity</span>
                  <span className="text-xs font-black text-slate-900">{latest?.communication_score || 0}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${latest?.communication_score || 0}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Rank</span>
                  <span className={`text-xs font-black ${latest?.integrity_breach ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {latest?.integrity_breach ? 'BREACHED' : 'SECURE'}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${latest?.integrity_breach ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-indigo-50/30 rounded-[3rem] border border-indigo-100 space-y-6 relative overflow-hidden">
              <div className="absolute top-4 right-8 text-indigo-100/40 text-6xl font-black">AI</div>
              <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Recruiter Disposition Summary</h5>
              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                "{latest?.feedback || 'Insufficient assessment data to generate professional disposition. Please complete the technical forge and behavior interaction modules.'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 px-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black">H</div>
          <div>
            <div className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Validated Candidate</div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">HireAI Placement Infrastructure</div>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-3"
        >
          <i className="fas fa-print"></i> Generate Physical Copy
        </button>
      </div>
    </div>
  );
};
