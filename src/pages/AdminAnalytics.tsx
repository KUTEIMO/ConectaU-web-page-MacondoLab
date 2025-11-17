import { useEffect, useMemo, useState } from 'react';
import { getAdminAnalytics, AdminAnalytics } from '../services/adminService';
import { BarChart3, Activity, Layers, Users, RefreshCw } from 'lucide-react';

const EMPTY_STATS: AdminAnalytics = {
  totalUsers: 0,
  totalCompanies: 0,
  totalStudents: 0,
  totalProjects: 0,
  totalApplications: 0,
  acceptedApplications: 0,
  reviewedApplications: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  pendingVerifications: 0,
  pendingCompanies: 0,
  pendingStudents: 0,
  projectsByStatus: {
    active: 0,
    inactive: 0,
    closed: 0,
  },
  applicationsByStatus: {
    pending: 0,
    reviewed: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  },
};

function AdminAnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminAnalytics>(EMPTY_STATS);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAdminAnalytics();
      setStats(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptanceRate = useMemo(() => {
    if (stats.totalApplications === 0) return 0;
    return Math.round((stats.acceptedApplications / stats.totalApplications) * 100);
  }, [stats]);

  const reviewRate = useMemo(() => {
    if (stats.totalApplications === 0) return 0;
    return Math.round((stats.reviewedApplications / stats.totalApplications) * 100);
  }, [stats]);

  const activeRatio = useMemo(() => {
    if (stats.totalUsers === 0) return 0;
    return Math.round((stats.activeUsers / stats.totalUsers) * 100);
  }, [stats]);

  const verifiedRatio = useMemo(() => {
    if (stats.totalUsers === 0) return 0;
    return Math.round(((stats.totalUsers - stats.pendingVerifications) / stats.totalUsers) * 100);
  }, [stats]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analíticas</h1>
          <p className="text-text-secondary mt-1">Indicadores generales de la plataforma</p>
        </div>
        <button
          className="btn-secondary text-sm inline-flex items-center space-x-2"
          onClick={loadAnalytics}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-surface rounded w-3/4 mb-2" />
              <div className="h-8 bg-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <p className="text-sm text-text-secondary">Usuarios totales</p>
              <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
              <p className="text-xs text-text-secondary mt-2">
                {stats.totalCompanies} empresas · {stats.totalStudents} estudiantes
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-text-secondary">Vacantes publicadas</p>
              <p className="text-3xl font-bold text-primary">{stats.totalProjects}</p>
              <p className="text-xs text-text-secondary mt-2">
                {stats.projectsByStatus.active} activas · {stats.projectsByStatus.closed} cerradas
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-text-secondary">Postulaciones</p>
              <p className="text-3xl font-bold text-primary">{stats.totalApplications}</p>
              <p className="text-xs text-text-secondary mt-2">
                {stats.acceptedApplications} aceptadas · {stats.reviewedApplications} revisadas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Postulaciones por estado</h2>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.applicationsByStatus).map(([status, count]) => {
                  const percent =
                    stats.totalApplications > 0
                      ? Math.round((count / stats.totalApplications) * 100)
                      : 0;
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
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Layers className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Vacantes por estado</h2>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.projectsByStatus).map(([status, count]) => {
                  const percent =
                    stats.totalProjects > 0
                      ? Math.round((count / stats.totalProjects) * 100)
                      : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span className="capitalize">{status}</span>
                        <span>
                          {count} · {percent}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Estado de usuarios</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-text-secondary mb-1">
                    <span>Usuarios activos</span>
                    <span>{activeRatio}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${activeRatio}%` }} />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {stats.activeUsers} activos · {stats.inactiveUsers} suspendidos
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-text-secondary mb-1">
                    <span>Verificación completada</span>
                    <span>{verifiedRatio}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${verifiedRatio}%` }} />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {stats.pendingVerifications} cuentas pendientes
                  </p>
                  <p className="text-xs text-text-secondary">
                    {stats.pendingStudents} estudiantes · {stats.pendingCompanies} empresas
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Insights rápidos</h2>
              </div>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li>
                  • Ratio de aceptación:{' '}
                  <span className="font-semibold text-text-primary">{acceptanceRate}%</span>
                </li>
                <li>
                  • Ratio de revisión:{' '}
                  <span className="font-semibold text-text-primary">{reviewRate}%</span>
                </li>
                <li>
                  • Promedio de postulaciones por vacante:{' '}
                  <span className="font-semibold text-text-primary">
                    {stats.totalProjects > 0
                      ? (stats.totalApplications / stats.totalProjects).toFixed(1)
                      : '0'}
                  </span>
                </li>
                <li>
                  • Empresas activas:{' '}
                  <span className="font-semibold text-text-primary">{stats.totalCompanies}</span>
                </li>
                <li>
                  • Estudiantes registrados:{' '}
                  <span className="font-semibold text-text-primary">{stats.totalStudents}</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminAnalyticsView;
