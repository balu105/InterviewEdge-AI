
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { checkPortalAdminStatus, updateUserProfile } from '../services/databaseService';
import './AuthPage.css';

interface AuthProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      if (isLogin) {
        // --- STUDENT LOGIN FLOW ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          // ROLE GATE: Prevent Placement Officers from entering via Student portal
          const isAdmin = await checkPortalAdminStatus(data.user.id);
          if (isAdmin) {
            await supabase.auth.signOut();
            throw new Error("ROLE CONFLICT: This account is registered as Faculty. Please use the Institutional Entry Portal.");
          }

          const meta = data.user.user_metadata;
          onSuccess({
            id: data.user.id,
            name: meta?.display_name || data.user.email?.split('@')[0] || "User",
            email: data.user.email || "",
            joinedDate: new Date(data.user.created_at).toLocaleDateString(),
            college: meta?.college,
            department: meta?.department,
            rollNumber: meta?.rollNumber,
            graduationYear: meta?.graduationYear
          });
        }
      } else {
        // --- STUDENT REGISTRATION FLOW ---
        if (!name || !college || !department || !rollNumber || !graduationYear) {
          throw new Error("All institutional profile fields are required for verification.");
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              display_name: name,
              role: 'student',
              college,
              department,
              rollNumber,
              graduationYear
            } 
          }
        });
        
        if (error) throw error;
        
        if (data.user && data.session) {
          onSuccess({
            id: data.user.id,
            name: name,
            email: data.user.email || "",
            joinedDate: new Date(data.user.created_at).toLocaleDateString(),
            college,
            department,
            rollNumber,
            graduationYear
          });
        } else {
          setErrorMsg("Success! Please confirm your identity via the link sent to your institutional email.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication protocols failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fadeIn relative z-10 overflow-hidden">
      
      <div className={`w-full ${isLogin ? 'max-w-[440px]' : 'max-w-[700px]'} celestial-auth-card p-10 md:p-12 relative transition-all duration-500`}>
        
        {/* Brand Logo Box */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[#5832D8] rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-black shadow-[0_0_20px_rgba(88,50,216,0.4)]">
            H
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLogin ? 'Student Login' : 'Student Onboarding'}
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            {isLogin ? 'Sync with the HireAI Intelligence Hub' : 'Register your institutional profile for assessment'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleAuth}>
          <div className={`grid grid-cols-1 ${isLogin ? '' : 'md:grid-cols-2'} gap-6`}>
            
            {/* Core Credentials */}
            <div className="space-y-6">
               {!isLogin && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Full Legal Name</label>
                  <input
                    type="text" required
                    className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
                    placeholder="John Doe"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Institutional Email</label>
                <input
                  type="email" required
                  className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
                  placeholder="student@college.edu"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Secret Key (Password)</label>
                <input
                  type="password" required
                  className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Academic Information (Visible only on Register) */}
            {!isLogin && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">University / College</label>
                  <input
                    type="text" required
                    className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
                    placeholder="State Engineering College"
                    value={college} onChange={(e) => setCollege(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Department / Branch</label>
                  <select 
                    required
                    className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white appearance-none"
                    value={department} onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="" className="bg-slate-900">Select Branch</option>
                    <option value="CSE" className="bg-slate-900">Computer Science</option>
                    <option value="IT" className="bg-slate-900">Information Technology</option>
                    <option value="ECE" className="bg-slate-900">Electronics & Comm.</option>
                    <option value="MECH" className="bg-slate-900">Mechanical Eng.</option>
                    <option value="EEE" className="bg-slate-900">Electrical Eng.</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Roll Number</label>
                    <input
                      type="text" required
                      className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
                      placeholder="e.g. 22G31A..."
                      value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Graduation Year</label>
                    <input
                      type="number" required min="2020" max="2030"
                      className="celestial-input w-full px-5 py-4 outline-none transition-all text-sm font-medium text-white"
                      placeholder="2026"
                      value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="celestial-error-box p-4 rounded-xl flex items-center justify-center gap-3 animate-shake">
              <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[8px] text-white">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <span className="text-[11px] font-medium text-white opacity-80 leading-relaxed text-center">{errorMsg}</span>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="celestial-auth-btn w-full py-4.5 rounded-2xl font-bold text-sm tracking-wide text-white uppercase transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin mr-3"></i> : null}
              {isLogin ? 'Establish Link' : 'Register Profile'}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center space-y-6">
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-slate-500 font-medium">
              {isLogin ? "Not in our registry?" : "Already initialized?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
                className="ml-2 text-[#1D7BFF] font-bold hover:underline underline-offset-4"
              >
                {isLogin ? 'Onboard Now' : 'Login instead'}
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
