import React, { useState, useEffect, useMemo } from 'react';
import { getAllAssessments } from '../services/databaseService';
import { AssessmentRecord, InterventionStatus } from '../types';

export const PlacementOfficerDashboard: React.FC = () => {
  const [data, setData] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Scheduling Modal State
  const [schedulingCandidate, setSchedulingCandidate] = useState<AssessmentRecord | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assessments = await getAllAssessments();
        const enhancedData = (assessments || []).map((item: any) => ({
          ...item,
          placement_status: item.overall_score > 85 ? 'SHORTLISTED' : 
                           item.overall_score > 70 ? 'INTERVIEW_READY' : 
                           item.technical_score > 60 ? 'CODING_QUALIFIED' : 'RESUME_READY',
          user_dept: item.user_dept || 'General',
          user_name: item.user_name || `Candidate ${item.user_id?.substring(0, 4).toUpperCase() || 'ID'}`,
          user_email: item.user_email || 'N/A',
          intervention_status: item.intervention_status || 'NONE',
          last_contacted: item.last_contacted || null
        }));
        setData(enhancedData);
      } catch (err) {
        console.error("Director Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const departments = useMemo(() => ['All Departments', ...new Set(data.map(d => d.user_dept || 'General'))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(c => {
      const nameMatch = c.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = c.target_role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || roleMatch;
      const matchesDept = selectedDept === 'All Departments' || c.user_dept === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [data, searchTerm, selectedDept]);

  const handleStatusUpdate = (id: string, status: InterventionStatus) => {
    const now = new Date().toISOString();
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, intervention_status: status, last_contacted: now } : item
    ));
    console.log(`Updated candidate ${id} to ${status} at ${now}`);
  };

  const handleConfirmSchedule = () => {
    if (!schedulingCandidate || !scheduleDate || !scheduleTime) return;
    
    handleStatusUpdate(schedulingCandidate.id, 'SCHEDULED');
    alert(`Mock Interview confirmed for ${schedulingCandidate.user_name} on ${scheduleDate} at ${scheduleTime}. Notification vectors dispatched.`);
    
    setSchedulingCandidate(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  const getRank = (score: number) => {
    const sortedScores = [...data].map(d => d.overall_score).sort((a, b) => b - a);
    const position = sortedScores.indexOf(score) + 1;
    return { position };
  };

  const stats = useMemo(() => {
    const total = data.length;
    const ready = data.filter(c => c.overall_score >= 70 && !c.integrity_breach).length;
    return { total, ready, readinessRate: total ? Math.round((ready / total) * 100) : 0 };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-60">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-6">Syncing Intelligence Core</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-10 space-y-12 animate-fadeIn">
      
      {/* Scheduling Modal */}
      {schedulingCandidate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-10 rounded-[3rem] border border-white/10 shadow-2xl animate-fadeIn space-y-8 bg-slate-900">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter">Schedule Session</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidate: {schedulingCandidate.user_name}</p>
              </div>
              <button onClick={() => setSchedulingCandidate(null)} className="text-slate-500 hover:text-white transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Calibration Date</label>
                <input 
                  type="date" 
                  className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Neural Sync Time</label>
                <input 
                  type="time" 
                  className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setSchedulingCandidate(null)}
                className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-slate-750 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleConfirmSchedule}
                disabled={!scheduleDate || !scheduleTime}
                className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-30"
              >
                Confirm Vector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl">
            <i className="fas fa-tower-broadcast text-2xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Placement Intelligence</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Director Console • Unified Registry</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-10 px-10 border-l border-white/5 hidden xl:grid">
          <div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Talent</div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Hire Ready</div>
            <div className="text-2xl font-black text-emerald-400">{stats.ready}</div>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Yield</div>
            <div className="text-2xl font-black text-indigo-400">{stats.readinessRate}%</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <i className="fas fa-magnifying-glass absolute left-8 top-1/2 -translate-y-1/2 text-slate-600"></i>
          <input 
            type="text" 
            placeholder="Search candidate, role, or department..."
            className="w-full pl-16 pr-8 py-6 bg-slate-900/40 border border-white/5 rounded-[2rem] text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-10 py-6 bg-slate-900/40 border border-white/5 rounded-[2rem] text-[13px] font-bold text-white outline-none cursor-pointer hover:bg-slate-800 transition-all appearance-none min-w-[280px]"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map(dept => <option key={dept} value={dept} className="bg-slate-900">{dept}</option>)}
        </select>
      </div>

      {/* Registry Table */}
      <div className="bg-slate-900/40 rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-white/5">
                <th className="px-8 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidate Identity</th>
                <th className="px-8 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Intervention Status</th>
                <th className="px-8 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Readiness Index</th>
                <th className="px-8 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Contacted</th>
                <th className="px-8 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((c) => {
                const isExpanded = expandedId === c.id;
                const rankInfo = getRank(c.overall_score);

                return (
                  <React.Fragment key={c.id}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className={`group cursor-pointer transition-all ${isExpanded ? 'bg-indigo-500/10' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-8 py-10">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border ${isExpanded ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-500 border-white/5 group-hover:border-indigo-500/30'}`}>
                            {c.user_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-lg font-black text-white tracking-tight">{c.user_name}</div>
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                              {c.user_dept} • {c.target_role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-10">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          c.intervention_status === 'NONE' ? 'bg-slate-800/50 text-slate-500 border-white/5' :
                          c.intervention_status === 'SCHEDULED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          c.intervention_status === 'CONTACTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                             c.intervention_status === 'NONE' ? 'bg-slate-600' :
                             c.intervention_status === 'SCHEDULED' ? 'bg-indigo-500 animate-pulse' :
                             c.intervention_status === 'CONTACTED' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}></span>
                          {c.intervention_status}
                        </div>
                      </td>
                      <td className="px-8 py-10">
                        <div className="flex items-center gap-6">
                          <div className="text-2xl font-black text-white">{c.overall_score}%</div>
                          <div className="flex-1 max-w-[100px] h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600" style={{ width: `${c.overall_score}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-10 text-sm font-medium text-slate-400">
                        {c.last_contacted ? new Date(c.last_contacted).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-8 py-10 text-right">
                        <div className={`inline-block px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.integrity_breach ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                          {c.integrity_breach ? 'BREACHED' : 'SECURE'}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-950/40">
                        <td colSpan={5} className="px-12 py-12 animate-fadeIn border-b border-white/5">
                           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                              
                              <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fas fa-file-invoice text-indigo-400"></i> Audit Sync
                                 </h4>
                                 <div className="space-y-4">
                                    <div className="text-2xl font-black text-white">{c.resume_score}% Alignment</div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Domain verified for {c.target_role}.</p>
                                 </div>
                              </div>

                              <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fas fa-microchip text-sky-400"></i> Performance
                                 </h4>
                                 <div className="space-y-4">
                                    <div className="text-2xl font-black text-white">{c.technical_score}% Logic</div>
                                    <div className="flex gap-2">
                                       <div className="flex-1 p-3 bg-slate-950 rounded-xl text-center border border-white/5">
                                          <div className="text-[8px] font-black text-slate-600 uppercase">Comm</div>
                                          <div className="text-xs font-black text-indigo-400">{c.communication_score}%</div>
                                       </div>
                                       <div className="flex-1 p-3 bg-slate-950 rounded-xl text-center border border-white/5">
                                          <div className="text-[8px] font-black text-slate-600 uppercase">Rank</div>
                                          <div className="text-xs font-black text-sky-400">#{rankInfo.position}</div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Intervention Controls */}
                              <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fas fa-sliders text-indigo-400"></i> Intervention Console
                                 </h4>
                                 <div className="grid grid-cols-1 gap-3">
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); setSchedulingCandidate(c); }}
                                       className="flex items-center justify-between px-5 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                                    >
                                       Schedule Mock Interview
                                       <i className="fas fa-calendar-plus"></i>
                                    </button>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleStatusUpdate(c.id, 'CONTACTED')}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-800 text-slate-300 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5"
                                      >
                                        Contacted
                                      </button>
                                      <button 
                                        onClick={() => handleStatusUpdate(c.id, 'RE-ASSESS')}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-800 text-rose-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5"
                                      >
                                        Re-Assess
                                      </button>
                                    </div>
                                 </div>
                              </div>

                              <div className="bg-slate-800/60 p-8 rounded-[2.5rem] text-white space-y-6 border border-white/10">
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Director Verdict</h4>
                                 <p className="text-[11px] font-medium leading-relaxed italic text-slate-300">
                                    "{c.feedback?.substring(0, 150)}..."
                                 </p>
                                 <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                                    Full Transcript
                                 </button>
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
