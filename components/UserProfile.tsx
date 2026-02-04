import React, { useState } from 'react';
import { User, AssessmentRecord } from '../types';
import { updateUserProfile } from '../services/databaseService';

interface UserProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  history: AssessmentRecord[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate, history }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user.id) {
        await updateUserProfile(user.id, formData);
        onUpdate(formData);
        setIsEditing(false);
      }
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const latestAssessment = history[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fadeIn space-y-12 pb-32">
      {/* Profile Header */}
      <div className="glass-card p-12 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-900/60">
        <div className="flex items-center gap-10">
          <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl text-5xl font-black text-indigo-400">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-white tracking-tighter">{user.name}</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] italic">{user.email}</p>
            <div className="flex items-center gap-3">
              <span className="px-5 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                Verified Candidate
              </span>
              {latestAssessment?.overall_score > 70 && (
                <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Market Ready
                </span>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-12 py-5 bg-slate-800 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-xl active:scale-95"
        >
          {isEditing ? 'Cancel Edit' : 'Modify Credentials'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-12 rounded-[4rem] space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <i className="fas fa-id-card text-xl"></i>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Institutional Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { label: 'Full Legal Name', key: 'name', type: 'text' },
              { label: 'University/College', key: 'college', type: 'text' },
              { label: 'Roll / ID Number', key: 'rollNumber', type: 'text' },
              { label: 'Graduation Year', key: 'graduationYear', type: 'text' },
              { label: 'Contact Primary', key: 'phone', type: 'tel' }
            ].map(field => (
              <div key={field.key} className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                <input 
                  type={field.type} 
                  disabled={!isEditing}
                  className="w-full px-8 py-5 bg-slate-950 border border-white/5 rounded-2xl font-bold text-slate-100 outline-none focus:border-indigo-500 transition-all disabled:opacity-50 shadow-inner"
                  value={(formData as any)[field.key] || ''}
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                />
              </div>
            ))}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
              <select 
                disabled={!isEditing}
                className="w-full px-8 py-5 bg-slate-950 border border-white/5 rounded-2xl font-bold text-slate-100 outline-none focus:border-indigo-500 transition-all disabled:opacity-50 shadow-inner appearance-none"
                value={formData.department || ''}
                onChange={e => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">Electronics</option>
                <option value="MECH">Mechanical</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-crystal w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl mt-4"
            >
              {saving ? 'Syncing...' : 'Save Profile Metadata'}
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-12 rounded-[3.5rem] space-y-10">
            <h3 className="text-xl font-black text-white tracking-tight">Status Snapshot</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master IQ</span>
                <span className="text-lg font-black text-indigo-400">{latestAssessment?.overall_score || 0}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tech Rating</span>
                <span className="text-lg font-black text-white">{latestAssessment?.technical_score || 0}/100</span>
              </div>
            </div>
            <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-center leading-relaxed italic">
              All data is proctored and verified by institutional admins
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};