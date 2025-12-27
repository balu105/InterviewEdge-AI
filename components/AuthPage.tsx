
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setStatusMsg("Authenticating...");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        onSuccess({
          name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || "Candidate",
          email: data.user.email || "",
          joinedDate: new Date(data.user.created_at).toLocaleDateString()
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMsg("Email and Password are required.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setStatusMsg("Provisioning Database Record...");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name || email.split('@')[0]
          }
        }
      });
      if (error) throw error;
      
      if (data.user && data.session) {
        // If email confirmation is off, we get a session immediately
        onSuccess({
          name: data.user.user_metadata?.display_name || name,
          email: data.user.email || "",
          joinedDate: new Date(data.user.created_at).toLocaleDateString()
        });
      } else {
        alert("Verification email sent to " + email + ". Click the link in your inbox to store the user permanently in the DB.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Performs a live DB operation as requested
  const handleProvisionRequestedUser = async () => {
    const devEmail = 'balajikc89@gmail.com';
    const devPassword = 'balu123@';
    const devName = 'K C balaji';

    setLoading(true);
    setErrorMsg(null);
    setStatusMsg("Syncing with Global Database...");

    try {
      // 1. Try to register first
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: { data: { display_name: devName } }
      });

      // 2. If already exists, just log in
      if (signUpError && signUpError.message.includes('already registered')) {
        setStatusMsg("User exists. Synchronizing session...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword
        });
        
        if (signInError) throw signInError;
        
        if (signInData.user) {
          onSuccess({
            name: signInData.user.user_metadata?.display_name || devName,
            email: signInData.user.email || devEmail,
            joinedDate: new Date(signInData.user.created_at).toLocaleDateString()
          });
        }
      } else if (signUpError) {
        throw signUpError;
      } else {
        // Successfully created
        setStatusMsg("Database Provisioning Complete.");
        if (signUpData.session) {
            onSuccess({
                name: devName,
                email: devEmail,
                joinedDate: new Date().toLocaleDateString()
            });
        } else {
            alert("Account created for K C balaji. Please check your email to verify and complete DB storage.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] flex flex-col items-center pt-24 px-4 animate-fadeIn">
      <button 
        onClick={onBack}
        className="absolute top-12 left-12 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-all active:scale-95"
      >
        <i className="fas fa-arrow-left text-xs"></i> Back to Terminal
      </button>

      <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-[0_20px_50px_rgba(99,102,241,0.3)]">
        <i className="fas fa-robot text-4xl"></i>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Cloud Gateway</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Supabase Node Synchronized</span>
        </div>
      </div>

      <div className="w-full max-w-[480px] bg-[#141721] p-12 rounded-[40px] shadow-2xl border border-white/5 relative overflow-hidden">
        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name (New Accounts)</label>
            <input
              type="text"
              placeholder="e.g. K C balaji"
              className="w-full px-6 py-4 bg-[#0c0e14] border border-white/5 rounded-2xl focus:border-indigo-600 outline-none text-white transition-all text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Endpoint</label>
            <input
              type="email"
              placeholder="id@hireai.io"
              required
              className="w-full px-6 py-4 bg-[#0c0e14] border border-white/5 rounded-2xl focus:border-indigo-600 outline-none text-white transition-all text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Token</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-6 py-4 bg-[#0c0e14] border border-white/5 rounded-2xl focus:border-indigo-600 outline-none text-white transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {statusMsg && !errorMsg && <p className="text-indigo-400 text-[10px] font-black uppercase text-center animate-pulse">{statusMsg}</p>}
          {errorMsg && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{errorMsg}</p>}

          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Execute Login'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-white/5 text-slate-400 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
            >
              Deploy Account (Sign Up)
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <button 
            onClick={handleProvisionRequestedUser}
            disabled={loading}
            className="group flex flex-col items-center gap-2 mx-auto"
          >
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
              <i className="fas fa-database mr-2"></i> Provision Requested Profile
            </span>
            <span className="text-[8px] font-bold text-slate-800 italic">balajikc89@gmail.com</span>
          </button>
        </div>
      </div>
    </div>
  );
};
