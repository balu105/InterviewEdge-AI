
import React, { useState } from 'react';
import { analyzeResume, suggestJobRoles } from '../services/geminiService';
import { ResumeAnalysisResult } from '../types';

interface ResumeUploadProps {
  onAnalysisComplete: (result: ResumeAnalysisResult, role: string) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisComplete }) => {
  const [resumeText, setResumeText] = useState('');
  const [roleMode, setRoleMode] = useState<'MANUAL' | 'AI'>('MANUAL');
  const [manualRole, setManualRole] = useState('');
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'INPUT' | 'ROLE_SELECTION'>('INPUT');

  const handleNext = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      if (roleMode === 'AI') {
        const roles = await suggestJobRoles(resumeText);
        setSuggestedRoles(roles);
      }
      setStage('ROLE_SELECTION');
    } catch (error) {
      console.error("Suggestion failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalAnalyze = async () => {
    const finalRole = roleMode === 'MANUAL' ? manualRole : selectedRole;
    if (!finalRole) return;
    
    setLoading(true);
    try {
      const result = await analyzeResume(resumeText, finalRole);
      onAnalysisComplete(result, finalRole);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'ROLE_SELECTION') {
    return (
      <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl border border-slate-800 max-w-2xl mx-auto">
        <button onClick={() => setStage('INPUT')} className="text-slate-500 hover:text-indigo-400 mb-6 flex items-center gap-2 font-medium transition-colors">
          <i className="fas fa-arrow-left"></i> Back to Resume
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">Target Job Role</h2>
        <p className="text-slate-400 mb-8 text-sm">How should we determine your target role for this assessment?</p>

        <div className="flex bg-slate-800 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setRoleMode('MANUAL')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${roleMode === 'MANUAL' ? 'bg-slate-700 shadow-inner text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Manual Entry
          </button>
          <button 
            onClick={() => setRoleMode('AI')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${roleMode === 'AI' ? 'bg-slate-700 shadow-inner text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AI Mapping
          </button>
        </div>

        {roleMode === 'MANUAL' ? (
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="e.g. Frontend Engineer, Product Manager..."
              className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-white placeholder:text-slate-600"
              value={manualRole}
              onChange={e => setManualRole(e.target.value)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {suggestedRoles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`text-left px-5 py-4 rounded-2xl border-2 transition-all font-semibold ${
                  selectedRole === role ? 'border-indigo-600 bg-indigo-900/30 text-indigo-200 shadow-lg shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700 text-slate-400 bg-slate-800/50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleFinalAnalyze}
          disabled={loading || (roleMode === 'MANUAL' ? !manualRole : !selectedRole)}
          className="w-full mt-10 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-brain"></i> Perform Deep Audit</>}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl border border-slate-800 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white mb-2">Resume Audit</h2>
        <p className="text-slate-400">Our AI identifies skill gaps and enhances your industry profile.</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <textarea
            className="w-full h-80 p-6 bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl focus:border-indigo-500 focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-mono leading-relaxed text-indigo-100 placeholder:text-slate-700 shadow-inner"
            placeholder="Paste your plain text resume here (Education, Experience, Tech Stack, Projects)..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          {!resumeText && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-800">
              <i className="fas fa-file-code text-5xl mb-4 opacity-40"></i>
              <p className="text-sm font-bold tracking-widest uppercase opacity-40">AI Parser Initialized</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400">AI</div>
              ))}
            </div>
            <span className="ml-2 text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Powered by Gemini 3.0</span>
          </div>
          <button
            onClick={handleNext}
            disabled={loading || !resumeText.trim()}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-microchip"></i> Start Audit</>}
          </button>
        </div>
      </div>
    </div>
  );
};
