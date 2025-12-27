
import React from 'react';

interface RoleTrackSelectionProps {
  onSelect: (role: string) => void;
}

export const RoleTrackSelection: React.FC<RoleTrackSelectionProps> = ({ onSelect }) => {
  const tracks = [
    { id: 'JAVA', label: 'Java Developer', desc: 'Enterprise-grade applications, Spring Boot microservices, and robust backend architecture.', icon: 'fa-coffee', color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 'PYTHON', label: 'Python Developer', desc: 'Scalable scripting, Django web frameworks, automation, and backend integration.', icon: 'fa-plus', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'DATA', label: 'Data Analysis', desc: 'SQL-driven insights, data visualization, statistical modeling, and business intelligence.', icon: 'fa-magnifying-glass', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'MERN', label: 'MERN Stack Developer', desc: 'Full-stack mastery of MongoDB, Express, React, and Node.js for modern web apps.', icon: 'fa-cubes', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-24 px-6 text-center animate-fadeInUp">
      <div className="mb-16">
        <div className="inline-block px-4 py-2 bg-indigo-500/10 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 border border-indigo-500/20">
          Phase 01: Targeting Calibration
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Select Your Career Path</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Choose one of the core industry tracks to calibrate your AI assessment engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {tracks.map((track) => (
          <div key={track.id} className="gating-card p-12 text-left relative overflow-hidden group cursor-pointer" onClick={() => onSelect(track.label)}>
            <div className="relative z-10">
              <div className={`w-14 h-14 ${track.bg} ${track.color} rounded-2xl flex items-center justify-center mb-10 border border-white/5 shadow-xl`}>
                <i className={`fas ${track.icon} text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{track.label}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{track.desc}</p>
              <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-white transition-colors">
                Configure Assessment
                <i className="fas fa-arrow-right text-[8px]"></i>
              </button>
            </div>
            {/* Ambient light effect */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>

      <button className="px-10 py-5 bg-[#141721] border border-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 mx-auto shadow-xl">
        <i className="fas fa-plus"></i> Define Custom Industrial Role
      </button>
    </div>
  );
};
