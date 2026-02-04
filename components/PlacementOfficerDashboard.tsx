
import React, { useState, useEffect, useMemo } from 'react';
import { getAllAssessments, updateAssessmentIntervention } from '../services/databaseService';
import { AssessmentRecord, InterventionStatus } from '../types';

export const PlacementOfficerDashboard: React.FC = () => {
  const [data, setData] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Scheduling Modal State
  const [schedulingCandidate, setSchedulingCandidate] = useState<AssessmentRecord | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

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

  useEffect(() => {
    fetchData();
  }, []);

  const departments = useMemo(() => ['All Departments', ...new Set(data.map(d => d.user_dept || 'General'))], [data]);

  const filteredAndSortedData = useMemo(() => {
    let result = data.filter(c => {
      const nameMatch = c.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = c.target_role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || roleMatch;
      const matchesDept = selectedDept === 'All Departments' || c.user_dept === selectedDept;
      return matchesSearch && matchesDept;
    });

    if (sortBy === 'score') {
      result.sort((a, b) => b.overall_score - a.overall_score);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [data, searchTerm, selectedDept, sortBy]);

  const handleStatusUpdate = async (id: string, status: InterventionStatus) => {
    try {
      await updateAssessmentIntervention(id, status);
      // Refresh local data
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, intervention_status: status, last_contacted: new Date().toISOString() } : item
      ));
    } catch (err) {
      alert("Database sync failed. Please check your network or permissions.");
    }
  };

  const handleConfirmSchedule = async () => {
    if (!schedulingCandidate || !scheduleDate || !scheduleTime) return;
    await handleStatusUpdate(schedulingCandidate.id, 'SCHEDULED');
    alert(`Mock Interview confirmed for ${schedulingCandidate.user_name} on ${scheduleDate} at ${scheduleTime}. Notification vectors dispatched.`);
    setSchedulingCandidate(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  const stats = useMemo(() => {
    const total = data.length;
    const ready = data.filter(c => c.overall_score >= 70 && !c.integrity_breach).length;
    const flagged = data.filter(c => c.integrity_breach).length;
    return { total, ready, flagged, readinessRate: total ? Math.round((ready / total) * 100) : 0 };
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
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-10 space-y-10 animate-fadeIn">
      
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
                <input type="date" className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Neural Sync Time</label>
                <input type="time" className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setSchedulingCandidate(null)} className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-slate-750 transition-all">Abort</button>
              <button onClick={handleConfirmSchedule} disabled={!scheduleDate || !scheduleTime} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-30">Confirm Vector</button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Registry', val: stats.total, icon: 'fa-users', color: 'text-white' },
          { label: 'Verified Ready', val: stats.ready, icon: 'fa-certificate', color: 'text-emerald-400' },
          { label: 'Yield Efficiency', val: `${stats.readinessRate}%`, icon: 'fa-chart-pie', color: 'text-indigo-400' },
          { label: 'Integrity Alerts', val: stats.flagged, icon: 'fa-triangle-exclamation', color: 'text-rose-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-xl backdrop-blur-md flex items-center justify-between group hover:border-white/10 transition-all">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.val}</h3>
             </div>
             <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                <i className={`fas ${stat.icon}`}></i>
             </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="relative flex-1">
          <i className="fas fa-magnifying-glass absolute left-8 top-1/2 -translate-y-1/2 text-slate-600"></i>
          <input 
            type="text" 
            placeholder="Search by name, role, or ID..."
            className="w-full pl-16 pr-8 py-6 bg-slate-900/40 border border-white/5 rounded-[2rem] text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-10 py-6 bg-slate-900/40 border border-white/5 rounded-[2rem] text-[13px] font-bold text-white outline-none cursor-pointer hover:bg-slate-800 transition-all appearance-none min-w-[240px]"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => <option key={dept} value={dept} className="bg-slate-900">{dept}</option>)}
          </select>
          <button 
            onClick={() => setSortBy(sortBy === 'score' ? 'date' : 'score')}
            className="px-8 py-6 bg-slate-900/40 border border-white/5 rounded-[2rem] text-[11px] font-black text-indigo-400 uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3"
          >
            <i className={`fas ${sortBy === 'score' ? 'fa-sort-amount-down' : 'fa-calendar-days'}`}></i>
            Sort by {sortBy === 'score' ? 'Readiness' : 'Recency'}
          </button>
        </div>
      </div>

      {/* Talent Intelligence Grid */}
      <div className="bg-slate-900/40 rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-white/5">
                <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidate Profile</th>
                <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Tech Logic</th>
                <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Readiness IQ</th>
                <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Intervention</th>
                <th className="px-10 py-10 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedData.length > 0 ? filteredAndSortedData.map((c) => {
                const isExpanded = expandedId === c.id;
                const isMarketReady = c.overall_score >= 80;

                return (
                  <React.Fragment key={c.id}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className={`group cursor-pointer transition-all ${isExpanded ? 'bg-indigo-500/10' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border ${isExpanded ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-500 border-white/5 group-hover:border-indigo-500/30'}`}>
                            {c.user_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                              {c.user_name}
                              {isMarketReady && <i className="fas fa-check-circle text-emerald-400 text-sm"></i>}
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                              {c.user_dept} • {c.target_role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                         <div className="inline-flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-xl border border-white/5">
                            <span className="text-lg font-black text-indigo-400">{c.technical_score}%</span>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500" style={{ width: `${c.technical_score}%` }}></div>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <div className={`text-2xl font-black ${isMarketReady ? 'text-emerald-400' : 'text-white'} tracking-tighter`}>
                          {c.overall_score}<span className="text-sm opacity-40 ml-0.5">%</span>
                        </div>
                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">
                          {isMarketReady ? 'High Potential' : 'Developing'}
                        </div>
                      </td>
                      <td className="px-10 py-10">
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
                      <td className="px-10 py-10 text-right">
                        <div className={`inline-block px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          c.integrity_breach 
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          <i className={`fas ${c.integrity_breach ? 'fa-triangle-exclamation' : 'fa-shield-halved'} mr-2`}></i>
                          {c.integrity_breach ? 'Flagged Breach' : 'Protocol Secure'}
                        </div>
                      </td>
                    </tr>

                    {/* Intelligence Insight Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-950/60 border-b border-white/5">
                        <td colSpan={5} className="px-12 py-16 animate-fadeIn">
                           <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                              
                              <div className="space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fas fa-microchip text-indigo-400"></i> Competency Map
                                 </h4>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-900 rounded-3xl border border-white/5 space-y-1">
                                       <p className="text-[8px] font-black text-slate-500 uppercase">Resume Audit</p>
                                       <p className="text-xl font-black text-white">{c.resume_score}%</p>
                                    </div>
                                    <div className="p-5 bg-slate-900 rounded-3xl border border-white/5 space-y-1">
                                       <p className="text-[8px] font-black text-slate-500 uppercase">Comm. Index</p>
                                       <p className="text-xl font-black text-indigo-400">{c.communication_score}%</p>
                                    </div>
                                 </div>
                                 <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                                       <span>Market Fit</span>
                                       <span className="text-indigo-400">Optimal</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                       <div className="h-full bg-indigo-500" style={{ width: '85%' }}></div>
                                    </div>
                                 </div>
                              </div>

                              <div className="lg:col-span-2 space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fas fa-quote-left text-sky-400"></i> AI Disposition Summary
                                 </h4>
                                 <div className="p-8 bg-slate-900/80 rounded-[2.5rem] border border-white/5 relative overflow-hidden h-full">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-6xl font-black italic pointer-events-none">AI LOG</div>
                                    <p className="text-slate-300 text-sm font-medium leading-relaxed italic relative z-10">
                                       "{c.feedback || 'The assessment module has analyzed the technical and behavioral vectors for this candidate. Key findings suggest a strong alignment with core role parameters with minor optimization needed in architectural communication.'}"
                                    </p>
                                    <div className="mt-8 flex gap-4">
                                       <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">View Full Transcript</button>
                                       <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">Export JSON Report</button>
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <i className="fas fa-bolt text-rose-400"></i> Rapid Intervention
                                 </h4>
                                 <div className="flex flex-col gap-3">
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); setSchedulingCandidate(c); }}
                                       className="w-full flex items-center justify-between px-6 py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                                    >
                                       Schedule Calibration
                                       <i className="fas fa-calendar-plus"></i>
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                      <button 
                                        onClick={() => handleStatusUpdate(c.id, 'CONTACTED')}
                                        className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-800 text-slate-400 rounded-[1.5rem] border border-white/5 hover:text-white transition-all"
                                      >
                                        <i className="fas fa-envelope text-sm"></i>
                                        <span className="text-[8px] font-black uppercase">Contact</span>
                                      </button>
                                      <button 
                                        onClick={() => handleStatusUpdate(c.id, 'RE-ASSESS')}
                                        className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-800 text-slate-400 rounded-[1.5rem] border border-white/5 hover:text-rose-400 transition-all"
                                      >
                                        <i className="fas fa-rotate-right text-sm"></i>
                                        <span className="text-[8px] font-black uppercase">Reset</span>
                                      </button>
                                    </div>
                                    <div className="p-4 bg-slate-950/60 rounded-2xl text-[9px] font-bold text-slate-600 flex justify-between items-center italic">
                                       <span>Session Date:</span>
                                       <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                 </div>
                              </div>

                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="space-y-4 opacity-20">
                      <i className="fas fa-database text-6xl"></i>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">No matching neural records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
