
import React from 'react';

export const ProjectAbout: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-16 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-2 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] border border-indigo-100">
          Architecture Documentation
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">System Blueprint</h1>
        <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-black italic">HireAI Infrastructure v4.0.1</p>
      </div>

      <div className="glass-card rounded-[4rem] p-12 md:p-16 border border-white shadow-xl">
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
          <i className="fas fa-file-invoice text-indigo-600"></i> Project Abstract
        </h2>
        <div className="text-slate-600 font-medium leading-relaxed space-y-6">
          <p>
            The <strong>AI-Based Student Interview Readiness and Skill Enrichment Platform</strong> is a unified neural pipeline designed to bridge the chasm between academic theory and high-performance industry expectations.
          </p>
          <p>
            By integrating <strong>NLP-driven semantic analysis</strong> for resume auditing, <strong>algorithmic proctoring</strong> for technical evaluation, and <strong>low-latency voice simulations</strong> for behavioral stress-testing, the platform provides a quantifiable readiness coefficient for every candidate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card rounded-[3.5rem] p-12 space-y-10">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-4">
            <i className="fas fa-layer-group text-sky-500"></i> Engineering Stack
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Intelligence Core', val: 'Google Gemini 3.0 API' },
              { label: 'Interface Layer', val: 'React 19 + Tailwind CSS' },
              { label: 'Vector Engine', val: 'NLP Semantic Analysis' },
              { label: 'Security Domain', val: 'Tab-Switch Proctoring API' }
            ].map((t, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.label}</span>
                <span className="text-sm text-slate-900 font-black tracking-tight">{t.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[3.5rem] p-12 space-y-10">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-4">
            <i className="fas fa-bullseye text-rose-500"></i> System Objectives
          </h3>
          <ul className="space-y-5">
            {[
              'Automated Skill Vector Extraction',
              'Quantifiable Readiness Coefficients',
              'High-Fidelity Behavioral Simulation',
              'Proctoring & Integrity Enforcement'
            ].map((obj, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                  <i className="fas fa-check text-[10px]"></i>
                </div>
                <span className="text-sm text-slate-600 font-semibold">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center pt-10">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
          End of Documentation • Security Clearances Active
        </p>
      </div>
    </div>
  );
};
