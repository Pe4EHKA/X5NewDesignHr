import { useState } from 'react';
import { AppContextType } from '../../App';
import { Plus, Search, FileDown, FileUp, Users, Briefcase, Eye, X } from 'lucide-react';
import { CandidateInfoCard } from '../CandidateInfoCard';

type HRDashboardProps = {
  context: AppContextType;
};

export function HRDashboard({ context }: HRDashboardProps) {
  const [activeTab, setActiveTab] = useState<'programs' | 'candidates'>('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const handleLogout = () => {
    context.setUser(null);
    context.navigateTo('login');
  };

  const handleExportExcel = () => {
    alert('Экспорт в Excel будет реализован с бэкендом');
  };

  const handleImportExcel = () => {
    // В реальном приложении здесь был бы file input
    const mockCandidates = [
      {
        id: `c${Date.now()}-1`,
        name: 'Импорт Кандидат 1',
        email: 'import1@example.com',
        direction: 'Frontend Development',
        programs: [],
        createdAt: new Date()
      },
      {
        id: `c${Date.now()}-2`,
        name: 'Импорт Кандидат 2',
        email: 'import2@example.com',
        direction: 'Backend Development',
        programs: [],
        createdAt: new Date()
      }
    ];
    
    context.addCandidates(mockCandidates);
    alert(`Импортировано ${mockCandidates.length} кандидатов`);
  };

  const filteredPrograms = context.programs.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.direction.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCandidates = context.candidates.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.direction.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">X5</span>
              </div>
              <div>
                <h1 className="text-xl">Панель HR</h1>
                <p className="text-sm text-gray-600">{context.user?.name}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Табы */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'programs'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              Программы стажировок
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'candidates'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Кандидаты
            </button>
          </div>
        </div>

        {/* Панель действий */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'programs' ? 'Поиск программ...' : 'Поиск кандидатов...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {activeTab === 'programs' ? (
                <button
                  onClick={() => context.navigateTo('create-program')}
                  className="flex items-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Создать программу
                </button>
              ) : (
                <>
                  <button
                    onClick={handleImportExcel}
                    className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileUp className="w-5 h-5 mr-2" />
                    Импорт Excel
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileDown className="w-5 h-5 mr-2" />
                    Экспорт Excel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Контент */}
        {activeTab === 'programs' ? (
          <div className="space-y-4">
            {filteredPrograms.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl mb-2">Нет программ</h3>
                <p className="text-gray-600 mb-6">Создайте первую программу стажировки</p>
                <button
                  onClick={() => context.navigateTo('create-program')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Создать программу
                </button>
              </div>
            ) : (
              filteredPrograms.map(program => {
                const candidatesInProgram = context.candidates.filter(c => c.programs.includes(program.id));
                const progressData = context.candidateProgress.filter(p => p.programId === program.id);

                return (
                  <div
                    key={program.id}
                    onClick={() => context.navigateTo('program-details', { programId: program.id })}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="text-xl mr-3">{program.name}</h3>
                          {program.active ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              Активна
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              Неактивна
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{program.description}</p>
                        
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span>📂 {program.direction}</span>
                          <span>•</span>
                          <span>🎯 {program.stages.length} этапов</span>
                          <span>•</span>
                          <span>👥 {candidatesInProgram.length} кандидатов</span>
                        </div>

                        {/* Статистика по этапам */}
                        {progressData.length > 0 && (
                          <div className="mt-4 flex gap-2">
                            {['in_progress', 'pending_review', 'passed', 'rejected'].map(status => {
                              const count = progressData.filter(p => p.status === status).length;
                              if (count === 0) return null;

                              const labels: Record<string, string> = {
                                in_progress: 'В процессе',
                                pending_review: 'На проверке',
                                passed: 'Прошли',
                                rejected: 'Отклонены'
                              };

                              const colors: Record<string, string> = {
                                in_progress: 'bg-blue-100 text-blue-700',
                                pending_review: 'bg-amber-100 text-amber-700',
                                passed: 'bg-green-100 text-green-700',
                                rejected: 'bg-red-100 text-red-700'
                              };

                              return (
                                <span key={status} className={`px-2 py-1 rounded text-xs ${colors[status]}`}>
                                  {labels[status]}: {count}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <button className="ml-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Открыть →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl mb-2">Нет кандидатов</h3>
                <p className="text-gray-600 mb-6">Импортируйте кандидатов из Excel</p>
                <button
                  onClick={handleImportExcel}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileUp className="w-5 h-5 inline mr-2" />
                  Импорт Excel
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Имя</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Направление</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Программы</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Дата создания</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCandidates.map(candidate => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{candidate.firstName} {candidate.lastName}</td>
                        <td className="px-6 py-4 text-gray-600">{candidate.email}</td>
                        <td className="px-6 py-4 text-gray-600">{candidate.direction}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {candidate.programs.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(candidate.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidateId(candidate.id);
                            }}
                            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Посмотреть
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно с информацией о кандидате */}
      {selectedCandidateId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setSelectedCandidateId(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Информация о кандидате</h2>
              <button
                onClick={() => setSelectedCandidateId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <CandidateInfoCard candidate={context.candidates.find(c => c.id === selectedCandidateId)!} />
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCandidateId(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}