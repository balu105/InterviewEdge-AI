
import React, { useState } from 'react';
import { User, AssessmentRecord } from '../types';
import { supabase } from '../services/supabaseClient';
import { checkPortalAdminStatus } from '../services/databaseService';

interface PlacementPortalProps {
  user: User | null;
  history: AssessmentRecord[];
  onBack: () => void;
  onFacultyEnter: () => void;
}

export const PlacementPortal: React.FC<PlacementPortalProps> = ({ user, onBack, onFacultyEnter }) => {
  const [authMode, setAuthMode] = useState<'CHOICE' | 'ADMIN_LOGIN' | 'VERIFYING'>('CHOICE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Standard Supabase Login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      if (authData.user) {
        // Step 2: Strict Role Verification against the placement_portal_admins table
        const adminStatus = await checkPortalAdminStatus(authData.user.id);
        
        if (!adminStatus) {
          // Failure: Sign out immediately if they are not authorized faculty
          await supabase.auth.signOut();
          throw new Error("UNAUTHORIZED ACCESS: You are not registered in the Faculty Intelligence Registry. Please contact the administrator.");
        }

        // Success: Proceed to faculty dashboard
        setAuthMode('VERIFYING');
        setTimeout(() => onFacultyEnter(), 1500);
      }
    } catch (err: any) {
      setError(err.message || "Institutional authentication protocols failed.");
    } finally {
      setLoading(false);
    }
  };

  if (authMode === 'CHOICE') {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 animate-fadeIn">
        <div className="text-center mb-16 space-y-4">
          <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-2xl border-4 border-white mb-6">
            <i className="fas fa-university text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Institutional Entry Portal</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Secure Verification Required</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-12 rounded-[3rem] border border-white space-y-8 flex flex-col justify-between group hover:border-indigo-200 transition-all bg-white/60">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                <i className="fas fa-user-graduate text-xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Hub</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Access your professional portfolio and readiness certifications.</p>
            </div>
            <button 
              onClick={() => onBack()}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all"
            >
              Verify Identity
            </button>
          </div>

          <div className="glass-card p-12 rounded-[3rem] border border-white space-y-8 flex flex-col justify-between group hover:border-indigo-400 transition-all bg-white/60">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <i className="fas fa-user-shield text-xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Console</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Encrypted portal for Placement Officers and institutional leadership.</p>
            </div>
            <button 
              onClick={() => setAuthMode('ADMIN_LOGIN')}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
            >
              Officer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authMode === 'VERIFYING') {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-40 text-center space-y-12">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
          <div className="absolute inset-0 border-t-8 border-indigo-600 rounded-full animate-spin"></div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Decrypting Vault</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing Institutional Core</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 pt-10 pb-20 animate-fadeIn">
      <button onClick={() => setAuthMode('CHOICE')} className="mb-10 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors">
        <i className="fas fa-arrow-left"></i> Back to Selection
      </button>

      <div className="glass-card p-10 md:p-14 rounded-[3.5rem] border border-white shadow-2xl relative overflow-hidden bg-white/80">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Officer Auth</h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Access Domain</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
             <i className="fas fa-lock"></i>
          </div>
        </div>

        <form onSubmit={handleAdminAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <input 
                type="email" placeholder="officer@university.edu" required
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none shadow-inner"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
              <input 
                type="password" placeholder="••••••••" required
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none shadow-inner"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rose-100 leading-relaxed text-center animate-shake">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" disabled={loading}
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin mr-3"></i> : null}
              Authorize Access
            </button>
          </div>

          <div className="text-center py-4">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
               Authorized Personnel Only • Audit Logging Active
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};
