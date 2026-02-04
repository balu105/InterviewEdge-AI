import React from 'react';
import './RoleTrackSelection.css';

interface RoleTrackSelectionProps {
  onSelect: (role: string) => void;
}

export const RoleTrackSelection: React.FC<RoleTrackSelectionProps> = ({ onSelect }) => {
  const tracks = [
    { 
      id: 'JAVA', 
      label: 'Java Developer', 
      desc: 'Enterprise ecosystems, Spring Boot architecture, and high-performance backend systems.', 
      icon: 'fa-mug-hot', 
      color: '#F43F5E', 
      bg: 'rgba(244, 63, 94, 0.05)', 
      border: 'rgba(244, 63, 94, 0.1)' 
    },
    { 
      id: 'PYTHON', 
      label: 'Python Developer', 
      desc: 'Neural engineering, data pipelines, and scalable microservice integration.', 
      icon: 'fa-microchip', 
      color: '#6366F1', 
      bg: 'rgba(99, 102, 241, 0.05)', 
      border: 'rgba(99, 102, 241, 0.1)' 
    },
    { 
      id: 'DATA', 
      label: 'Data Analysis', 
      desc: 'Advanced analytics, SQL modeling, and predictive intelligence frameworks.', 
      icon: 'fa-chart-line', 
      color: '#0EA5E9', 
      bg: 'rgba(14, 165, 233, 0.05)', 
      border: 'rgba(14, 165, 233, 0.1)' 
    },
    { 
      id: 'MERN', 
      label: 'MERN Stack Developer', 
      desc: 'High-fidelity full-stack applications with React, Node, and modern cloud stacks.', 
      icon: 'fa-cubes', 
      color: '#10B981', 
      bg: 'rgba(16, 185, 129, 0.05)', 
      border: 'rgba(16, 185, 129, 0.1)' 
    },
  ];

  return (
    <div className="track-theme-container min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-32 animate-fadeIn">
        
        {/* Header Section */}
        <div className="text-center mb-24 space-y-6">
          <div className="inline-flex items-center px-6 py-2 bg-[#EEF2FF] rounded-full text-[9px] font-black text-[#6366F1] uppercase tracking-[0.4em] border border-[#6366F1]/10">
            Target Calibration
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#1E293B] tracking-tighter">Choose Your Path</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed text-sm">
            Select a core industry track to calibrate the AI assessment engine to specific professional standards.
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tracks.map((track) => (
            <div 
              key={track.id} 
              className="track-card p-12 rounded-[2.5rem] bg-white border border-white shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative group cursor-pointer transition-all duration-500 hover:translate-y-[-8px] hover:shadow-[0_25px_60px_rgba(0,0,0,0.04)]" 
              onClick={() => onSelect(track.label)}
            >
              <div className="space-y-8 relative z-10">
                {/* Icon Box */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-transform duration-500 group-hover:scale-110" 
                  style={{ backgroundColor: track.bg, borderColor: track.border, color: track.color }}
                >
                  <i className={`fas ${track.icon}`}></i>
                </div>
                
                {/* Text Content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-[#1E293B] tracking-tight">{track.label}</h3>
                  <p className="text-slate-400 text-[13px] font-medium leading-relaxed">
                    {track.desc}
                  </p>
                </div>
                
                {/* Action Link */}
                <div className="flex justify-between items-center pt-2">
                  <button className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                    Configure Protocols
                    <span className="text-sm font-normal">›</span>
                  </button>
                  <span className="text-slate-200 text-sm group-hover:translate-x-1 group-hover:text-[#6366F1] transition-all">→</span>
                </div>
              </div>

              {/* Decorative Subtle Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="mt-20 flex justify-center">
          <button className="px-10 py-4 bg-white/60 backdrop-blur-md border border-white rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-[0_5px_20px_rgba(0,0,0,0.02)] hover:text-[#6366F1] hover:border-[#6366F1]/20 transition-all flex items-center gap-3 active:scale-95">
            <span className="text-lg font-normal">+</span>
            Define Custom Deployment Role
          </button>
        </div>

      </div>
    </div>
  );
};