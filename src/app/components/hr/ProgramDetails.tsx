import { AppContextType } from '../../App';
import { ArrowLeft, Users, CheckCircle, Clock, XCircle, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { CandidateInfoCard } from '../CandidateInfoCard';

type ProgramDetailsProps = {
  context: AppContextType;
};

export function ProgramDetails({ context }: ProgramDetailsProps) {
  const program = context.programs.find(p => p.id === context.selectedProgramId);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl mb-2">Программа не найдена</h2>
          <button
            onClick={() => context.navigateTo('hr-dashboard')}
            className="text-red-600 hover:text-red-700"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  const candidatesInProgram = context.candidates.filter(c => c.programs.includes(program.id));
  const progressData = context.candidateProgress.filter(p => p.programId === program.id);

  const getCandidateProgress = (candidateId: string) => {
    return progressData.find(p => p.candidateId === candidateId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending_review':
        return 'bg-amber-100 text-amber-700';
      case 'passed':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      in_progress: 'В процессе',
      pending_review: 'На проверке',
      passed: 'Прошёл',
      rejected: 'Отклонён'
    };
    return labels[status] || status;
  };

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Шапка */}
        <div className="mb-6">
          <button
            onClick={() => context.navigateTo('hr-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            К списку программ
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl mb-2">{program.name}</h1>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📂 {program.direction}</span>
                  <span>•</span>
                  <span>🎯 {program.stages.length} этапов</span>
                  <span>•</span>
                  <span>👥 {candidatesInProgram.length} кандидатов</span>
                </div>
              </div>
              
              {program.active ? (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                  Активна
                </span>
              ) : (
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  Неактивна
                </span>
              )}
            </div>

            {/* Этапы программы */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm text-gray-700 mb-3">Этапы программы:</h3>
              <div className="flex gap-2 flex-wrap">
                {program.stages.map((stage, index) => (
                  <div key={stage.id} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                    {index + 1}. {stage.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Список кандидатов */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Кандидаты и их прогресс
            </h2>
          </div>

          {candidatesInProgram.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl mb-2">Нет кандидатов</h3>
              <p className="text-gray-600">Назначьте кандидатов на эту программу</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm text-gray-700 sticky left-0 bg-gray-50">
                      Кандидат
                    </th>
                    {program.stages.map(stage => (
                      <th key={stage.id} className="px-6 py-3 text-center text-sm text-gray-700 min-w-[150px]">
                        {stage.name}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-sm text-gray-700 min-w-[120px]">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-center text-sm text-gray-700 min-w-[120px]">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidatesInProgram.map(candidate => {
                    const progress = getCandidateProgress(candidate.id);
                    
                    // Проверяем, есть ли завершенное видеоинтервью
                    const hasCompletedVideoInterview = progress?.stageResults.some(sr => {
                      const stage = program.stages.find(s => s.id === sr.stageId);
                      return stage?.type === 'video_interview' && 
                             sr.videoAnswers && 
                             sr.videoAnswers.length > 0;
                    });

                    const handleCandidateClick = () => {
                      if (hasCompletedVideoInterview) {
                        // Если есть видео - открываем страницу просмотра
                        context.setSelectedCandidateId(candidate.id);
                        context.navigateTo('candidate-review', { 
                          candidateId: candidate.id,
                          programId: program.id
                        });
                      } else {
                        // Если нет видео - показываем модальное окно с информацией
                        setSelectedCandidate(candidate.id);
                      }
                    };
                    
                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 sticky left-0 bg-white">
                          <div>
                            <button
                              onClick={handleCandidateClick}
                              className="text-gray-900 hover:text-blue-600 hover:underline text-left transition-colors"
                            >
                              {candidate.firstName} {candidate.lastName}
                            </button>
                            <div className="text-sm text-gray-600">{candidate.email}</div>
                          </div>
                        </td>
                        
                        {program.stages.map(stage => {
                          const stageResult = progress?.stageResults.find(sr => sr.stageId === stage.id);
                          const status = stageResult?.status || 'not_started';
                          
                          return (
                            <td key={stage.id} className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center">
                                {getStatusIcon(status)}
                              </div>
                            </td>
                          );
                        })}

                        <td className="px-6 py-4 text-center">
                          {progress && (
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(progress.status)}`}>
                              {getStatusLabel(progress.status)}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {progress?.status === 'pending_review' && (
                            <button
                              onClick={() => {
                                context.setSelectedCandidateId(candidate.id);
                                context.navigateTo('candidate-review', { 
                                  candidateId: candidate.id,
                                  programId: program.id
                                });
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Проверить
                            </button>
                          )}
                          {progress?.status === 'in_progress' && (
                            <span className="text-sm text-gray-500">Ожидание...</span>
                          )}
                          {progress?.status === 'passed' && (
                            <div className="flex flex-col gap-2 items-center">
                              <span className="text-sm text-green-600">✓ Прошёл</span>
                              {/* Проверяем, на этапе ли интервью */}
                              {(() => {
                                const currentStage = program.stages.find(s => s.id === progress.currentStageId);
                                const stageResult = progress.stageResults.find(sr => sr.stageId === progress.currentStageId);
                                
                                // Если текущий этап - интервью и есть запись на слот (или статус не started)
                                if (currentStage?.type === 'interview' && stageResult?.status === 'not_started') {
                                  return (
                                    <button
                                      onClick={() => {
                                        context.setSelectedCandidateId(candidate.id);
                                        context.navigateTo('manager-evaluation', {
                                          candidateId: candidate.id,
                                          programId: program.id
                                        });
                                      }}
                                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                                    >
                                      Форма оценки →
                                    </button>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                          {progress?.status === 'rejected' && (
                            <span className="text-sm text-red-600">✗ Отклонён</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Модальное окно с информацией о кандидате */}
        {selectedCandidate && (() => {
          const candidate = context.candidates.find(c => c.id === selectedCandidate);
          if (!candidate) return null;
          
          return (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" 
              onClick={() => setSelectedCandidate(null)}
            >
              <div 
                className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl">Информация о кандидате</h2>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <CandidateInfoCard candidate={candidate} />
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 Этот кандидат ещё не прошёл видеоинтервью в данной программе
                  </p>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}