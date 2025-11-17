import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface LandingRouteProps {
  children: React.ReactNode;
}

export default function LandingRoute({ children }: LandingRouteProps) {
  const { currentUser, userData, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF8F4F' }}></div>
      </div>
    );
  }

  // Solo redirigir automáticamente si el usuario NO es invitado
  // Esto permite que siempre se muestre la landing page al inicio
  // y que los invitados puedan navegar libremente
  if (currentUser && userData && !userData.isGuest) {
    // No redirigir automáticamente desde la landing
    // Permitir que el usuario vea la landing si la visita explícitamente
    return <>{children}</>;
  }

  // Mostrar siempre la landing page si no hay usuario o es invitado
  return <>{children}</>;
}

