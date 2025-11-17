import { useEffect, useMemo, useState } from 'react';
import { User, UserRole } from '../types';
import { getAllUsers, updateUserActiveStatus } from '../services/adminService';
import {
  createUserWithRole,
  sendResetPasswordLink,
  updateUserPassword as updateUserPasswordService,
} from '../services/userManagementService';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  PlusCircle,
  Mail,
  Lock,
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'inactive';
type VerificationFilter = 'all' | 'verified' | 'pending';
type SortOption = 'recent' | 'oldest';

const ROLE_CONFIG: Array<{
  role: UserRole;
  title: string;
  description: string;
  accent: string;
}> = [
  {
    role: 'student',
    title: 'Estudiantes',
    description: 'Perfiles académicos verificados por las universidades aliadas.',
    accent: 'text-emerald-600',
  },
  {
    role: 'company',
    title: 'Empresas',
    description: 'Organizaciones habilitadas para publicar vacantes y contactar talento.',
    accent: 'text-blue-600',
  },
  {
    role: 'admin',
    title: 'Administradores',
    description: 'Cuentas internas con acceso total al panel de control.',
    accent: 'text-primary',
  },
];

const initialCreateForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'admin' as UserRole,
};

const initialPasswordForm = {
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      data.sort(
        (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
      );
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const verified = users.filter((user) => user.isVerified).length;
    const active = users.filter((user) => user.isActive).length;
    return {
      total,
      verified,
      pendingVerification: total - verified,
      inactive: total - active,
    };
  }, [users]);

  const normalizedSearch = search.trim().toLowerCase();

  const processedUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' ? user.isActive : !user.isActive);
        const matchesVerification =
          verificationFilter === 'all' ||
          (verificationFilter === 'verified' ? user.isVerified : !user.isVerified);
        if (!matchesStatus || !matchesVerification) return false;
        if (!normalizedSearch) return true;
        const haystack = [user.name, user.email, user.companyName, user.university]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return (a.createdAt?.getTime?.() || 0) - (b.createdAt?.getTime?.() || 0);
        }
        return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
      });
  }, [users, normalizedSearch, statusFilter, verificationFilter, sortBy]);

  const usersByRole = useMemo(() => {
    return ROLE_CONFIG.reduce<Record<UserRole, User[]>>((acc, config) => {
      acc[config.role] = processedUsers.filter((user) => user.role === config.role);
      return acc;
    }, { student: [], company: [], admin: [] });
  }, [processedUsers]);

  const handleToggleActive = async (user: User) => {
    try {
      setActionUserId(user.id);
      await updateUserActiveStatus(user.id, !user.isActive);
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, isActive: !user.isActive } : item))
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setActionUserId(null);
    }
  };

  const openCreateModal = (role: UserRole) => {
    setCreateForm({ ...initialCreateForm, role });
    setFormError(null);
    setCreateModalOpen(true);
  };

  const openPasswordModal = (user: User) => {
    setPasswordForm({
      ...initialPasswordForm,
      email: user.email,
    });
    setPasswordError(null);
    setPasswordModalOpen(true);
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (createForm.password !== createForm.confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }
    setFormLoading(true);
    try {
      await createUserWithRole({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      });
      await loadUsers();
      setCreateModalOpen(false);
      setCreateForm(initialCreateForm);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setFormError(error?.message || 'No se pudo crear el usuario.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    if (!passwordForm.currentPassword) {
      setPasswordError('Debes ingresar la contraseña actual para poder actualizarla.');
      return;
    }
    setPasswordLoading(true);
    try {
      await updateUserPasswordService({
        email: passwordForm.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordModalOpen(false);
      setPasswordForm(initialPasswordForm);
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(
        error?.message || 'No se pudo cambiar la contraseña. Verifica los datos ingresados.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPasswordLink = async (email: string) => {
    try {
      setResetMessage(null);
      await sendResetPasswordLink(email);
      setResetMessage(`Se envió un enlace de restablecimiento a ${email}.`);
    } catch (error) {
      console.error('Error sending reset email:', error);
      setResetMessage('No se pudo enviar el enlace. Intenta nuevamente.');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-text-secondary text-sm">
            Crea credenciales, organiza por rol y gestiona el acceso a la plataforma.
          </p>
        </div>
        <button
          onClick={() => openCreateModal('admin')}
          className="btn-primary inline-flex items-center space-x-2 text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nuevo usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Verificados</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pendingVerification}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-secondary">Suspendidos</p>
          <p className="text-2xl font-bold text-rose-600">{stats.inactive}</p>
        </div>
      </div>

      <div className="card mb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, empresa o correo"
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-border rounded-md"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Suspendidos</option>
          </select>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as VerificationFilter)}
            className="px-4 py-2 border border-border rounded-md"
          >
            <option value="all">Todos los niveles</option>
            <option value="verified">Verificados</option>
            <option value="pending">Pendientes</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-border rounded-md"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
          </select>
        </div>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{stats.verified} verificados</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>{stats.pendingVerification} por verificar</span>
          </div>
          <button
            onClick={loadUsers}
            className="btn-secondary btn-sm inline-flex items-center space-x-2"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="card mb-6 border border-emerald-200 bg-emerald-50 text-sm text-emerald-900">
          {resetMessage}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {ROLE_CONFIG.map((config) => {
          const roleUsers = usersByRole[config.role];
          return (
            <div key={config.role} className="card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-wide ${config.accent}`}>{config.title}</p>
                  <p className="text-sm text-text-secondary mt-1">{config.description}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {roleUsers.length} usuario{roleUsers.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                  onClick={() => openCreateModal(config.role)}
                  className="btn-secondary btn-sm inline-flex items-center space-x-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Agregar</span>
                </button>
              </div>

              <div className="mt-4 flex-1">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : roleUsers.length === 0 ? (
                  <div className="text-center text-text-secondary py-8 text-sm">
                    No hay usuarios con este rol según los filtros actuales.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {roleUsers.slice(0, 8).map((user) => (
                      <li key={user.id} className="py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text-primary">{user.name || 'Sin nombre'}</p>
                            <p className="text-xs text-text-secondary">{user.email}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.isActive ? 'Activo' : 'Suspendido'}
                            </span>
                            <span
                              className={`block px-2 py-1 rounded-full text-xs ${
                                user.isVerified ? 'bg-primary-light text-primary-dark' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {user.isVerified ? 'Verificado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="inline-flex items-center space-x-1 text-primary hover:underline"
                          >
                            <Lock className="h-3 w-3" />
                            <span>Cambiar contraseña</span>
                          </button>
                          <button
                            onClick={() => handleResetPasswordLink(user.email)}
                            className="inline-flex items-center space-x-1 text-primary hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Enviar enlace</span>
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={actionUserId === user.id}
                            className="inline-flex items-center space-x-1 text-primary hover:underline"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            <span>
                              {actionUserId === user.id
                                ? 'Actualizando...'
                                : user.isActive
                                ? 'Suspender'
                                : 'Reactivar'}
                            </span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Crear usuario</h2>
                <p className="text-sm text-text-secondary">
                  Asigna credenciales manuales a cualquier rol (incluidos administradores).
                </p>
              </div>
              <button
                className="text-sm text-text-secondary hover:text-text-primary"
                onClick={() => setCreateModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <label className="flex flex-col gap-1 text-sm">
                Rol
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
                  }
                  className="px-3 py-2 border border-border rounded-md"
                >
                  <option value="admin">Administrador</option>
                  <option value="company">Empresa</option>
                  <option value="student">Estudiante</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Nombre completo
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="px-3 py-2 border border-border rounded-md"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Correo electrónico
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="px-3 py-2 border border-border rounded-md"
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm">
                  Contraseña
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    minLength={6}
                    required
                    className="px-3 py-2 border border-border rounded-md"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Confirmar contraseña
                  <input
                    type="password"
                    value={createForm.confirmPassword}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    minLength={6}
                    required
                    className="px-3 py-2 border border-border rounded-md"
                  />
                </label>
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary btn-sm"
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary btn-sm" disabled={formLoading}>
                  {formLoading ? 'Creando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Actualizar contraseña</h2>
                <p className="text-sm text-text-secondary">
                  Para cambiar la contraseña debes conocer la actual. Si no la tienes, envía un enlace
                  de restablecimiento.
                </p>
              </div>
              <button
                className="text-sm text-text-secondary hover:text-text-primary"
                onClick={() => setPasswordModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleUpdatePassword}>
              <label className="flex flex-col gap-1 text-sm">
                Correo
                <input
                  type="email"
                  value={passwordForm.email}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  className="px-3 py-2 border border-border rounded-md"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Contraseña actual
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  minLength={6}
                  required
                  className="px-3 py-2 border border-border rounded-md"
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm">
                  Nueva contraseña
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    minLength={6}
                    required
                    className="px-3 py-2 border border-border rounded-md"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Confirmar contraseña
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    minLength={6}
                    required
                    className="px-3 py-2 border border-border rounded-md"
                  />
                </label>
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleResetPasswordLink(passwordForm.email)}
                  className="text-sm text-primary hover:underline inline-flex items-center space-x-1"
                >
                  <Mail className="h-4 w-4" />
                  <span>Enviar enlace de restablecimiento</span>
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="btn-secondary btn-sm"
                    disabled={passwordLoading}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary btn-sm" disabled={passwordLoading}>
                    {passwordLoading ? 'Actualizando...' : 'Guardar cambio'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

