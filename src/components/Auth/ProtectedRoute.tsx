import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean; // Si true, los invitados necesitan iniciar sesión
}

export default function ProtectedRoute({ children, allowedRoles, requireAuth = false }: ProtectedRouteProps) {
  const { currentUser, userData, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF8F4F' }}></div>
      </div>
    );
  }

  if (!currentUser || !userData) {
    // Guardar la ruta actual para redirigir después del login
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // Si es invitado y se requiere autenticación completa
  if (userData.isGuest && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Iniciar sesión requerido</h2>
          <p className="text-text-secondary mb-6">
            Esta función requiere que tengas una cuenta completa. Por favor inicia sesión o regístrate para continuar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <LogIn className="h-5 w-5" />
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si es invitado y hay roles permitidos, verificar que el rol del invitado esté permitido
  // Los invitados tienen rol 'student' por defecto
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    // Si es invitado y la ruta requiere un rol específico, mostrar mensaje
    if (userData.isGuest) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Acceso restringido</h2>
            <p className="text-text-secondary mb-6">
              Esta sección está disponible solo para usuarios registrados. Por favor inicia sesión o regístrate para continuar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      );
    }
    // Para usuarios no invitados, redirigir según su rol
    if (userData.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

