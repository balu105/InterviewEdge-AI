
import React from 'react';
import { AppStage, User } from '../types';

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

  const studentTabs = [
    { id: AppStage.HUB, label: 'HUB', icon: 'fa-house' },
    { id: AppStage.TARGET, label: 'TRACKS', icon: 'fa-crosshairs' },
    { id: AppStage.FORGE, label: 'FORGE', icon: 'fa-microchip' },
    { id: AppStage.INTERVIEW, label: 'INTERVIEW', icon: 'fa-headset' },
    { id: AppStage.VERDICT, label: 'VERDICT', icon: 'fa-shield-halved' },
  ];

  return (
    <header className="fixed top-2 sm:top-6 left-1/2 -translate-x-1/2 w-[98%] max-w-[1400px] z-50">
      <div className="glass-panel rounded-full h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between border-slate-200 shadow-lg bg-white/80 backdrop-blur-xl">
        
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => isFacultyView ? onExitFaculty() : onNavigate(AppStage.HUB)}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs sm:text-sm font-black italic shadow-lg shadow-indigo-200">H</div>
          <div className="hidden md:block">
            <div className="text-[10px] font-black tracking-widest uppercase text-slate-900">HireAI</div>
            <div className="text-[6px] font-bold text-slate-400 tracking-[0.3em] uppercase">
              {isFacultyView ? 'Intelligence Console' : 'Enterprise Suite'}
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        {!isFacultyView ? (
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200 max-w-fit overflow-x-auto no-scrollbar mx-4">
            {studentTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !locked && onNavigate(tab.id)}
                disabled={locked && tab.id !== AppStage.VERDICT}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[9px] font-black transition-all tracking-widest uppercase whitespace-nowrap ${
                  currentStage === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                } ${locked && tab.id !== AppStage.VERDICT ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <i className={`fas ${tab.icon} text-[10px]`}></i>
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        ) : (
          <div className="flex items-center gap-2 bg-indigo-50 px-6 py-2 rounded-full border border-indigo-100">
             <i className="fas fa-crown text-[10px] text-indigo-600"></i>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Director Level Authorization Active</span>
          </div>
        )}

        {/* Right Info Section */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-200">
            
            {/* Profile link - Only for students/non-faculty view */}
            {!isFacultyView && (
              <div 
                className="flex items-center gap-2 group cursor-pointer" 
                onClick={() => onNavigate(AppStage.PROFILE)}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">
                    {user.name.split(' ')[0]}
                  </div>
                  <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Student Profile</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase group-hover:border-indigo-400 group-hover:bg-white transition-all">
                  {user.name.charAt(0)}
                </div>
              </div>
            )}

            {isFacultyView && (
              <button 
                onClick={onExitFaculty}
                className="hidden sm:flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all"
              >
                <i className="fas fa-arrow-right-from-bracket"></i>
                Exit Portal
              </button>
            )}

            <button 
              onClick={onLogout}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors border border-slate-200 shadow-sm"
              title="Logout session"
            >
              <i className="fas fa-power-off text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
