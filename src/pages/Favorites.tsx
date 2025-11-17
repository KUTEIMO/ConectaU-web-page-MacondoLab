import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Briefcase, MapPin, DollarSign, Clock, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getFavorites, removeFavorite } from '../services/favoritesService';
import { getProjectById } from '../services/projectsService';
import { Favorite, Project } from '../types';

export default function Favorites() {
  const { currentUser } = useAuthStore();
  const [favorites, setFavorites] = useState<(Favorite & { project?: Project })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  const loadFavorites = async () => {
    if (!currentUser) return;
    try {
      const favs = await getFavorites(currentUser.uid);
      const favoritesWithProjects = await Promise.all(
        favs.map(async (fav) => {
          const project = await getProjectById(fav.projectId);
          return { ...fav, project };
        })
      );
      setFavorites(favoritesWithProjects.filter((fav) => fav.project !== null) as Array<{ id: string; studentId: string; projectId: string; createdAt: Date; project?: Project }>);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (projectId: string) => {
    if (!currentUser) return;
    try {
      await removeFavorite(currentUser.uid, projectId);
      setFavorites(favorites.filter((fav) => fav.projectId !== projectId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mis Favoritos</h1>

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
      ) : favorites.length === 0 ? (
        <div className="card text-center py-12">
          <Heart className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary mb-4">No tienes favoritos guardados</p>
          <Link to="/jobs" className="text-primary hover:underline">
            Explorar vacantes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const project = favorite.project;
            if (!project) return null;

            return (
              <div key={favorite.id} className="card relative">
                <button
                  onClick={() => handleRemove(project.id)}
                  className="absolute top-4 right-4 p-2 text-text-secondary hover:text-red-600"
                  title="Eliminar de favoritos"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <Link to={`/jobs/${project.id}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-text-primary pr-8">{project.title}</h3>
                    <span className="px-2 py-1 bg-primary-light text-primary-dark text-xs rounded">
                      {project.type?.toLowerCase().includes('practice') ? 'Práctica' : 'Proyecto'}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>{project.company?.name || 'Empresa'}</span>
                    </div>
                    {project.location && (
                      <div className="flex items-center text-sm text-text-secondary">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    {project.modality && (
                      <div className="flex items-center text-sm text-text-secondary">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="capitalize">{project.modality}</span>
                      </div>
                    )}
                    {project.salary && (
                      <div className="flex items-center text-sm text-text-secondary">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>{project.salary}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

