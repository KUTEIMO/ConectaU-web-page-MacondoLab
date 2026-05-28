import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Mail, Briefcase, MapPin, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { userData, currentUser } = useAuthStore();
  const studentRequiredFields = ['university', 'career', 'semester', 'skills', 'portfolio'];
  const companyRequiredFields = ['companyName', 'industry', 'description', 'contactPerson', 'website'];

  if (!userData) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Cargando perfil...</p>
      </div>
    );
  }

  const requiredFields =
    userData.role === 'student'
      ? studentRequiredFields
      : userData.role === 'company'
      ? companyRequiredFields
      : [];

  const completedFields = requiredFields.filter((field) => {
    const value = (userData as any)[field];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Boolean(value);
  });

  const completionPercent =
    requiredFields.length > 0 ? Math.round((completedFields.length / requiredFields.length) * 100) : 100;
  const missingFields = requiredFields.filter(
    (field) => !completedFields.includes(field)
  );

  const avatarUrl =
    userData.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData.companyName || userData.name
    )}&background=E3E8EF&color=1F2A37&size=256&rounded=true`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <Link
          to="/profile/edit"
          className="btn-secondary flex items-center space-x-2"
        >
          <Edit className="h-5 w-5" />
          <span>Editar</span>
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-light flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={userData.name}
              className="w-24 h-24 object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              {userData.isVerified ? (
                <span className="inline-flex items-center px-3 py-1 bg-accent text-white rounded-full text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verificado
                </span>
              ) : userData.role === 'student' ? (
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Pendiente de verificación
                </span>
              ) : null}
            </div>
            <div className="space-y-2 text-text-secondary">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                <span className="capitalize">
                  {userData.role === 'student'
                    ? 'Estudiante'
                    : userData.role === 'company'
                    ? 'Empresa'
                    : 'Administrador'}
                </span>
              </div>
            </div>
            {!userData.isVerified && userData.role === 'student' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Tu perfil está pendiente de verificación institucional.
                </p>
                <button className="mt-2 text-sm text-primary hover:underline font-medium">
                  Solicitar verificación
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {requiredFields.length > 0 && completionPercent < 100 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-text-secondary">Compleción del perfil</p>
              <p className="text-2xl font-bold text-text-primary">{completionPercent}%</p>
            </div>
            <Link to="/profile/edit" className="btn-primary text-sm px-4">
              Completar perfil
            </Link>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {missingFields.length > 0 && (
            <p className="text-xs text-text-secondary mt-2">
              Pendiente: {missingFields.slice(0, 3).map((field) => field).join(', ')}
              {missingFields.length > 3 ? '…' : ''}
            </p>
          )}
        </div>
      )}

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Información de contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
          <p><span className="font-medium">Correo:</span> {userData.email}</p>
          <p><span className="font-medium">Teléfono:</span> {userData.phone || 'Sin especificar'}</p>
          <p><span className="font-medium">Dirección:</span> {userData.address || 'Sin especificar'}</p>
        </div>
      </div>

      {userData.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card space-y-2">
            <h3 className="text-lg font-semibold mb-4">Información académica</h3>
            <p className="text-sm"><span className="font-medium">Universidad:</span> {userData.university || 'Sin especificar'}</p>
            <p className="text-sm"><span className="font-medium">Carrera:</span> {userData.career || 'Sin especificar'}</p>
            <p className="text-sm"><span className="font-medium">Semestre:</span> {userData.semester || 'Sin especificar'}</p>
            <p className="text-sm"><span className="font-medium">GPA:</span> {userData.gpa || 'N/A'}</p>
            <p className="text-sm"><span className="font-medium">Disponibilidad:</span> {userData.availability || 'Sin definir'}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Habilidades</h3>
            {userData.skills && userData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userData.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary-light text-primary-dark rounded-md text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No hay habilidades agregadas</p>
            )}
          </div>
          {userData.portfolio && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Portafolio</h3>
              <a href={userData.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {userData.portfolio}
              </a>
            </div>
          )}
        </div>
      )}

      {userData.role === 'company' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card space-y-3 text-sm text-text-secondary">
            <h3 className="text-lg font-semibold mb-4">Información de la Empresa</h3>
            <p><span className="font-medium">Nombre:</span> {userData.companyName || userData.name}</p>
            <p><span className="font-medium">Industria:</span> {userData.industry || 'Sin especificar'}</p>
            <p><span className="font-medium">NIT:</span> {userData.nit || 'Sin especificar'}</p>
            <p><span className="font-medium">Contacto:</span> {userData.contactPerson || 'Sin especificar'} ({userData.contactPosition || 'N/A'})</p>
            {userData.website && (
              <p>
                <span className="font-medium">Sitio web:</span>{' '}
                <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {userData.website}
                </a>
              </p>
            )}
          </div>
          {userData.description && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Descripción</h3>
              <p className="text-text-secondary leading-relaxed">{userData.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

