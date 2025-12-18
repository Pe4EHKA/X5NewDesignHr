import { useState } from 'react';
import { AppContextType, Program, ProgramStage } from '../../types';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';

type CreateProgramProps = {
  context: AppContextType;
};

type StageType = 'video_interview' | 'technical_test' | 'interview' | 'task';

export function CreateProgram({ context }: CreateProgramProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [direction, setDirection] = useState('');
  const [stages, setStages] = useState<Partial<ProgramStage>[]>([
    {
      name: 'Видеоинтервью',
      type: 'video_interview',
      order: 1,
      questions: ['']
    }
  ]);

  const stageTypes: { value: StageType; label: string }[] = [
    { value: 'video_interview', label: 'Видеоинтервью' },
    { value: 'technical_test', label: 'Техническое тестирование' },
    { value: 'interview', label: 'Интервью' },
    { value: 'task', label: 'Практическое задание' }
  ];

  const addStage = () => {
    setStages([
      ...stages,
      {
        name: '',
        type: 'interview',
        order: stages.length + 1
      }
    ]);
  };

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, updates: Partial<ProgramStage>) => {
    setStages(stages.map((stage, i) => 
      i === index ? { ...stage, ...updates } : stage
    ));
  };

  const addQuestion = (stageIndex: number) => {
    const stage = stages[stageIndex];
    if (stage.type === 'video_interview') {
      updateStage(stageIndex, {
        questions: [...(stage.questions || []), '']
      });
    }
  };

  const updateQuestion = (stageIndex: number, questionIndex: number, value: string) => {
    const stage = stages[stageIndex];
    const newQuestions = [...(stage.questions || [])];
    newQuestions[questionIndex] = value;
    updateStage(stageIndex, { questions: newQuestions });
  };

  const removeQuestion = (stageIndex: number, questionIndex: number) => {
    const stage = stages[stageIndex];
    updateStage(stageIndex, {
      questions: (stage.questions || []).filter((_, i) => i !== questionIndex)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !direction) {
      alert('Заполните все обязательные поля');
      return;
    }

    if (stages.length === 0) {
      alert('Добавьте хотя бы один этап');
      return;
    }

    const program: Program = {
      id: `prog-${Date.now()}`,
      name,
      description,
      direction,
      active: true,
      createdAt: new Date(),
      stages: stages.map((stage, index) => ({
        id: `stage-${Date.now()}-${index}`,
        name: stage.name || '',
        type: stage.type || 'interview',
        order: index + 1,
        questions: stage.questions?.filter(q => q.trim() !== '')
      }))
    };

    await context.addProgram(program);
    context.navigateTo('hr-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => context.navigateTo('hr-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            К списку программ
          </button>
          
          <h1 className="text-3xl mb-2">Создание программы стажировки</h1>
          <p className="text-gray-600">Настройте этапы отбора и вопросы для кандидатов</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl mb-4">Основная информация</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Название программы <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Frontend стажировка 2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Описание <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание программы стажировки"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Направление <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  placeholder="Например: Frontend Development"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Этапы */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Этапы отбора</h2>
              <button
                type="button"
                onClick={addStage}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить этап
              </button>
            </div>

            <div className="space-y-4">
              {stages.map((stage, stageIndex) => (
                <div key={stageIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 mt-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1 text-gray-700">
                            Название этапа
                          </label>
                          <input
                            type="text"
                            value={stage.name || ''}
                            onChange={(e) => updateStage(stageIndex, { name: e.target.value })}
                            placeholder="Например: Видеоинтервью"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1 text-gray-700">
                            Тип этапа
                          </label>
                          <select
                            value={stage.type}
                            onChange={(e) => updateStage(stageIndex, { type: e.target.value as StageType })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
                          >
                            {stageTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Вопросы для видеоинтервью */}
                      {stage.type === 'video_interview' && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm text-gray-700">Вопросы</label>
                            <button
                              type="button"
                              onClick={() => addQuestion(stageIndex)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              + Добавить вопрос
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {(stage.questions || []).map((question, qIndex) => (
                              <div key={qIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={question}
                                  onChange={(e) => updateQuestion(stageIndex, qIndex, e.target.value)}
                                  placeholder={`Вопрос ${qIndex + 1}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(stageIndex, qIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeStage(stageIndex)}
                      className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 pl-8">
                    Этап {stageIndex + 1} из {stages.length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => context.navigateTo('hr-dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Создать программу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
