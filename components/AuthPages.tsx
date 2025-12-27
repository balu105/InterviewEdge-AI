
import React, { useState } from 'react';
import { AppStage, User } from '../types';

interface AuthProps {
  type: 'LOGIN' | 'REGISTER';
  onSuccess: (user: User) => void;
  onSwitch: (stage: AppStage) => void;
}

export const AuthPage: React.FC<AuthProps> = ({ type, onSuccess, onSwitch }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate standard API call
    setTimeout(() => {
      onSuccess({
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        joinedDate: new Date().toLocaleDateString()
      });
      setLoading(false);
    }, 1200);
  };

  const handleGoogleAuth = () => {
    setSocialLoading(true);
    // Simulate Google OAuth flow
    setTimeout(() => {
      onSuccess({
        name: "Alex Thompson",
        email: "alex.t@google.com",
        avatar: "https://i.pravatar.cc/150?u=alex",
        joinedDate: new Date().toLocaleDateString(),
        college: "Global Tech University"
      });
      setSocialLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fadeInUp">
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-3xl rounded-full"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/20 transition-transform hover:scale-110">
            <i className={`fas ${type === 'LOGIN' ? 'fa-shield-halved' : 'fa-user-plus'} text-2xl`}></i>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">
            {type === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {type === 'LOGIN' ? 'Resume your preparation mission' : 'Join the elite talent network'}
          </p>
        </div>

        <div className="space-y-4 relative z-10">
          {/* Google Social Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={socialLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 glass-card border-white/10 rounded-2xl font-bold text-slate-200 hover:bg-white/5 transition-all glow-border disabled:opacity-50"
          >
            {socialLoading ? (
              <i className="fas fa-circle-notch fa-spin text-indigo-400"></i>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span className="text-sm">
              {type === 'LOGIN' ? 'Sign in with Google' : 'Sign up with Google'}
            </span>
          </button>

          {/* Separator */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'REGISTER' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text" required
                  className="w-full px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-white placeholder:text-slate-700 text-sm"
                  placeholder="Student Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal Email</label>
              <input
                type="email" required
                className="w-full px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-white placeholder:text-slate-700 text-sm"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <input
                type="password" required
                className="w-full px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-white placeholder:text-slate-700 text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || socialLoading}
              className="w-full bg-indigo-600 text-white py-4 mt-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className={`fas ${type === 'LOGIN' ? 'fa-right-to-bracket' : 'fa-paper-plane'}`}></i>
              )}
              {type === 'LOGIN' ? 'CONTINUE TO ARENA' : 'DEPLOY ACCOUNT'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center relative z-10">
          <p className="text-slate-500 text-xs font-medium">
            {type === 'LOGIN' ? "Don't have access?" : "Already verified?"}
            <button 
              onClick={() => onSwitch(type === 'LOGIN' ? AppStage.REGISTER : AppStage.LOGIN)}
              className="ml-2 text-indigo-400 font-black hover:text-indigo-300 transition-colors uppercase tracking-widest text-[10px]"
            >
              {type === 'LOGIN' ? 'Apply Now' : 'Terminal Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
