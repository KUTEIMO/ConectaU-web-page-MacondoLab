import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Briefcase, Code, Globe, Link as LinkIcon, MessageCircle, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { createConversation } from '../services/messagesService';
import {
  getSavedProfiles,
  getStudentProfile,
  removeSavedProfile,
  saveStudentProfile,
} from '../services/studentsService';
import { SavedProfile, StudentProfile as StudentProfileType, User } from '../types';

interface ProfileState {
  user: User;
  profile: StudentProfileType | null;
}

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);

  const isCompany = userData?.role === 'company';

  useEffect(() => {
    if (studentId) {
      loadProfile(studentId);
    }
  }, [studentId]);

  useEffect(() => {
    if (isCompany && userData?.id) {
      loadSavedProfiles();
    }
  }, [userData?.id, isCompany]);

  const loadProfile = async (id: string) => {
    setLoading(true);
    try {
      const data = await getStudentProfile(id);
      if (!data) {
        navigate('/talent');
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error loading student profile:', error);
      navigate('/talent');
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

  const isProfileSaved = () =>
    profile && savedProfiles.some((saved) => saved.studentId === profile.user.id);

  const handleToggleSaved = async () => {
    if (!profile || !userData?.id) return;
    setSaving(true);
    try {
      if (isProfileSaved()) {
        await removeSavedProfile(userData.id, profile.user.id);
      } else {
        await saveStudentProfile(userData.id, profile.user.id, {
          studentName: profile.user.name,
          studentPhoto: profile.user.photoUrl,
        });
      }
      await loadSavedProfiles();
    } catch (error) {
      console.error('Error toggling saved profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContact = async () => {
    if (!profile || !userData?.id) return;
    setContacting(true);
    try {
      const conversationId = await createConversation([userData.id, profile.user.id], {
        studentName: profile.user.name,
        companyName: userData.companyName || userData.name,
        jobTitle: profile.user.career,
      });
      navigate(`/messages?chat=${conversationId}`);
    } catch (error) {
      console.error('Error contacting student:', error);
      alert('No se pudo abrir el chat. Intenta nuevamente.');
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-1/3 bg-surface rounded mb-4" />
        <div className="h-4 bg-surface rounded w-2/3 mb-2" />
        <div className="h-4 bg-surface rounded w-full mb-2" />
        <div className="h-4 bg-surface rounded w-3/4" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card text-center py-16">
        <p className="text-text-secondary mb-4">No encontramos este perfil.</p>
        <button onClick={() => navigate('/talent')} className="btn-primary">
          Volver a talentos
        </button>
      </div>
    );
  }

  const { user, profile: studentProfile } = profile;
  const avatarUrl =
    user.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff&size=256&rounded=true`;

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/talent')}
        className="inline-flex items-center text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a talentos
      </button>

      <section className="card bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-center space-x-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30 bg-white/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/30">
                <UserRound className="h-14 w-14 text-white/80" />
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">Talento destacado</p>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-white/80">
                {user.career} • Semestre {user.semester || 'N/A'} • {user.university || 'Universidad'}
              </p>
              {studentProfile?.headline && (
                <p className="text-white mt-2">{studentProfile.headline}</p>
              )}
            </div>
          </div>

          {isCompany && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleToggleSaved}
                disabled={saving}
                className={`px-4 py-2 rounded-lg border border-white/40 hover:border-white transition ${
                  isProfileSaved() ? 'bg-white text-primary font-semibold' : 'text-white'
                }`}
              >
                {isProfileSaved() ? 'En guardados' : 'Guardar perfil'}
              </button>
              <button
                onClick={handleContact}
                disabled={contacting}
                className="px-4 py-2 rounded-lg bg-white text-primary font-semibold flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{contacting ? 'Abriendo chat...' : 'Contactar'}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <article className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Información académica</h2>
              </div>
              {studentProfile?.availability && (
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-primary text-primary font-semibold">
                  {studentProfile.availability}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Universidad" value={user.university || 'No especificado'} />
              <InfoRow label="Carrera" value={user.career || 'No especificada'} />
              <InfoRow label="Semestre" value={user.semester || 'No indicado'} />
              <InfoRow label="GPA" value={user.gpa || 'No registrado'} />
              {studentProfile?.languages && studentProfile.languages.length > 0 && (
                <InfoRow label="Idiomas" value={studentProfile.languages.join(' • ')} />
              )}
              {studentProfile?.interests && studentProfile.interests.length > 0 && (
                <InfoRow label="Intereses" value={studentProfile.interests.join(', ')} />
              )}
            </div>
            {studentProfile?.summary && (
              <div className="p-3 bg-surface rounded-md text-sm text-text-secondary">
                {studentProfile.summary}
              </div>
            )}
          </article>

          {studentProfile?.experience && (
            <article className="card space-y-3">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>Experiencia y logros</span>
              </h2>
              <p className="text-text-secondary whitespace-pre-line">{studentProfile.experience}</p>
            </article>
          )}

          {studentProfile?.featuredProjects && studentProfile.featuredProjects.length > 0 && (
            <article className="card space-y-4">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary" />
                <span>Proyectos destacados</span>
              </h2>
              <div className="space-y-3">
                {studentProfile.featuredProjects.map((project, index) => (
                  <div key={project.title + index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Proyecto #{index + 1}</p>
                        <h3 className="font-semibold text-text-primary">{project.title}</h3>
                      </div>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary flex items-center space-x-1"
                        >
                          <LinkIcon className="h-4 w-4" />
                          <span>Ver</span>
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-text-secondary mt-2">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>

        <div className="space-y-6">
          {studentProfile?.skills && studentProfile.skills.length > 0 && (
            <article className="card">
              <h2 className="text-lg font-semibold mb-3">Habilidades clave</h2>
              <div className="flex flex-wrap gap-2">
                {studentProfile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-surface text-sm text-text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          )}

          <article className="card space-y-3">
            <h2 className="text-lg font-semibold">Contacto directo</h2>
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Teléfono" value={user.phone} />
            {user.portfolio && (
              <a
                href={user.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm inline-flex items-center space-x-1"
              >
                <Globe className="h-4 w-4" />
                <span>Ver portafolio</span>
              </a>
            )}
            {user.resumeUrl && (
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm inline-flex items-center space-x-1"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Descargar CV</span>
              </a>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <div>
      <p className="text-text-secondary text-sm">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

