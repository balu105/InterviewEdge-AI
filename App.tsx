
import React, { useState, useEffect } from 'react';
import { AppStage, User, ResumeAnalysisResult, ReadinessScore, CodingChallenge, AssessmentRecord } from './types';
import { Header } from './components/Header';
import { AuthPage } from './components/AuthPage';
import { HubDashboard } from './components/HubDashboard';
import { RoleTrackSelection } from './components/RoleTrackSelection';
import { ResumeBenchmarking } from './components/ResumeBenchmarking';
import { TechnicalAssessment } from './components/TechnicalAssessment';
import { MockInterview } from './components/MockInterview';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { ProjectAbout } from './components/ProjectAbout';
import { analyzeResume, evaluateFinalReadiness } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { saveResumeData, saveFinalVerdict, getUserHistory } from './services/databaseService';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.LANDING);
  const [user, setUser] = useState<User | null>(null);
  
  // Data State
  const [targetRole, setTargetRole] = useState('');
  const [resumeResults, setResumeResults] = useState<ResumeAnalysisResult | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentRecord[]>([]);
  
  // Technical Phase State
  const [technicalScore, setTechnicalScore] = useState<number>(0);
  const [hasCheated, setHasCheated] = useState(false);
  const [codingChallenges, setCodingChallenges] = useState<CodingChallenge[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Record<string, string>>({});

  // Final Results State
  const [finalScore, setFinalScore] = useState<ReadinessScore | null>(null);
  const [interviewTranscript, setInterviewTranscript] = useState<string>('');
  
  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedStages, setUnlockedStages] = useState<Set<AppStage>>(new Set([AppStage.HUB, AppStage.TARGET]));

  // Restore session from Supabase on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || "User",
          email: session.user.email || "",
          joinedDate: new Date(session.user.created_at).toLocaleDateString()
        });
        setStage(AppStage.HUB);
      }
    });
  }, []);

  // Re-fetch history whenever we hit the Hub
  useEffect(() => {
    if (user && stage === AppStage.HUB) {
      const loadHistory = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          try {
            const history = await getUserHistory(authUser.id);
            setAssessmentHistory(history);
          } catch (e) {
            console.error("History fetch failed", e);
          }
        }
      };
      loadHistory();
    }
  }, [user, stage]);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setStage(AppStage.HUB);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStage(AppStage.LANDING);
    setUnlockedStages(new Set([AppStage.HUB, AppStage.TARGET]));
    setResumeResults(null);
    setFinalScore(null);
    setError(null);
    setHasCheated(false);
  };

  const handleRoleSelect = (role: string) => {
    setTargetRole(role);
    setUnlockedStages(prev => new Set(prev).add(AppStage.RESUME));
    setStage(AppStage.RESUME);
    setError(null);
  };

  const handleResumeAnalysis = async (text: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const results = await analyzeResume(text, targetRole);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        try {
          await saveResumeData(authUser.id, targetRole, results);
        } catch (dbErr: any) {
          console.error("Database Sync Error:", dbErr);
        }
      }

      setResumeResults(results);
      setUnlockedStages(prev => new Set(prev).add(AppStage.FORGE));
      setStage(AppStage.FORGE);
    } catch (err: any) {
      console.error("Resume Analysis Error:", err);
      setError(err.message || "Neural processing interrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssessmentComplete = (score: number, cheated: boolean, challenges: CodingChallenge[], submissions: Record<string, string>) => {
    setTechnicalScore(score);
    setHasCheated(cheated);
    setCodingChallenges(challenges);
    setUserSubmissions(submissions);
    setUnlockedStages(prev => new Set(prev).add(AppStage.INTERVIEW));
    setStage(AppStage.INTERVIEW);
    setError(null);
  };

  const handleInterviewComplete = async (transcript: string) => {
    setIsProcessing(true);
    setError(null);
    setInterviewTranscript(transcript);
    
    try {
      // 1. Get AI evaluation first (so we have results even if DB fails)
      const final = await evaluateFinalReadiness(
        resumeResults?.score || 0,
        technicalScore,
        transcript,
        hasCheated
      );
      
      const enrichedFinal = {
        ...final,
        methodologyNote: `Weighted Readiness Vector: Resume (${final.resume}%), Technical (${final.technical}%), Comm (${final.communication}%). Integrity Gating: ${hasCheated ? 'FAILED' : 'PASSED'}.`
      };

      setFinalScore(enrichedFinal);

      // 2. Attempt Background Database Save
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        try {
          await saveFinalVerdict(
            authUser.id, 
            targetRole, 
            enrichedFinal, 
            transcript, 
            codingChallenges, 
            userSubmissions, 
            hasCheated
          );
        } catch (dbErr: any) {
          console.error("Supabase Sync Failed:", dbErr);
          // Only show error message if it's the schema mismatch issue
          if (dbErr.code === 'PGRST204' || dbErr.message?.includes('schema cache')) {
            setError("SCHEMA MISMATCH: Run the SQL script to add missing columns to your Supabase table.");
          }
        }
      }

      // 3. Move to result page regardless of DB status (for better UX)
      setUnlockedStages(prev => new Set(prev).add(AppStage.VERDICT));
      setStage(AppStage.VERDICT);
    } catch (err: any) {
      console.error("Final Evaluation Error:", err);
      setError("AI Analysis encountered an error. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateTo = (newStage: AppStage) => {
    if (user && unlockedStages.has(newStage)) {
      setStage(newStage);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-100 relative">
      <div className="mesh-bg"></div>
      <div className="noise-overlay"></div>

      {user && (
        <Header 
          currentStage={stage} 
          user={user} 
          onNavigate={navigateTo} 
          onLogout={handleLogout} 
          locked={!resumeResults}
        />
      )}
      
      <main className={user ? "pt-16 pb-12" : ""}>
        {error && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-rose-500/30 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl animate-fadeInDown ring-1 ring-rose-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                <i className="fas fa-triangle-exclamation text-rose-500 text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-0.5">Neural System Alert</div>
                <p className="text-xs font-bold text-slate-200 leading-tight">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative">
               <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full"></div>
               <div className="absolute inset-0 w-24 h-24 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
               <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
            </div>
            <div className="mt-10 text-center space-y-2">
              <h2 className="text-xl font-black text-white tracking-[0.4em] uppercase">Neural Analysis</h2>
              <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest animate-pulse">Synchronizing Session Data...</p>
            </div>
          </div>
        )}

        <div className="animate-fadeIn">
          {stage === AppStage.LANDING && (
            <LandingPage onStart={(target) => setStage(target)} />
          )}

          {stage === AppStage.PROJECT_DETAILS && (
            <div className="pt-24">
              <ProjectAbout />
              <div className="flex justify-center mt-12">
                <button 
                  onClick={() => setStage(AppStage.LANDING)}
                  className="px-8 py-4 glass-panel rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] hover:text-white transition-all"
                >
                  <i className="fas fa-terminal mr-2"></i> Return to Terminal
                </button>
              </div>
            </div>
          )}

          {(stage === AppStage.LOGIN || stage === AppStage.REGISTER) && !user && (
            <AuthPage 
              onSuccess={handleAuthSuccess} 
              onBack={() => setStage(AppStage.LANDING)} 
            />
          )}

          {stage === AppStage.HUB && user && (
            <HubDashboard 
              onStart={() => navigateTo(AppStage.TARGET)} 
              progress={resumeResults ? (unlockedStages.size / 6) * 100 : 0}
              history={assessmentHistory}
            />
          )}

          {stage === AppStage.TARGET && user && (
            <RoleTrackSelection onSelect={handleRoleSelect} />
          )}

          {stage === AppStage.RESUME && user && (
            <ResumeBenchmarking onUpload={handleResumeAnalysis} />
          )}

          {stage === AppStage.FORGE && user && (
            <TechnicalAssessment 
              targetRole={targetRole} 
              onComplete={handleAssessmentComplete} 
            />
          )}

          {stage === AppStage.INTERVIEW && user && (
            <MockInterview 
              targetRole={targetRole} 
              onComplete={handleInterviewComplete} 
            />
          )}

          {stage === AppStage.VERDICT && user && finalScore && resumeResults && (
            <Dashboard 
              score={finalScore} 
              resumeData={resumeResults} 
              onRestart={() => setStage(AppStage.HUB)} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
