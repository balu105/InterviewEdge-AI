
import React from 'react';
import { AppStage } from '../types';

interface LandingPageProps {
  onStart: (stage: AppStage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-0 pb-20 md:pb-32 space-y-24 md:space-y-40">
        {/* Hero Section */}
        <section className="text-center space-y-8 md:space-y-12 max-w-5xl mx-auto">
          <div className="mt-12 md:mt-16 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-slate-200 text-[10px] font-black text-indigo-600 tracking-[0.3em] animate-fadeInUp uppercase">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            System Online: Academic Phase 3.0
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[1] md:leading-[0.85] animate-fadeInUp">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-400 to-indigo-500">
              Placement Readiness.
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed animate-fadeInUp">
            Bridging the gap between theory and industry through NLP-driven resume auditing and high-fidelity audio interview simulations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-150">
            <button 
              onClick={() => onStart(AppStage.REGISTER)}
              className="btn-crystal px-8 md:px-12 py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => onStart(AppStage.PLACEMENT_OFFICE)}
              className="px-8 md:px-12 py-5 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl"
            >
              <i className="fas fa-university mr-3 text-indigo-400"></i>
              Placement Portal
            </button>
            <button 
              onClick={() => onStart(AppStage.PROJECT_DETAILS)}
              className="px-8 md:px-12 py-5 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all shadow-md"
            >
              View Architecture
            </button>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {[
            { 
              icon: 'fa-brain', 
              title: 'Neural Resume Audit', 
              desc: 'Applying semantic analysis to extract skill vectors and identify industry gaps.',
              color: 'text-indigo-600',
              bg: 'bg-indigo-50'
            },
            { 
              icon: 'fa-microphone-alt', 
              title: 'Live Audio Mockups', 
              desc: 'High-fidelity voice simulations powered by Gemini Flash for realistic HR stress testing.',
              color: 'text-sky-600',
              bg: 'bg-sky-50'
            },
            { 
              icon: 'fa-chart-pie', 
              title: 'Readiness Metrics', 
              desc: 'Quantifiable job-readiness scores based on a weighted multi-modal assessment engine.',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50'
            }
          ].map((f, i) => (
            <div key={i} className="glass-card p-10 md:p-12 rounded-[3rem] hover:scale-[1.03] transition-all space-y-6 group">
              <div className={`w-16 h-16 rounded-[1.5rem] ${f.bg} border border-black/5 flex items-center justify-center text-2xl ${f.color} group-hover:rotate-6 transition-transform`}>
                <i className={`fas ${f.icon}`}></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Architecture Section (Project Visualizer) */}
        <section className="glass-card rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-10">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Project Pipeline</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Input Layer', desc: 'Resume artifacts parsed via deep semantic analyzers.' },
                  { step: '02', title: 'Assessment Logic', desc: 'Dynamic coding challenges mapped to industry skill vectors.' },
                  { step: '03', title: 'Neural Interview', desc: 'Context-aware conversational agent for deep simulation.' }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">{s.step}</span>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg md:text-xl tracking-tight">{s.title}</h4>
                      <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square md:aspect-video bg-slate-50 border border-slate-200 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
              <div className="flex gap-4 md:gap-8 scale-75 md:scale-100">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white border border-slate-200 shadow-xl flex items-center justify-center text-indigo-600 animate-float">
                  <i className="fas fa-file-invoice text-3xl md:text-4xl"></i>
                </div>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white border border-slate-200 shadow-xl flex items-center justify-center text-sky-600 animate-float delay-150">
                  <i className="fas fa-microchip text-3xl md:text-4xl"></i>
                </div>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white border border-slate-200 shadow-xl flex items-center justify-center text-purple-600 animate-float delay-300">
                  <i className="fas fa-robot text-3xl md:text-4xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
