
import React, { useState, useEffect, useMemo } from 'react';
import { getAllAssessments } from '../services/databaseService';
import { AssessmentRecord } from '../types';

export const PlacementOfficerDashboard: React.FC = () => {
  const [data, setData] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          user_email: item.user_email || 'N/A'
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

  // Ranking calculation helper
  const getRank = (score: number) => {
    const sortedScores = [...data].map(d => d.overall_score).sort((a, b) => b - a);
    const position = sortedScores.indexOf(score) + 1;
    const percentile = Math.round(((data.length - position) / data.length) * 100);
    return { position, percentile };
  };

  const stats = useMemo(() => {
    const total = data.length;
    const ready = data.filter(c => c.overall_score >= 70 && !c.integrity_breach).length;
    const atRisk = data.filter(c => c.integrity_breach || (c.overall_score !== undefined && c.overall_score < 40)).length;
    return { total, ready, atRisk, readinessRate: total ? Math.round((ready / total) * 100) : 0 };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-60">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Syncing Intelligence Core</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-10 space-y-12 animate-fadeIn">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl">
            <i className="fas fa-tower-broadcast text-2xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Placement Intelligence</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Director Console • Unified Candidate Registry</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-10 relative z-10 px-10 border-l border-slate-100 hidden xl:grid">
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Talent</div>
            <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hire Ready</div>
            <div className="text-2xl font-black text-emerald-600">{stats.ready}</div>
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cohort Yield</div>
            <div className="text-2xl font-black text-indigo-600">{stats.readinessRate}%</div>
          </div>
        </div>
      </div>

      {/* Controller Bar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <i className="fas fa-magnifying-glass absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search candidate identity, role, or department..."
            className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold outline-none focus:border-indigo-600 shadow-sm transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-10 py-6 bg-white border border-slate-100 rounded-[2rem] text-[13px] font-bold outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm appearance-none text-slate-700 min-w-[280px]"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
      </div>

      {/* Main Registry Table */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Identity</th>
                <th className="px-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness Index</th>
                <th className="px-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain Metrics</th>
                <th className="px-12 py-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((c) => {
                const isExpanded = expandedId === c.id;
                const rankInfo = getRank(c.overall_score);

                return (
                  <React.Fragment key={c.id}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className={`group cursor-pointer transition-all ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm border ${isExpanded ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-400 border-slate-100 group-hover:border-indigo-200 group-hover:text-indigo-600'}`}>
                            {c.user_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-lg font-black text-slate-900 tracking-tight">{c.user_name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {c.user_dept} • {c.target_role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-6">
                          <div className="text-2xl font-black text-slate-900">{c.overall_score}%</div>
                          <div className="flex-1 max-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${c.overall_score}%` }}></div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${c.overall_score > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                             Rank #{rankInfo.position}
                          </span>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                         <div className="flex gap-4">
                            <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                               <div className="text-[8px] font-black text-slate-400 uppercase">Resume</div>
                               <div className="text-xs font-black text-slate-900">{c.resume_score}%</div>
                            </div>
                            <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                               <div className="text-[8px] font-black text-slate-400 uppercase">Forge</div>
                               <div className="text-xs font-black text-slate-900">{c.technical_score}%</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex flex-col items-end gap-2">
                           <div className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${c.integrity_breach ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {c.integrity_breach ? 'Security Alert' : 'Verified Secure'}
                           </div>
                           <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                             {new Date(c.created_at).toLocaleDateString()}
                           </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Drill-down */}
                    {isExpanded && (
                      <tr className="bg-slate-50/40">
                        <td colSpan={4} className="px-12 py-12 animate-fadeIn">
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                              
                              {/* Resume Section */}
                              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                 <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resume Audit</h4>
                                    <i className="fas fa-file-invoice text-indigo-400"></i>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="text-3xl font-black text-slate-900">{c.resume_score}% <span className="text-[10px] text-slate-400 font-bold ml-2">Affinity</span></div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Candidate demonstrates high competency in primary technical stack with moderate alignment for {c.target_role}.</p>
                                 </div>
                                 <div className="pt-4 border-t border-slate-50 space-y-3">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Behavioral Insight</div>
                                    <div className="flex flex-wrap gap-2">
                                       {(c as any).behavioralTraits?.map((t: string) => (
                                         <span key={t} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-bold uppercase">{t}</span>
                                       ))}
                                    </div>
                                 </div>
                              </div>

                              {/* Technical Forge Section */}
                              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                 <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical Forge</h4>
                                    <i className="fas fa-microchip text-sky-400"></i>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="text-3xl font-black text-slate-900">{c.technical_score}% <span className="text-[10px] text-slate-400 font-bold ml-2">Logic Rating</span></div>
                                    <div className="flex gap-4">
                                       <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                          <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Comm. Clarity</div>
                                          <div className="text-sm font-black text-indigo-600">{c.communication_score}%</div>
                                       </div>
                                       <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                          <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Global Percentile</div>
                                          <div className="text-sm font-black text-sky-600">{rankInfo.percentile}th</div>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="pt-4 border-t border-slate-50">
                                    <button className="w-full py-4 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-all rounded-xl border border-indigo-100">
                                       View Session Transcript
                                    </button>
                                 </div>
                              </div>

                              {/* Director's Verdict Section */}
                              <div className="bg-[#1E293B] p-10 rounded-[2.5rem] text-white space-y-8 relative overflow-hidden shadow-2xl">
                                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                 <div className="flex justify-between items-center relative z-10">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Verdict</h4>
                                    <i className="fas fa-shield-halved text-indigo-400"></i>
                                 </div>
                                 <div className="space-y-4 relative z-10">
                                    <div className="text-[11px] font-medium leading-relaxed italic text-slate-300">
                                       "{c.feedback?.substring(0, 180)}..."
                                    </div>
                                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                       <div>
                                          <div className="text-[9px] font-black text-slate-500 uppercase">Deployment Ready</div>
                                          <div className={`text-sm font-black ${c.overall_score > 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {c.overall_score > 70 ? 'VERIFIED' : 'CALIBRATION REQ.'}
                                          </div>
                                       </div>
                                       <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">
                                          Contact Student
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-12 py-32 text-center">
                    <div className="text-slate-300 text-5xl mb-6 opacity-20"><i className="fas fa-folder-open"></i></div>
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching records found in the vault</div>
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
