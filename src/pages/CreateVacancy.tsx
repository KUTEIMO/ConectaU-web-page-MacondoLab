import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { createProject } from '../services/projectsService';
import { Project } from '../types';
import { DEFAULT_CITY } from '../constants/geo';

interface VacancyForm {
  title: string;
  description: string;
  category: string;
  type: 'project' | 'practice';
  location: string;
  modality: 'remote' | 'hybrid' | 'on-site';
  salary: string;
  skillsRequired: string;
  requirements: string;
  benefits: string;
  minExperience: string;
  maxExperience: string;
}

export default function CreateVacancy() {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<VacancyForm>({
    defaultValues: {
      location: DEFAULT_CITY,
      modality: 'remote',
      type: 'project',
    },
  });

  const onSubmit = async (data: VacancyForm) => {
    if (!currentUser || !userData) return;
    
    setLoading(true);
    try {
      const project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount'> = {
        title: data.title,
        description: data.description,
        category: data.category,
        companyId: currentUser.uid,
        company: {
          id: userData.id,
          name: userData.companyName || userData.name,
          industry: userData.industry,
          logo: userData.photoUrl,
        },
        status: 'active',
        type: data.type,
        location: data.location || DEFAULT_CITY,
        modality: data.modality,
        salary: data.salary || undefined,
        skillsRequired: data.skillsRequired.split(',').map(s => s.trim()).filter(s => s),
        requirements: data.requirements.split('\n').filter(r => r.trim()),
        benefits: data.benefits.split('\n').filter(b => b.trim()),
        minExperience: data.minExperience || undefined,
        maxExperience: data.maxExperience || undefined,
      };

      await createProject(project);
      alert('Vacante creada exitosamente');
      navigate('/vacancies');
    } catch (error: any) {
      console.error('Error creating vacancy:', error);
      alert('Error al crear la vacante: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Crear Nueva Vacante</h1>
        <button
          onClick={() => navigate('/vacancies')}
          className="btn-secondary flex items-center space-x-2"
        >
          <X className="h-5 w-5" />
          <span>Cancelar</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Título de la Vacante *
              </label>
              <input
                type="text"
                {...register('title', { required: 'El título es requerido' })}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: Desarrollador Frontend React"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Descripción *
              </label>
              <textarea
                {...register('description', { required: 'La descripción es requerida' })}
                rows={6}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe el proyecto o práctica..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  {...register('category', { required: 'La categoría es requerida' })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Desarrollo Web"
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tipo *
                </label>
                <select
                  {...register('type', { required: true })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="project">Proyecto</option>
                  <option value="practice">Práctica</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Detalles</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  {...register('location', { required: 'La ubicación es requerida' })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Remoto, Caracas, etc."
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Modalidad *
                </label>
                <select
                  {...register('modality', { required: true })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="on-site">Presencial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Experiencia mínima (opcional)
                </label>
                <input
                  type="text"
                  {...register('minExperience')}
                  placeholder="Ej: 1 año"
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Experiencia máxima (opcional)
                </label>
                <input
                  type="text"
                  {...register('maxExperience')}
                  placeholder="Ej: 3 años"
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Salario (Opcional)
              </label>
              <input
                type="text"
                {...register('salary')}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: $500 - $800 USD"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Requisitos y Habilidades</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Habilidades Requeridas * (separadas por comas)
              </label>
              <input
                type="text"
                {...register('skillsRequired', { required: 'Las habilidades son requeridas' })}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: React, TypeScript, Node.js"
              />
              {errors.skillsRequired && (
                <p className="mt-1 text-sm text-red-600">{errors.skillsRequired.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Requisitos * (uno por línea)
              </label>
              <textarea
                {...register('requirements', { required: 'Los requisitos son requeridos' })}
                rows={6}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej:&#10;Estudiante de ingeniería&#10;Conocimientos en React&#10;Disponibilidad de tiempo"
              />
              {errors.requirements && (
                <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Beneficios (uno por línea)
              </label>
              <textarea
                {...register('benefits')}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej:&#10;Experiencia práctica&#10;Certificado al finalizar&#10;Posibilidad de contrato"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/vacancies')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Creando...' : 'Crear Vacante'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

