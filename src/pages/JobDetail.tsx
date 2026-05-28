import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Briefcase, Heart, ArrowLeft } from 'lucide-react';
import { getProjectById } from '../services/projectsService';
import { isFavorite, addFavorite, removeFavorite } from '../services/favoritesService';
import { useAuthStore } from '../store/authStore';
import { Project } from '../types';
import { createApplication } from '../services/applicationsService';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData, currentUser } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
      checkFavorite();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!id || !currentUser || userData?.role !== 'student') return;
    try {
      const fav = await isFavorite(currentUser.uid, id);
      setIsFav(fav);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavorite = async () => {
    if (!id || !currentUser || userData?.role !== 'student') return;
    try {
      if (isFav) {
        await removeFavorite(currentUser.uid, id);
        setIsFav(false);
      } else {
        await addFavorite(currentUser.uid, id);
        setIsFav(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleApply = async () => {
    if (!id || !currentUser || userData?.role !== 'student') return;
    if (!project) return;
    setApplying(true);
    try {
      await createApplication({
        studentId: currentUser.uid,
        projectId: id,
        companyId: project.companyId,
        message: '',
      });
      alert('¡Postulación enviada exitosamente!');
      navigate('/applications');
    } catch (error: any) {
      console.error('Error applying:', error);
      const errorMessage = error.message || 'Error al postular. Intenta nuevamente.';
      alert(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-surface rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-surface rounded w-full mb-2"></div>
        <div className="h-4 bg-surface rounded w-2/3"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Vacante no encontrada</p>
        <Link to="/jobs" className="text-primary mt-4 inline-block">
          Volver a vacantes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Volver</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <div className="flex items-center space-x-4 text-text-secondary">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{project.company?.name || 'Empresa'}</span>
                  </div>
                  {project.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{project.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-light text-primary-dark text-sm rounded">
                {project.type === 'project' ? 'Proyecto' : 'Práctica'}
              </span>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-3">Descripción</h2>
              <p className="text-text-secondary mb-6 whitespace-pre-line">{project.description}</p>

              <h2 className="text-xl font-semibold mb-3">Requisitos</h2>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-6">
                {project.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>

              <h2 className="text-xl font-semibold mb-3">Beneficios</h2>
              <ul className="list-disc list-inside space-y-2 text-text-secondary mb-6">
                {project.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>

              <h2 className="text-xl font-semibold mb-3">Habilidades Requeridas</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.skillsRequired.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-light text-primary-dark rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {(project.minExperience || project.maxExperience) && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Experiencia Requerida</h2>
                  <p className="text-text-secondary">
                    {project.minExperience && project.maxExperience
                      ? `${project.minExperience} - ${project.maxExperience}`
                      : project.minExperience || project.maxExperience}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Modalidad</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="capitalize">{project.modality}</span>
                </div>
              </div>
              {project.salary && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Salario</span>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{project.salary}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Postulaciones</span>
                <span>{project.applicationsCount}</span>
              </div>
            </div>

            {userData?.role === 'student' && (
              <div className="space-y-3">
                <button
                  onClick={handleFavorite}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md border ${
                    isFav
                      ? 'bg-primary-light text-primary-dark border-primary'
                      : 'bg-white text-text-primary border-border hover:bg-surface'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                  <span>{isFav ? 'En favoritos' : 'Agregar a favoritos'}</span>
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {applying ? 'Postulando...' : 'Postularme'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

