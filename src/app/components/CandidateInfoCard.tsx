import { Candidate } from '../App';
import { User, Mail, Phone, MessageCircle, FileText, Calendar, MapPin, GraduationCap, Globe, Clock } from 'lucide-react';

type CandidateInfoCardProps = {
  candidate: Candidate;
  compact?: boolean;
};

export function CandidateInfoCard({ candidate, compact = false }: CandidateInfoCardProps) {
  const fullName = `${candidate.lastName} ${candidate.firstName}`;

  if (compact) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="mb-3">{fullName}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Email:</span>
            <div className="text-gray-900">{candidate.email}</div>
          </div>
          <div>
            <span className="text-gray-600">Телефон:</span>
            <div className="text-gray-900">{candidate.phone}</div>
          </div>
          <div>
            <span className="text-gray-600">Приоритет:</span>
            <div className="text-gray-900">{candidate.firstPriority}</div>
          </div>
          <div>
            <span className="text-gray-600">Дата заявки:</span>
            <div className="text-gray-900">
              {candidate.createdAt.toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-xl mb-6">{fullName}</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Контактная информация */}
        <div>
          <h3 className="text-sm uppercase text-gray-500 mb-3">Контакты</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <Mail className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-gray-600">Email</div>
                <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                  {candidate.email}
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-gray-600">Телефон</div>
                <a href={`tel:${candidate.phone}`} className="text-gray-900">
                  {candidate.phone}
                </a>
              </div>
            </div>

            {candidate.telegram && (
              <div className="flex items-start">
                <MessageCircle className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <div className="text-gray-600">Telegram</div>
                  <a href={`https://t.me/${candidate.telegram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    @{candidate.telegram}
                  </a>
                </div>
              </div>
            )}

            {candidate.resumeUrl && (
              <div className="flex items-start">
                <FileText className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <div className="text-gray-600">Резюме</div>
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Открыть резюме
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Приоритеты */}
        <div>
          <h3 className="text-sm uppercase text-gray-500 mb-3">Приоритеты</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-600">Первый приоритет</div>
              <div className="text-gray-900">{candidate.firstPriority}</div>
            </div>

            {candidate.secondPriority && (
              <div>
                <div className="text-gray-600">Второй приоритет</div>
                <div className="text-gray-900">{candidate.secondPriority}</div>
              </div>
            )}

            <div>
              <div className="text-gray-600">График</div>
              <div className="text-gray-900 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {candidate.schedule}
              </div>
            </div>
          </div>
        </div>

        {/* Образование */}
        <div>
          <h3 className="text-sm uppercase text-gray-500 mb-3">Образование</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <GraduationCap className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-gray-600">ВУЗ</div>
                <div className="text-gray-900">{candidate.university}</div>
                {candidate.otherUniversity && (
                  <div className="text-gray-700 text-xs mt-1">{candidate.otherUniversity}</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-gray-600">Курс</div>
              <div className="text-gray-900">{candidate.course}</div>
            </div>

            <div>
              <div className="text-gray-600">Специальность</div>
              <div className="text-gray-900">{candidate.specialty}</div>
              {candidate.otherSpecialty && (
                <div className="text-gray-700 text-xs mt-1">{candidate.otherSpecialty}</div>
              )}
            </div>

            {candidate.languages && candidate.languages.length > 0 && (
              <div>
                <div className="text-gray-600 mb-1">Языки программирования</div>
                <div className="flex flex-wrap gap-1">
                  {candidate.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div>
          <h3 className="text-sm uppercase text-gray-500 mb-3">Дополнительно</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-gray-600">Город</div>
                <div className="text-gray-900">{candidate.city}</div>
                {candidate.otherCity && (
                  <div className="text-gray-700 text-xs mt-1">{candidate.otherCity}</div>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <Globe className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-gray-600">Гражданство</div>
                <div className="text-gray-900">{candidate.citizenship}</div>
              </div>
            </div>

            <div className="flex items-start">
              <User className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-gray-600">Год рождения</div>
                <div className="text-gray-900">{candidate.birthYear}</div>
              </div>
            </div>

            <div>
              <div className="text-gray-600">Откуда узнал</div>
              <div className="text-gray-900">{candidate.source}</div>
            </div>

            <div className="flex items-start">
              <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-gray-600">Дата заявки</div>
                <div className="text-gray-900">
                  {candidate.createdAt.toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
