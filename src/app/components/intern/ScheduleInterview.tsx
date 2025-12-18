import { useState } from 'react';
import { AppContextType } from '../../App';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

type ScheduleInterviewProps = {
  context: AppContextType;
};

export function ScheduleInterview({ context }: ScheduleInterviewProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const program = context.programs.find(p => p.id === context.selectedProgramId);
  const candidate = context.candidates.find(c => c.id === context.user?.id);

  if (!program || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Данные не найдены</p>
          <button
            onClick={() => context.navigateTo('intern-dashboard')}
            className="text-red-600 hover:text-red-700"
          >
            Вернуться к программам
          </button>
        </div>
      </div>
    );
  }

  // Генерируем доступные даты (следующие 14 дней, исключая выходные)
  const availableDates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    
    // Пропускаем выходные
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      availableDates.push(date);
    }
  }

  // Доступные временные слоты
  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Выберите дату и время');
      return;
    }

    const progress = context.candidateProgress.find(
      p => p.candidateId === candidate.id && p.programId === program.id
    );

    if (!progress) return;

    // Сохраняем выбранное время в прогресс
    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const interviewStage = progress.stageResults.find(
      sr => sr.stageId === progress.currentStageId
    );

    if (interviewStage) {
      context.updateCandidateProgress(candidate.id, program.id, {
        stageResults: progress.stageResults.map(sr =>
          sr.stageId === progress.currentStageId
            ? { ...sr, scheduledDate: scheduledDateTime }
            : sr
        )
      });
    }

    alert(`Вы записаны на интервью ${selectedDate} в ${selectedTime}. Вам придёт подтверждение на email с ссылкой на встречу.`);
    context.navigateTo('program-progress');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => context.navigateTo('program-progress')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад к программе
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-3xl mb-2">Выбор времени интервью</h1>
            <p className="text-gray-600">{program.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Выбор даты */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-xl">Выберите дату</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {availableDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm text-gray-600">
                      {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                    </div>
                    <div className="text-lg">
                      {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Выбор времени */}
          {selectedDate && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-red-600 mr-2" />
                <h2 className="text-xl">Выберите время</h2>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Подтверждение */}
          {selectedDate && selectedTime && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="mb-2 text-blue-900">Подтверждение записи</h3>
              <p className="text-blue-800 mb-4">
                Вы записываетесь на интервью:<br />
                <strong>
                  {new Date(selectedDate).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })} в {selectedTime}
                </strong>
              </p>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Подтвердить запись
              </button>
            </div>
          )}
        </form>

        {/* Информация */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-3">💡 Важная информация</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Интервью проводится онлайн через Zoom/Teams</li>
            <li>• Ссылка на встречу придёт на ваш email за 1 час до начала</li>
            <li>• Длительность интервью: около 45-60 минут</li>
            <li>• Можно перенести встречу не позднее, чем за 24 часа</li>
          </ul>
        </div>
      </div>
    </div>
  );
}