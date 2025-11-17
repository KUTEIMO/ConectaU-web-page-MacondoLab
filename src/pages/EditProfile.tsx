import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { updateUserData } from '../services/authService';
import { VALID_UNIVERSITIES } from '../constants/geo';

interface StudentProfileForm {
  phone?: string;
  address?: string;
  university?: string;
  career?: string;
  semester?: string;
  gpa?: string;
  skills?: string;
  availability?: string;
  portfolio?: string;
  isPublic?: boolean;
}

interface CompanyProfileForm {
  companyName?: string;
  industry?: string;
  website?: string;
  description?: string;
  phone?: string;
  address?: string;
  nit?: string;
  contactPerson?: string;
  contactPosition?: string;
}

type ProfileForm = StudentProfileForm & CompanyProfileForm;

const normalizeText = (value?: string) =>
  value?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

const UNIVERSITY_ALIASES: Record<string, string[]> = {
  UNISIMON: ['simón', 'simon', 'unisimon', 'simón bolívar'],
  UFPS: ['ufps', 'francisco', 'paula', 'francisco de paula'],
  UDES: ['udes', 'desarrollo', 'universidad de santander'],
  UNIPAMPLONA: ['pamplona', 'universidad de pamplona'],
};

const mapUniversity = (value?: string) => {
  if (!value) return value;
  const normalized = normalizeText(value);
  for (const uni of VALID_UNIVERSITIES) {
    const aliases = UNIVERSITY_ALIASES[uni] || [];
    if (
      normalized === normalizeText(uni) ||
      aliases.some((alias) => normalized.includes(normalizeText(alias)))
    ) {
      return uni;
    }
  }
  return value.trim();
};

export default function EditProfile() {
  const { userData } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>();

  useEffect(() => {
    if (userData) {
      reset({
        phone: userData.phone,
        address: userData.address,
        university: mapUniversity(userData.university),
        career: userData.career,
        semester: userData.semester,
        gpa: userData.gpa,
        skills: userData.skills?.join(', '),
        availability: userData.availability,
        portfolio: userData.portfolio,
        isPublic: userData.isPublic,
        companyName: userData.companyName,
        industry: userData.industry,
        website: userData.website,
        description: userData.description,
        nit: userData.nit,
        contactPerson: userData.contactPerson,
        contactPosition: userData.contactPosition,
      });
    }
  }, [userData, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!userData) return;
    const payload: any = {
      phone: data.phone,
      address: data.address,
    };

    if (userData.role === 'student') {
      payload.university = mapUniversity(data.university);
      payload.career = data.career;
      payload.semester = data.semester;
      payload.gpa = data.gpa;
      payload.skills = data.skills?.split(',').map((skill) => skill.trim()).filter(Boolean) || [];
      payload.availability = data.availability;
      payload.portfolio = data.portfolio;
      payload.isPublic = data.isPublic ?? true;
    } else if (userData.role === 'company') {
      payload.companyName = data.companyName;
      payload.industry = data.industry;
      payload.website = data.website;
      payload.description = data.description;
      payload.nit = data.nit;
      payload.contactPerson = data.contactPerson;
      payload.contactPosition = data.contactPosition;
    }

    try {
      await updateUserData(userData.id, payload);
      alert('Perfil actualizado correctamente');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Error al actualizar el perfil');
    }
  };

  if (!userData) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Cargando datos del perfil...</p>
      </div>
    );
  }

  const isStudent = userData.role === 'student';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
        <button className="btn-secondary flex items-center space-x-2" onClick={() => navigate('/profile')}>
          <X className="h-5 w-5" />
          <span>Cancelar</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Información de contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {isStudent ? (
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold">Información académica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Universidad</label>
                <input
                  type="text"
                  list="universities"
                  {...register('university')}
                  placeholder="Ej. Universidad Simón Bolívar"
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <datalist id="universities">
                  {VALID_UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carrera</label>
                <input
                  type="text"
                  {...register('career')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Semestre</label>
                <input
                  type="text"
                  {...register('semester')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Promedio (GPA)</label>
                <input
                  type="text"
                  {...register('gpa')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skills (separadas por coma)</label>
                <input
                  type="text"
                  {...register('skills')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Disponibilidad</label>
                <input
                  type="text"
                  {...register('availability')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Portafolio</label>
                <input
                  type="url"
                  {...register('portfolio')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <label className="flex items-center space-x-2 mt-6">
                <input type="checkbox" {...register('isPublic')} className="rounded border-border text-primary" />
                <span className="text-sm text-text-secondary">Mostrar mi perfil en el buscador</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold">Información de la empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre comercial</label>
                <input
                  type="text"
                  {...register('companyName', { required: 'El nombre es requerido' })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industria</label>
                <input
                  type="text"
                  {...register('industry')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sitio web</label>
                <input
                  type="url"
                  {...register('website')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NIT</label>
                <input
                  type="text"
                  {...register('nit')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                rows={4}
                {...register('description')}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Persona de contacto</label>
                <input
                  type="text"
                  {...register('contactPerson')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus-border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo de la persona de contacto</label>
                <input
                  type="text"
                  {...register('contactPosition')}
                  className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus-border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button type="button" className="btn-secondary" onClick={() => navigate('/profile')}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

