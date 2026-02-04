import React from 'react';
import { AppStage, AssessmentRecord } from '../types';
import './HubDashboard.css';

interface HubDashboardProps {
  onStart: () => void;
  progress: number;
  history: AssessmentRecord[];
}

export const HubDashboard: React.FC<HubDashboardProps> = ({ onStart, progress, history }) => {
  const phases = [
    { id: 'TARGET', title: 'Calibration', icon: 'fa-crosshairs', color: '#0EA5A4', p: 'P - 01' },
    { id: 'RESUME', title: 'Deep Audit', icon: 'fa-file-shield', color: '#38BDF8', p: 'P - 02' },
    { id: 'FORGE', title: 'The Forge', icon: 'fa-terminal', color: '#5832D8', p: 'P - 03' },
    { id: 'SESSION', title: 'Live Sync', icon: 'fa-headset', color: '#FF9B42', p: 'P - 04' },
  ];

  return (
    <div className="hub-theme-container min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fadeIn">
        
        {/* Main Hero Deployment Card */}
        <div className="glass-card hub-main-card p-12 md:p-16 rounded-[3.5rem] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 border border-white">
          <div className="space-y-8 flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f0f9f9] rounded-full border border-[#0EA5A4]/10 shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full shadow-[0_0_8px_#22C55E]"></span>
              <span className="text-[9px] font-black text-[#0EA5A4] tracking-widest uppercase">System Performance Optimized</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black text-[#1E293B] tracking-tighter leading-[1.05] max-w-xl">
              Accelerate Your <br />
              Readiness Quotient.
            </h2>
            
            <p className="text-[#64748b] text-sm md:text-base max-w-md font-medium leading-relaxed">
              A high-fidelity evaluation suite for technical candidates. Benchmarking neural readiness with precision teals.
            </p>
            
            <div className="pt-4">
              <button 
                onClick={onStart}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 hover:text-indigo-600 transition-all"
              >
                Initialize Deployment
                <span className="text-sm font-normal">›</span>
              </button>
            </div>
          </div>

          {/* Master Progress Sub-Card */}
          <div className="w-full lg:w-[420px] z-10">
            <div className="bg-white/80 p-12 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-md space-y-10 text-center">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Progress</span>
                <span className="text-3xl font-black text-[#0EA5A4]">{Math.round(progress)}%</span>
              </div>
              
              <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1D7BFF] to-[#5832D8] transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Syncing Skill Vectors</p>
                <button 
                  onClick={onStart}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#1D7BFF] to-[#5832D8] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                >
                  Initialize Deployment
                  <span className="text-xs">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Protocol Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {phases.map((p) => (
            <div key={p.id} className="glass-card hub-protocol-card p-10 rounded-[2.5rem] bg-white border border-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-8 group hover:translate-y-[-5px] transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-[1.25rem] bg-white flex items-center justify-center text-xl shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-slate-50 group-hover:scale-105 transition-all" style={{ color: p.color }}>
                  <i className={`fas ${p.icon}`}></i>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{p.p}</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#1E293B] tracking-tight">{p.title}</h3>
                <p className="text-[9px] text-[#0EA5A4] font-black uppercase tracking-widest">Operational</p>
              </div>
              
              <div className="h-px bg-slate-100 w-full"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Active</span>
                <span className="text-slate-300 text-sm group-hover:translate-x-1 group-hover:text-indigo-500 transition-all">→</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};