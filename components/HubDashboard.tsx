
import React from 'react';
import { AppStage, AssessmentRecord } from '../types';

interface HubDashboardProps {
  onStart: () => void;
  progress: number;
  history: AssessmentRecord[];
}

export const HubDashboard: React.FC<HubDashboardProps> = ({ onStart, progress, history }) => {
  const phases = [
    { 
      id: 'TARGET', 
      title: 'Target Calibration', 
      subtitle: 'PHASE 01: GOAL DEFINITION', 
      status: progress >= 15 ? 'SYNCED' : 'READY', 
      icon: 'fa-crosshairs',
      done: progress >= 15,
      isLocked: false
    },
    { 
      id: 'RESUME', 
      title: 'Neural Scanning', 
      subtitle: 'PHASE 02: SKILL VECTORS', 
      status: progress >= 30 ? 'SYNCED' : (progress >= 15 ? 'READY' : 'LOCKED'), 
      icon: 'fa-fingerprint',
      done: progress >= 30,
      isLocked: progress < 15
    },
    { 
      id: 'FORGE', 
      title: 'Technical Forge', 
      subtitle: 'PHASE 03: CODE RIGOR', 
      status: progress >= 50 ? 'SYNCED' : (progress >= 30 ? 'READY' : 'LOCKED'), 
      icon: 'fa-microchip',
      done: progress >= 50,
      isLocked: progress < 30
    },
    { 
      id: 'INTERVIEW', 
      title: 'Session Interaction', 
      subtitle: 'PHASE 04: BEHAVIORAL', 
      status: progress >= 100 ? 'SYNCED' : (progress >= 50 ? 'READY' : 'LOCKED'), 
      icon: 'fa-headset',
      done: progress >= 100,
      isLocked: progress < 50
    },
  ];

  const activity = [
    { label: 'Neural Core Ready', time: 'SYSTEM ONLINE', completed: true },
    { label: 'Profile Scanning', time: progress >= 30 ? 'VERIFIED' : 'PENDING', completed: progress >= 30 },
    { label: 'Algorithm Audit', time: progress >= 50 ? 'VERIFIED' : 'PENDING', completed: progress >= 50 },
    { label: 'Deployment Ready', time: progress >= 100 ? 'CALCULATED' : 'LOCKED', completed: progress >= 100 },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-10 space-y-16 animate-fadeIn">
      {/* Hero Header Section */}
      <div className="relative group p-10 md:p-20 rounded-[4rem] bg-white border border-white/80 shadow-2xl overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-12">
        {/* Animated Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-sky-400 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-[120px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-700"></div>
        
        <div className="space-y-8 md:space-y-12 flex-1 max-w-2xl relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50 rounded-full border border-indigo-100 shadow-sm">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-indigo-700 tracking-[0.4em] uppercase">Enterprise Readiness Engine</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Industry Footprint.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-500 font-medium leading-relaxed mx-auto lg:mx-0 max-w-xl">
              A high-precision neural pipeline designed to measure, analyze, and optimize your professional potential.
            </p>
          </div>

          <div className="pt-4">
            <button 
              onClick={onStart}
              className="btn-crystal px-12 py-6 text-white rounded-3xl font-black text-xs tracking-[0.3em] uppercase flex items-center justify-center lg:justify-start gap-6 mx-auto lg:mx-0 active:scale-95 transition-all shadow-xl shadow-indigo-200"
            >
              Start Pipeline
              <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* Global Status Monitoring Card */}
        <div className="w-full lg:w-[420px] glass-card p-10 md:p-12 rounded-[3.5rem] space-y-10 relative z-10 border border-white/80 shadow-2xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Status</div>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">Live Monitor</div>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
              <i className="fas fa-satellite-dish animate-pulse"></i>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full opacity-60"></div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness Probability</span>
              <span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-6 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-1.5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-sky-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
            <p className="text-[9px] font-black text-indigo-600/70 uppercase tracking-widest text-center leading-relaxed">
              Real-time synchronization with industry benchmarks active
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
        
        {/* Verification Phases Grid */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Deployment Phases</h2>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Phase Control: Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {phases.map((phase) => (
              <div 
                key={phase.id} 
                className={`group p-10 rounded-[3.5rem] flex flex-col justify-between h-[360px] transition-all duration-500 relative overflow-hidden ${
                  phase.isLocked 
                    ? 'bg-slate-100/30 opacity-40 grayscale border border-slate-200' 
                    : 'glass-card hover:translate-y-[-6px] cursor-pointer'
                }`}
              >
                {/* Active Phase Aura */}
                {!phase.isLocked && !phase.done && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full animate-pulse"></div>
                )}

                <div className="flex justify-between items-start">
                  <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center border-2 transition-transform group-hover:rotate-6 ${
                    phase.isLocked ? 'bg-slate-200 border-slate-300' : 'bg-indigo-50 border-indigo-100'
                  }`}>
                    <i className={`fas ${phase.icon} text-2xl ${phase.isLocked ? 'text-slate-400' : 'text-indigo-600'}`}></i>
                  </div>
                  
                  {/* Phase Completion Indicator */}
                  <div className={`w-14 h-14 rounded-full border-4 border-slate-50 flex items-center justify-center relative shadow-sm ${phase.isLocked ? 'bg-slate-100' : 'bg-white'}`}>
                     {!phase.isLocked && !phase.done && (
                       <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin opacity-40"></div>
                     )}
                     {phase.done && <i className="fas fa-check text-emerald-500"></i>}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{phase.title}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{phase.subtitle}</p>
                </div>

                <div className={`h-px w-full ${phase.isLocked ? 'bg-slate-200' : 'bg-slate-100'} opacity-60`}></div>

                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                    phase.done ? 'text-emerald-600' : (phase.isLocked ? 'text-slate-400' : 'text-indigo-600')
                  }`}>
                    {phase.status}
                  </span>
                  
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${
                    phase.done 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                      : (phase.isLocked ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100')
                  }`}>
                    <i className={`fas ${phase.done ? 'fa-check-double' : 'fa-play'} text-sm`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Logs (Right Sidebar) */}
        <div className="glass-card p-12 rounded-[4rem] border border-white/80 shadow-2xl flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-12">Neural Nodes</h2>

          <div className="flex-1 space-y-12 relative">
            {activity.map((item, i) => (
              <div key={i} className="flex gap-8 relative">
                {/* Vertical Connector Line */}
                {i !== activity.length - 1 && (
                  <div className="absolute left-[23px] top-12 bottom-[-48px] w-0.5 bg-slate-100"></div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border-4 border-white z-10 transition-all duration-700 ${
                  item.completed ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className={`fas ${item.completed ? 'fa-microchip' : 'fa-lock'} text-[10px]`}></i>
                </div>
                
                <div className="space-y-1.5 py-1">
                  <div className="text-lg font-black text-slate-900 tracking-tight leading-none">{item.label}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Protocol Info Box */}
          <div className="mt-12 p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100/80 space-y-8 shadow-inner">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                <i className="fas fa-shield-halved text-xl"></i>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Validation</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Global Protocol v.4.0</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RESUME MATCH</span>
                <span className="text-[10px] font-black text-indigo-600 tracking-widest">70% MIN</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TECH KPI</span>
                <span className="text-[10px] font-black text-sky-600 tracking-widest">60% MIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
