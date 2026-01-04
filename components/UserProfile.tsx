
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
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fadeIn space-y-10 pb-32">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-32 h-32 bg-[#F8FAFC] rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl text-4xl font-black text-indigo-600">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{user.name}</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{user.email}</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                Verified Student
              </span>
              {latestAssessment?.overall_score > 70 && (
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  Job Ready
                </span>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
        >
          {isEditing ? 'Cancel Edit' : 'Modify Credentials'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Placement Details Card */}
        <div className="lg:col-span-2 glass-card p-10 md:p-14 rounded-[3.5rem] border-white shadow-2xl space-y-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <i className="fas fa-university"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Legal Name</label>
              <input 
                type="text" 
                disabled={!isEditing}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all disabled:opacity-70"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">University/College</label>
              <input 
                type="text" 
                disabled={!isEditing}
                placeholder="Institute of Technology"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all disabled:opacity-70"
                value={formData.college || ''}
                onChange={e => setFormData({...formData, college: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</label>
              <select 
                disabled={!isEditing}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all appearance-none disabled:opacity-70"
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
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Roll / ID Number</label>
              <input 
                type="text" 
                disabled={!isEditing}
                placeholder="UG-2024-XXX"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all disabled:opacity-70"
                value={formData.rollNumber || ''}
                onChange={e => setFormData({...formData, rollNumber: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Graduation Year</label>
              <input 
                type="text" 
                disabled={!isEditing}
                placeholder="2025"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all disabled:opacity-70"
                value={formData.graduationYear || ''}
                onChange={e => setFormData({...formData, graduationYear: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Primary</label>
              <input 
                type="tel" 
                disabled={!isEditing}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 transition-all disabled:opacity-70"
                value={formData.phone || ''}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-8">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Syncing Profile...' : 'Finalize Credentials'}
              </button>
            </div>
          )}
        </div>

        {/* Career Summary Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-10 rounded-[3.5rem] border-white shadow-xl space-y-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Placement Snapshot</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Accuracy</span>
                <span className="text-sm font-black text-indigo-600">{latestAssessment?.overall_score || 0}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tech Rating</span>
                <span className="text-sm font-black text-slate-900">{latestAssessment?.technical_score || 0}/100</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                  {latestAssessment ? 'ACTIVE PIPELINE' : 'PENDING ASSESSMENT'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] p-10 rounded-[3.5rem] shadow-2xl text-white space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <h3 className="text-lg font-black tracking-tight relative z-10">Director Note</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed italic relative z-10">
              "Your profile data is directly synchronized with the Placement Officer's dashboard. Ensure accuracy in Roll Number and Phone for recruitment coordination."
            </p>
            <div className="pt-4 flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-[10px]">
                 <i className="fas fa-lock-alt"></i>
               </div>
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Encrypted Data Stream v4.2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
