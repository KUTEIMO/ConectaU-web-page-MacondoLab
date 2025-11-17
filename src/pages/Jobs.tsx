import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Search, X } from 'lucide-react';
import { getProjects } from '../services/projectsService';
import { Project } from '../types';

export default function Jobs() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    modality: '',
    location: '',
    category: '',
  });
  const normalizeText = (value?: string) =>
    value?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects({ status: 'active' });
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(projects.map((project) => project.category).filter(Boolean));
    return Array.from(unique);
  }, [projects]);

  const modalities = useMemo(() => {
    const unique = new Set(projects.map((project) => project.modality?.toLowerCase()).filter(Boolean));
    return Array.from(unique);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const search = normalizeText(searchTerm);
    return projects.filter((project) => {
      if (filters.type && project.type !== filters.type) return false;
      if (filters.modality && normalizeText(project.modality) !== normalizeText(filters.modality)) return false;
      if (filters.category && normalizeText(project.category) !== normalizeText(filters.category)) return false;
      if (filters.location && !normalizeText(project.location).includes(normalizeText(filters.location))) return false;
      if (search) {
        const bag = [
          project.title,
          project.description,
          project.company?.name,
          project.category,
          project.location,
          project.skillsRequired?.join(' '),
        ]
          .map(normalizeText)
          .join(' ');
        if (!bag.includes(search)) return false;
      }
      return true;
    });
  }, [projects, filters, searchTerm]);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Explorar proyectos</h1>

        <div className="card p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por título, empresa o habilidad…"
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base touch-manipulation"
              />
            </div>
            <button
              onClick={() => setFilters({ type: '', modality: '', location: '', category: '' })}
              className="text-xs sm:text-sm text-primary flex items-center space-x-1 touch-manipulation whitespace-nowrap"
            >
              <X className="h-4 w-4" />
              <span>Limpiar filtros</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <label className="text-text-secondary text-xs sm:text-sm">
              Tipo
              <select
                value={filters.type}
                onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
                className="mt-1 w-full px-3 py-2.5 sm:py-2 border border-border rounded-md text-sm sm:text-base touch-manipulation"
              >
                <option value="">Todos</option>
                <option value="project">Proyectos</option>
                <option value="practice">Prácticas</option>
              </select>
            </label>
            <label className="text-text-secondary text-xs sm:text-sm">
              Modalidad
              <select
                value={filters.modality}
                onChange={(event) => setFilters((prev) => ({ ...prev, modality: event.target.value }))}
                className="mt-1 w-full px-3 py-2.5 sm:py-2 border border-border rounded-md text-sm sm:text-base touch-manipulation"
              >
                <option value="">Todas</option>
                {modalities.map((modality) => (
                  <option key={modality} value={modality}>
                    {modality === 'remote'
                      ? 'Remoto'
                      : modality === 'hybrid'
                      ? 'Híbrido'
                      : modality === 'on-site'
                      ? 'Presencial'
                      : modality.charAt(0).toUpperCase() + modality.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-text-secondary text-xs sm:text-sm">
              Categoría
              <select
                value={filters.category}
                onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
                className="mt-1 w-full px-3 py-2.5 sm:py-2 border border-border rounded-md text-sm sm:text-base touch-manipulation"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-text-secondary text-xs sm:text-sm">
              Ubicación
              <input
                type="text"
                value={filters.location}
                onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Ej. Cúcuta"
                className="mt-1 w-full px-3 py-2.5 sm:py-2 border border-border rounded-md text-sm sm:text-base touch-manipulation"
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-surface rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-surface rounded w-full mb-2"></div>
              <div className="h-4 bg-surface rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card text-center py-8 sm:py-12 p-4 sm:p-6">
          <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary text-sm sm:text-base">No se encontraron proyectos</p>
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
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary line-clamp-2 flex-1">{project.title}</h3>
                <span className="px-2 py-1 bg-primary-light text-primary-dark text-xs rounded flex-shrink-0 whitespace-nowrap">
                  {project.type?.toLowerCase().includes('practice') ? 'Práctica' : 'Proyecto'}
                </span>
              </div>
              <p className="text-text-secondary text-xs sm:text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
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
                  <span
                    key={idx}
                    className="px-2 py-0.5 sm:py-1 bg-surface text-text-secondary text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

