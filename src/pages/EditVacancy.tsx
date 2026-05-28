import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getProjectById, updateProject } from '../services/projectsService';
import { Project } from '../types';
import { DEFAULT_CITY } from '../constants/geo';

interface VacancyForm {
  title: string;
  description: string;
  category: string;
  type: 'project' | 'practice';
  location: string;
  modality: 'remote' | 'hybrid' | 'on-site';
  salary?: string;
  skillsRequired: string;
  requirements: string;
  benefits: string;
  minExperience?: string;
  maxExperience?: string;
}

export default function EditVacancy() {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<VacancyForm>();

  useEffect(() => {
    const loadVacancy = async () => {
      if (!vacancyId) {
        navigate('/vacancies');
        return;
      }
      setLoading(true);
      try {
        const project = await getProjectById(vacancyId);
        if (!project) {
          alert('Vacante no encontrada');
          navigate('/vacancies');
          return;
        }
        reset({
          title: project.title,
          description: project.description,
          category: project.category,
          type: project.type === 'practice' ? 'practice' : 'project',
          location: project.location || DEFAULT_CITY,
          modality: (project.modality as VacancyForm['modality']) || 'remote',
          salary: project.salary,
          skillsRequired: project.skillsRequired?.join(', '),
          requirements: project.requirements?.join('\n'),
          benefits: project.benefits?.join('\n'),
          minExperience: project.minExperience,
          maxExperience: project.maxExperience,
        });
      } catch (error) {
        console.error('Error loading vacancy:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVacancy();
  }, [vacancyId, reset, navigate]);

  const onSubmit = async (data: VacancyForm) => {
    if (!vacancyId) return;
    try {
      await updateProject(vacancyId, {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        location: data.location,
        modality: data.modality,
        salary: data.salary,
        skillsRequired: data.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
        requirements: data.requirements.split('\n').filter((line) => line.trim()),
        benefits: data.benefits.split('\n').filter((line) => line.trim()),
        minExperience: data.minExperience,
        maxExperience: data.maxExperience,
      } as Partial<Project>);
      alert('Vacante actualizada');
      navigate('/vacancies');
    } catch (error) {
      console.error('Error updating vacancy:', error);
      alert('No se pudo actualizar la vacante');
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Cargando información de la vacante...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary inline-flex items-center space-x-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
        <h1 className="text-3xl font-bold">Editar vacante</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              {...register('title', { required: true })}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción *</label>
            <textarea
              rows={6}
              {...register('description', { required: true })}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoría *</label>
            <input
              type="text"
              {...register('category', { required: true })}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              {...register('type', { required: true })}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="project">Proyecto</option>
              <option value="practice">Práctica</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ubicación *</label>
            <input
              type="text"
              {...register('location', { required: true })}
              className="w-full px-4 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modalidad *</label>
            <select
              {...register('modality', { required: true })}
              className="w-full px-4 py-2 border border-border rounded-md"
            >
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
              <option value="on-site">Presencial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salario</label>
            <input
              type="text"
              {...register('salary')}
              className="w-full px-4 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experiencia mínima</label>
            <input
              type="text"
              {...register('minExperience')}
              className="w-full px-4 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experiencia máxima</label>
            <input
              type="text"
              {...register('maxExperience')}
              className="w-full px-4 py-2 border border-border rounded-md"
            />
          </div>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Habilidades (separadas por coma)</label>
            <input
              type="text"
              {...register('skillsRequired')}
              className="w-full px-4 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Requisitos (uno por línea)</label>
            <textarea
              rows={4}
              {...register('requirements')}
              className="w-full px-4 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Beneficios (uno por línea)</label>
            <textarea
              rows={4}
              {...register('benefits')}
              className="w-full px-4 py-2 border border-border rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" className="btn-secondary" onClick={() => navigate('/vacancies')}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

