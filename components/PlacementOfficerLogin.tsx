
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { checkPortalAdminStatus } from '../services/databaseService';
import './AuthPage.css'; // Reusing celestial base styles

interface Props {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const PlacementOfficerLogin: React.FC<Props> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Core Auth Handshake
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Strict Institutional Role Gate
        // Verify user exists in placement_portal_admins table
        const adminData = await checkPortalAdminStatus(authData.user.id);
        
        if (!adminData) {
          await supabase.auth.signOut();
          throw new Error("UNAUTHORIZED: Your account is not registered in the Faculty Intelligence Registry. Access Denied.");
        }

        // 3. Success
        onSuccess({
          id: authData.user.id,
          name: adminData.full_name || "Placement Officer",
          email: authData.user.email || "",
          joinedDate: new Date(authData.user.created_at).toLocaleDateString(),
          department: adminData.department
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Institutional authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fadeIn relative z-10">
      <div className="w-full max-w-[440px] celestial-auth-card p-10 md:p-12 relative border-indigo-500/30">
        
        {/* Faculty Badge Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[#1e1b4b] rounded-[1.25rem] border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl font-black shadow-2xl">
            <i className="fas fa-user-shield"></i>
          </div>
        </div>

        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Officer Login</h2>
          <p className="text-slate-500 font-medium text-sm">
            Institutional Control Domain • Faculty Portal
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleFacultyLogin}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
            <input
              type="email" required
              className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
              placeholder="officer@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
            <input
              type="password" required
              className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="celestial-error-box p-4 rounded-xl flex items-center justify-center gap-3 animate-shake">
              <i className="fas fa-exclamation-triangle text-rose-500 text-xs"></i>
              <span className="text-[11px] font-medium text-white opacity-80">{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 rounded-2xl font-black text-xs tracking-[0.2em] text-white uppercase transition-all shadow-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Authorize Access'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
           <button 
             onClick={onBack}
             className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-all"
           >
             Return to Landing
           </button>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">
             Authorized Personnel Only • Audit Logging Active
           </p>
        </div>
      </div>
    </div>
  );
};
