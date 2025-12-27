
import React from 'react';
import { User, AppStage } from '../types';

interface StudentDashboardProps {
  user: User;
  onStartTool: (stage: AppStage) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onStartTool }) => {
  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Welcome, {user.name} 👋</h1>
          <p className="text-slate-400">Your interview readiness command center is ready.</p>
        </div>
        {/* Corrected AppStage.RESUME_ANALYSIS to AppStage.RESUME */}
        <button 
          onClick={() => onStartTool(AppStage.RESUME)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <i className="fas fa-plus-circle"></i> New Readiness Check
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-file-alt text-xl"></i>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Resume Integrity</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">82%</h2>
            <span className="text-green-400 text-xs font-bold">+5% improvement</span>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-code text-xl"></i>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Technical Agility</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">68%</h2>
            <span className="text-orange-400 text-xs font-bold">In Progress</span>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-comments text-xl"></i>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Mock Mastery</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">12</h2>
            <span className="text-slate-500 text-xs font-bold">Total Sessions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended Actions */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-bolt text-yellow-400"></i> Smart Recommendations
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
                  <i className="fas fa-book-open"></i>
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-200">System Design Patterns</p>
                  <p className="text-xs text-slate-500 italic">Recommended based on Software Eng. role</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-slate-600 group-hover:text-indigo-400 transition-colors"></i>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center">
                  <i className="fas fa-pen-nib"></i>
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-200">Behavioral Answer Builder</p>
                  <p className="text-xs text-slate-500 italic">Sharpen your 'Tell me about yourself'</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-slate-600 group-hover:text-indigo-400 transition-colors"></i>
            </div>
          </div>
        </div>

        {/* Preparation Progress */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Readiness Roadmap</h3>
          <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            <div className="relative">
              <div className="absolute -left-8 w-6 h-6 rounded-full bg-green-500/20 border-4 border-slate-950 text-green-400 flex items-center justify-center">
                <i className="fas fa-check text-[10px]"></i>
              </div>
              <p className="text-sm font-bold text-slate-200">Resume IQ Complete</p>
              <p className="text-xs text-slate-500">Verified 2 days ago</p>
            </div>
            <div className="relative">
              <div className="absolute -left-8 w-6 h-6 rounded-full bg-indigo-500 border-4 border-slate-950 flex items-center justify-center text-white">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm font-bold text-white">Technical Deep Dive</p>
              <p className="text-xs text-indigo-400">Current Phase — 70% Progress</p>
            </div>
            <div className="relative opacity-40">
              <div className="absolute -left-8 w-6 h-6 rounded-full bg-slate-800 border-4 border-slate-950"></div>
              <p className="text-sm font-bold text-slate-400">HR Simulator Arena</p>
              <p className="text-xs text-slate-600">Locked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};