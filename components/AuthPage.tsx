import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { checkPortalAdminStatus } from '../services/databaseService';
import './AuthPage.css';

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          const isAdmin = await checkPortalAdminStatus(data.user.id);
          if (isAdmin) {
            await supabase.auth.signOut();
            throw new Error("Placement Director console access restricted.");
          }

          onSuccess({
            name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || "User",
            email: data.user.email || "",
            joinedDate: new Date(data.user.created_at).toLocaleDateString()
          });
        }
      } else {
        if (!name) throw new Error("Full name required.");
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
          setErrorMsg("Verification required. Please check your inbox.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication protocols failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fadeIn relative z-10 overflow-hidden">
      
      <div className="w-full max-w-[440px] celestial-auth-card p-10 md:p-12 relative">
        
        {/* Brand Logo Box */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[#5832D8] rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-black shadow-[0_0_20px_rgba(88,50,216,0.4)]">
            H
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            {isLogin ? 'Log in to your account' : 'Sign up to get started'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Full Name</label>
              <input
                type="text"
                required={!isLogin}
                className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
                placeholder="yourname@example.com"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Email</label>
            <input
              type="email"
              required
              className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Password</label>
            <input
              type="password"
              required
              className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="celestial-error-box p-4 rounded-xl flex items-center justify-center gap-3 animate-shake">
              <div className="w-4 h-4 rounded-full bg-orange-600 flex items-center justify-center text-[8px]">
                <i className="fas fa-check"></i>
              </div>
              <span className="text-[11px] font-medium text-white opacity-80">{errorMsg}</span>
            </div>
          )}

          {!isLogin && (
            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" className="celestial-checkbox" id="terms" required />
              <label htmlFor="terms" className="text-xs text-slate-400 font-medium cursor-pointer">
                I agree to the <span className="text-orange-500">Terms & Conditions</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="celestial-auth-btn w-full py-4.5 rounded-2xl font-bold text-sm tracking-wide text-white uppercase transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (isLogin ? 'Login' : 'Sign up')}
          </button>
        </form>

        <div className="mt-12 text-center space-y-6">
          {isLogin ? (
            <button className="text-sm font-medium text-[#1D7BFF] hover:underline underline-offset-4 opacity-90">
              Forgot password?
            </button>
          ) : null}
          
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-slate-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
                className="ml-2 text-[#1D7BFF] font-bold hover:underline underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        {/* Subtle Back Link */}
        <div className="mt-8 text-center">
           <button 
             onClick={onBack}
             className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-all"
           >
             Return to Matrix
           </button>
        </div>
      </div>
    </div>
  );
};