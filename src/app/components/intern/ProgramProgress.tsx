import { AppContextType } from '../../types';
import { ArrowLeft, CheckCircle, Lock, Play, Clock } from 'lucide-react';

type ProgramProgressProps = {
  context: AppContextType;
};

export function ProgramProgress({ context }: ProgramProgressProps) {
  const program = context.programs.find(p => p.id === context.selectedProgramId);
  const candidate = context.candidates.find(c => c.id === context.user?.id);

  if (!program || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Программа не найдена</p>
          <button
            onClick={() => context.navigateTo('intern-dashboard')}
            className="text-red-600 hover:text-red-700"
          >
            Вернуться к списку программ
          </button>
        </div>
      </div>
    );
  }

  const progress = context.candidateProgress.find(
    p => p.candidateId === candidate.id && p.programId === program.id
  );

  const handleStartStage = async (stageId: string) => {
    const stage = program.stages.find(s => s.id === stageId);
    
    if (!stage) return;

    if (stage.type === 'video_interview') {
      // Инициализируем прогресс если его нет
      if (!progress) {
        await context.updateCandidateProgress(candidate.id, program.id, {
          candidateId: candidate.id,
          programId: program.id,
          currentStageId: stageId,
          status: 'in_progress',
          stageResults: program.stages.map(s => ({
            stageId: s.id,
            status: s.id === stageId ? 'in_progress' : 'not_started'
          }))
        });
      }
      
      context.navigateTo('video-interview');
    } else if (stage.type === 'interview') {
      // Переходим к выбору слота
      context.navigateTo('schedule-interview');
    } else {
      alert(`Этап "${stage.name}" будет доступен позже`);
    }
  };

  const getStageStatus = (stageId: string): 'not_started' | 'in_progress' | 'completed' | 'passed' | 'rejected' | 'locked' => {
    if (!progress) {
      // Первый этап доступен, остальные заблокированы
      return stageId === program.stages[0].id ? 'not_started' : 'locked';
    }

    const stageResult = progress.stageResults.find(sr => sr.stageId === stageId);
    const stageIndex = program.stages.findIndex(s => s.id === stageId);
    const currentStageIndex = program.stages.findIndex(s => s.id === progress.currentStageId);

    // ВАЖНО: Сначала проверяем, не является ли этап будущим
    // Если это этап после текущего - заблокирован
    if (stageIndex > currentStageIndex) {
      return 'locked';
    }

    // Только потом смотрим на статус из stageResult
    if (stageResult?.status && stageResult.status !== 'not_started') {
      return stageResult.status as any;
    }

    // Если это текущий этап или до него
    if (stageIndex === currentStageIndex) {
      return stageResult?.status || 'in_progress';
    }

    return stageResult?.status || 'not_started';
  };

  const isStageAccessible = (stageId: string): boolean => {
    const status = getStageStatus(stageId);
    return status !== 'locked';
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'rejected':
        return (
          <div className="w-6 h-6 rounded-full border-2 border-red-600 bg-red-50 flex items-center justify-center">
            <span className="text-red-600 text-lg leading-none">✕</span>
          </div>
        );
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Шапка */}
        <div className="mb-6">
          <button
            onClick={() => context.navigateTo('intern-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            К списку программ
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h1 className="text-3xl mb-2">{program.name}</h1>
            <p className="text-gray-600">{program.description}</p>
          </div>
        </div>

        {/* Роадмап - только текущий и прошедшие этапы */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl mb-6">Ваш прогресс</h2>

          {/* Если отклонён - показываем обратную связь */}
          {progress?.status === 'rejected' && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="text-red-900 mb-3 flex items-center">
                <span className="text-2xl mr-2">✉️</span>
                Обратная связь от команды
              </h3>
              <div className="bg-white p-4 rounded-lg border border-red-100">
                <p className="text-gray-800 leading-relaxed">
                  {progress.stageResults.find(sr => sr.feedback)?.feedback || 
                   'Благодарим за участие в программе стажировок. К сожалению, на данный момент мы не можем продолжить рассмотрение вашей кандидатуры.'}
                </p>
              </div>
            </div>
          )}

          {/* Если успешно завершил - показываем поздравление */}
          {progress?.status === 'passed' && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-green-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">🎉</span>
                Поздравляем!
              </h3>
              <p className="text-green-800">
                Вы успешно прошли все этапы программы стажировок. Наш HR свяжется с вами для обсуждения следующих шагов.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {program.stages.map((stage, index) => {
              const status = getStageStatus(stage.id);
              const isAccessible = isStageAccessible(stage.id);
              const isCurrent = progress?.currentStageId === stage.id;
              const isLocked = status === 'locked';

              // НЕ ПОКАЗЫВАЕМ будущие этапы - только текущий и пройденные
              if (isLocked) {
                return null;
              }

              return (
                <div key={stage.id} className="relative">
                  {/* Линия соединения */}
                  {index < program.stages.length - 1 && (
                    <div className={`absolute left-3 top-12 w-0.5 h-full ${
                      status === 'passed' || status === 'completed' 
                        ? 'bg-green-600' 
                        : 'bg-gray-300'
                    }`} style={{ height: 'calc(100% + 0.5rem)' }} />
                  )}

                  <div className={`relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                    isCurrent 
                      ? 'border-blue-500 bg-blue-50' 
                      : isLocked
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : status === 'passed' || status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                    {/* Иконка статуса */}
                    <div className="flex-shrink-0 mt-1">
                      {getStageIcon(status)}
                    </div>

                    {/* Содержимое */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg">{stage.name}</h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs">
                                Текущий этап
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {stage.type === 'video_interview' && 'Видеоинтервью'}
                            {stage.type === 'technical_test' && 'Техническое тестирование'}
                            {stage.type === 'interview' && 'Интервью с командой'}
                            {stage.type === 'task' && 'Практическое задание'}
                          </p>

                          {stage.type === 'video_interview' && stage.questions && (
                            <p className="text-sm text-gray-500 mt-1">
                              {stage.questions.length} вопросов
                            </p>
                          )}
                        </div>

                        {/* Действия */}
                        {!isLocked && (
                          <div>
                            {(status === 'not_started' || status === 'in_progress') && stage.type === 'interview' && (() => {
                              // Проверяем, выбрана ли дата интервью
                              const stageResult = progress?.stageResults.find(sr => sr.stageId === stage.id);
                              if (stageResult?.scheduledDate) {
                                const scheduledDate = new Date(stageResult.scheduledDate);
                                return (
                                  <div className="px-4 py-3 bg-green-50 border-2 border-green-500 rounded-lg text-sm">
                                    <div className="text-green-900 mb-1">
                                      <Clock className="w-4 h-4 inline mr-1" />
                                      Вы записаны:
                                    </div>
                                    <div className="text-green-800">
                                      {scheduledDate.toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                    <a
                                      href="https://meet.google.com/xxx-yyyy-zzz"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                                    >
                                      🔗 Ссылка на встречу
                                    </a>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            
                            {(status === 'not_started' || status === 'in_progress') && !(() => {
                              const stageResult = progress?.stageResults.find(sr => sr.stageId === stage.id);
                              return stage.type === 'interview' && stageResult?.scheduledDate;
                            })() && (
                              <button
                                onClick={() => handleStartStage(stage.id)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {status === 'in_progress' ? 'Продолжить' : 'Начать'}
                              </button>
                            )}
                            {status === 'completed' && (
                              <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm text-center">
                                <Clock className="w-4 h-4 inline mr-1" />
                                На проверке
                              </div>
                            )}
                            {status === 'passed' && (
                              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm text-center">
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                Пройдено
                              </div>
                            )}
                          </div>
                        )}

                        {isLocked && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Lock className="w-4 h-4 mr-1" />
                            Заблокировано
                          </div>
                        )}
                      </div>

                      {/* Информация о следующем этапе */}
                      {status === 'completed' && (
                        <div className="mt-3 p-3 bg-white rounded border border-amber-200">
                          <p className="text-sm text-amber-800">
                            ⏳ Ваши ответы проверяются. Вы получите уведомление о результатах.
                          </p>
                        </div>
                      )}

                      {status === 'passed' && index < program.stages.length - 1 && (
                        <div className="mt-3 p-3 bg-white rounded border border-green-200">
                          <p className="text-sm text-green-800">
                            ✅ Этап пройден! Следующий этап уже доступен.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Общий прогресс */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700">Общий прогресс</span>
              <span className="text-gray-600">
                {progress?.stageResults.filter(sr => sr.status === 'passed' || sr.status === 'completed').length || 0} из {program.stages.length}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${((progress?.stageResults.filter(sr => sr.status === 'passed' || sr.status === 'completed').length || 0) / program.stages.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Информация */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="mb-2 text-blue-900">💡 Важно знать</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Этапы открываются последовательно после прохождения предыдущего</li>
            <li>• Видеоинтервью нельзя прервать - убедитесь, что у вас есть время</li>
            <li>• После завершения этапа он отправляется на проверку</li>
            <li>• Вы получите уведомление о результатах проверки</li>
          </ul>
        </div>
      </div>
    </div>
  );
}