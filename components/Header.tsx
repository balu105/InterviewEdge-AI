import React from 'react';
import { AppStage, User } from '../types';
import './Header.css';

interface HeaderProps {
  currentStage: AppStage;
  user: User | null;
  onNavigate: (stage: AppStage) => void;
  onLogout: () => void;
  locked: boolean;
  isFacultyView: boolean;
  onExitFaculty: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentStage, 
  user, 
  onNavigate, 
  onLogout, 
  locked, 
  isFacultyView,
  onExitFaculty 
}) => {
  if (!user) return null;

  const tabs = [
    { id: AppStage.HUB, label: 'HUB', icon: 'fa-house' },
    { id: AppStage.TARGET, label: 'TRACKS', icon: 'fa-circle-dot' },
    { id: AppStage.FORGE, label: 'FORGE', icon: 'fa-code' },
    { id: AppStage.INTERVIEW, label: 'SESSION', icon: 'fa-headset' },
    { id: AppStage.VERDICT, label: 'RESULTS', icon: 'fa-chart-simple' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 z-[100] animate-fadeIn">
      <div className="max-w-[1400px] mx-auto h-full px-8 grid grid-cols-3 items-center">
        
        {/* Left: Logo */}
        <div className="flex items-center justify-start">
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => isFacultyView ? onExitFaculty() : onNavigate(AppStage.HUB)}
          >
            <div className="w-10 h-10 bg-[#0EA5A4] rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-[#0EA5A4]/20 group-hover:scale-105 transition-transform">H</div>
          </div>
        </div>

        {/* Center: Centered Pill Navigation */}
        <div className="flex justify-center">
          {!isFacultyView ? (
            <nav className="flex items-center gap-1 bg-[#F8FAFC] p-1.5 rounded-2xl border border-slate-100/50 shadow-inner">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !locked && onNavigate(tab.id)}
                  disabled={locked && tab.id !== AppStage.VERDICT}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                    currentStage === tab.id 
                      ? 'nav-tab-active' 
                      : 'text-slate-400 hover:text-[#5832D8]'
                  } ${locked && tab.id !== AppStage.VERDICT ? 'opacity-20 cursor-not-allowed' : ''}`}
                >
                  <i className={`fas ${tab.icon} text-[11px]`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          ) : (
            <div className="text-[10px] font-black text-[#5832D8] uppercase tracking-[0.4em] px-8 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              Faculty Intelligence Terminal
            </div>
          )}
        </div>

        {/* Right: User Identity & Control */}
        <div className="flex items-center justify-end gap-5">
          <div className="hidden sm:block text-right">
            <div className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{user.name.toUpperCase()}</div>
            <div className="text-[8px] font-black text-[#0EA5A4] uppercase tracking-[0.2em] flex items-center justify-end gap-1.5 mt-0.5">
               ACTIVE SYNC
               <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full shadow-[0_0_5px_#22C55E]"></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate(AppStage.PROFILE)}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 border border-slate-100 hover:border-[#5832D8] hover:text-[#5832D8] transition-all shadow-sm"
            >
              <i className="fas fa-user text-xs"></i>
            </button>
            <button 
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 border border-slate-100 hover:border-rose-500 hover:text-rose-500 transition-all shadow-sm"
            >
              <i className="fas fa-power-off text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
