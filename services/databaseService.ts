
import { supabase } from './supabaseClient';
import { ResumeAnalysisResult, ReadinessScore, CodingChallenge, User } from '../types';

/**
 * Checks if a user is an authorized placement portal admin.
 */
export const checkPortalAdminStatus = async (userId: string) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('placement_portal_admins')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) return null;
  return data;
};

/**
 * Registers a new Placement Portal Admin.
 */
export const registerPortalAdmin = async (adminData: { 
  userId: string, 
  name: string, 
  department: string, 
  designation: string 
}) => {
  const { data, error } = await supabase
    .from('placement_portal_admins')
    .insert({
      user_id: adminData.userId,
      full_name: adminData.name,
      department: adminData.department,
      designation: adminData.designation
    });
  
  if (error) throw error;
  return data;
};

/**
 * Saves or updates user profile metadata.
 */
export const updateUserProfile = async (userId: string, profile: Partial<User>) => {
  if (!userId) return null;
  
  const { data, error } = await supabase.auth.updateUser({
    data: { 
      college: profile.college,
      department: profile.department,
      phone: profile.phone,
      rollNumber: profile.rollNumber,
      graduationYear: profile.graduationYear,
      display_name: profile.name
    }
  });

  if (error) throw error;
  return data;
};

/**
 * Saves or updates resume analysis results.
 */
export const saveResumeData = async (userId: string, role: string, result: ResumeAnalysisResult) => {
  if (!userId) return null;
  
  const payload = {
    user_id: userId,
    target_role: role,
    skills: result.skills,
    missing_skills: result.missingSkills,
    score: Math.round(result.score || 0),
    suggestions: result.suggestions,
    education: result.education,
    experience: result.experience,
    updated_at: new Date().toISOString()
  };

  try {
    const { data: existing, error: checkError } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      const { data, error } = await supabase
        .from('resumes')
        .update(payload)
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('resumes')
        .insert(payload);
      if (error) throw error;
      return data;
    }
  } catch (error: any) {
    console.error("Resilient Sync Failed (Resume):", error.message || error);
    throw error;
  }
};

/**
 * Saves the entire session result.
 */
export const saveFinalVerdict = async (
  userId: string, 
  role: string, 
  verdict: ReadinessScore, 
  transcript: string, 
  challenges: CodingChallenge[], 
  submissions: Record<string, string>,
  cheated: boolean
) => {
  if (!userId) return null;

  const { data: { user } } = await supabase.auth.getUser();
  const meta = user?.user_metadata;

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      user_name: meta?.display_name || user?.email?.split('@')[0] || 'Candidate',
      user_email: user?.email,
      user_dept: meta?.department || 'General',
      target_role: role,
      overall_score: Math.round(verdict.overall || 0),
      resume_score: Math.round(verdict.resume || 0),
      technical_score: Math.round(verdict.technical || 0),
      communication_score: Math.round(verdict.communication || 0),
      feedback: verdict.feedback,
      interview_transcript: transcript,
      integrity_breach: cheated,
      coding_challenges: challenges,
      user_code_submissions: submissions,
      created_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
};

export const getUserHistory = async (userId: string) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllAssessments = async () => {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
