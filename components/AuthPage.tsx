
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { checkPortalAdminStatus } from '../services/databaseService';

interface AuthProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setStatusMsg(isLogin ? "Signing you in..." : "Creating your profile...");
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          // ISOLATION SECURITY CHECK:
          // Check if this ID exists in the Placement Admin table.
          const isAdmin = await checkPortalAdminStatus(data.user.id);
          
          if (isAdmin) {
            // Force sign out because this is a Director account trying to enter Student Hub
            await supabase.auth.signOut();
            throw new Error("ACCESS DENIED: This is a Placement Director account. Please log in via the Institutional Placement Portal instead.");
          }

          onSuccess({
            name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || "Candidate",
            email: data.user.email || "",
            joinedDate: new Date(data.user.created_at).toLocaleDateString()
          });
        }
      } else {
        if (!name) throw new Error("Full name is required to create an account.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } }
        });
        if (error) throw error;
        if (data.user && data.session) {
          onSuccess({
            name: name,
            email: data.user.email || "",
            joinedDate: new Date(data.user.created_at).toLocaleDateString()
          });
        } else {
          setStatusMsg("Verification email sent. Please check your inbox.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
      setStatusMsg(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start px-4 sm:px-6 pt-6 sm:pt-12 animate-fadeIn">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-all active:scale-95 group"
      >
        <i className="fas fa-arrow-left text-[8px] group-hover:-translate-x-1 transition-transform"></i> 
        Back to Home
      </button>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[440px] glass-card p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/80">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-sky-400 to-indigo-500"></div>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-sm">
            <i className={`fas ${isLogin ? 'fa-user' : 'fa-user-plus'} text-2xl`}></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
            {isLogin ? 'Student Login' : 'Student Signup'}
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            {isLogin ? 'HireAI Student Infrastructure' : 'Join the candidate pool'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2 animate-fadeInDown">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Alex Johnson"
                required={!isLogin}
                className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none text-slate-900 transition-all text-sm placeholder:text-slate-300 shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              placeholder="alex@example.com"
              required
              className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none text-slate-900 transition-all text-sm placeholder:text-slate-300 shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none text-slate-900 transition-all text-sm placeholder:text-slate-300 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {statusMsg && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-pulse">
              <p className="text-indigo-600 text-[9px] font-black uppercase text-center tracking-widest">{statusMsg}</p>
            </div>
          )}
          
          {errorMsg && (
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 animate-shake">
              <p className="text-rose-500 text-[9px] font-black uppercase text-center tracking-widest">{errorMsg}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-crystal w-full py-5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg"
            >
              {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
              {isLogin ? 'Authorize Student' : 'Create Profile'}
            </button>
            
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setStatusMsg(null); }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          End-to-end encrypted connection
        </p>
      </div>
    </div>
  );
};
