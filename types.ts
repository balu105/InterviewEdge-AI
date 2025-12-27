
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
  VERDICT = 'VERDICT'
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  joinedDate: string;
  college?: string;
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
}

export interface AssessmentRecord {
  id: string;
  target_role: string;
  overall_score: number;
  technical_score: number;
  created_at: string;
  integrity_breach: boolean;
}
