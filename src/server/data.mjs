import { randomUUID } from 'node:crypto';

const programs = [
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
];

const candidates = [
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
];

const candidateProgress = [
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
            transcript:
              'Привет! Меня зовут Алексей, я увлекаюсь программированием уже 2 года. Начинал с HTML и CSS, потом перешёл на JavaScript. Делал несколько pet-проектов...',
            duration: 120
          },
          {
            question: 'Почему вы хотите стать frontend разработчиком?',
            videoUrl: 'mock-video-2',
            transcript:
              'Frontend разработка сочетает креативность и технические навыки. Мне нравится создавать интерфейсы, которыми удобно пользоваться...',
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
];

const evaluations = [];

const issueId = () => randomUUID();

export {
  programs,
  candidates,
  candidateProgress,
  evaluations,
  issueId
};
