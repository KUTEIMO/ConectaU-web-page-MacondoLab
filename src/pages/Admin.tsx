import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Activity,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getAdminDashboardData,
  AdminDashboardData,
  updateUserVerificationStatus,
} from '../services/adminService';

export default function Admin() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboardData();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = dashboard?.stats;

  const systemHealth = useMemo(() => {
    if (!stats) {
      return { activeRatio: 0, verificationRatio: 0 };
    }
    const activeRatio =
      stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;
    const verificationRatio =
      stats.totalUsers > 0 ? Math.round(((stats.totalUsers - stats.pendingVerifications) / stats.totalUsers) * 100) : 0;
    return { activeRatio, verificationRatio };
  }, [stats]);

  const handleVerify = async (userId: string) => {
    try {
      setVerifyingUserId(userId);
      await updateUserVerificationStatus(userId, true);
      setDashboard((prev) => {
        if (!prev) return prev;
        const pendingUser = prev.pendingUsers.find((user) => user.id === userId);
        return {
          ...prev,
          pendingUsers: prev.pendingUsers.filter((user) => user.id !== userId),
          stats: {
            ...prev.stats,
            pendingVerifications: Math.max(prev.stats.pendingVerifications - 1, 0),
            pendingCompanies:
              pendingUser?.role === 'company'
                ? Math.max(prev.stats.pendingCompanies - 1, 0)
                : prev.stats.pendingCompanies,
            pendingStudents:
              pendingUser?.role === 'student'
                ? Math.max(prev.stats.pendingStudents - 1, 0)
                : prev.stats.pendingStudents,
          },
        };
      });
    } catch (error) {
      console.error('Error verifying user:', error);
    } finally {
      setVerifyingUserId(null);
    }
  };

  const summaryCards = [
    {
      icon: Users,
      label: 'Usuarios totales',
      value: stats?.totalUsers ?? '—',
      sublabel: `${stats?.totalCompanies ?? 0} empresas · ${stats?.totalStudents ?? 0} estudiantes`,
    },
    {
      icon: Briefcase,
      label: 'Vacantes publicadas',
      value: stats?.totalProjects ?? '—',
      sublabel: `${stats?.projectsByStatus?.active ?? 0} activas`,
    },
    {
      icon: FileText,
      label: 'Postulaciones',
      value: stats?.totalApplications ?? '—',
      sublabel: `${stats?.applicationsByStatus?.pending ?? 0} pendientes`,
    },
    {
      icon: BarChart3,
      label: 'Matches confirmados',
      value: stats?.acceptedApplications ?? '—',
      sublabel: `${stats?.reviewedApplications ?? 0} revisadas`,
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-text-secondary text-sm">
            Supervisa usuarios, vacantes y postulaciones en tiempo real.
          </p>
        </div>
        <button onClick={loadDashboard} className="btn-secondary text-sm inline-flex items-center space-x-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map(({ icon: Icon, label, value, sublabel }) => (
          <div key={label} className="card">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-surface rounded w-1/2" />
                <div className="h-6 bg-surface rounded w-1/3" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-text-primary">{value}</span>
                </div>
                <p className="text-text-secondary text-sm">{label}</p>
                {sublabel && <p className="text-xs text-text-secondary mt-1">{sublabel}</p>}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Pendientes por verificar</h2>
              <p className="text-sm text-text-secondary">
                {stats?.pendingVerifications ?? 0} cuentas requieren revisión
              </p>
            </div>
            <Link to="/admin/users" className="text-sm text-primary inline-flex items-center space-x-1">
              <span>Gestionar usuarios</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
              ))}
            </div>
          ) : dashboard?.pendingUsers.length ? (
            <ul className="space-y-3">
              {dashboard.pendingUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-text-primary">{user.name || 'Usuario sin nombre'}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                    <p className="text-xs text-text-secondary capitalize">
                      {user.role}{' '}
                      {user.role === 'student'
                        ? `· ${user.university || 'Universidad no especificada'}`
                        : user.companyName
                        ? `· ${user.companyName}`
                        : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVerify(user.id)}
                    disabled={verifyingUserId === user.id}
                    className="btn-primary mt-3 md:mt-0 text-sm inline-flex items-center space-x-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{verifyingUserId === user.id ? 'Verificando…' : 'Verificar'}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-text-secondary py-10">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-primary" />
              No hay cuentas pendientes de verificación.
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Salud del sistema</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Usuarios activos</span>
                <span>{systemHealth.activeRatio}%</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${systemHealth.activeRatio}%` }} />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {stats?.activeUsers ?? 0} activos · {stats?.inactiveUsers ?? 0} suspendidos
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Verificaciones completadas</span>
                <span>{systemHealth.verificationRatio}%</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${systemHealth.verificationRatio}%` }} />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {stats?.pendingVerifications ?? 0} cuentas por verificar
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estudiantes pendientes</span>
                <span>{stats?.pendingStudents ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Empresas pendientes</span>
                <span>{stats?.pendingCompanies ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Vacantes recientes</h2>
              <p className="text-sm text-text-secondary">Últimas oportunidades publicadas</p>
            </div>
            <Link to="/admin/vacancies" className="text-sm text-primary inline-flex items-center space-x-1">
              <span>Moderarlas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-surface rounded-lg animate-pulse" />
              ))}
            </div>
          ) : dashboard?.recentProjects.length ? (
            <ul className="space-y-3">
              {dashboard.recentProjects.map((project) => (
                <li key={project.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{project.title}</p>
                      <p className="text-sm text-text-secondary">
                        {project.companyName || 'Empresa'} · {project.location || 'Ubicación no especificada'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {project.type?.toLowerCase().includes('practice') ? 'Práctica' : 'Proyecto'} ·{' '}
                        {project.modality || 'Modalidad no definida'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 text-xs rounded-full capitalize ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {project.status}
                      </span>
                      <p className="text-xs text-text-secondary mt-1">{project.applicationsCount} postulaciones</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-text-secondary py-10">
              <Briefcase className="h-10 w-10 mx-auto mb-2 text-text-secondary" />
              No se encontraron vacantes recientes.
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Distribución de postulaciones</h2>
              <p className="text-sm text-text-secondary">Estados visibles para empresas y estudiantes</p>
            </div>
          </div>
          {stats ? (
            <div className="space-y-3">
              {Object.entries(stats.applicationsByStatus || {}).map(([status, count]) => {
                const percent =
                  stats.totalApplications > 0 ? Math.round((count / stats.totalApplications) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span className="capitalize">{status}</span>
                      <span>
                        {count} · {percent}%
                      </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-surface rounded animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/admin/users" className="card hover:shadow-md transition-shadow">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Gestión de Usuarios</h3>
          <p className="text-text-secondary text-sm">
            Revisar verificación, suspender cuentas y ver historial de actividad.
          </p>
        </Link>

        <Link to="/admin/vacancies" className="card hover:shadow-md transition-shadow">
          <Briefcase className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Gestión de Vacantes</h3>
          <p className="text-text-secondary text-sm">
            Cambiar estados, cerrar vacantes y depurar información duplicada.
          </p>
        </Link>

        <Link to="/admin/analytics" className="card hover:shadow-md transition-shadow">
          <BarChart3 className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Analíticas</h3>
          <p className="text-text-secondary text-sm">
            Métricas globales y ratios para tus reportes semanales.
          </p>
        </Link>
      </div>
    </div>
  );
}
