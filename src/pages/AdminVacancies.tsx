import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllProjectsForAdmin,
  updateProjectStatusAdmin,
  deleteProjectAdmin,
} from '../services/adminService';
import { Project } from '../types';
import {
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Briefcase,
  Trash2,
  Eye,
  Layers,
} from 'lucide-react';

type StatusFilter = 'all' | Project['status'];
type TypeFilter = 'all' | Project['type'];
type SortOption = 'recent' | 'oldest' | 'applications';

export default function AdminVacancies() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjectsForAdmin();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      setUpdatingId(projectId);
      await updateProjectStatusAdmin(projectId, newStatus);
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, status: newStatus } : project
        )
      );
    } catch (error) {
      console.error('Error updating project status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar esta vacante? Esta acción no se puede deshacer.'
    );
    if (!confirmDelete) return;
    try {
      setDeletingId(projectId);
      await deleteProjectAdmin(projectId);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const modalities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => {
      if (project.modality) {
        set.add(project.modality.toLowerCase());
      }
    });
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        const matchesType = typeFilter === 'all' || project.type === typeFilter;
        const matchesModality =
          modalityFilter === 'all' ||
          project.modality?.toLowerCase() === modalityFilter.toLowerCase();

        if (!matchesStatus || !matchesType || !matchesModality) return false;

        if (!normalizedSearch) return true;
        const haystack = [
          project.title,
          project.description,
          project.company?.name,
          project.location,
          project.skillsRequired?.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sortBy === 'applications') {
          return (b.applicationsCount || 0) - (a.applicationsCount || 0);
        }
        if (sortBy === 'oldest') {
          return (a.createdAt?.getTime?.() || 0) - (b.createdAt?.getTime?.() || 0);
        }
        return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
      });
  }, [projects, statusFilter, typeFilter, modalityFilter, normalizedSearch, sortBy]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter((project) => project.status === 'active').length,
      inactive: projects.filter((project) => project.status === 'inactive').length,
      closed: projects.filter((project) => project.status === 'closed').length,
    };
  }, [projects]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vacantes publicadas</h1>
          <p className="text-text-secondary text-sm">
            Supervisa el contenido disponible para estudiantes y empresas.
          </p>
        </div>
        <button
          onClick={loadProjects}
          className="btn-secondary text-sm inline-flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Activas</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Inactivas</p>
          <p className="text-2xl font-bold text-amber-600">{stats.inactive}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Cerradas</p>
          <p className="text-2xl font-bold text-rose-600">{stats.closed}</p>
        </div>
      </div>

      <div className="card mb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, empresa o ubicación"
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-border rounded-md"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
            <option value="closed">Cerradas</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-4 py-2 border border-border rounded-md"
          >
            <option value="all">Todos los tipos</option>
            <option value="project">Proyectos</option>
            <option value="practice">Prácticas</option>
          </select>
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-md"
          >
            <option value="all">Todas las modalidades</option>
            {modalities.map((modality) => (
              <option key={modality} value={modality}>
                {modality.charAt(0).toUpperCase() + modality.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-border rounded-md"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="applications">Más postuladas</option>
          </select>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Layers className="h-4 w-4" />
            <span>{filteredProjects.length} resultados</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-surface rounded w-3/4 mb-2" />
              <div className="h-4 bg-surface rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary">No se encontraron vacantes con el filtro seleccionado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-semibold">{project.title}</h2>
                      <span
                        className={`px-2 py-1 rounded-full text-xs capitalize ${
                          project.type?.toLowerCase().includes('practice')
                            ? 'bg-primary-light text-primary-dark'
                            : 'bg-surface text-text-secondary'
                        }`}
                      >
                        {project.type || 'Proyecto'}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary flex items-center space-x-2">
                      <span className="font-medium">{project.company?.name || 'Empresa'}</span>
                      {project.location && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center space-x-1 text-xs">
                            <MapPin className="h-3 w-3" />
                            <span>{project.location}</span>
                          </span>
                        </>
                      )}
                      {project.modality && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center space-x-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{project.modality}</span>
                          </span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="mt-4 lg:mt-0 flex flex-col items-start lg:items-end space-y-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'inactive'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {project.status}
                    </span>
                    <p className="text-xs text-text-secondary">
                      {project.applicationsCount || 0} postulaciones ·{' '}
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString('es-CO')
                        : 'Sin fecha'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-t border-border pt-4">
                  <div className="flex items-center space-x-3">
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value as Project['status'])}
                      disabled={updatingId === project.id}
                      className="px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                      <option value="closed">Cerrada</option>
                    </select>
                    <span className="text-xs text-text-secondary">
                      {updatingId === project.id ? 'Actualizando estado...' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/jobs/${project.id}`}
                      className="btn-secondary btn-sm inline-flex items-center space-x-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver detalle</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="btn-secondary btn-sm inline-flex items-center space-x-2 text-red-600 border-red-200"
                      disabled={deletingId === project.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{deletingId === project.id ? 'Eliminando...' : 'Eliminar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
