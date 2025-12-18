import type {
  Candidate,
  CandidateProgress,
  ManagerEvaluationData,
  Program,
  ProgramStage,
  User,
  UserRole
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const asDate = (value?: string | number | Date) => (value ? new Date(value) : undefined);

const normalizeProgram = (program: any): Program => ({
  ...program,
  createdAt: asDate(program.createdAt) ?? new Date(),
  stages: (program.stages || []).map((stage: ProgramStage) => stage)
});

const normalizeCandidate = (candidate: any): Candidate => ({
  ...candidate,
  createdAt: asDate(candidate.createdAt) ?? new Date()
});

const normalizeProgress = (progress: any): CandidateProgress => ({
  ...progress,
  stageResults: (progress.stageResults || []).map((stage: any) => ({
    ...stage,
    completedAt: asDate(stage.completedAt),
    scheduledDate: asDate(stage.scheduledDate)
  }))
});

const normalizeEvaluation = (evaluation: any): ManagerEvaluationData => ({
  ...evaluation,
  submittedAt: asDate(evaluation.submittedAt) ?? new Date()
});

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Неверный email или пароль');
  }

  return response.json();
}

export async function fetchPrograms(): Promise<Program[]> {
  const response = await fetch(`${API_URL}/programs`);
  if (!response.ok) throw new Error('Не удалось загрузить программы');
  const data = await response.json();
  return data.map(normalizeProgram);
}

export async function createProgram(program: Omit<Program, 'id' | 'createdAt' | 'active'>): Promise<Program> {
  const response = await fetch(`${API_URL}/programs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(program)
  });
  if (!response.ok) throw new Error('Не удалось создать программу');
  return normalizeProgram(await response.json());
}

export async function patchProgram(id: string, updates: Partial<Program>): Promise<Program> {
  const response = await fetch(`${API_URL}/programs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Не удалось обновить программу');
  return normalizeProgram(await response.json());
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const response = await fetch(`${API_URL}/candidates`);
  if (!response.ok) throw new Error('Не удалось загрузить кандидатов');
  const data = await response.json();
  return data.map(normalizeCandidate);
}

export async function createCandidate(candidate: Omit<Candidate, 'id' | 'createdAt'>): Promise<Candidate> {
  const response = await fetch(`${API_URL}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate)
  });
  if (!response.ok) throw new Error('Не удалось создать кандидата');
  return normalizeCandidate(await response.json());
}

export async function patchCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
  const response = await fetch(`${API_URL}/candidates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Не удалось обновить кандидата');
  return normalizeCandidate(await response.json());
}

export async function fetchCandidateProgress(): Promise<CandidateProgress[]> {
  const response = await fetch(`${API_URL}/candidate-progress`);
  if (!response.ok) throw new Error('Не удалось загрузить прогресс кандидатов');
  const data = await response.json();
  return data.map(normalizeProgress);
}

export async function updateCandidateProgress(
  candidateId: string,
  programId: string,
  updates: Partial<CandidateProgress>
): Promise<CandidateProgress> {
  const response = await fetch(`${API_URL}/candidate-progress/${candidateId}/${programId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Не удалось обновить прогресс');
  return normalizeProgress(await response.json());
}

export async function fetchEvaluations(): Promise<ManagerEvaluationData[]> {
  const response = await fetch(`${API_URL}/evaluations`);
  if (!response.ok) throw new Error('Не удалось загрузить оценки');
  const data = await response.json();
  return data.map(normalizeEvaluation);
}

export async function createEvaluation(evaluation: Omit<ManagerEvaluationData, 'submittedAt'>) {
  const response = await fetch(`${API_URL}/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evaluation)
  });
  if (!response.ok) throw new Error('Не удалось сохранить оценку');
  return normalizeEvaluation(await response.json());
}

export function quickLoginAs(role: UserRole, candidates: Candidate[]): User {
  if (role === 'hr') {
    return {
      id: 'hr1',
      email: 'hr@x5.ru',
      name: 'HR Менеджер',
      role: 'hr'
    };
  }

  const candidate = candidates.find(c => c.id === 'c3') || candidates[0];
  return {
    id: candidate.id,
    email: candidate.email,
    name: `${candidate.firstName} ${candidate.lastName}`,
    role: 'intern'
  };
}
