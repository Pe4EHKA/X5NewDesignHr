import { useState } from 'react';
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
    requiredQuestions: string[]; // Обязательные вопросы
    optionalQuestions: string[]; // Необязательные вопросы
    totalQuestionsLimit: number; // Сколько всего вопросов задать
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
    feedback?: string; // Обратная связь при отклонении
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
  course: string; // Магистратура 1 курс, Бакалавриат 3 курс, и т.д.
  specialty: string;
  otherSpecialty?: string;
  schedule: string; // 40 часов, 20 часов, и т.д.
  city: string;
  otherCity?: string;
  source: string; // Откуда узнал
  birthYear: number;
  citizenship: string;
  university: string;
  otherUniversity?: string;
  languages: string[]; // ['Python', 'R', 'SQL']
  direction: string;
  programs: string[]; // program IDs
  createdAt: Date;
  
  // Для обратной совместимости (deprecated)
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
  addProgram: (program: Program) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  candidates: Candidate[];
  addCandidate: (candidate: Candidate) => void;
  addCandidates: (candidates: Candidate[]) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  candidateProgress: CandidateProgress[];
  updateCandidateProgress: (candidateId: string, programId: string, updates: Partial<CandidateProgress>) => void;
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  selectedCandidateId: string | null;
  setSelectedCandidateId: (id: string | null) => void;
  evaluations: ManagerEvaluationData[];
  addEvaluation: (evaluation: ManagerEvaluationData) => void;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Mock данные для демонстрации
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: '1',
      name: 'Frontend стажировка 2025',
      description: 'Программа обучения frontend разработчиков на React',
      direction: 'Frontend Development',
      active: true,
      createdAt: new Date('2025-01-01'),
      stages: [
        {
          id: 's1',
          name: 'Видеоинтервью',
          type: 'video_interview',
          order: 1,
          questions: [
            'Расскажите о себе и своём опыте в разработке',
            'Почему вы хотите стать frontend разработчиком?',
            'Опишите проект, которым вы гордитесь',
            'Как вы справляетесь с дедлайнами и стрессом?',
            'Какие технологии вы хотите изучить на стажировке?'
          ]
        },
        {
          id: 's2',
          name: 'Интервью с тимлидом',
          type: 'interview',
          order: 2
        }
      ]
    },
    {
      id: '2',
      name: 'Backend стажировка 2025',
      description: 'Программа обучения backend разработчиков на Node.js и Python',
      direction: 'Backend Development',
      active: true,
      createdAt: new Date('2025-01-01'),
      stages: [
        {
          id: 'b1',
          name: 'Видеоинтервью',
          type: 'video_interview',
          order: 1,
          questions: [
            'Расскажите о своём опыте работы с серверными технологиями',
            'Какие базы данных вы использовали?',
            'Опишите принципы REST API',
            'Как вы обеспечиваете безопасность приложения?'
          ]
        },
        {
          id: 'b2',
          name: 'Интервью с командой',
          type: 'interview',
          order: 2
        }
      ]
    }
  ]);

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 'c1',
      firstName: 'Александр',
      lastName: 'Иванов',
      email: 'александр.иванов@mail.ru',
      phone: '7(985)273-22-80',
      telegram: 'user1',
      resumeUrl: 'https://example.com/resume/aleksandr-ivanov.pdf',
      firstPriority: 'Стажер-разработчик backend',
      secondPriority: 'Стажер DevOps',
      course: 'Магистратура 1 курс',
      specialty: 'Информатика и вычислительная техника',
      schedule: '40 часов',
      city: 'Санкт-Петербург или Ленинградская область',
      source: 'Социальные сети',
      birthYear: 2004,
      citizenship: 'Российская Федерация',
      university: 'МФТИ - Московский физико-технический институт',
      languages: ['Python', 'R', 'SQL'],
      direction: 'Frontend Development',
      programs: ['1'],
      createdAt: new Date('2025-12-18')
    },
    {
      id: 'c2',
      firstName: 'Мария',
      lastName: 'Петрова',
      email: 'maria.petrova@example.com',
      phone: '7(999)888-77-66',
      telegram: 'maria_p',
      resumeUrl: 'https://example.com/resume/maria-petrova.pdf',
      firstPriority: 'Стажер-разработчик frontend',
      secondPriority: 'Стажер UI/UX дизайнер',
      course: 'Бакалавриат 3 курс',
      specialty: 'Программная инженерия',
      schedule: '20 часов',
      city: 'Москва',
      source: 'Университет',
      birthYear: 2003,
      citizenship: 'Российская Федерация',
      university: 'МГУ - Московский государственный университет',
      languages: ['JavaScript', 'TypeScript', 'HTML/CSS'],
      direction: 'Frontend Development',
      programs: ['1'],
      createdAt: new Date('2025-12-18')
    },
    {
      id: 'c3',
      firstName: 'Дмитрий',
      lastName: 'Сидоров',
      email: 'dmitry.sidorov@example.com',
      phone: '7(999)777-88-99',
      telegram: 'dmitry_dev',
      resumeUrl: 'https://example.com/resume/dmitry-sidorov.pdf',
      firstPriority: 'Стажер-разработчик frontend',
      course: 'Магистратура 2 курс',
      specialty: 'Компьютерные науки',
      schedule: '40 часов',
      city: 'Москва',
      source: 'Социальные сети',
      birthYear: 2001,
      citizenship: 'Российская Федерация',
      university: 'ИТМО - Университет ИТМО',
      languages: ['JavaScript', 'React', 'Node.js'],
      direction: 'Frontend Development',
      programs: ['1'],
      createdAt: new Date('2025-12-18')
    }
  ]);

  const [candidateProgress, setCandidateProgress] = useState<CandidateProgress[]>([
    {
      candidateId: 'c1',
      programId: '1',
      currentStageId: 's1',
      status: 'pending_review',
      stageResults: [
        {
          stageId: 's1',
          status: 'completed',
          completedAt: new Date('2025-01-10'),
          videoAnswers: [
            {
              question: 'Расскажите о себе и своём опыте в разработке',
              videoUrl: 'mock-video-1',
              transcript: 'Привет! Меня зовут Алексей, я увлекаюсь программированием уже 2 года. Начинал с HTML и CSS, потом перешёл на JavaScript. Делал несколько pet-проектов...',
              duration: 120
            },
            {
              question: 'Почему вы хотите стать frontend разработчиком?',
              videoUrl: 'mock-video-2',
              transcript: 'Frontend разработка сочетает креативность и технические навыки. Мне нравится создавать интерфейсы, которыми удобно пользоваться...',
              duration: 95
            }
          ]
        },
        {
          stageId: 's2',
          status: 'not_started'
        }
      ]
    },
    {
      candidateId: 'c2',
      programId: '1',
      currentStageId: 's1',
      status: 'in_progress',
      stageResults: [
        {
          stageId: 's1',
          status: 'in_progress'
        },
        {
          stageId: 's2',
          status: 'not_started'
        }
      ]
    }
    // c3 - новый стажёр без прогресса, сможет начать с нуля
  ]);

  const [evaluations, setEvaluations] = useState<ManagerEvaluationData[]>([]);

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
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addCandidate = (candidate: Candidate) => {
    setCandidates(prev => [...prev, candidate]);
  };

  const addCandidates = (newCandidates: Candidate[]) => {
    setCandidates(prev => [...prev, ...newCandidates]);
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateCandidateProgress = (candidateId: string, programId: string, updates: Partial<CandidateProgress>) => {
    setCandidateProgress(prev => {
      const existing = prev.find(p => p.candidateId === candidateId && p.programId === programId);
      if (existing) {
        return prev.map(p => 
          p.candidateId === candidateId && p.programId === programId 
            ? { ...p, ...updates }
            : p
        );
      } else {
        return [...prev, { candidateId, programId, ...updates } as CandidateProgress];
      }
    });
  };

  const addEvaluation = (evaluation: ManagerEvaluationData) => {
    setEvaluations(prev => [...prev, evaluation]);
  };

  const context: AppContextType = {
    currentScreen,
    navigateTo,
    user,
    setUser,
    programs,
    addProgram,
    updateProgram,
    candidates,
    addCandidate,
    addCandidates,
    updateCandidate,
    candidateProgress,
    updateCandidateProgress,
    selectedProgramId,
    setSelectedProgramId,
    selectedCandidateId,
    setSelectedCandidateId,
    evaluations,
    addEvaluation
  };

  return (
    <div className="min-h-screen bg-gray-50">
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