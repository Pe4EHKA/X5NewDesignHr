import { useState } from 'react';
import { AppContextType, User } from '../App';
import { Building2, LogIn } from 'lucide-react';

type LoginProps = {
  context: AppContextType;
};

export function Login({ context }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Простая mock авторизация
    // В реальном приложении здесь был бы API запрос
    let user: User | null = null;

    if (email === 'hr@x5.ru' && password === 'hr') {
      user = {
        id: 'hr1',
        email: 'hr@x5.ru',
        name: 'HR Менеджер',
        role: 'hr'
      };
      context.setUser(user);
      context.navigateTo('hr-dashboard');
    } else if (email === 'intern@x5.ru' && password === 'intern') {
      const candidate = context.candidates[0];
      user = {
        id: candidate.id,
        email: candidate.email,
        name: `${candidate.firstName} ${candidate.lastName}`,
        role: 'intern'
      };
      context.setUser(user);
      context.navigateTo('intern-dashboard');
    } else {
      alert('Неверный email или пароль. Для демо используйте: hr или intern');
    }
  };

  const handleQuickLogin = (role: 'hr' | 'intern') => {
    if (role === 'hr') {
      const user: User = {
        id: 'hr1',
        email: 'hr@x5.ru',
        name: 'HR Менеджер',
        role: 'hr'
      };
      context.setUser(user);
      context.navigateTo('hr-dashboard');
    } else {
      // Используем c3 - новый стажёр без прогресса
      const candidate = context.candidates.find(c => c.id === 'c3') || context.candidates[0];
      const user: User = {
        id: candidate.id,
        email: candidate.email,
        name: `${candidate.firstName} ${candidate.lastName}`,
        role: 'intern'
      };
      context.setUser(user);
      context.navigateTo('intern-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl mb-2">X5 Group</h1>
          <p className="text-gray-600">Платформа отбора стажёров</p>
        </div>

        {/* Форма вход�� */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl mb-6">Вход в систему</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                Email
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@x5.ru"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Войти
            </button>
          </form>

          {/* Быстрый вход для демо */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">Демо-доступ:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('hr')}
                className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              >
                Войти как HR
              </button>
              
              <div className="grid grid-cols-3 gap-2">
                {context.candidates.map((candidate, index) => {
                  const progress = context.candidateProgress.find(p => p.candidateId === candidate.id);
                  const statusLabel = progress 
                    ? progress.status === 'in_progress' ? '🔵 В процессе'
                    : progress.status === 'pending_review' ? '🟡 На проверке'
                    : progress.status === 'passed' ? '🟢 Прошёл'
                    : '🔴 Отклонён'
                    : '✨ Новый';
                  
                  const fullName = `${candidate.firstName} ${candidate.lastName}`;
                  
                  return (
                    <button
                      key={candidate.id}
                      onClick={() => {
                        const user: User = {
                          id: candidate.id,
                          email: candidate.email,
                          name: fullName,
                          role: 'intern'
                        };
                        context.setUser(user);
                        context.navigateTo('intern-dashboard');
                      }}
                      className="px-2 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs text-left"
                      title={`${fullName} - ${statusLabel}`}
                    >
                      <div className="truncate">{candidate.firstName}</div>
                      <div className="text-xs opacity-70">{statusLabel}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Нанимающий менеджер?</p>
          <button
            onClick={() => context.navigateTo('manager-evaluation')}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Перейти к форме оценки →
          </button>
        </div>
      </div>
    </div>
  );
}