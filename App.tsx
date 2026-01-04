
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
import { PlacementProfile } from './components/PlacementProfile';
import { PlacementPortal } from './components/PlacementPortal';
import { PlacementOfficerDashboard } from './components/PlacementOfficerDashboard';
import { UserProfile } from './components/UserProfile';
import { analyzeResume, evaluateFinalReadiness } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { saveResumeData, saveFinalVerdict, getUserHistory } from './services/databaseService';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [showPortalForm, setShowPortalForm] = useState(false);
  const [facultyView, setFacultyView] = useState(false);
  const [isFacultyEntryMode, setIsFacultyEntryMode] = useState(false);
  
  const [targetRole, setTargetRole] = useState('');
  const [resumeResults, setResumeResults] = useState<ResumeAnalysisResult | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentRecord[]>([]);
  
  const [technicalScore, setTechnicalScore] = useState<number>(0);
  const [hasCheated, setHasCheated] = useState(false);
  const [codingChallenges, setCodingChallenges] = useState<CodingChallenge[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Record<string, string>>({});

  const [finalScore, setFinalScore] = useState<ReadinessScore | null>(null);
  const [interviewTranscript, setInterviewTranscript] = useState<string>('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage, showPortalForm, facultyView]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        syncUserData(supabaseUser);
      }
    };
    checkUser();
  }, []);

  const syncUserData = async (supabaseUser: any) => {
    const history = await getUserHistory(supabaseUser.id);
    setAssessmentHistory(history);
    
    const meta = supabaseUser.user_metadata;
    setUser({
      id: supabaseUser.id,
      name: meta?.display_name || supabaseUser.email?.split('@')[0] || "Candidate",
      email: supabaseUser.email || "",
      joinedDate: new Date(supabaseUser.created_at).toLocaleDateString(),
      college: meta?.college,
      department: meta?.department,
      phone: meta?.phone,
      rollNumber: meta?.rollNumber,
      graduationYear: meta?.graduationYear
    });
  };

  const handleAuthSuccess = async (u: User) => {
    setUser(u);
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) await syncUserData(supabaseUser);

    if (isFacultyEntryMode) {
      setFacultyView(true);
      setStage(AppStage.PLACEMENT_OFFICE);
    } else {
      setStage(AppStage.HUB);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowPortalForm(false);
    setFacultyView(false);
    setIsFacultyEntryMode(false);
    setStage(AppStage.LANDING);
  };

  const handleStartDeployment = () => {
    setStage(AppStage.TARGET);
  };

  const handleRoleSelection = (role: string) => {
    setTargetRole(role);
    setStage(AppStage.RESUME);
  };

  const handleResumeUpload = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await analyzeResume(text, targetRole);
      setResumeResults(result);
      
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        await saveResumeData(supabaseUser.id, targetRole, result);
      }
      
      setStage(AppStage.FORGE);
    } catch (err) {
      console.error("Vector analysis failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTechnicalComplete = (score: number, cheated: boolean, challenges: CodingChallenge[], submissions: Record<string, string>) => {
    setTechnicalScore(score);
    setHasCheated(cheated);
    setCodingChallenges(challenges);
    setUserSubmissions(submissions);
    setStage(AppStage.INTERVIEW);
  };

  const handleInterviewComplete = async (transcript: string) => {
    setInterviewTranscript(transcript);
    setIsProcessing(true);
    try {
      const result = await evaluateFinalReadiness(
        resumeResults?.score || 0,
        technicalScore,
        transcript,
        hasCheated
      );
      setFinalScore(result);
      
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        await saveFinalVerdict(
          supabaseUser.id,
          targetRole,
          result,
          transcript,
          codingChallenges,
          userSubmissions,
          hasCheated
        );
        syncUserData(supabaseUser);
      }
      
      setStage(AppStage.VERDICT);
    } catch (err) {
      console.error("Verdict generation failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateProgress = () => {
    let p = 0;
    if (targetRole) p += 15;
    if (resumeResults) p += 15;
    if (technicalScore > 0 || codingChallenges.length > 0) p += 20;
    if (interviewTranscript) p += 50;
    return p;
  };

  const navigateToOffice = () => {
    if (user) {
      setStage(AppStage.PLACEMENT_OFFICE);
    } else {
      setIsFacultyEntryMode(true);
      setStage(AppStage.LOGIN);
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderStage = () => {
    if (stage === AppStage.PLACEMENT_OFFICE) {
      if (!user) return <AuthPage onSuccess={handleAuthSuccess} onBack={() => { setStage(AppStage.LANDING); setIsFacultyEntryMode(false); }} />;
      
      if (facultyView) {
        return <PlacementOfficerDashboard />;
      }

      if (showPortalForm) {
        return <PlacementPortal 
                  user={user} 
                  history={assessmentHistory} 
                  onBack={() => { setShowPortalForm(false); setStage(AppStage.HUB); }} 
                  onFacultyEnter={() => { setFacultyView(true); setShowPortalForm(false); }}
                />;
      }
      return <PlacementProfile user={user} history={assessmentHistory} />;
    }

    switch (stage) {
      case AppStage.LANDING:
        return <LandingPage onStart={(s) => {
          if (s === AppStage.PLACEMENT_OFFICE) {
            navigateToOffice();
          } else {
            setIsFacultyEntryMode(false);
            setStage(s);
          }
        }} />;
      case AppStage.LOGIN:
      case AppStage.REGISTER:
        return <AuthPage onSuccess={handleAuthSuccess} onBack={() => { setStage(AppStage.LANDING); setIsFacultyEntryMode(false); }} />;
      case AppStage.PROJECT_DETAILS:
        return <ProjectAbout />;
      case AppStage.HUB:
        return <HubDashboard onStart={handleStartDeployment} progress={calculateProgress()} history={assessmentHistory} />;
      case AppStage.PROFILE:
        return user ? <UserProfile user={user} onUpdate={handleProfileUpdate} history={assessmentHistory} /> : null;
      case AppStage.TARGET:
        return <RoleTrackSelection onSelect={handleRoleSelection} />;
      case AppStage.RESUME:
        return <ResumeBenchmarking onUpload={handleResumeUpload} />;
      case AppStage.FORGE:
        return <TechnicalAssessment targetRole={targetRole} onComplete={handleTechnicalComplete} />;
      case AppStage.INTERVIEW:
        return <MockInterview targetRole={targetRole} onComplete={handleInterviewComplete} />;
      case AppStage.VERDICT:
        if (!finalScore || !resumeResults) return null;
        return <Dashboard score={finalScore} resumeData={resumeResults} onRestart={() => setStage(AppStage.HUB)} />;
      default:
        return <LandingPage onStart={(s) => {
          if (s === AppStage.PLACEMENT_OFFICE) navigateToOffice();
          else { setIsFacultyEntryMode(false); setStage(s); }
        }} />;
    }
  };

  const isPostLogin = user !== null && ![AppStage.LANDING, AppStage.LOGIN, AppStage.REGISTER, AppStage.PROJECT_DETAILS].includes(stage);

  return (
    <div className="min-h-screen text-slate-900 transition-all duration-700 ease-in-out">
      <Header 
        currentStage={stage} 
        user={user} 
        onNavigate={(s) => {
          if (s === AppStage.PLACEMENT_OFFICE) navigateToOffice();
          else { 
            setStage(s); 
            setShowPortalForm(false); 
            setFacultyView(false); 
            setIsFacultyEntryMode(false); 
          }
        }} 
        onLogout={handleLogout}
        locked={hasCheated && stage !== AppStage.VERDICT}
        isFacultyView={facultyView}
        onExitFaculty={() => { setFacultyView(false); setStage(AppStage.HUB); }}
      />
      
      <main className={`pb-20 relative z-10 transition-all duration-500 ${isPostLogin ? 'pt-28 sm:pt-40' : 'pt-0'}`}>
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-40 animate-fadeIn">
            <div className="relative w-24 h-24 mb-10">
              <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
              <div className="absolute inset-0 border-t-8 border-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-indigo-900 animate-pulse text-center px-4">Syncing Neural Data</h2>
            <p className="text-slate-400 text-xs font-bold mt-4 tracking-widest uppercase">Initializing Assessment Engine</p>
          </div>
        ) : (
          renderStage()
        )}
      </main>
    </div>
  );
};

export default App;
