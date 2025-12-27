
import React from 'react';
import { AppStage } from '../types';

interface LandingPageProps {
  onStart: (stage: AppStage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent -z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-32 space-y-40">
        {/* Hero Section */}
        <section className="text-center space-y-12 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-white/10 text-xs font-bold text-indigo-400 tracking-widest animate-fadeInUp">
            <span className="pulse-indicator"></span>
            SYSTEM ONLINE: ACADEMIC PHASE 2.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] animate-fadeInUp">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
              Placement Readiness.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed animate-fadeInUp">
            Bridging the gap between theory and industry through NLP-driven resume auditing and real-time audio interview simulations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-150">
            <button 
              onClick={() => onStart(AppStage.REGISTER)}
              className="px-10 py-5 bg-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-600/20"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => onStart(AppStage.PROJECT_DETAILS)}
              className="px-10 py-5 glass-card border-white/10 rounded-2xl font-black text-lg hover:bg-white/5 transition-all"
            >
              View Architecture
            </button>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: 'fa-brain', 
              title: 'Neural Resume Audit', 
              desc: 'Applying semantic analysis to extract skill vectors and identify industry gaps.',
              color: 'text-indigo-400'
            },
            { 
              icon: 'fa-microphone-alt', 
              title: 'Live Audio Mockups', 
              desc: 'High-fidelity voice simulations powered by Gemini Flash for realistic HR stress testing.',
              color: 'text-purple-400'
            },
            { 
              icon: 'fa-chart-pie', 
              title: 'Readiness Metrics', 
              desc: 'Quantifiable job-readiness scores based on a weighted multi-modal assessment engine.',
              color: 'text-emerald-400'
            }
          ].map((f, i) => (
            <div key={i} className="glass-card p-10 rounded-[2.5rem] glow-border transition-all space-y-6 group">
              <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-2xl ${f.color} group-hover:scale-110 transition-transform`}>
                <i className={`fas ${f.icon}`}></i>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Architecture Section (Project Visualizer) */}
        <section className="glass-card rounded-[3rem] p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-white">Project Pipeline</h2>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Input Layer', desc: 'Resume text or PDF parsed via LangChain & Gemini.' },
                  { step: '02', title: 'Assessment Logic', desc: 'Dynamic MCQ/Coding challenges mapped to skill vectors.' },
                  { step: '03', title: 'Neural Interview', desc: 'Context-aware conversational agent for HR/Tech simulation.' }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-indigo-500 font-black text-lg">{s.step}</span>
                    <div>
                      <h4 className="font-bold text-white text-lg">{s.title}</h4>
                      <p className="text-slate-500 text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video glass-card border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-full border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-float">
                  <i className="fas fa-file-invoice text-3xl"></i>
                </div>
                <div className="w-32 h-32 rounded-full border border-purple-500/30 flex items-center justify-center text-purple-400 animate-float delay-75">
                  <i className="fas fa-microchip text-3xl"></i>
                </div>
                <div className="w-32 h-32 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 animate-float delay-150">
                  <i className="fas fa-robot text-3xl"></i>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
