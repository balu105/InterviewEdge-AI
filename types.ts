
export enum AppStage {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  PROJECT_DETAILS = 'PROJECT_DETAILS',
  HUB = 'HUB',
  TARGET = 'TARGET',
  RESUME = 'RESUME',
  FORGE = 'FORGE',
  INTERVIEW = 'INTERVIEW',
  VERDICT = 'VERDICT',
  PLACEMENT_OFFICE = 'PLACEMENT_OFFICE',
  PROFILE = 'PROFILE'
}

export type PlacementStatus = 
  | 'RESUME_READY' 
  | 'CODING_QUALIFIED' 
  | 'INTERVIEW_READY' 
  | 'SHORTLISTED' 
  | 'OFFERED' 
  | 'PLACED' 
  | 'IDLE';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  joinedDate: string;
  college?: string;
  department?: string;
  phone?: string;
  rollNumber?: string;
  graduationYear?: string;
}

export interface ResumeAnalysisResult {
  skills: string[];
  missingSkills: string[];
  score: number;
  suggestions: string[];
  education: string;
  experience: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  problemStatement: string;
  constraints: string[];
  exampleInput: string;
  exampleOutput: string;
  topic: 'Strings' | 'Arrays' | 'Stack' | 'Queues' | 'Linked Lists';
  boilerplate: string;
}

export interface MockInterviewTurn {
  role: 'interviewer' | 'student';
  content: string;
}

export interface ReadinessScore {
  overall: number;
  resume: number;
  technical: number;
  communication: number;
  feedback: string;
  methodologyNote: string;
  isEligible: boolean;
  behavioralTraits?: string[];
}

export interface AssessmentRecord {
  id: string;
  user_id: string;
  target_role: string;
  overall_score: number;
  technical_score: number;
  resume_score?: number;
  communication_score?: number;
  created_at: string;
  integrity_breach: boolean;
  feedback?: string;
  placement_status?: PlacementStatus;
  user_email?: string; 
  user_name?: string;  
  user_dept?: string;  
  behavioralTraits?: string[];
}
