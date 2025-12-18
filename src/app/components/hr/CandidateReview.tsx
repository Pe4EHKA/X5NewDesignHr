import { useState } from 'react';
import { AppContextType } from '../../App';
import { ArrowLeft, Video, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { CandidateInfoCard } from '../CandidateInfoCard';

type CandidateReviewProps = {
  context: AppContextType;
};

export function CandidateReview({ context }: CandidateReviewProps) {
  const candidate = context.candidates.find(c => c.id === context.selectedCandidateId);
  const program = context.programs.find(p => p.id === context.selectedProgramId);
  const progress = context.candidateProgress.find(
    p => p.candidateId === context.selectedCandidateId && p.programId === context.selectedProgramId
  );

  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFeedbackTemplate, setSelectedFeedbackTemplate] = useState('');
  const [customFeedback, setCustomFeedback] = useState('');

  // Найти всех кандидатов с завершённым видеоинтервью в этой программе
  const candidatesWithVideo = program ? context.candidates.filter(c => {
    const prog = context.candidateProgress.find(p => p.candidateId === c.id && p.programId === program.id);
    return prog?.stageResults.some(sr => {
      const stage = program.stages.find(s => s.id === sr.stageId);
      return stage?.type === 'video_interview' && 
             (sr.status === 'completed' || sr.status === 'passed' || sr.status === 'rejected') && 
             sr.videoAnswers && 
             sr.videoAnswers.length > 0;
    });
  }) : [];

  const currentCandidateIndex = candidatesWithVideo.findIndex(c => c.id === context.selectedCandidateId);
  const nextCandidate = candidatesWithVideo[currentCandidateIndex + 1];
  const previousCandidate = candidatesWithVideo[currentCandidateIndex - 1];

  const goToNextCandidate = () => {
    if (nextCandidate) {
      context.setSelectedCandidateId(nextCandidate.id);
      setSelectedVideoIndex(0); // Сбросить на первое видео
      setShowRejectModal(false);
      setSelectedFeedbackTemplate('');
      setCustomFeedback('');
    }
  };

  const goToPreviousCandidate = () => {
    if (previousCandidate) {
      context.setSelectedCandidateId(previousCandidate.id);
      setSelectedVideoIndex(0); // Сбросить на первое видео
      setShowRejectModal(false);
      setSelectedFeedbackTemplate('');
      setCustomFeedback('');
    }
  };

  if (!candidate || !program || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Данные не найдены</p>
          <button
            onClick={() => context.navigateTo('program-details')}
            className="text-red-600 hover:text-red-700"
          >
            Вернуться к программе
          </button>
        </div>
      </div>
    );
  }

  // Находим видеоинтервью
  const videoStage = progress.stageResults.find(sr => {
    const stage = program.stages.find(s => s.id === sr.stageId);
    return stage?.type === 'video_interview' && sr.videoAnswers;
  });

  const handleAccept = () => {
    // Переводим на следующий этап
    const currentStageIndex = program.stages.findIndex(s => s.id === progress.currentStageId);
    const nextStage = program.stages[currentStageIndex + 1];

    if (nextStage) {
      // Если следующий этап - интервью, кандидат должен выбрать слот
      if (nextStage.type === 'interview') {
        context.updateCandidateProgress(candidate.id, program.id, {
          status: 'passed', // Меняем статус, чтобы стажёр мог записаться
          currentStageId: nextStage.id,
          stageResults: progress.stageResults.map(sr => 
            sr.stageId === progress.currentStageId
              ? { ...sr, status: 'passed' }
              : sr
          )
        });
        alert('Кандидат переведён на следующий этап! Ему доступна запись на интервью.');
      } else {
        context.updateCandidateProgress(candidate.id, program.id, {
          status: 'in_progress',
          currentStageId: nextStage.id,
          stageResults: progress.stageResults.map(sr => 
            sr.stageId === progress.currentStageId
              ? { ...sr, status: 'passed' }
              : sr
          )
        });
        alert('Кандидат переведён на следующий этап!');
      }
    } else {
      // Это был последний этап
      context.updateCandidateProgress(candidate.id, program.id, {
        status: 'passed',
        stageResults: progress.stageResults.map(sr => 
          sr.stageId === progress.currentStageId
            ? { ...sr, status: 'passed' }
            : sr
        )
      });
      alert('Кандидат успешно прошёл все этапы программы!');
    }

    // Не выходим со страницы, остаёмся для просмотра
  };

  const handleReject = () => {
    // Показываем модальное окно с выбором обратной связи
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    const feedback = selectedFeedbackTemplate || customFeedback;
    
    if (!feedback) {
      alert('Пожалуйста, выберите шаблон обратной связи или напишите свой текст');
      return;
    }

    context.updateCandidateProgress(candidate.id, program.id, {
      status: 'rejected',
      stageResults: progress.stageResults.map(sr => 
        sr.stageId === progress.currentStageId
          ? { ...sr, status: 'rejected', feedback }
          : sr
      )
    });

    alert(`Кандидат отклонён. Обратная связь отправлена:\n\n${feedback}`);
    setShowRejectModal(false);
    setSelectedFeedbackTemplate('');
    setCustomFeedback('');
    // Не выходим со страницы, остаёмся для просмотра
  };

  const feedbackTemplates = [
    'Благодарим за интерес к нашей программе стажировок. К сожалению, на данный момент мы не можем продолжить рассмотрение вашей кандидатуры. Желаем успехов в поиске!',
    'Спасибо за прохождение видеоинтервью. После тщательного рассмотрения мы решили продолжить работу с другими кандидатами. Рекомендуем углубить знания и попробовать снова в следующем наборе.',
    'Благодарим за участие в отборе. На текущий момент мы выбрали кандидатов с более релевантным опытом. Желаем вам найти идеальную возможность для развития карьеры!'
  ];

  if (!videoStage?.videoAnswers || videoStage.videoAnswers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Видеоответы не найдены</p>
          <button
            onClick={() => context.navigateTo('program-details')}
            className="text-red-600 hover:text-red-700"
          >
            Вернуться к программе
          </button>
        </div>
      </div>
    );
  }

  const currentVideo = videoStage.videoAnswers[selectedVideoIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Шапка */}
        <div className="mb-6">
          <button
            onClick={() => context.navigateTo('program-details')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            К списку кандидатов
          </button>

          {/* Информация о кандидате */}
          <CandidateInfoCard candidate={candidate} />
        </div>

        {/* Кнопки действий */}
        <div className="mb-6 flex gap-3 items-center">
          {/* Показываем кнопки только если статус pending_review или in_progress */}
          {(progress.status === 'pending_review' || progress.status === 'in_progress') ? (
            <>
              <button
                onClick={handleReject}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Отклонить
              </button>
              <button
                onClick={handleAccept}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Принять
              </button>
            </>
          ) : (
            // Показываем статус если уже обработан
            <div className="flex items-center gap-3">
              {progress.status === 'passed' && (
                <div className="flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Кандидат принят
                </div>
              )}
              {progress.status === 'rejected' && (
                <div className="flex items-center px-6 py-3 bg-red-100 text-red-800 rounded-lg">
                  <XCircle className="w-5 h-5 mr-2" />
                  Кандидат отклонён
                </div>
              )}
            </div>
          )}
          
          {/* Навигация между кандидатами */}
          {candidatesWithVideo.length > 1 && (
            <>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <button
                  onClick={goToPreviousCandidate}
                  disabled={!previousCandidate}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                  Предыдущий
                </button>
                
                <span className="text-sm text-gray-600">
                  {currentCandidateIndex + 1} / {candidatesWithVideo.length}
                </span>
                
                <button
                  onClick={goToNextCandidate}
                  disabled={!nextCandidate}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующий
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Список вопросов */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-lg mb-4">
                Вопросы ({videoStage.videoAnswers.length})
              </h2>

              <div className="space-y-2">
                {videoStage.videoAnswers.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVideoIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedVideoIndex === index
                        ? 'bg-red-50 border-2 border-red-500'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        selectedVideoIndex === index ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm line-clamp-2">{video.question}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Видео и транскрипт */}
          <div className="lg:col-span-2 space-y-6">
            {/* Вопрос */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mr-4">
                  {selectedVideoIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl mb-2">Вопрос</h2>
                  <p className="text-gray-700">{currentVideo.question}</p>
                </div>
              </div>
            </div>

            {/* Видео */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Video className="w-5 h-5 mr-2 text-red-600" />
                <h2 className="text-xl">Видеоответ</h2>
                <span className="ml-auto text-sm text-gray-600">
                  {Math.floor(currentVideo.duration / 60)}:{(currentVideo.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center group cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p>Нажмите для просмотра видео</p>
                  <p className="text-sm text-gray-400 mt-2">
                    (В демо-версии видео не воспроизводится)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    URL: {currentVideo.videoUrl}
                  </p>
                </div>
              </div>
            </div>

            {/* Полный транскрипт */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 mr-2 text-red-600" />
                <h2 className="text-xl">Полный текст ответа</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {currentVideo.transcript}
                </p>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                💡 Это полная автоматическая расшифровка ответа кандидата. 
                Никаких AI-упрощений или резюме.
              </div>
            </div>

            {/* Навигация между видео */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedVideoIndex(Math.max(0, selectedVideoIndex - 1))}
                disabled={selectedVideoIndex === 0}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Прдыдущий вопрос
              </button>

              <span className="text-gray-600">
                {selectedVideoIndex + 1} из {videoStage.videoAnswers.length}
              </span>

              <button
                onClick={() => setSelectedVideoIndex(Math.min(videoStage.videoAnswers.length - 1, selectedVideoIndex + 1))}
                disabled={selectedVideoIndex === videoStage.videoAnswers.length - 1}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Следующий вопрос →
              </button>
            </div>

            {/* Финальное решение */}
            {(progress.status === 'pending_review' || progress.status === 'in_progress') && (
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="mb-3 text-amber-900">Принятие решения</h3>
                <p className="text-sm text-amber-800 mb-4">
                  После просмотра всех видеоответов и изучения транскриптов примите решение о кандидате.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Отклонить кандидата
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Принять и перевести на следующий этап
                  </button>
                </div>
              </div>
            )}
            
            {/* Показываем статус если кандидат уже обработан */}
            {progress.status === 'passed' && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  <div>
                    <h3 className="mb-1">Кандидат принят</h3>
                    <p className="text-sm">
                      Кандидат успешно прошёл этап видеоинтервью и переведён на следующий этап программы.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {progress.status === 'rejected' && (
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center text-red-800">
                  <XCircle className="w-6 h-6 mr-3" />
                  <div>
                    <h3 className="mb-1">Кандидат отклонён</h3>
                    <p className="text-sm">
                      Кандидат был отклонён на этапе видеоинтервью. Обратная связь отправлена.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно отклонения кандидата */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl mb-4">Отклонить кандидата</h2>
            <p className="text-gray-600 mb-6">
              Выберите готовый шаблон обратной связи или напишите свой текст, который будет отправлен кандидату:
            </p>

            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-700">Готовые шаблоны:</label>
              <div className="space-y-2">
                {feedbackTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedFeedbackTemplate(template);
                      setCustomFeedback('');
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedFeedbackTemplate === template
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="text-sm text-gray-800">{template}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-700">Или напишите свой текст:</label>
              <textarea
                value={customFeedback}
                onChange={(e) => {
                  setCustomFeedback(e.target.value);
                  setSelectedFeedbackTemplate('');
                }}
                placeholder="Введите персональную обратную связь для кандидата..."
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedFeedbackTemplate('');
                  setCustomFeedback('');
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmReject}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Отклонить и отправить обратную связь
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}