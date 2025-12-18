import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { HRDashboard } from './components/hr/HRDashboard';
import { CreateProgram } from './components/hr/CreateProgram';
import { ProgramDetails } from './components/hr/ProgramDetails';
import { CandidateReview } from './components/hr/CandidateReview';
import { InternDashboard } from './components/intern/InternDashboard';
import { ProgramProgress } from './components/intern/ProgramProgress';
import { VideoInterviewFlow } from './components/intern/VideoInterviewFlow';
import { ScheduleInterview } from './components/intern/ScheduleInterview';
import { ManagerEvaluation } from './components/manager/ManagerEvaluation';
import {
  createCandidate,
  createEvaluation,
  createProgram,
  fetchCandidateProgress,
  fetchCandidates,
  fetchEvaluations,
  fetchPrograms,
  patchCandidate,
  patchProgram,
  updateCandidateProgress as apiUpdateCandidateProgress
} from './api';
import type {
  AppContextType,
  Candidate,
  CandidateProgress,
  ManagerEvaluationData,
  Program,
  Screen,
  User
} from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateProgress, setCandidateProgress] = useState<CandidateProgress[]>([]);
  const [evaluations, setEvaluations] = useState<ManagerEvaluationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [programsData, candidatesData, progressData, evaluationsData] = await Promise.all([
        fetchPrograms(),
        fetchCandidates(),
        fetchCandidateProgress(),
        fetchEvaluations()
      ]);

      setPrograms(programsData);
      setCandidates(candidatesData);
      setCandidateProgress(progressData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error(error);
      setLoadError('Не удалось загрузить данные. Проверьте работу API.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (screen: Screen, data?: any) => {
    if (data) {
      if (data.programId) setSelectedProgramId(data.programId);
      if (data.candidateId) setSelectedCandidateId(data.candidateId);
    }
    setCurrentScreen(screen);
  };

  const addProgram = (program: Program) => {
    setPrograms(prev => [...prev, program]);
  };

  const updateProgram = (id: string, updates: Partial<Program>) => {
    setPrograms(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addCandidate = (candidate: Candidate) => {
    setCandidates(prev => [...prev, candidate]);
  };

  const addCandidates = (newCandidates: Candidate[]) => {
    setCandidates(prev => [...prev, ...newCandidates]);
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const setCandidateProgressState = (
    candidateId: string,
    programId: string,
    updates: Partial<CandidateProgress>
  ) => {
    setCandidateProgress(prev => {
      const existing = prev.find(p => p.candidateId === candidateId && p.programId === programId);
      if (existing) {
        return prev.map(p =>
          p.candidateId === candidateId && p.programId === programId ? { ...p, ...updates } : p
        );
      } else {
        return [...prev, { candidateId, programId, ...updates } as CandidateProgress];
      }
    });
  };

  const addEvaluation = (evaluation: ManagerEvaluationData) => {
    setEvaluations(prev => [...prev, evaluation]);
  };

  const safeCreateProgram = async (program: Omit<Program, 'id' | 'createdAt' | 'active'>) => {
    const created = await createProgram(program);
    addProgram(created);
    return created;
  };

  const safeUpdateProgram = async (id: string, updates: Partial<Program>) => {
    const updated = await patchProgram(id, updates);
    updateProgram(id, updated);
    return updated;
  };

  const safeCreateCandidate = async (candidate: Omit<Candidate, 'id' | 'createdAt'>) => {
    const created = await createCandidate(candidate);
    addCandidate(created);
    return created;
  };

  const safeUpdateCandidate = async (id: string, updates: Partial<Candidate>) => {
    const updated = await patchCandidate(id, updates);
    updateCandidate(id, updated);
    return updated;
  };

  const safeUpdateCandidateProgress = async (
    candidateId: string,
    programId: string,
    updates: Partial<CandidateProgress>
  ) => {
    const updated = await apiUpdateCandidateProgress(candidateId, programId, updates);
    setCandidateProgressState(candidateId, programId, updated);
    return updated;
  };

  const safeAddEvaluation = async (evaluation: Omit<ManagerEvaluationData, 'submittedAt'>) => {
    const created = await createEvaluation(evaluation);
    addEvaluation(created);
    return created;
  };

  const context: AppContextType = {
    currentScreen,
    navigateTo,
    user,
    setUser,
    programs,
    addProgram: safeCreateProgram,
    updateProgram: safeUpdateProgram,
    candidates,
    addCandidate: safeCreateCandidate,
    addCandidates,
    updateCandidate: safeUpdateCandidate,
    candidateProgress,
    updateCandidateProgress: safeUpdateCandidateProgress,
    selectedProgramId,
    setSelectedProgramId,
    selectedCandidateId,
    setSelectedCandidateId,
    evaluations,
    addEvaluation: safeAddEvaluation,
    isLoading,
    refreshData
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loadError && (
        <div className="bg-red-50 text-red-800 border border-red-200 p-4 text-center">{loadError}</div>
      )}
      {currentScreen === 'login' && <Login context={context} />}
      {currentScreen === 'hr-dashboard' && <HRDashboard context={context} />}
      {currentScreen === 'create-program' && <CreateProgram context={context} />}
      {currentScreen === 'program-details' && <ProgramDetails context={context} />}
      {currentScreen === 'candidate-review' && <CandidateReview context={context} />}
      {currentScreen === 'intern-dashboard' && <InternDashboard context={context} />}
      {currentScreen === 'program-progress' && <ProgramProgress context={context} />}
      {currentScreen === 'video-interview' && <VideoInterviewFlow context={context} />}
      {currentScreen === 'schedule-interview' && <ScheduleInterview context={context} />}
      {currentScreen === 'manager-evaluation' && <ManagerEvaluation context={context} />}
    </div>
  );
}
