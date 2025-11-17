import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getProjects } from '../services/projectsService';
import { Project } from '../types';

export default function Vacancies() {
  const { userData, currentUser } = useAuthStore();
  const [vacancies, setVacancies] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.role === 'company' && currentUser) {
      loadVacancies();
    }
  }, [userData, currentUser]);

  const loadVacancies = async () => {
    if (!currentUser) return;
    try {
      const data = await getProjects({ companyId: currentUser.uid });
      setVacancies(data);
    } catch (error) {
      console.error('Error loading vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mis Vacantes</h1>
        <Link
          to="/vacancies/new"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Vacante</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse h-40">
              <div className="h-4 bg-surface rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-surface rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-surface rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : vacancies.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary mb-4">No has creado vacantes aún</p>
          <Link to="/vacancies/new" className="btn-primary inline-flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Crear Primera Vacante</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} className="card h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">{vacancy.category}</p>
                  <h3 className="text-xl font-semibold">{vacancy.title}</h3>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    vacancy.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : vacancy.status === 'closed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {vacancy.status === 'active' ? 'Activa' : vacancy.status === 'closed' ? 'Cerrada' : 'Inactiva'}
                </span>
              </div>
              <p className="text-text-secondary text-sm line-clamp-3 mb-4 flex-1">{vacancy.description}</p>
              <div className="flex items-center justify-between text-xs text-text-secondary mb-4">
                <span>{vacancy.applicationsCount} postulaciones</span>
                <span>Creada: {vacancy.createdAt.toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <Link
                  to={`/vacancies/${vacancy.id}/applications`}
                  className="text-sm text-primary hover:underline flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Postulaciones</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/vacancies/${vacancy.id}/edit`}
                    className="p-2 text-text-secondary hover:text-primary"
                    title="Editar"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button className="p-2 text-text-secondary hover:text-red-600" title="Eliminar">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

