
import React from 'react';
import { AppStage, User } from '../types';

interface HeaderProps {
  currentStage: AppStage;
  user: User | null;
  onNavigate: (stage: AppStage) => void;
  onLogout: () => void;
  locked: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentStage, user, onNavigate, onLogout, locked }) => {
  if (!user) return null;

  const tabs = [
    { id: AppStage.HUB, label: 'HUB', icon: 'fa-house' },
    { id: AppStage.TARGET, label: 'TARGET', icon: 'fa-crosshairs' },
    { id: AppStage.RESUME, label: 'SCAN', icon: 'fa-fingerprint' },
    { id: AppStage.FORGE, label: 'FORGE', icon: 'fa-microchip' },
    { id: AppStage.INTERVIEW, label: 'ARENA', icon: 'fa-headset' },
    { id: AppStage.VERDICT, label: 'VERDICT', icon: 'fa-shield-halved' },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[1400px] z-50">
      <div className="glass-panel rounded-2xl h-16 px-6 flex items-center justify-between">
        {/* Brand Group */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate(AppStage.HUB)}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-indigo-600/30">
            H
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-black tracking-tighter leading-none text-white glow-text">HireAI</div>
            <div className="text-[8px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">Enterprise Kernel</div>
          </div>
        </div>

        {/* Navigation - Ultra Slim Tabs */}
        <nav className="hidden md:flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest ${
                currentStage === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className={`fas ${tab.icon} text-[10px]`}></i>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Gating Status */}
        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
            <div className={`w-1.5 h-1.5 rounded-full ${locked ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 glow-indigo'}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${locked ? 'text-rose-400' : 'text-emerald-400'}`}>
              {locked ? 'KERNEL LOCKED' : 'KERNEL ACTIVE'}
            </span>
          </div>

          <div className="flex items-center gap-3 pl-5 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-slate-300 overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-500 hover:text-rose-500 transition-colors"
            >
              <i className="fas fa-power-off text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
