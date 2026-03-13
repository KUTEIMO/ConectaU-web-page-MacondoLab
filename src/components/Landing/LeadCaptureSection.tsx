import { useState } from 'react';
import { ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { submitLead, Lead } from '../../services/leadService';

export default function LeadCaptureSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    role: 'student' as 'student' | 'company',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData((prev) => ({ ...prev, role: value as 'student' | 'company' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación simple
    if (!formData.name.trim() || !formData.email.trim() || !formData.university.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    // Validación email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido.');
      return;
    }

    setLoading(true);
    try {
      await submitLead(formData as Lead);
      setSuccess(true);
      setFormData({ name: '', email: '', university: '', role: 'student' });
      // Resetear éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el formulario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border-t border-b border-border py-12 sm:py-16 md:py-20">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
            Tu talento merece oportunidades reales
          </h2>
          <p className="text-text-secondary text-base sm:text-lg">
            Únete a la lista de espera de ConectaU y sé de los primeros en acceder a proyectos reales con empresas.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">¡Registro completado!</h3>
            <p className="text-green-700">Te enviaremos un email con más información pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-4 sm:p-6 md:p-8 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full px-4 py-2 border border-border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="university" className="block text-sm font-medium text-text-primary mb-2">
                Universidad
              </label>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Tu universidad"
                className="w-full px-4 py-2 border border-border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-2">
                ¿Eres estudiante o empresa?
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="student">Estudiante</option>
                <option value="company">Empresa</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary inline-flex items-center justify-center space-x-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>Quiero acceso anticipado</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-xs text-text-secondary text-center">
              Datos protegidos y nunca compartidos con terceros.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
