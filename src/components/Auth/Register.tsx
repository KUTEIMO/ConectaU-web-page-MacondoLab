import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, LogIn, Home, ArrowLeft } from 'lucide-react';
import { registerWithEmail } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { role: 'student' }
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = await registerWithEmail(data.email, data.password, data.name, data.role);
      setCurrentUser(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 relative">
        {/* Botón para volver al inicio */}
        <Link
          to="/"
          className="absolute top-4 left-4 p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          title="Volver al inicio"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl sm:text-2xl">CU</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Únete a ConectaU</h2>
          <p className="text-text-secondary mt-2 text-sm sm:text-base">Crear perfil</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-4"
          method="post"
          autoComplete="on"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', { required: 'El nombre es requerido' })}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                id="register-email"
                type="email"
                autoComplete="email username"
                {...register('email', { required: 'El email es requerido' })}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-2">
              Tipo de cuenta
            </label>
            <select
              id="role"
              autoComplete="off"
              {...register('role', { required: true })}
              className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="student">Estudiante</option>
              <option value="company">Empresa</option>
            </select>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-text-primary mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: value => value === password || 'Las contraseñas no coinciden'
                })}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 sm:py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation"
          >
            <LogIn className="h-5 w-5" />
            <span>{loading ? 'Creando cuenta...' : 'Registrarse'}</span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

