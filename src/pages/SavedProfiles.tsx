import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarkCheck, MessageCircle, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  getSavedProfiles,
  removeSavedProfile,
  getStudentProfile,
} from '../services/studentsService';
import { createConversation } from '../services/messagesService';
import { SavedProfile, StudentProfile as StudentProfileType, StudentWithProfile } from '../types';

interface SavedProfileWithUser extends SavedProfile {
  student?: StudentWithProfile;
  profile?: StudentProfileType | null;
}

const getAvatarUrl = (name?: string, photo?: string) =>
  photo ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'ConectaU')}&background=E3E8EF&color=1F2A37&size=128&rounded=true`;

export default function SavedProfiles() {
  const { userData } = useAuthStore();
  const navigate = useNavigate();
  const [savedProfiles, setSavedProfiles] = useState<SavedProfileWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.id) {
      loadProfiles();
    }
  }, [userData?.id]);

  const loadProfiles = async () => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      const data = await getSavedProfiles(userData.id);
      const withUserData = await Promise.all(
        data.map(async (profile) => {
          const studentData = await getStudentProfile(profile.studentId);
          return {
            ...profile,
            student: studentData?.user || undefined,
            profile: studentData?.profile || null,
          };
        })
      );
      setSavedProfiles(withUserData);
    } catch (error) {
      console.error('Error loading saved profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (studentId: string) => {
    if (!userData?.id) return;
    await removeSavedProfile(userData.id, studentId);
    await loadProfiles();
  };

  const handleContact = async (profile: SavedProfileWithUser) => {
    if (!userData?.id) return;
    setContacting(profile.studentId);
    try {
      const conversationId = await createConversation([userData.id, profile.studentId], {
        studentName: profile.student?.name,
        companyName: userData.companyName || userData.name,
        jobTitle: profile.student?.career,
      });
      navigate(`/messages?chat=${conversationId}`);
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('No se pudo abrir el chat. Intenta nuevamente.');
    } finally {
      setContacting(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((index) => (
          <div key={index} className="card animate-pulse h-48">
            <div className="h-4 bg-surface rounded w-1/2 mb-4" />
            <div className="h-4 bg-surface rounded w-full mb-2" />
            <div className="h-4 bg-surface rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (savedProfiles.length === 0) {
    return (
      <div className="card text-center py-16">
        <BookmarkCheck className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-text-secondary mb-4">Aún no has guardado estudiantes.</p>
        <button onClick={() => navigate('/talent')} className="btn-primary">
          Explorar talentos
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Perfiles guardados</h1>
          <p className="text-text-secondary">
            Revisa y contacta a los estudiantes que marcaste como favoritos.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/talent')}>
          Explorar más talentos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedProfiles.map((profile) => (
          <article key={profile.id} className="card flex flex-col min-h-[320px]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <img
                  src={getAvatarUrl(profile.student?.name, (profile.student as any)?.photoUrl)}
                  alt={profile.student?.name || 'Estudiante'}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
                <div>
                  <h3 className="text-xl font-semibold">{profile.student?.name || 'Estudiante'}</h3>
                  <p className="text-sm text-text-secondary">
                    {profile.student?.career} • {profile.student?.university}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Guardado el {profile.savedAt.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(profile.studentId)}
                className="text-text-secondary hover:text-red-500"
                title="Eliminar de guardados"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 text-sm text-text-secondary">
              {((profile.student?.skills || []).concat(profile.profile?.skills || [])).slice(0, 4).map((skill) => (
                <span key={skill} className="inline-block bg-surface px-2 py-1 rounded mr-2 mb-2 text-xs">
                  {skill}
                </span>
              ))}
            </div>

            {profile.profile?.summary && (
              <p className={`text-sm text-text-secondary ${expandedCard === profile.id ? 'mt-2' : 'mt-2 line-clamp-3'}`}>
                {profile.profile.summary}
              </p>
            )}

            <button
              onClick={() => setExpandedCard((prev) => (prev === profile.id ? null : profile.id))}
              className="text-sm text-primary mt-3 text-left"
            >
              {expandedCard === profile.id ? 'Ocultar detalles' : 'Ver detalles'}
            </button>

            {expandedCard === profile.id && (
              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                {profile.profile?.experience && <p className="whitespace-pre-line">{profile.profile.experience}</p>}
                {profile.profile?.languages && (
                  <p>
                    <span className="font-medium text-text-primary">Idiomas:</span>{' '}
                    {profile.profile.languages.join(', ')}
                  </p>
                )}
                {profile.student?.portfolio && (
                  <a
                    href={profile.student.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm"
                  >
                    Ver portafolio
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => navigate(`/talent/${profile.studentId}`)}
                className="btn-secondary"
              >
                Ver perfil
              </button>
              <button
                onClick={() => handleContact(profile)}
                disabled={contacting === profile.studentId}
                className="btn-primary flex items-center justify-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{contacting === profile.studentId ? 'Abriendo...' : 'Contactar'}</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

