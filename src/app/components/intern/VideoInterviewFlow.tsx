import { useState, useRef, useEffect } from 'react';
import { AppContextType } from '../../App';
import { Video, Circle, Square, AlertTriangle } from 'lucide-react';

type VideoInterviewFlowProps = {
  context: AppContextType;
};

const MAX_RECORDING_TIME = 180; // 3 минуты на вопрос

export function VideoInterviewFlow({ context }: VideoInterviewFlowProps) {
  const program = context.programs.find(p => p.id === context.selectedProgramId);
  const candidate = context.candidates.find(c => c.id === context.user?.id);
  const progress = context.candidateProgress.find(
    p => p.candidateId === candidate?.id && p.programId === program?.id
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; duration: number; transcript: string }[]>([]);
  const [hasRecordedCurrent, setHasRecordedCurrent] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!program || !candidate) {
    return null;
  }

  const videoStage = program.stages.find(s => s.type === 'video_interview' && s.id === progress?.currentStageId);
  
  if (!videoStage || !videoStage.questions || videoStage.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Вопросы не найдены</p>
          <button
            onClick={() => context.navigateTo('program-progress')}
            className="text-red-600 hover:text-red-700"
          >
            Вернуться к программе
          </button>
        </div>
      </div>
    );
  }

  const questions = videoStage.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Симуляция камеры
  useEffect(() => {
    const timer = setTimeout(() => {
      setCameraReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Таймер записи
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Предупреждение при попытке покинуть страницу
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (answers.length > 0 && answers.length < questions.length) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers.length, questions.length]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecordedCurrent(true);

    // Симуляция транскрипции
    const mockTranscript = `Это автоматическая транскрипция ответа на вопрос "${currentQuestion}". 
В реальной системе здесь был бы полный текст ответа кандидата, полученный через speech-to-text API. 
Длительность записи: ${formatTime(recordingTime)}. 
Текст должен точно отражать всё сказанное кандидатом без искажений и упрощений.`;

    const newAnswer = {
      question: currentQuestion,
      duration: recordingTime,
      transcript: mockTranscript
    };

    setAnswers([...answers, newAnswer]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setRecordingTime(0);
      setHasRecordedCurrent(false);
    }
  };

  const handleSubmitAll = () => {
    // Сохраняем все ответы в прогресс
    const videoAnswers = answers.map((answer, index) => ({
      question: answer.question,
      videoUrl: `mock-video-${Date.now()}-${index}`,
      transcript: answer.transcript,
      duration: answer.duration
    }));

    // Обновляем прогресс
    const updatedStageResults = progress!.stageResults.map(sr => 
      sr.stageId === videoStage.id
        ? { 
            ...sr, 
            status: 'completed' as const,
            completedAt: new Date(),
            videoAnswers 
          }
        : sr
    );

    context.updateCandidateProgress(candidate.id, program.id, {
      status: 'pending_review',
      stageResults: updatedStageResults
    });

    alert('Все ответы отправлены на проверку! Вы получите уведомление о результатах.');
    context.navigateTo('program-progress');
  };

  const handleTryExit = () => {
    // Если уже начали записывать ответы - можем выйти и отправить то что есть
    if (answers.length > 0) {
      setShowExitWarning(true);
    } else {
      // Если ещё не начали - просто выходим
      context.navigateTo('program-progress');
    }
  };

  const handleForceExit = () => {
    // Отправляем все записанные ответы и завершаем интервью
    if (answers.length === 0) {
      context.navigateTo('program-progress');
      return;
    }

    const videoAnswers = answers.map((answer, index) => ({
      question: answer.question,
      videoUrl: `mock-video-${Date.now()}-${index}`,
      transcript: answer.transcript,
      duration: answer.duration
    }));

    // Обновляем прогресс - помечаем как completed
    const updatedStageResults = progress!.stageResults.map(sr => 
      sr.stageId === videoStage.id
        ? { 
            ...sr, 
            status: 'completed' as const,
            completedAt: new Date(),
            videoAnswers 
          }
        : sr
    );

    context.updateCandidateProgress(candidate.id, program.id, {
      status: 'pending_review',
      stageResults: updatedStageResults
    });

    alert(`Видеоинтервью завершено! Отправлено ${answers.length} ответов из ${questions.length} возможных.\nОстальные вопросы будут пропущены.\n\nВаши ответы направлены на проверку HR.`);
    context.navigateTo('program-progress');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      {/* Предупреждение о выходе */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-gray-900 my-8">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl mb-2">Нельзя прервать интервью!</h2>
              <p className="text-gray-600">
                После начала видеоинтервью вы должны ответить на все вопросы. 
                Ваши текущие ответы сохранены, но вы не можете выйти, пока не завершите все вопросы.
              </p>
              <p className="text-gray-800 mt-4">
                Уже записано: <strong>{answers.length}</strong> из <strong>{questions.length}</strong> ответов
              </p>
            </div>
            <button
              onClick={() => setShowExitWarning(false)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Продолжить интервью
            </button>
            <button
              onClick={handleForceExit}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-4"
            >
              Завершить интервью и выйти
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Шапка */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">{videoStage.name}</h1>
            <p className="text-gray-400">{program.name}</p>
          </div>

          <button
            onClick={handleTryExit}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            {answers.length === 0 ? 'Отменить' : 'Выйти'}
          </button>
        </div>

        {/* Прогресс */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span>Вопрос {currentQuestionIndex + 1} из {questions.length}</span>
            <span>{answers.length} ответов записано</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(answers.length / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Видео */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="relative aspect-video bg-black">
                {!cameraReady ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                      <p>Подключаем камеру...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center bg-red-600 px-3 py-1.5 rounded-full">
                        <Circle className="w-3 h-3 mr-2 fill-current animate-pulse" />
                        <span className="text-sm">REC</span>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 bg-black/70 px-3 py-1.5 rounded-lg">
                      <span className="text-sm tabular-nums">
                        {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Контролы */}
              <div className="p-6">
                {!isRecording && !hasRecordedCurrent ? (
                  <button
                    onClick={handleStartRecording}
                    disabled={!cameraReady}
                    className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                  >
                    <Circle className="w-6 h-6 mr-2 fill-current" />
                    Начать запись ответа
                  </button>
                ) : isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="w-full bg-white text-gray-900 py-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center text-lg"
                  >
                    <Square className="w-6 h-6 mr-2 fill-current" />
                    Остановить запись
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 text-center">
                      <p className="text-green-400">✓ Ответ записан ({formatTime(recordingTime)})</p>
                    </div>

                    {!isLastQuestion ? (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-lg"
                      >
                        Следующий вопрос →
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitAll}
                        className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-lg"
                      >
                        Отправить все ответы ✓
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Вопрос и инструкции */}
          <div className="space-y-6">
            {/* Текущий вопрос */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="mb-4">
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm">
                  Вопрос {currentQuestionIndex + 1}
                </span>
              </div>
              <h2 className="text-2xl mb-4">{currentQuestion}</h2>
              <p className="text-gray-400 text-sm">
                У вас есть до {MAX_RECORDING_TIME / 60} минут на ответ
              </p>
            </div>

            {/* Важная информация */}
            <div className="bg-amber-900/30 border border-amber-600 rounded-xl p-6">
              <h3 className="mb-3 text-amber-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Важно!
              </h3>
              <ul className="space-y-2 text-sm text-amber-200">
                <li>• Нельзя прервать интервью - отвечайте на все вопросы подряд</li>
                <li>• Вопросы открываются последовательно - вы не видите их заранее</li>
                <li>• Всего {questions.length} вопросов в этом интервью</li>
                <li>• Убедитесь, что у вас есть время на все вопросы</li>
                <li>• Рекомендуем найти тихое место с хорошим освещением</li>
              </ul>
            </div>

            {/* Счётчик пройденных вопросов */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="mb-4">Прогресс интервью</h3>
              <div className="space-y-2">
                {Array.from({ length: questions.length }).map((_, idx) => {
                  const isAnswered = idx < answers.length;
                  const isCurrent = idx === currentQuestionIndex;
                  const isUpcoming = idx > currentQuestionIndex;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        isCurrent
                          ? 'bg-red-600'
                          : isAnswered
                          ? 'bg-green-900/50 border border-green-600'
                          : 'bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center mr-3 text-sm">
                          {idx + 1}
                        </div>
                        <span className="text-sm">
                          {isCurrent ? 'Текущий вопрос' : isAnswered ? 'Ответ записан' : 'Ожидание'}
                        </span>
                      </div>
                      {isAnswered && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}