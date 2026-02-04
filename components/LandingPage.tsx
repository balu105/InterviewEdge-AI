import React from 'react';
import { AppStage } from '../types';
import './LandingPage.css';

interface LandingPageProps {
  onStart: (stage: AppStage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative w-full min-h-screen pt-10 pb-20 overflow-x-hidden flex flex-col items-center">
      
      {/* 1. Header Navigation Label */}
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.45em] mb-24 animate-fadeIn">
        HireAI | Celestial Enterprise Suite
      </div>

      <div className="max-w-7xl mx-auto px-8 w-full space-y-48">
        
        {/* 2. Hero Section */}
        <section className="text-center space-y-12 animate-fadeIn">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1e1b4b]/30 border border-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.1)] text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
            Neural Assessment Infrastructure
          </div>
          
          <div className="space-y-10">
            <h1 className="font-extrabold text-white tracking-tighter leading-[1.05] hero-title max-w-4xl mx-auto">
              Intelligence for the <br />
              <span className="text-slate-400/80">Modern Enterprise.</span>
            </h1>
            <p className="text-slate-400/60 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed tracking-wide">
              A high-fidelity framework for talent evaluation. Aligning candidate skills <br className="hidden md:block" />
              with institutional readiness through soft touch neural auditing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
            <button 
              onClick={() => onStart(AppStage.REGISTER)}
              className="btn-celestial-purple px-10 py-4.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Start Calibration
            </button>
            <button 
              onClick={() => onStart(AppStage.PLACEMENT_OFFICE)}
              className="btn-celestial-blue px-10 py-4.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
            >
              Institutional Login
              <span className="text-sm font-normal">→</span>
            </button>
          </div>
        </section>

        {/* 3. System Benchmarks Section */}
        <section className="space-y-16">
          <div className="flex flex-col items-center gap-4">
             <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">System Benchmarks</h2>
             <div className="h-[1px] w-12 bg-indigo-600/40 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { label: 'System Latency', val: '< 150ms', color: '#38BDF8', icon: 'fa-lock' },
              { label: 'Audit Accuracy', val: '99.8%', color: '#F87171', icon: 'fa-shield-halved' },
              { label: 'Global Users', val: '12.5k', color: '#2563EB', icon: 'fa-user' },
              { label: 'Platform Uptime', val: '99.9%', color: '#C084FC', icon: 'fa-location-dot' },
            ].map((m, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.04] p-12 rounded-[2.5rem] flex flex-col items-center text-center group transition-all hover:bg-white/[0.04] hover:translate-y-[-5px]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-8 text-sm" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                  <i className={`fas ${m.icon}`}></i>
                </div>
                <div className="text-3xl font-bold text-white mb-2 tracking-tight">{m.val}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Enterprise Capabilities Section */}
        <section className="space-y-20 pb-16">
          <div className="text-center space-y-6">
             <h2 className="text-4xl font-black text-white tracking-tighter">Enterprise Capabilities</h2>
             <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl mx-auto opacity-70">
               Integrated assessment modules designed for institutional excellence and candidate confidence.
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                title: 'Neural Auditing', 
                desc: 'Analyze skillstets with contextual alignment using advanced algorithmic and neural signals.', 
                icon: 'fa-microchip',
                gradient: 'from-[#4F46E5] to-[#2E248E]',
                glow: 'shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)]'
              },
              { 
                title: 'Technical Forge', 
                desc: 'High-entropy technical vetting and proctoring to analyze code, simulate attacks and mitigate technical deceptions.', 
                icon: 'fa-terminal',
                gradient: 'from-[#1D7BFF] to-[#1557B6]',
                glow: 'shadow-[0_20px_40px_-15px_rgba(29,123,255,0.3)]'
              },
              { 
                title: 'Live Simulation', 
                desc: 'Real-time interactive staging environments for hands-on project and communication scenarios.', 
                icon: 'fa-video',
                gradient: 'from-[#FF9B42] to-[#D97706]',
                glow: 'shadow-[0_20px_40px_-15px_rgba(255,155,66,0.3)]'
              },
            ].map((feature, i) => (
              <div key={i} className={`relative p-12 rounded-[2.8rem] bg-gradient-to-br ${feature.gradient} ${feature.glow} border border-white/10 flex flex-col gap-10 group hover:scale-[1.03] transition-all duration-500 overflow-hidden min-h-[460px]`}>
                {/* Visual Texture/Star-dust effect */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors"></div>
                
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{feature.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
                
                <div className="mt-auto pt-4">
                   <div className="h-[1px] w-12 bg-white/30 rounded-full group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* 5. Institutional Footer */}
      <footer className="w-full mt-40 border-t border-white/5 bg-[#03010a] py-16">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-12">
          
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-[#5832D8] rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl">H</div>
            <div className="text-left">
              <div className="text-xs font-black text-white uppercase tracking-[0.15em]">HIREAI PERFORMANCE SUITE</div>
              <div className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest">Strategie evaluation evolved.</div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {['COMPLIANCE', 'ARCHITECTURE', 'SECURITY', 'INSTITUTIONAL READINESS'].map(link => (
              <a key={link} href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-[0.25em] transition-all duration-300">{link}</a>
            ))}
          </div>
          
        </div>
      </footer>
    </div>
  );
};