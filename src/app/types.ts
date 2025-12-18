export type UserRole = 'hr' | 'intern' | 'manager';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type ProgramStage = {
  id: string;
  name: string;
  type: 'video_interview' | 'technical_test' | 'interview' | 'task';
  questions?: string[];
  questionSettings?: {
    requiredQuestions: string[];
    optionalQuestions: string[];
    totalQuestionsLimit: number;
  };
  order: number;
};

export type Program = {
  id: string;
  name: string;
  description: string;
  direction: string;
  stages: ProgramStage[];
  createdAt: Date;
  active: boolean;
};

export type CandidateProgress = {
  candidateId: string;
  programId: string;
  currentStageId: string;
  status: 'in_progress' | 'pending_review' | 'passed' | 'rejected';
  stageResults: {
    stageId: string;
    completedAt?: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'passed' | 'rejected';
    videoAnswers?: {
      question: string;
      videoUrl: string;
      transcript: string;
      duration: number;
    }[];
    scheduledDate?: Date;
    feedback?: string;
  }[];
};

export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  telegram?: string;
  resumeUrl?: string;
  firstPriority: string;
  secondPriority?: string;
  course: string;
  specialty: string;
  otherSpecialty?: string;
  schedule: string;
  city: string;
  otherCity?: string;
  source: string;
  birthYear: number;
  citizenship: string;
  university: string;
  otherUniversity?: string;
  languages: string[];
  direction: string;
  programs: string[];
  createdAt: Date;
  name?: string;
};

export type ManagerEvaluationData = {
  candidateId: string;
  programId: string;
  stageId: string;
  evaluatorName: string;
  evaluatorEmail: string;
  skills: {
    name: string;
    score: -1 | 0 | 1;
    comment?: string;
  }[];
  finalDecision: 'suitable' | 'not_suitable';
  submittedAt: Date;
};

export type Screen =
  | 'login'
  | 'hr-dashboard'
  | 'create-program'
  | 'program-details'
  | 'candidate-review'
  | 'intern-dashboard'
  | 'program-progress'
  | 'video-interview'
  | 'schedule-interview'
  | 'manager-evaluation';

export type AppContextType = {
  currentScreen: Screen;
  navigateTo: (screen: Screen, data?: any) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  programs: Program[];
  addProgram: (program: Omit<Program, 'id' | 'createdAt' | 'active'>) => Promise<Program>;
  updateProgram: (id: string, updates: Partial<Program>) => Promise<Program>;
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt'>) => Promise<Candidate>;
  addCandidates: (candidates: Candidate[]) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<Candidate>;
  candidateProgress: CandidateProgress[];
  updateCandidateProgress: (
    candidateId: string,
    programId: string,
    updates: Partial<CandidateProgress>
  ) => Promise<CandidateProgress>;
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  selectedCandidateId: string | null;
  setSelectedCandidateId: (id: string | null) => void;
  evaluations: ManagerEvaluationData[];
  addEvaluation: (evaluation: Omit<ManagerEvaluationData, 'submittedAt'>) => Promise<ManagerEvaluationData>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
};
