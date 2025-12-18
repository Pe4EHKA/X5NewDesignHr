import express from 'express';
import cors from 'cors';
import { programs, candidates, candidateProgress, evaluations, issueId } from './data.mjs';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'hr@x5.ru' && password === 'hr') {
    return res.json({ id: 'hr1', email, name: 'HR Менеджер', role: 'hr' });
  }

  if (email === 'manager@x5.ru' && password === 'manager') {
    return res.json({ id: 'manager1', email, name: 'Hiring Manager', role: 'manager' });
  }

  const candidate = candidates.find(c => c.email === email);
  if (candidate && (!password || password === 'intern')) {
    return res.json({
      id: candidate.id,
      email: candidate.email,
      name: `${candidate.firstName} ${candidate.lastName}`,
      role: 'intern'
    });
  }

  return res.status(401).json({ message: 'Неверный email или пароль' });
});

app.get('/api/programs', (_req, res) => {
  res.json(programs);
});

app.post('/api/programs', (req, res) => {
  const program = { ...req.body, id: issueId(), createdAt: new Date(), active: true };
  programs.push(program);
  res.status(201).json(program);
});

app.patch('/api/programs/:id', (req, res) => {
  const program = programs.find(p => p.id === req.params.id);
  if (!program) return res.status(404).json({ message: 'Программа не найдена' });

  Object.assign(program, req.body);
  res.json(program);
});

app.get('/api/candidates', (_req, res) => {
  res.json(candidates);
});

app.post('/api/candidates', (req, res) => {
  const candidate = { ...req.body, id: issueId(), createdAt: new Date() };
  candidates.push(candidate);
  res.status(201).json(candidate);
});

app.patch('/api/candidates/:id', (req, res) => {
  const candidate = candidates.find(c => c.id === req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Кандидат не найден' });
  Object.assign(candidate, req.body);
  res.json(candidate);
});

app.get('/api/candidate-progress', (_req, res) => {
  res.json(candidateProgress);
});

app.put('/api/candidate-progress/:candidateId/:programId', (req, res) => {
  const { candidateId, programId } = req.params;
  let progress = candidateProgress.find(
    p => p.candidateId === candidateId && p.programId === programId
  );

  if (progress) {
    Object.assign(progress, req.body);
  } else {
    progress = { candidateId, programId, ...req.body };
    candidateProgress.push(progress);
  }

  res.json(progress);
});

app.get('/api/evaluations', (_req, res) => {
  res.json(evaluations);
});

app.post('/api/evaluations', (req, res) => {
  const evaluation = { ...req.body, submittedAt: new Date() };
  evaluations.push(evaluation);
  res.status(201).json(evaluation);
});

app.listen(PORT, () => {
  console.log(`Mock API server is running on http://localhost:${PORT}`);
});
