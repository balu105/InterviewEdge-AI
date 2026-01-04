
import React from 'react';

interface RoleTrackSelectionProps {
  onSelect: (role: string) => void;
}

export const RoleTrackSelection: React.FC<RoleTrackSelectionProps> = ({ onSelect }) => {
  const tracks = [
    { id: 'JAVA', label: 'Java Developer', desc: 'Enterprise ecosystems, Spring Boot architecture, and high-performance backend systems.', icon: 'fa-coffee', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
    { id: 'PYTHON', label: 'Python Developer', desc: 'Neural engineering, data pipelines, and scalable microservice integration.', icon: 'fa-microchip', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { id: 'DATA', label: 'Data Analysis', desc: 'Advanced analytics, SQL modeling, and predictive intelligence frameworks.', icon: 'fa-chart-line', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
    { id: 'MERN', label: 'MERN Stack Developer', desc: 'High-fidelity full-stack applications with React, Node, and modern cloud stacks.', icon: 'fa-cubes', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 text-center animate-fadeIn">
      <div className="mb-20 space-y-4">
        <div className="inline-block px-4 py-2 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] border border-indigo-100">
          Target Calibration
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">Choose Your Path</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
          Select a core industry track to calibrate the AI assessment engine to specific professional standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {tracks.map((track) => (
          <div 
            key={track.id} 
            className="glass-card p-10 md:p-14 text-left group cursor-pointer hover:translate-y-[-8px] transition-all rounded-[3.5rem]" 
            onClick={() => onSelect(track.label)}
          >
            <div className="relative z-10 space-y-8">
              <div className={`w-16 h-16 ${track.bg} ${track.color} rounded-[1.5rem] flex items-center justify-center border-2 ${track.border} shadow-sm group-hover:scale-110 transition-transform`}>
                <i className={`fas ${track.icon} text-2xl`}></i>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{track.label}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{track.desc}</p>
              </div>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Configure Protocol
                <i className="fas fa-arrow-right text-[8px]"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <button className="px-10 py-5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-3 mx-auto">
          <i className="fas fa-plus"></i> Define Custom Deployment Role
        </button>
      </div>
    </div>
  );
};
