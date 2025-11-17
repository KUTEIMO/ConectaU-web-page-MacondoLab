import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  FileText,
  Heart,
  MessageSquare,
  Bell,
  User,
  Users,
  BarChart3,
  Building2,
  GraduationCap,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { userData } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { path: '/app', icon: Home, label: 'Inicio' },
    { path: '/jobs', icon: Briefcase, label: 'Explorar Vacantes' },
    { path: '/applications', icon: FileText, label: 'Mis Postulaciones', requireAuth: true },
    { path: '/favorites', icon: Heart, label: 'Favoritos', requireAuth: true },
    { path: '/messages', icon: MessageSquare, label: 'Mensajes', requireAuth: true },
    { path: '/notifications', icon: Bell, label: 'Notificaciones', requireAuth: true },
    { path: '/profile', icon: User, label: 'Mi Perfil', requireAuth: true },
  ];

  const guestLinks = [
    { path: '/app', icon: Home, label: 'Inicio' },
    { path: '/jobs', icon: Briefcase, label: 'Explorar Vacantes' },
  ];

  const companyLinks = [
    { path: '/app', icon: Home, label: 'Dashboard' },
    { path: '/vacancies', icon: Briefcase, label: 'Mis Vacantes', requireAuth: true },
    { path: '/talent', icon: GraduationCap, label: 'Talentos', requireAuth: true },
    { path: '/saved-profiles', icon: BookmarkCheck, label: 'Guardados', requireAuth: true },
    { path: '/messages', icon: MessageSquare, label: 'Mensajes', requireAuth: true },
    { path: '/notifications', icon: Bell, label: 'Notificaciones', requireAuth: true },
    { path: '/profile', icon: Building2, label: 'Mi Perfil', requireAuth: true },
  ];

  const adminLinks = [
    { path: '/admin', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Usuarios' },
    { path: '/admin/vacancies', icon: Briefcase, label: 'Vacantes' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analíticas' },
  ];

  const links = userData?.isGuest
    ? guestLinks
    : userData?.role === 'student'
    ? studentLinks
    : userData?.role === 'company'
    ? companyLinks
    : adminLinks;

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-14 sm:top-16 lg:top-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] lg:h-screen
          ${collapsed ? 'w-16 lg:w-20' : 'w-64 sm:w-72'} bg-white border-r border-border z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto overscroll-contain
        `}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            const isRestricted = userData?.isGuest && (link as any).requireAuth;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`
                  flex items-center ${collapsed ? 'justify-center' : 'space-x-2 sm:space-x-3'} 
                  px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
                  transition-colors touch-manipulation
                  ${active ? 'bg-primary-light text-primary-dark font-medium' : 'text-text-primary hover:bg-surface'}
                  ${isRestricted ? 'opacity-50' : 'active:bg-surface'}
                `}
                title={isRestricted ? 'Requiere iniciar sesión' : link.label}
                aria-label={link.label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm sm:text-base truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="absolute -right-3 top-6 hidden lg:flex bg-white border border-border rounded-full p-1 shadow touch-manipulation z-10"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>
    </>
  );
}

