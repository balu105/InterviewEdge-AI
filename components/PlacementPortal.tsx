
import React, { useState } from 'react';
import { User, AssessmentRecord } from '../types';
import { supabase } from '../services/supabaseClient';
import { checkPortalAdminStatus, registerPortalAdmin } from '../services/databaseService';

interface PlacementPortalProps {
  user: User;
  history: AssessmentRecord[];
  onBack: () => void;
  onFacultyEnter: () => void;
}

export const PlacementPortal: React.FC<PlacementPortalProps> = ({ user, history, onBack, onFacultyEnter }) => {
  const [authMode, setAuthMode] = useState<'CHOICE' | 'ADMIN_LOGIN' | 'ADMIN_REGISTER' | 'VERIFYING'>('CHOICE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'ADMIN_REGISTER') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error("Authentication failed");

        await registerPortalAdmin({
          userId: authData.user.id,
          name: adminName,
          department,
          designation
        });
        
        setAuthMode('ADMIN_LOGIN');
        alert("Registration successful. Please login with your credentials.");
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        
        if (authData.user) {
          // ISOLATION SECURITY CHECK:
          // Check if this user ID is NOT in the admin table.
          const adminStatus = await checkPortalAdminStatus(authData.user.id);
          
          if (!adminStatus) {
            // Force sign out because this is a Student account trying to enter the Director portal
            await supabase.auth.signOut();
            throw new Error("ACCESS DENIED: You are logged in as a Student. Student accounts are not permitted to access the Placement Intelligence Console.");
          }

          setAuthMode('VERIFYING');
          setTimeout(() => onFacultyEnter(), 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
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
          <div className="glass-card p-12 rounded-[3rem] border border-white space-y-8 flex flex-col justify-between group hover:border-indigo-200 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                <i className="fas fa-user-graduate text-xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Portfolio</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Access your verified professional credentials and placement readiness certificate.</p>
            </div>
            <button 
              onClick={() => { setAuthMode('VERIFYING'); setTimeout(() => onBack(), 1000); }}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
            >
              Verify My Identity
            </button>
          </div>

          <div className="glass-card p-12 rounded-[3rem] border border-white space-y-8 flex flex-col justify-between group hover:border-indigo-400 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <i className="fas fa-crown text-xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Console</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Secure access for Placement Officers, Directors, and authorized academic staff.</p>
            </div>
            <button 
              onClick={() => setAuthMode('ADMIN_LOGIN')}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing Institutional Intelligence Core</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 pt-10 pb-20 animate-fadeIn">
      <button onClick={() => setAuthMode('CHOICE')} className="mb-10 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors">
        <i className="fas fa-arrow-left"></i> Back to Selection
      </button>

      <div className="glass-card p-10 md:p-14 rounded-[3.5rem] border border-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
          {authMode === 'ADMIN_LOGIN' ? 'Officer Login' : 'Register Admin'}
        </h2>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Institutional Access Domain</p>

        <form onSubmit={handleAdminAuth} className="space-y-6">
          {authMode === 'ADMIN_REGISTER' && (
            <div className="space-y-4">
              <input 
                type="text" placeholder="Full Professional Name" required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none"
                value={adminName} onChange={e => setAdminName(e.target.value)}
              />
              <select 
                required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none"
                value={department} onChange={e => setDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                <option value="Placement Cell">Placement Cell</option>
                <option value="CSE Department">CSE Department</option>
                <option value="ECE Department">ECE Department</option>
                <option value="Director Office">Director Office</option>
              </select>
              <input 
                type="text" placeholder="Designation (e.g. Training Officer)" required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none"
                value={designation} onChange={e => setDesignation(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-4">
            <input 
              type="email" placeholder="Official Email" required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Access Password" required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rose-100 text-center animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            {authMode === 'ADMIN_LOGIN' ? 'Authorize Access' : 'Register Officer'}
          </button>

          <button 
            type="button"
            onClick={() => setAuthMode(authMode === 'ADMIN_LOGIN' ? 'ADMIN_REGISTER' : 'ADMIN_LOGIN')}
            className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            {authMode === 'ADMIN_LOGIN' ? "Request Admin Credentials" : "I have an admin account"}
          </button>
        </form>
      </div>
    </div>
  );
};
