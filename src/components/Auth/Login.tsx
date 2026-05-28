import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, User, Home, ArrowLeft } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, loginAsGuest } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { getUserData } from '../../services/authService';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser, setUserData } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Limpiar cualquier sesión anterior al cargar el componente de login
  useEffect(() => {
    const cleanup = async () => {
      const { currentUser } = useAuthStore.getState();
      const { auth } = await import('../../config/firebase');
      // Si hay un usuario anónimo (invitado), cerrarlo al entrar al login
      if (auth.currentUser?.isAnonymous) {
        try {
          const { logout } = await import('../../services/authService');
          await logout();
          const { clearAuth } = useAuthStore.getState();
          clearAuth();
        } catch (error) {
          console.error('Error limpiando sesión anterior:', error);
        }
      }
    };
    cleanup();
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      // Si hay un usuario invitado, cerrarlo primero
      const { currentUser } = useAuthStore.getState();
      if (currentUser?.isAnonymous) {
        const { logout } = await import('../../services/authService');
        await logout();
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
      }
      
      const user = await loginWithEmail(data.email, data.password);
      const userData = await getUserData(user.uid);
      setCurrentUser(user);
      setUserData(userData);
      
      // Redirigir según rol o a la página anterior si existe
      const from = (location.state as any)?.from || null;
      
      if (userData?.role === 'admin') {
        navigate(from || '/admin', { replace: true });
      } else {
        navigate(from || '/app', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Si hay un usuario invitado, cerrarlo primero
      const { currentUser } = useAuthStore.getState();
      if (currentUser?.isAnonymous) {
        const { logout } = await import('../../services/authService');
        await logout();
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
      }
      
      const user = await loginWithGoogle();
      const userData = await getUserData(user.uid);
      setCurrentUser(user);
      setUserData(userData);
      
      // Redirigir según rol o a la página anterior si existe
      const from = (location.state as any)?.from || null;
      
      if (userData?.role === 'admin') {
        navigate(from || '/admin', { replace: true });
      } else {
        navigate(from || '/app', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Limpiar estado actual antes de iniciar como invitado
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      
      const user = await loginAsGuest();
      const userData = await getUserData(user.uid);
      setCurrentUser(user);
      setUserData(userData);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Error al continuar como invitado');
      // Limpiar estado en caso de error
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
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
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Bienvenido a ConectaU</h2>
          <p className="text-text-secondary mt-2 text-sm sm:text-base">Inicia sesión en tu cuenta</p>
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
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                id="email"
                type="email"
                autoComplete="username email"
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
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { required: 'La contraseña es requerida' })}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 sm:py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation"
          >
            <LogIn className="h-5 w-5" />
            <span>{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</span>
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-text-secondary">O continúa con</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border border-border rounded-md px-4 py-2 text-text-primary hover:bg-surface disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full border border-border rounded-md px-4 py-2 text-text-secondary hover:bg-surface disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <User className="h-5 w-5" />
              <span>Continuar como invitado</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Regístrate
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

