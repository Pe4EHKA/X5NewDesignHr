import { useState } from 'react';
import { AppContextType, ManagerEvaluationData } from '../../types';
import { ArrowLeft, Send, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

type ManagerEvaluationProps = {
  context: AppContextType;
};

type SkillEvaluation = {
  name: string;
  score: -1 | 0 | 1 | null;
  comment?: string;
};

const DEFAULT_SKILLS = [
  { name: 'Технические навыки', description: 'Владение необходимыми технологиями и инструментами' },
  { name: 'Качество кода', description: 'Чистота, читаемость и структура кода' },
  { name: 'Решение проблем', description: 'Способность находить эффективные решения' },
  { name: 'Коммуникация', description: 'Ясность изложения мыслей и умение слушать' },
  { name: 'Обучаемость', description: 'Готовность учиться и воспринимать фидбек' },
  { name: 'Самостоятельность', description: 'Способность работать без постоянного контроля' },
  { name: 'Командная работа', description: 'Умение работать в команде и помогать коллегам' },
  { name: 'Инициативность', description: 'Проактивный подход к задачам' }
];

export function ManagerEvaluation({ context }: ManagerEvaluationProps) {
  // Подтягиваем данные кандидата и программы из контекста, если они выбраны
  const selectedCandidate = context.selectedCandidateId 
    ? context.candidates.find(c => c.id === context.selectedCandidateId)
    : null;
  const selectedProgram = context.selectedProgramId
    ? context.programs.find(p => p.id === context.selectedProgramId)
    : null;

  const [candidateId, setCandidateId] = useState(context.selectedCandidateId || '');
  const [programId, setProgramId] = useState(context.selectedProgramId || '');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorEmail, setEvaluatorEmail] = useState('');
  const [skills, setSkills] = useState<SkillEvaluation[]>(
    DEFAULT_SKILLS.map(s => ({ name: s.name, score: null }))
  );
  const [finalDecision, setFinalDecision] = useState<'suitable' | 'not_suitable' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleScoreChange = (index: number, score: -1 | 0 | 1) => {
    setSkills(skills.map((skill, i) => 
      i === index ? { ...skill, score } : skill
    ));
  };

  const handleCommentChange = (index: number, comment: string) => {
    setSkills(skills.map((skill, i) => 
      i === index ? { ...skill, comment } : skill
    ));
  };

  const generateFeedback = (): string => {
    const positives: string[] = [];
    const improvements: string[] = [];

    skills.forEach(skill => {
      if (skill.score === 1) {
        positives.push(skill.name);
      } else if (skill.score === -1) {
        improvements.push(skill.name);
      }
    });

    let feedback = '';

    if (finalDecision === 'suitable') {
      feedback = `Поздравляем! Вы успешно прошли собеседование.\n\n`;
      
      if (positives.length > 0) {
        feedback += `Сильные стороны:\n`;
        feedback += positives.map(p => `• ${p}`).join('\n');
        feedback += '\n\n';
      }

      if (improvements.length > 0) {
        feedback += `Рекомендации для развития:\n`;
        improvements.forEach(imp => {
          const skillConfig = DEFAULT_SKILLS.find(s => s.name === imp);
          feedback += `• ${imp}: ${skillConfig?.description}\n`;
        });
      }

      feedback += `\nМы рады видеть вас в нашей команде и готовы поддержать ваше развитие!`;
    } else {
      feedback = `Спасибо за прохождение собеседования.\n\n`;
      feedback += `К сожалению, на данном этапе мы не готовы предложить вам позицию. `;
      feedback += `Это не означает, что вы не талантливы - просто нам нужен кандидат с другим профилем навыков.\n\n`;

      if (improvements.length > 0) {
        feedback += `Рекомендуем обратить внимание на следующие области:\n\n`;
        improvements.forEach(imp => {
          const skillConfig = DEFAULT_SKILLS.find(s => s.name === imp);
          const skillEval = skills.find(s => s.name === imp);
          
          feedback += `• ${imp}: ${skillConfig?.description}`;
          if (skillEval?.comment) {
            feedback += ` - ${skillEval.comment}`;
          }
          feedback += '\n';
        });
        feedback += '\n';
      }

      feedback += `Желаем успехов в развитии! Будем рады рассмотреть вашу кандидатуру снова через 3-6 месяцев.`;
    }

    return feedback;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Проверки
    if (!candidateId || !programId) {
      alert('Укажите ID кандидата и программы');
      return;
    }

    if (!evaluatorName || !evaluatorEmail) {
      alert('Заполните информацию об оценщике');
      return;
    }

    const unevaluatedSkills = skills.filter(s => s.score === null);
    if (unevaluatedSkills.length > 0) {
      alert('Оцените все навыки');
      return;
    }

    if (!finalDecision) {
      alert('Примите финальное решение');
      return;
    }

    const evaluation: ManagerEvaluationData = {
      candidateId,
      programId,
      stageId: 'mock-stage-id',
      evaluatorName,
      evaluatorEmail,
      skills: skills.map(s => ({
        name: s.name,
        score: s.score as -1 | 0 | 1,
        comment: s.comment
      })),
      finalDecision,
      submittedAt: new Date()
    };

    await context.addEvaluation(evaluation);
    setSubmitted(true);
  };

  if (submitted) {
    const feedback = generateFeedback();

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl mb-4">Оценка отправлена!</h1>
            <p className="text-gray-600 mb-8">
              Кандидат получит автоматически сгенерированную обратную связь на основе ваших оценок.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
              <h3 className="mb-3">Предпросмотр обратной связи:</h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {feedback}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSkills(DEFAULT_SKILLS.map(s => ({ name: s.name, score: null })));
                  setFinalDecision(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Оценить ещё одного кандидата
              </button>
              <button
                onClick={() => context.navigateTo('login')}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allSkillsEvaluated = skills.every(s => s.score !== null);
  const averageScore = allSkillsEvaluated 
    ? skills.reduce((sum, s) => sum + (s.score || 0), 0) / skills.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => context.navigateTo('login')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-3xl mb-2">Форма оценки кандидата</h1>
            <p className="text-gray-600">
              Заполните форму для автоматической генерации обратной связи кандидату
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* И��формация об оценке */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl mb-4">Основная информация</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  ID кандидата <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  placeholder="c1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Для демо используйте: c1 или c2</p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  ID программы <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Для демо используйте: 1</p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Ваше имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Ваш email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={evaluatorEmail}
                  onChange={(e) => setEvaluatorEmail(e.target.value)}
                  placeholder="manager@x5.ru"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Оценка навыков */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl mb-2">Оценка навыков</h2>
            <p className="text-sm text-gray-600 mb-6">
              Оцените каждый навык по шкале: -1 (ниже ожиданий), 0 (соответствует), +1 (превосходит)
            </p>

            <div className="space-y-4">
              {DEFAULT_SKILLS.map((skillDef, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="mb-1">{skillDef.name}</h3>
                      <p className="text-sm text-gray-600">{skillDef.description}</p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleScoreChange(index, -1)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          skills[index].score === -1
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                        title="Ниже ожиданий"
                      >
                        <ThumbsDown className={`w-5 h-5 ${
                          skills[index].score === -1 ? 'text-red-600' : 'text-gray-400'
                        }`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScoreChange(index, 0)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          skills[index].score === 0
                            ? 'border-gray-500 bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title="Соответствует ожиданиям"
                      >
                        <Minus className={`w-5 h-5 ${
                          skills[index].score === 0 ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleScoreChange(index, 1)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          skills[index].score === 1
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                        title="Превосходит ожидания"
                      >
                        <ThumbsUp className={`w-5 h-5 ${
                          skills[index].score === 1 ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Комментарий опционально */}
                  <input
                    type="text"
                    value={skills[index].comment || ''}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    placeholder="Дополнительный комментарий (опционально)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Средний балл */}
            {allSkillsEvaluated && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900">Средний балл:</span>
                  <span className={`text-2xl ${
                    averageScore > 0.3 ? 'text-green-600' :
                    averageScore < -0.3 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {averageScore > 0 ? '+' : ''}{averageScore.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Финальное решение */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl mb-4">Финальное решение</h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFinalDecision('suitable')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  finalDecision === 'suitable'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <ThumbsUp className={`w-8 h-8 mb-3 ${
                  finalDecision === 'suitable' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <h3 className="mb-1">Подходит</h3>
                <p className="text-sm text-gray-600">
                  Кандидат соответствует требованиям и приглашается на следующий этап
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFinalDecision('not_suitable')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  finalDecision === 'not_suitable'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <ThumbsDown className={`w-8 h-8 mb-3 ${
                  finalDecision === 'not_suitable' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <h3 className="mb-1">Не подходит</h3>
                <p className="text-sm text-gray-600">
                  Кандидат не соответствует текущим требованиям
                </p>
              </button>
            </div>
          </div>

          {/* Предпросмотр обратной связи */}
          {allSkillsEvaluated && finalDecision && (
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="mb-3 text-purple-900">📝 Предпросмотр автоматической обратной связи:</h3>
              <div className="bg-white rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                {generateFeedback()}
              </div>
            </div>
          )}

          {/* Отправка */}
          <button
            type="submit"
            disabled={!allSkillsEvaluated || !finalDecision}
            className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-lg"
          >
            <Send className="w-5 h-5 mr-2" />
            Отправить оценку
          </button>
        </form>

        {/* Информация */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Оценка автоматически генерирует персонализированную обратную связь для кандидата</p>
        </div>
      </div>
    </div>
  );
}