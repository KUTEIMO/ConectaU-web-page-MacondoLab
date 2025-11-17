import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, FileText, CheckCircle, XCircle, Clock, Eye, MessageSquare, CalendarClock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getApplicationsByProject, updateApplicationStatus } from '../services/applicationsService';
import { getProjectById } from '../services/projectsService';
import { Application, Project } from '../types';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  reviewed: { label: 'Revisada', color: 'bg-blue-100 text-blue-800', icon: Eye },
  accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: XCircle },
  interview: { label: 'Entrevista', color: 'bg-purple-100 text-purple-800', icon: CalendarClock },
};

export default function ViewApplications() {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const { currentUser } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (vacancyId) {
      loadData();
    }
  }, [vacancyId]);

  const loadData = async () => {
    if (!vacancyId) return;
    try {
      const [projectData, applicationsData] = await Promise.all([
        getProjectById(vacancyId),
        getApplicationsByProject(vacancyId),
      ]);
      setProject(projectData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    setUpdating(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-surface rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-surface rounded w-full mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Vacante no encontrada</p>
        <Link to="/vacancies" className="text-primary mt-4 inline-block">
          Volver a mis vacantes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/vacancies" className="text-primary hover:underline mb-2 inline-block">
          ← Volver a mis vacantes
        </Link>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-text-secondary mt-2">
          {applications.length} postulación{applications.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No hay postulaciones para esta vacante</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const statusMeta = statusConfig[application.status] || statusConfig.pending;
            const StatusIcon = statusMeta.icon;
            return (
              <div key={application.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                      {application.studentPhoto ? (
                        <img
                          src={application.studentPhoto}
                          alt={application.studentName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        {application.studentName || 'Estudiante'}
                      </h3>
                      <p className="text-text-secondary text-sm mb-2">
                        Postuló el {application.dateApplied.toLocaleDateString('es-ES')}
                      </p>
                      {application.message && (
                        <p className="text-text-secondary text-sm mb-2 line-clamp-3">
                          {application.message}
                        </p>
                      )}
                      {application.coverLetter && (
                        <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                          {application.coverLetter}
                        </p>
                      )}
                      {application.resumeUrl && (
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline inline-flex items-center space-x-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Ver CV</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${statusMeta.color}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      <span>{statusMeta.label}</span>
                    </div>
                    <div className="flex space-x-2">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application.id, 'reviewed')}
                            disabled={updating === application.id}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                          >
                            {updating === application.id ? '...' : 'Revisar'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(application.id, 'accepted')}
                            disabled={updating === application.id}
                            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                          >
                            {updating === application.id ? '...' : 'Aceptar'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            disabled={updating === application.id}
                            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            {updating === application.id ? '...' : 'Rechazar'}
                          </button>
                        </>
                      )}
                      {application.status === 'reviewed' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application.id, 'accepted')}
                            disabled={updating === application.id}
                            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                          >
                            {updating === application.id ? '...' : 'Aceptar'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            disabled={updating === application.id}
                            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            {updating === application.id ? '...' : 'Rechazar'}
                          </button>
                        </>
                      )}
                    </div>
                    <button className="text-primary text-sm hover:underline inline-flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Mensaje</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

