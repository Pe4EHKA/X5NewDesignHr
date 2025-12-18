import { AppContextType } from '../../App';
import { LogOut, FolderOpen, Play, CheckCircle, Clock, XCircle } from 'lucide-react';

type InternDashboardProps = {
  context: AppContextType;
};

export function InternDashboard({ context }: InternDashboardProps) {
  const handleLogout = () => {
    context.setUser(null);
    context.navigateTo('login');
  };

  if (!context.user) return null;

  const candidate = context.candidates.find(c => c.id === context.user!.id);
  if (!candidate) return null;

  const myPrograms = context.programs.filter(p => candidate.programs.includes(p.id));
  const myProgress = context.candidateProgress.filter(p => p.candidateId === candidate.id);

  const getProgramProgress = (programId: string) => {
    return myProgress.find(p => p.programId === programId);
  };

  const getStatusInfo = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string; bgColor: string }> = {
      in_progress: {
        icon: Clock,
        color: 'text-blue-700',
        label: 'В процессе',
        bgColor: 'bg-blue-100'
      },
      pending_review: {
        icon: Clock,
        color: 'text-amber-700',
        label: 'На проверке',
        bgColor: 'bg-amber-100'
      },
      passed: {
        icon: CheckCircle,
        color: 'text-green-700',
        label: 'Завершено',
        bgColor: 'bg-green-100'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-700',
        label: 'Отклонено',
        bgColor: 'bg-red-100'
      }
    };

    return statusConfig[status] || statusConfig.in_progress;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">X5</span>
              </div>
              <div>
                <h1 className="text-xl">Мои программы стажировок</h1>
                <p className="text-sm text-gray-600">{candidate.firstName} {candidate.lastName}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Приветствие */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h2 className="text-2xl mb-2">Добро пожаловать, {candidate.firstName}! 👋</h2>
          <p className="text-red-50">
            Здесь вы можете отслеживать прогресс по всем вашим программам стажировок и проходить этапы отбора.
          </p>
        </div>

        {/* Список программ */}
        {myPrograms.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl mb-2">Вы пока не записаны ни на одну программу</h3>
            <p className="text-gray-600">Обратитесь к HR для назначения на программу стажировки</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myPrograms.map(program => {
              const progress = getProgramProgress(program.id);
              const statusInfo = progress ? getStatusInfo(progress.status) : null;

              // Подсчитываем прогресс
              const totalStages = program.stages.length;
              const completedStages = progress?.stageResults.filter(
                sr => sr.status === 'passed' || sr.status === 'completed'
              ).length || 0;

              return (
                <div
                  key={program.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl mb-2">{program.name}</h3>
                      <p className="text-gray-600 mb-3">{program.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-3 mb-4">
                        <span>📂 {program.direction}</span>
                        <span>•</span>
                        <span>🎯 {totalStages} этапов</span>
                      </div>

                      {/* Прогресс бар */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-700">Прогресс</span>
                          <span className="text-gray-600">
                            {completedStages} из {totalStages} этапов
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${(completedStages / totalStages) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Статус */}
                      {statusInfo && (
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${statusInfo.bgColor} ${statusInfo.color}`}>
                            <statusInfo.icon className="w-4 h-4 mr-2" />
                            {statusInfo.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ml-6">
                      {(progress?.status === 'in_progress' || progress?.status === 'pending_review') && (
                        <button
                          onClick={() => {
                            context.setSelectedProgramId(program.id);
                            context.navigateTo('program-progress');
                          }}
                          className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          {progress?.status === 'pending_review' ? 'Смотреть прогресс' : 'Продолжить'}
                        </button>
                      )}
                      {progress?.status === 'passed' && (
                        <button
                          onClick={() => {
                            context.setSelectedProgramId(program.id);
                            context.navigateTo('program-progress');
                          }}
                          className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Смотреть детали
                        </button>
                      )}
                      {progress?.status === 'rejected' && (
                        <button
                          onClick={() => {
                            context.setSelectedProgramId(program.id);
                            context.navigateTo('program-progress');
                          }}
                          className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          Смотреть обратную связь
                        </button>
                      )}
                      {!progress && (
                        <button
                          onClick={() => {
                            context.setSelectedProgramId(program.id);
                            context.navigateTo('program-progress');
                          }}
                          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Начать
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Детали текущего этапа */}
                  {progress && progress.status === 'in_progress' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center text-blue-900 mb-2">
                          <Play className="w-4 h-4 mr-2" />
                          <span className="text-sm">Текущий этап:</span>
                        </div>
                        <p className="text-blue-800">
                          {program.stages.find(s => s.id === progress.currentStageId)?.name || 'Неизвестный этап'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Для нового стажёра без прогресса - показать призыв к действию */}
                  {!progress && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-green-800">
                          ✨ Вы записаны на эту программу! Нажмите "Начать", чтобы приступить к первому этапу.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Подсказка */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Вопросы? Обратитесь к HR-менеджеру по адресу hr@x5.ru</p>
        </div>

        {/* Доступные программы для записи */}
        {(() => {
          const availablePrograms = context.programs.filter(
            p => p.active && !candidate.programs.includes(p.id)
          );

          if (availablePrograms.length === 0) return null;

          return (
            <div className="mt-12">
              <h2 className="text-2xl mb-4">Другие доступные программы</h2>
              <div className="space-y-4">
                {availablePrograms.map(program => (
                  <div
                    key={program.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl mb-2">{program.name}</h3>
                        <p className="text-gray-600 mb-3">{program.description}</p>
                        
                        <div className="flex items-center text-sm text-gray-600 space-x-3">
                          <span>📂 {program.direction}</span>
                          <span>•</span>
                          <span>🎯 {program.stages.length} этапов</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          // Добавляем программу к кандидату
                          const updatedPrograms = [...candidate.programs, program.id];
                          context.updateCandidate(candidate.id, {
                            programs: updatedPrograms
                          });
                          alert(`Вы успешно записались на программу "${program.name}"!`);
                        }}
                        className="ml-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        Записаться
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}