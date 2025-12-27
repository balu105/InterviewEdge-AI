
import React from 'react';

export const ProjectAbout: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-fadeInUp">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white mb-4">Project Documentation</h1>
        <p className="text-slate-500 uppercase tracking-[0.3em] text-xs font-black">Academic Year 2023-24 | Final Year Submission</p>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
        <h2 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
          <i className="fas fa-file-alt"></i> Abstract
        </h2>
        <div className="prose prose-invert prose-sm text-slate-400 leading-relaxed max-w-none">
          <p>
            The <strong>AI-Based Student Interview Readiness and Skill Enrichment Platform</strong> is designed to support college students and fresh graduates in preparing effectively for technical and HR interviews. Many students face difficulty during placements not due to a lack of knowledge, but because they lack structured preparation, clear feedback, and realistic interview practice.
          </p>
          <p className="mt-4">
            This project addresses that gap by providing a unified system that evaluates a student’s interview readiness and guides them toward improvement through a three-stage pipeline: 
            <strong> Resume Analysis</strong>, <strong>Technical Skill Assessment</strong>, and <strong>Mock Interview Simulation</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
          <h3 className="text-white font-bold mb-6 flex items-center gap-3">
            <i className="fas fa-layer-group text-purple-400"></i> Tech Stack
          </h3>
          <ul className="space-y-4">
            {[
              { label: 'Frontend', val: 'React 19 + Tailwind CSS' },
              { label: 'Logic Engine', val: 'Google Gemini 3.0 API' },
              { label: 'State Mgmt', val: 'React Hooks & Context' },
              { label: 'Integrity', val: 'Tab-Switch Detection API' }
            ].map((t, i) => (
              <li key={i} className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-500 font-bold uppercase">{t.label}</span>
                <span className="text-sm text-slate-200 font-bold">{t.val}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
          <h3 className="text-white font-bold mb-6 flex items-center gap-3">
            <i className="fas fa-bullseye text-red-400"></i> Key Objectives
          </h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-3"><i className="fas fa-check-circle text-indigo-500 mt-1"></i> Automated NLP-based resume skill extraction.</li>
            <li className="flex gap-3"><i className="fas fa-check-circle text-indigo-500 mt-1"></i> Quantifiable readiness metrics generation.</li>
            <li className="flex gap-3"><i className="fas fa-check-circle text-indigo-500 mt-1"></i> Constructive HR & Technical feedback loops.</li>
            <li className="flex gap-3"><i className="fas fa-check-circle text-indigo-500 mt-1"></i> Proctoring simulations for assessment integrity.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
