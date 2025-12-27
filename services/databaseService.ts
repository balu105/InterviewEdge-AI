
import { supabase } from './supabaseClient';
import { ResumeAnalysisResult, ReadinessScore, CodingChallenge } from '../types';

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
    score: Math.round(result.score || 0), // Ensure integer for DB
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
 * Saves the entire session result including transcript and code.
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

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
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

  if (error) {
    console.error("Supabase INSERT Error (Full Session):", JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
};

export const getUserHistory = async (userId: string) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase SELECT Error:", error.message || error);
    throw error;
  }
  return data;
};
