import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/authService';
import { getUnreadCount } from '../../services/notificationsService';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { currentUser, userData } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadUnreadCount();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadUnreadCount = async () => {
    if (!currentUser) return;
    try {
      const count = await getUnreadCount(currentUser.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const isGuest = userData?.isGuest;
      // Limpiar store antes de cerrar sesión
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      // Cerrar sesión de Firebase
      await logout();
      // Redirigir: invitados van a inicio, usuarios normales a login
      if (isGuest) {
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error durante logout:', error);
      const isGuest = userData?.isGuest;
      // Aun si hay error, redirigir y limpiar estado local
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      if (isGuest) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo y navegación móvil */}
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-text-primary hover:bg-surface mr-1 sm:mr-2 touch-manipulation"
              aria-label="Menú"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">CU</span>
              </div>
              <div className="hidden xs:block sm:block min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-text-primary truncate">ConectaU</h1>
                <p className="text-xs text-text-secondary hidden sm:block truncate">Conectando talento con oportunidades</p>
              </div>
            </Link>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {!userData?.isGuest && (
              <Link
                to="/app"
                className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors touch-manipulation"
              >
                Inicio
              </Link>
            )}
            {(userData?.role === 'student' || userData?.isGuest) && (
              <Link
                to="/jobs"
                className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors touch-manipulation"
              >
                Vacantes
              </Link>
            )}
            {userData?.role === 'student' && !userData?.isGuest && (
              <>
                <Link
                  to="/applications"
                  className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors touch-manipulation whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Mis Postulaciones</span>
                  <span className="xl:hidden">Postulaciones</span>
                </Link>
                <Link
                  to="/messages"
                  className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors touch-manipulation"
                >
                  Mensajes
                </Link>
              </>
            )}
            {userData?.role === 'company' && !userData?.isGuest && (
              <>
                <Link
                  to="/vacancies"
                  className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors touch-manipulation whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Mis Vacantes</span>
                  <span className="xl:hidden">Vacantes</span>
                </Link>
                <Link
                  to="/messages"
                  className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors touch-manipulation"
                >
                  Mensajes
                </Link>
              </>
            )}
            {userData?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-surface transition-colors touch-manipulation"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {currentUser ? (
              <>
                {!userData?.isGuest && (
                  <Link
                    to="/notifications"
                    className="p-2 rounded-md text-text-primary hover:bg-surface relative touch-manipulation"
                    aria-label="Notificaciones"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {!userData?.isGuest && (
                  <Link
                    to="/profile"
                    className="p-1.5 sm:p-2 rounded-full border border-border hover:border-primary transition touch-manipulation"
                    title="Mi perfil"
                    aria-label="Mi perfil"
                  >
                    <img
                      src={
                        userData?.photoUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          userData?.companyName || userData?.name || 'ConectaU'
                        )}&background=E3E8EF&color=1F2A37&size=64&rounded=true`
                      }
                      alt={userData?.name || 'Usuario'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  </Link>
                )}
                {userData?.isGuest ? (
                  <>
                    <Link
                      to="/login"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
                    >
                      <span className="hidden xs:inline">Iniciar sesión</span>
                      <span className="xs:hidden">Entrar</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-md flex items-center gap-1 sm:gap-2 touch-manipulation"
                      title="Salir del modo invitado"
                      aria-label="Salir del modo invitado"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Salir del modo invitado</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md text-text-primary hover:bg-surface touch-manipulation"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
                >
                  <span className="hidden xs:inline">Ingresar</span>
                  <span className="xs:hidden">Entrar</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

