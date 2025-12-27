
import React from 'react';
import { AppStage, AssessmentRecord } from '../types';

interface HubDashboardProps {
  onStart: () => void;
  progress: number;
  history: AssessmentRecord[];
}

export const HubDashboard: React.FC<HubDashboardProps> = ({ onStart, progress, history }) => {
  const phases = [
    { id: 'TARGET', title: 'Calibration', subtitle: 'Target Path', status: 'READY', icon: 'fa-crosshairs' },
    { id: 'RESUME', title: 'Audit', subtitle: 'CV Vectoring', status: progress > 15 ? 'COMPLETE' : 'READY', icon: 'fa-fingerprint' },
    { id: 'FORGE', title: 'Forge', subtitle: 'Tech Logic', status: progress > 30 ? 'ACTIVE' : 'LOCKED', icon: 'fa-microchip' },
    { id: 'INTERVIEW', title: 'Arena', subtitle: 'Behavioral', status: progress > 50 ? 'ACTIVE' : 'LOCKED', icon: 'fa-headset' },
  ];

  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.overall_score, 0) / history.length)
    : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-24 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-1">
        {/* Hero Section */}
        <div className="lg:col-span-2 glass-panel p-16 rounded-[40px] relative overflow-hidden flex flex-col justify-center min-h-[500px]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-600/10 rounded-full border border-indigo-600/20 text-[9px] font-black text-indigo-400 tracking-[0.4em] uppercase">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              Neural Command Center v4.2
            </div>
            
            <h1 className="text-7xl font-black tracking-tighter leading-[0.85] text-white">
              Bridge Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 glow-text">Industry Gap.</span>
            </h1>
            
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
              A military-grade assessment pipeline combining NLP skill vectoring and high-fidelity behavioral simulations.
            </p>

            <button 
              onClick={onStart}
              className="group px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center gap-4 shadow-2xl shadow-indigo-600/40 active:scale-95"
            >
              Initialize Deployment
              <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </button>
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="glass-panel p-12 rounded-[40px] flex flex-col justify-between stagger-2">
          <div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Readiness Average</div>
            <div className="text-4xl font-black text-white font-mono-tech">{averageScore}%</div>
          </div>

          <div className="space-y-10">
            <div className="flex flex-col items-center">
              <div className="text-6xl font-black text-indigo-400 mb-2">{Math.round(progress)}<span className="text-xl">%</span></div>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Current Session Index</div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Sims</div>
              <div className="text-xs font-bold text-emerald-400 font-mono-tech">{history.length}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Sync</div>
              <div className="text-xs font-bold text-indigo-400 font-mono-tech">CLOUD</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Process Gating Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-3">
          {phases.map((phase) => (
            <div key={phase.id} className={`glass-panel glass-panel-hover p-10 rounded-[32px] flex flex-col justify-between h-[280px] relative overflow-hidden group ${phase.status === 'LOCKED' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <i className={`fas ${phase.icon} text-lg text-indigo-400`}></i>
                </div>
                {phase.status === 'LOCKED' && <i className="fas fa-lock text-slate-600 text-xs"></i>}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white mb-1">{phase.title}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">{phase.subtitle}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${phase.status === 'LOCKED' ? 'text-slate-600' : 'text-indigo-400'}`}>
                    {phase.status}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${phase.status === 'COMPLETE' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                    <i className={`fas ${phase.status === 'COMPLETE' ? 'fa-check' : 'fa-arrow-right'} text-[10px]`}></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Historical Archive (Truly Proof of Backend Storage) */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-[40px] flex flex-col h-[580px] border-indigo-500/10 shadow-2xl">
           <div className="flex items-center gap-3 mb-8">
              <i className="fas fa-database text-indigo-400 text-sm"></i>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Neural Archive</h3>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <i className="fas fa-folder-open text-4xl mb-4"></i>
                  <p className="text-[10px] font-black uppercase tracking-widest">No Sessions Found</p>
                </div>
              ) : (
                history.map((record) => (
                  <div key={record.id} className="p-5 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
                     <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter truncate max-w-[120px]">
                          {record.target_role}
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${record.integrity_breach ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {record.integrity_breach ? 'BREACH' : 'SECURE'}
                        </span>
                     </div>
                     <div className="flex items-end justify-between">
                        <div>
                          <div className="text-2xl font-black text-white">{record.overall_score}%</div>
                          <div className="text-[8px] font-bold text-slate-600 mt-1">
                            {new Date(record.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button className="w-8 h-8 bg-indigo-600/10 text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <i className="fas fa-chevron-right text-[10px]"></i>
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>

      {/* Bottom Legal/Version Bar */}
      <div className="flex items-center justify-between pt-12 border-t border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
        <span>HireAI Kernel v4.4.2 (PRO)</span>
        <div className="flex gap-10">
          <span className="hover:text-indigo-400 cursor-pointer transition-colors">Documentation</span>
          <span className="hover:text-indigo-400 cursor-pointer transition-colors">Edge Status</span>
        </div>
      </div>
    </div>
  );
};
