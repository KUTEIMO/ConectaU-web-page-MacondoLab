import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Loader } from 'lucide-react';
import { createVacancy, getActiveVacancies, getAllLeads, deleteVacancy, Vacancy } from '../../services/vacancyService';

export default function VacancyManager() {
  const [vacancies, setVacancies] = useState<(Vacancy & { id: string })[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    salary: '',
    location: '',
  });

  useEffect(() => {
    loadVacancies();
    loadLeads();
  }, []);

  const loadVacancies = async () => {
    setLoading(true);
    const data = await getActiveVacancies();
    setVacancies(data);
    setLoading(false);
  };

  const loadLeads = async () => {
    const data = await getAllLeads();
    setLeads(data);
  };

  const handleAddVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company) {
      alert('Título y empresa son requeridos');
      return;
    }

    setLoading(true);
    try {
      await createVacancy({ ...formData, status: 'active' });
      setFormData({ title: '', company: '', description: '', salary: '', location: '' });
      await loadVacancies();
    } catch (error) {
      alert('Error al crear vacante');
    }
    setLoading(false);
  };

  const handleDeleteVacancy = async (id: string) => {
    if (confirm('¿Eliminar esta vacante?')) {
      await deleteVacancy(id);
      await loadVacancies();
    }
  };

  const handleSendEmailsToLeads = async () => {
    if (leads.length === 0) {
      alert('No hay leads para enviar correos');
      return;
    }

    if (vacancies.length === 0) {
      alert('No hay vacantes activas');
      return;
    }

    setSending(true);
    try {
      // Aquí iría la lógica para enviar correos
      // Por ahora, simular
      const subject = `📋 ${vacancies.length} vacantes disponibles en ConectaU`;
      const body = `
Hola,

Tenemos nuevas oportunidades disponibles en ConectaU:

${vacancies.map(v => `• ${v.title} - ${v.company}`).join('\n')}

Visita tu cuenta para ver más detalles.

—
Equipo ConectaU
      `;

      // Mostrar datos para Manual envío
      console.log('Correo a enviar:');
      console.log(`Subject: ${subject}`);
      console.log(`Recipients: ${leads.map(l => l.email).join(', ')}`);
      console.log(`Body:\n${body}`);

      alert(`✅ Correos listos para enviar\n\nTo: ${leads.length} leads\nVacantes: ${vacancies.length}\n\nNota: Actualmente requiere envío manual o integración con servicio de email.`);
    } catch (error) {
      alert('Error al enviar correos');
    }
    setSending(false);
  };

  return (
    <div className="p-6 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Gestor de Vacantes</h1>

        {/* Formulario crear vacante */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Nueva Vacante</h2>
          <form onSubmit={handleAddVacancy} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Título"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="px-4 py-2 border border-border rounded-md"
              />
              <input
                type="text"
                placeholder="Empresa"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="px-4 py-2 border border-border rounded-md"
              />
              <input
                type="text"
                placeholder="Salario (opcional)"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="px-4 py-2 border border-border rounded-md"
              />
              <input
                type="text"
                placeholder="Ubicación (opcional)"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="px-4 py-2 border border-border rounded-md"
              />
            </div>
            <textarea
              placeholder="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-border rounded-md h-24"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              {loading ? 'Guardando...' : 'Crear Vacante'}
            </button>
          </form>
        </div>

        {/* Vacantes activas */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Vacantes Activas ({vacancies.length})
          </h2>
          {vacancies.length === 0 ? (
            <p className="text-text-secondary">No hay vacantes activas</p>
          ) : (
            <div className="space-y-4">
              {vacancies.map((v) => (
                <div key={v.id} className="border border-border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-text-primary">{v.title}</h3>
                      <p className="text-text-secondary">{v.company}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteVacancy(v.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enviar correos a leads */}
        <div className="card p-6 bg-blue-50 border-2 border-primary">
          <h2 className="text-xl font-bold text-text-primary mb-4">Enviar Correos a Leads</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              <strong>Leads inscritos:</strong> {leads.length}
            </p>
            <p className="text-text-secondary">
              <strong>Vacantes activas:</strong> {vacancies.length}
            </p>
            <button
              onClick={handleSendEmailsToLeads}
              disabled={sending || leads.length === 0 || vacancies.length === 0}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Enviar correos a {leads.length} leads
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
