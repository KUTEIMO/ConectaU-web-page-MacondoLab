import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  MessageCircle,
  Star,
  BookmarkPlus,
  Filter,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { createConversation } from '../services/messagesService';
import {
  getSavedProfiles,
  getStudents,
  removeSavedProfile,
  saveStudentProfile,
} from '../services/studentsService';
import { SavedProfile, StudentFilters, StudentWithProfile } from '../types';

const UNIVERSITY_OPTIONS = [
  { value: 'UNISIMON', label: 'Universidad Simón Bolívar (Cúcuta)' },
  { value: 'UFPS', label: 'Universidad Francisco de Paula Santander' },
  { value: 'UDES', label: 'Universidad de Santander (UDES)' },
  { value: 'UNIPAMPLONA', label: 'Universidad de Pamplona' },
];
const SEMESTER_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const getAvatarUrl = (name?: string, photo?: string) =>
  photo ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'ConectaU')}&background=E3E8EF&color=1F2A37&size=128&rounded=true`;

export default function Talent() {
  const { userData } = useAuthStore();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<StudentFilters>({});
  const [skillsInput, setSkillsInput] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [contacting, setContacting] = useState<string | null>(null);

  const isCompany = userData?.role === 'company';

  useEffect(() => {
    loadStudents();
  }, [filters]);

  useEffect(() => {
    if (userData?.id && isCompany) {
      loadSavedProfiles();
    }
  }, [userData?.id, isCompany]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents(filters);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedProfiles = async () => {
    if (!userData?.id) return;
    try {
      const data = await getSavedProfiles(userData.id);
      setSavedProfiles(data);
    } catch (error) {
      console.error('Error loading saved profiles:', error);
    }
  };

  const handleContact = async (student: StudentWithProfile) => {
    if (!userData?.id) return;
    setContacting(student.id);
    try {
      const conversationId = await createConversation([userData.id, student.id], {
        studentName: student.name,
        companyName: userData.companyName || userData.name,
        jobTitle: student.career,
      });
      navigate(`/messages?chat=${conversationId}`);
    } catch (error) {
      console.error('Error contacting student:', error);
    } finally {
      setContacting(null);
    }
  };

  const isProfileSaved = (studentId: string) =>
    savedProfiles.some((profile) => profile.studentId === studentId);

  const handleToggleSaved = async (student: StudentWithProfile) => {
    if (!userData?.id) return;
    setSaving(student.id);
    try {
      if (isProfileSaved(student.id)) {
        await removeSavedProfile(userData.id, student.id);
      } else {
        await saveStudentProfile(userData.id, student.id, {
          studentName: student.name,
          studentPhoto: student.photoUrl,
        });
      }
      await loadSavedProfiles();
    } catch (error) {
      console.error('Error toggling saved profile:', error);
    } finally {
      setSaving(null);
    }
  };

const filteredStudents = useMemo(() => {
  if (!search.trim()) return students;
  const normalized = search.toLowerCase();
  return students.filter((student) => student.searchIndex?.includes(normalized));
}, [students, search]);

  const handleViewProfile = (studentId: string) => {
    navigate(`/talent/${studentId}`);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Talentos disponibles</h1>
          <p className="text-text-secondary">Filtra por universidad, carrera o habilidades.</p>
        </div>
        <button
          onClick={() => setFilters({})}
          className="text-sm text-primary flex items-center space-x-1"
        >
          <X className="h-4 w-4" />
          <span>Limpiar filtros</span>
        </button>
      </div>

      <div className="card mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="text-sm">
            <span className="text-text-secondary flex items-center space-x-2 mb-1">
              <Filter className="h-4 w-4" />
              <span>Universidad</span>
            </span>
            <select
              value={filters.university || ''}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  university: event.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-border rounded"
            >
              <option value="">Todas</option>
              {UNIVERSITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="text-text-secondary mb-1 block">Carrera</span>
            <input
              type="text"
              value={filters.career || ''}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  career: event.target.value || undefined,
                }))
              }
              placeholder="Ingeniería, Diseño..."
              className="w-full px-3 py-2 border border-border rounded"
            />
          </label>

          <label className="text-sm">
            <span className="text-text-secondary mb-1 block">Semestre</span>
            <input
              type="number"
              min={1}
              max={12}
              value={filters.semester || ''}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  semester: event.target.value ? event.target.value.replace(/\D/g, '') : undefined,
                }))
              }
              placeholder="Ej. 7"
              className="w-full px-3 py-2 border border-border rounded"
            />
          </label>

          <label className="text-sm">
            <span className="text-text-secondary mb-1 block">Habilidades</span>
            <input
              type="text"
              value={skillsInput}
              onChange={(event) => {
                const value = event.target.value;
                setSkillsInput(value);
                const skills = value
                  .split(',')
                  .map((skill) => skill.trim())
                  .filter(Boolean);
                setFilters((prev) => ({
                  ...prev,
                  skills: skills.length > 0 ? skills : undefined,
                }));
              }}
              placeholder="React, UX, Inglés..."
              className="w-full px-3 py-2 border border-border rounded"
            />
          </label>
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, carrera o proyecto..."
          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="card animate-pulse h-64">
              <div className="h-6 bg-surface rounded w-1/2 mb-4" />
              <div className="h-4 bg-surface rounded w-2/3 mb-2" />
              <div className="h-4 bg-surface rounded w-full mb-2" />
              <div className="h-4 bg-surface rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card text-center py-16">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-text-secondary">No encontramos perfiles con esos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <article
              key={student.id}
              className="card flex flex-col min-h-[360px] cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => handleViewProfile(student.id)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={getAvatarUrl(student.name, (student as any).photoUrl)}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wide">Estudiante</p>
                  <p className="text-sm text-text-secondary">
                    {student.university || 'Universidad'} • Semestre {student.semester || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{student.name}</h3>
                  <p className="text-sm text-text-secondary">
                    {student.career} • Semestre {student.semester || 'N/A'}
                  </p>
                  {student.university && (
                    <p className="text-xs text-text-secondary mt-1 uppercase tracking-wide">
                      {student.university}
                    </p>
                  )}
                </div>
                <button
                  disabled={saving === student.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleSaved(student);
                  }}
                  className={`p-2 rounded-full ${
                    isProfileSaved(student.id)
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-secondary hover:text-primary'
                  }`}
                  title={isProfileSaved(student.id) ? 'Eliminar de guardados' : 'Guardar perfil'}
                >
                  <BookmarkPlus className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {((student.skills || []).concat(student.profile?.skills || [])).slice(0, 4).map((skill) => (
                  <span key={skill} className="px-2 py-1 text-xs rounded-full bg-surface">
                    {skill}
                  </span>
                ))}
                {student.skills && student.skills.length + (student.profile?.skills?.length || 0) > 4 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-surface text-text-secondary">
                    +{(student.skills?.length || 0) + (student.profile?.skills?.length || 0) - 4}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-text-secondary flex-1">
                {student.profile?.headline && (
                  <p className="font-medium text-text-primary">{student.profile.headline}</p>
                )}
                {(student.profile?.summary || student.experience) && (
                  <p className={`text-text-secondary ${expandedCard === student.id ? '' : 'line-clamp-3'}`}>
                    {student.profile?.summary || student.experience}
                  </p>
                )}
              </div>

              <button
                onClick={() => setExpandedCard((prev) => (prev === student.id ? null : student.id))}
                className="text-sm text-primary mt-3 text-left"
              >
                {expandedCard === student.id ? 'Ocultar detalles' : 'Ver detalles'}
              </button>

              {expandedCard === student.id && (
                <div className="mt-3 space-y-2 text-sm text-text-secondary">
                  {student.profile?.experience && (
                    <p className="whitespace-pre-line">{student.profile.experience}</p>
                  )}
                  {student.profile?.languages && (
                    <p>
                      <span className="font-medium text-text-primary">Idiomas:</span>{' '}
                      {student.profile.languages.join(', ')}
                    </p>
                  )}
                  {student.portfolio && (
                    <a
                      href={student.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm"
                    >
                      Ver portafolio
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleViewProfile(student.id);
                  }}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Star className="h-4 w-4" />
                  <span>Ver perfil</span>
                </button>
                <button
                  disabled={contacting === student.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleContact(student);
                  }}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{contacting === student.id ? 'Abriendo...' : 'Contactar'}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

