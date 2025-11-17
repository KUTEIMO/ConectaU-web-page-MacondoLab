import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye, CalendarClock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getApplicationsByStudent } from '../services/applicationsService';
import { Application } from '../types';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  reviewed: { label: 'Revisada', color: 'bg-blue-100 text-blue-800', icon: Eye },
  accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: XCircle },
  interview: { label: 'Entrevista', color: 'bg-purple-100 text-purple-800', icon: CalendarClock },
};

export default function Applications() {
  const { currentUser } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (currentUser) {
      loadApplications();
    }
  }, [currentUser]);

  const loadApplications = async () => {
    if (!currentUser) return;
    try {
      const data = await getApplicationsByStudent(currentUser.uid);
      setApplications(data);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      if (error.code === 'failed-precondition') {
        // Mostrar mensaje útil al usuario
        console.warn('Se necesita crear un índice en Firestore. Consulta la consola para más información.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter((app) => app.status === filter);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mis Postulaciones</h1>

      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-white text-text-primary border border-border'
          }`}
        >
          Todas
        </button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white text-text-primary border border-border'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-surface rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-surface rounded w-full mb-2"></div>
              <div className="h-4 bg-surface rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary mb-4">No tienes postulaciones</p>
          <Link to="/jobs" className="text-primary hover:underline">
            Explorar vacantes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const statusMeta = statusConfig[application.status] || statusConfig.pending;
            const StatusIcon = statusMeta.icon;
            return (
              <Link
                key={application.id}
                to={`/jobs/${application.projectId}`}
                className="card hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {application.projectTitle || 'Vacante'}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                      Postulaste el {application.dateApplied.toLocaleDateString('es-ES')}
                    </p>
                    {application.message && (
                      <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                        {application.message}
                      </p>
                    )}
                    {application.coverLetter && (
                      <p className="text-text-secondary text-sm line-clamp-2">
                        {application.coverLetter}
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${statusMeta.color}`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    <span>{statusMeta.label}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

