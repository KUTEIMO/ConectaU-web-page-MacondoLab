import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Search, TrendingUp, Users, FileText, CalendarClock, GraduationCap, BookmarkCheck, Download, Smartphone, Apple, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getProjects } from '../services/projectsService';
import { getApplicationsByStudent } from '../services/applicationsService';
import { getCompanyStats, getStudentStats } from '../services/dashboardService';
import { Application, Project, StudentWithProfile } from '../types';
import { getSavedProfiles, getStudents } from '../services/studentsService';

export default function Home() {
  const { userData } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentStats, setStudentStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [studentStatsLoading, setStudentStatsLoading] = useState(true);
  const [studentApplications, setStudentApplications] = useState<Application[]>([]);
  const [studentAppsLoading, setStudentAppsLoading] = useState(true);
  
  // Stats para empresas
  const [companyStats, setCompanyStats] = useState({
    totalVacancies: 0,
    activeVacancies: 0,
    totalApplications: 0,
    views: 0,
  });
  const [companyStatsLoading, setCompanyStatsLoading] = useState(true);
  const [companyApplications, setCompanyApplications] = useState<Application[]>([]);
  const [companyApplicationsLoading, setCompanyApplicationsLoading] = useState(true);
  const [savedProfilesCount, setSavedProfilesCount] = useState(0);
  const [talentSuggestions, setTalentSuggestions] = useState<StudentWithProfile[]>([]);
  const [talentLoading, setTalentLoading] = useState(false);
  
  // Stats para admin
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalProjects: 0, totalApplications: 0, totalMatches: 0 });
  const [adminStatsLoading, setAdminStatsLoading] = useState(true);

  useEffect(() => {
    if (userData?.role === 'student') {
      loadProjects();
      loadStudentStats();
    } else if (!userData) {
      loadProjects();
    } else if (userData?.role === 'company') {
      loadCompanyStats();
      loadSavedProfilesCount();
      loadTalentSuggestions();
    } else if (userData?.role === 'admin') {
      loadAdminStats();
    }
  }, [userData]);

  const loadProjects = async () => {
    try {
      const data = await getProjects({ status: 'active' });
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

const loadStudentStats = async () => {
  if (!userData?.id) return;
  setStudentStatsLoading(true);
  try {
    const stats = await getStudentStats(userData.id);
    setStudentStats(stats);
    await loadStudentApplications(userData.id);
  } catch (error) {
    console.error('Error loading student stats:', error);
  } finally {
    setStudentStatsLoading(false);
  }
};

const loadStudentApplications = async (studentId: string) => {
  setStudentAppsLoading(true);
  try {
    const apps = await getApplicationsByStudent(studentId);
    setStudentApplications(apps.slice(0, 5));
  } catch (error) {
    console.error('Error loading student applications:', error);
    setStudentApplications([]);
  } finally {
    setStudentAppsLoading(false);
  }
};

  const loadCompanyStats = async () => {
    if (!userData?.id) return;
    setCompanyStatsLoading(true);
    setCompanyApplicationsLoading(true);
    try {
      const { stats, applications } = await getCompanyStats(userData.id);
      setCompanyStats(stats);
      setCompanyApplications(applications);
    } catch (error) {
      console.error('Error loading company stats:', error);
      setCompanyStats({
        totalVacancies: 0,
        activeVacancies: 0,
        totalApplications: 0,
        views: 0,
      });
      setCompanyApplications([]);
    } finally {
      setCompanyStatsLoading(false);
      setCompanyApplicationsLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      const { getAdminStats } = await import('../services/dashboardService');
      const stats = await getAdminStats();
      setAdminStats(stats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setAdminStatsLoading(false);
    }
  };

  const loadSavedProfilesCount = async () => {
    if (!userData?.id) return;
    try {
      const savedProfiles = await getSavedProfiles(userData.id);
      setSavedProfilesCount(savedProfiles.length);
    } catch (error) {
      console.error('Error loading saved profiles:', error);
    }
  };

  const loadTalentSuggestions = async () => {
    setTalentLoading(true);
    try {
      const students = await getStudents({ limitResults: 6 });
      setTalentSuggestions(students.slice(0, 3));
    } catch (error) {
      console.error('Error loading talent suggestions:', error);
    } finally {
      setTalentLoading(false);
    }
  };

const normalizedSearchTerm = searchTerm.trim().toLowerCase();
const filteredProjects = projects.filter((project) => {
  if (!normalizedSearchTerm) return true;
  const title = project.title?.toLowerCase() ?? '';
  const description = project.description?.toLowerCase() ?? '';
  return title.includes(normalizedSearchTerm) || description.includes(normalizedSearchTerm);
});

  const companyStatusSummary = useMemo(() => {
    const summary: Record<Application['status'], number> = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      interview: 0,
    };
    companyApplications.forEach((app) => {
      if (summary[app.status] === undefined) {
        summary.pending += 1;
      } else {
        summary[app.status] += 1;
      }
    });
    return summary;
  }, [companyApplications]);

  const recentApplications = useMemo(
    () =>
      companyApplications
        .slice()
        .sort((a, b) => b.dateApplied.getTime() - a.dateApplied.getTime())
        .slice(0, 5),
    [companyApplications]
  );

  const aggregateByField = (getter: (app: Application) => string) => {
    const counts: Record<string, number> = {};
    companyApplications.forEach((app) => {
      const key = getter(app) || 'Sin información';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const topUniversities = useMemo(
    () => aggregateByField((app) => app.studentUniversity || ''),
    [companyApplications]
  );
  const topCareers = useMemo(
    () => aggregateByField((app) => app.studentCareer || ''),
    [companyApplications]
  );
  const topSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    companyApplications.forEach((app) => {
      (app.studentSkills || []).forEach((skill) => {
        const key = skill.trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [companyApplications]);

const renderProjectsSection = (title: string) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Link to="/jobs" className="text-primary text-sm font-medium hover:underline">
        Ver todas
      </Link>
    </div>
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-surface rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-surface rounded w-full mb-2"></div>
            <div className="h-4 bg-surface rounded w-2/3"></div>
          </div>
        ))}
      </div>
    ) : filteredProjects.length === 0 ? (
      <div className="card text-center py-12">
        <Briefcase className="h-16 w-16 text-text-secondary mx-auto mb-4" />
        <p className="text-text-secondary">No se encontraron proyectos</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            to={`/jobs/${project.id}`}
            className="card p-4 sm:p-6 hover:shadow-md transition-shadow touch-manipulation"
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                  {project.category}
                </p>
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary line-clamp-2">{project.title}</h3>
              </div>
              <span className="px-2 py-1 bg-primary-light text-primary-dark text-xs rounded flex-shrink-0 whitespace-nowrap">
                {project.type?.toLowerCase().includes('practice') ? 'Práctica' : 'Proyecto'}
              </span>
            </div>
            <p className="text-text-secondary text-xs sm:text-sm mb-4 line-clamp-2">{project.description}</p>
            <div className="space-y-1.5 sm:space-y-2 mb-4">
              <div className="flex items-center text-xs sm:text-sm text-text-secondary">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{project.company?.name || 'Empresa'}</span>
              </div>
              {project.location && (
                <div className="flex items-center text-xs sm:text-sm text-text-secondary">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{project.location}</span>
                </div>
              )}
              {project.modality && (
                <div className="flex items-center text-xs sm:text-sm text-text-secondary">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="capitalize truncate">{project.modality}</span>
                </div>
              )}
              {project.salary && (
                <div className="flex items-center text-xs sm:text-sm text-text-secondary">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{project.salary}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {project.skillsRequired.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 sm:py-1 bg-surface text-text-secondary text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    )}
  </section>
);

  const isStudent = userData?.role === 'student';
  const isCompany = userData?.role === 'company';
  const isAdmin = userData?.role === 'admin';

  // Sección de descargas para móviles
  const DownloadsSection = () => (
    <section className="card bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-4 sm:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2 flex-wrap">
            <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span>Descarga nuestra app móvil</span>
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mb-4">
            Accede a ConectaU desde tu dispositivo móvil y mantente conectado en cualquier momento.
          </p>
          <div className="space-y-3 sm:space-y-4">
            {/* Android */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-border">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-text-primary">Android</h3>
                <p className="text-xs sm:text-sm text-text-secondary">Disponible ahora</p>
              </div>
              <a
                href="/app-releasev1-universal.apk"
                download="ConectaU.apk"
                className="btn-primary inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm touch-manipulation w-full sm:w-auto"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Descargar APK</span>
              </a>
            </div>

            {/* iOS */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-border opacity-60">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Apple className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-text-primary">iOS</h3>
                <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-2">
                  <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  En desarrollo
                </p>
              </div>
              <button
                disabled
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-text-secondary bg-surface rounded-md cursor-not-allowed inline-flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Próximamente</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  if (isStudent) {
    return (
      <div className="space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
            <h1 className="text-3xl font-bold mb-2">Hola, {userData?.name?.split(' ')[0]} 👋</h1>
            <p className="text-white/80 mb-6">
              Estas son las oportunidades recomendadas para estudiantes de Cúcuta y Norte de Santander.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/jobs" className="bg-white text-primary font-semibold px-4 py-2 rounded-md">
                Explorar vacantes
              </Link>
              <Link to="/messages" className="bg-transparent border border-white/30 px-4 py-2 rounded-md">
                Ver mensajes
              </Link>
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Tu progreso</h2>
            {studentStatsLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-surface rounded w-3/4" />
                <div className="h-4 bg-surface rounded w-1/2" />
                <div className="h-4 bg-surface rounded w-2/3" />
              </div>
            ) : (
              <div className="space-y-2 text-sm text-text-secondary">
                <p><span className="font-semibold text-text-primary">{studentStats.totalApplications}</span> postulaciones totales</p>
                <p><span className="font-semibold text-text-primary">{studentStats.pendingApplications}</span> pendientes</p>
                <p><span className="font-semibold text-text-primary">{studentStats.acceptedApplications}</span> aceptadas</p>
              </div>
            )}
            <Link to="/applications" className="mt-4 inline-flex text-sm text-primary font-medium hover:underline">
              Ver historial →
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Postulaciones enviadas', value: studentStats.totalApplications },
            { label: 'Pendientes', value: studentStats.pendingApplications },
            { label: 'Aceptadas', value: studentStats.acceptedApplications },
            { label: 'Rechazadas', value: studentStats.rejectedApplications },
          ].map((item) => (
            <div key={item.label} className="card">
              <p className="text-sm text-text-secondary">{item.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{studentStatsLoading ? '…' : item.value}</p>
            </div>
          ))}
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <Link to="/jobs" className="p-4 rounded-lg border border-border hover:bg-surface transition">
              Buscar vacantes por filtros
            </Link>
            <Link to="/profile/edit" className="p-4 rounded-lg border border-border hover:bg-surface transition">
              Actualizar mi perfil público
            </Link>
            <Link to="/favorites" className="p-4 rounded-lg border border-border hover:bg-surface transition">
              Revisar mis favoritos
            </Link>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tus postulaciones recientes</h2>
            <Link to="/applications" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          {studentAppsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-surface rounded animate-pulse" />
              ))}
            </div>
          ) : studentApplications.length === 0 ? (
            <p className="text-sm text-text-secondary">Aún no tienes postulaciones registradas.</p>
          ) : (
            <ul className="space-y-3">
              {studentApplications.map((app) => (
                <li key={app.id} className="flex items-center justify-between text-sm border border-border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-text-primary">{app.projectTitle || 'Vacante'}</p>
                    <p className="text-xs text-text-secondary">
                      {app.companyId ? 'Empresa' : 'Convocatoria'} •{' '}
                      {app.dateApplied.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs capitalize ${
                      app.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : app.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {app.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {renderProjectsSection('Vacantes recomendadas para ti')}

        <DownloadsSection />
      </div>
    );
  }

  if (isCompany) {
    const totalApplications = companyApplications.length || 1;
    const statusOrder: Array<{ key: keyof typeof companyStatusSummary; label: string; color: string }> = [
      { key: 'pending', label: 'Pendientes', color: 'bg-yellow-400' },
      { key: 'reviewed', label: 'En revisión', color: 'bg-blue-400' },
      { key: 'interview', label: 'Entrevistas', color: 'bg-purple-400' },
      { key: 'accepted', label: 'Aceptadas', color: 'bg-green-400' },
      { key: 'rejected', label: 'Rechazadas', color: 'bg-red-400' },
    ];

    return (
      <div className="space-y-8">
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="card xl:col-span-2 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <p className="text-sm uppercase tracking-wide text-white/70">Resumen</p>
                <h1 className="text-3xl font-bold">Hola, {userData?.companyName || userData?.name}</h1>
                <p className="text-white/80 mt-2">
                  Gestiona las vacantes activas y da seguimiento a los candidatos en tiempo real.
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/vacancies/new" className="bg-white text-primary font-semibold px-4 py-2 rounded-md">
                  Crear vacante
                </Link>
                <Link to="/messages" className="border border-white/30 px-4 py-2 rounded-md">
                  Mensajes
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Vacantes', value: companyStats.totalVacancies },
                { label: 'Activas', value: companyStats.activeVacancies },
                { label: 'Postulaciones', value: companyStats.totalApplications },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/70">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Estado de postulaciones</h3>
            {companyApplicationsLoading ? (
              <div className="space-y-2">
                <div className="h-3 bg-surface rounded" />
                <div className="h-3 bg-surface rounded" />
                <div className="h-3 bg-surface rounded" />
              </div>
            ) : statusOrder.map(({ key, label, color }) => {
              const count = companyStatusSummary[key] || 0;
              const percent = Math.round((count / totalApplications) * 100);
              return (
                <div key={key} className="mb-3">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden mt-1">
                    <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Pendientes', value: companyStatusSummary.pending, icon: FileText, color: 'bg-yellow-50 text-yellow-800' },
            { label: 'En revisión', value: companyStatusSummary.reviewed, icon: Users, color: 'bg-blue-50 text-blue-800' },
            { label: 'Entrevistas', value: companyStatusSummary.interview, icon: CalendarClock, color: 'bg-purple-50 text-purple-800' },
            { label: 'Aceptadas', value: companyStatusSummary.accepted, icon: TrendingUp, color: 'bg-green-50 text-green-800' },
            { label: 'Rechazadas', value: companyStatusSummary.rejected, icon: Briefcase, color: 'bg-red-50 text-red-800' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`card flex items-center space-x-3 ${color}`}>
              <Icon className="h-10 w-10" />
              <div>
                <p className="text-sm">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/talent" className="p-4 border border-border rounded-lg hover:bg-surface transition">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-text-primary">Explorar talentos</p>
                    <p className="text-xs text-text-secondary">Filtra por carrera, skills y universidad</p>
                  </div>
                </div>
              </Link>
              <Link to="/saved-profiles" className="p-4 border border-border rounded-lg hover:bg-surface transition">
                <div className="flex items-center space-x-3">
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-text-primary">Perfiles guardados</p>
                    <p className="text-xs text-text-secondary">{savedProfilesCount} en seguimiento</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Talentos sugeridos</h3>
              <Link to="/talent" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            {talentLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-surface rounded" />
                <div className="h-4 bg-surface rounded" />
                <div className="h-4 bg-surface rounded" />
              </div>
            ) : talentSuggestions.length === 0 ? (
              <p className="text-sm text-text-secondary">Aún no hay perfiles destacados.</p>
            ) : (
              <ul className="space-y-3">
                {talentSuggestions.map((student) => (
                  <li key={student.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{student.name}</p>
                      <p className="text-xs text-text-secondary">
                        {student.career} • {student.university}
                      </p>
                    </div>
                    <Link to={`/talent/${student.id}`} className="text-sm text-primary hover:underline">
                      Ver perfil
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Universidades con más postulaciones</h3>
              <span className="text-xs text-text-secondary">{topUniversities.length} universidades</span>
            </div>
            {topUniversities.length === 0 ? (
              <p className="text-sm text-text-secondary">Aún no recibes postulaciones.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topUniversities.slice(0, 5).map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">{name}</span>
                    <span className="text-text-secondary">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Programas académicos destacados</h3>
              <span className="text-xs text-text-secondary">{topCareers.length} carreras</span>
            </div>
            {topCareers.length === 0 ? (
              <p className="text-sm text-text-secondary">Sin datos aún.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topCareers.slice(0, 5).map(([career, count]) => (
                  <li key={career} className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">{career}</span>
                    <span className="text-text-secondary">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Habilidades más frecuentes</h3>
              <span className="text-xs text-text-secondary">{topSkills.length} skills</span>
            </div>
            {topSkills.length === 0 ? (
              <p className="text-sm text-text-secondary">Agrega filtros para ver tendencias.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topSkills.slice(0, 5).map(([skill, count]) => (
                  <li key={skill} className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">{skill}</span>
                    <span className="text-text-secondary">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pipeline de vacantes</h3>
              <Link to="/vacancies" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            {companyApplicationsLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-surface rounded" />
                <div className="h-4 bg-surface rounded" />
                <div className="h-4 bg-surface rounded" />
              </div>
            ) : (
              <div className="space-y-4">
                {statusOrder.map(({ key, label, color }) => {
                  const count = companyStatusSummary[key] || 0;
                  const percent = Math.round((count / totalApplications) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Postulaciones recientes</h3>
              <Link to="/vacancies" className="text-sm text-primary hover:underline">
                Gestionar
              </Link>
            </div>
            {companyApplicationsLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-surface rounded" />
                <div className="h-4 bg-surface rounded" />
                <div className="h-4 bg-surface rounded" />
              </div>
            ) : recentApplications.length === 0 ? (
              <p className="text-text-secondary text-sm">Aún no hay postulaciones registradas.</p>
            ) : (
              <ul className="space-y-3">
                {recentApplications.map((app) => (
                  <li key={app.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-text-primary">{app.studentName || 'Candidato'}</p>
                      <p className="text-text-secondary">
                        {app.projectTitle || 'Vacante'} • {app.dateApplied.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Link
                      to={`/vacancies/${app.projectId}/applications`}
                      className="text-primary text-xs hover:underline"
                    >
                      Ver
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <DownloadsSection />
      </div>
    );
  }

  if (userData?.role === 'admin') {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        {adminStatsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-surface rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-surface rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
              <p className="text-3xl font-bold text-primary">{adminStats.totalUsers}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Vacantes</h3>
              <p className="text-3xl font-bold text-primary">{adminStats.totalProjects}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Postulaciones</h3>
              <p className="text-3xl font-bold text-primary">{adminStats.totalApplications}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Matches</h3>
              <p className="text-3xl font-bold text-primary">{adminStats.totalMatches}</p>
            </div>
          </div>
        )}
        
        <DownloadsSection />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explora Oportunidades</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      {renderProjectsSection('Explora oportunidades')}
      
      <DownloadsSection />
    </div>
  );
}

