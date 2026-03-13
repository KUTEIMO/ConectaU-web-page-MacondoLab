import { useEffect, useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, Loader, RefreshCw } from 'lucide-react';
import { getActiveVacancies, getAllLeads, logEmailSent } from '../../services/vacancyService';
import { Project } from '../../types';

interface Lead {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

interface SelectedVacancy {
  projectId: string;
  title: string;
  companyName: string;
}

export default function VacancyManager() {
  const [vacancies, setVacancies] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedVacancies, setSelectedVacancies] = useState<SelectedVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vacsData, leadsData] = await Promise.all([
        getActiveVacancies(),
        getAllLeads(),
      ]);
      setVacancies(vacsData);
      setLeads(leadsData as Lead[]);
      setMessage(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const toggleVacancy = (vacancy: Project) => {
    setSelectedVacancies((prev) => {
      const exists = prev.find((v) => v.projectId === vacancy.id);
      if (exists) {
        return prev.filter((v) => v.projectId !== vacancy.id);
      }
      return [
        ...prev,
        {
          projectId: vacancy.id,
          title: vacancy.title,
          companyName: vacancy.company?.name || 'Empresa',
        },
      ];
    });
  };

  const handleSendEmails = async () => {
    if (selectedVacancies.length === 0 || leads.length === 0) {
      setMessage({ type: 'error', text: 'Selecciona vacantes y asegúrate de tener leads' });
      return;
    }

    setSending(true);
    try {
      let sentCount = 0;

      // Registrar en BD: correos a enviar (automático por Google Apps Script)
      for (const vacancy of selectedVacancies) {
        for (const lead of leads) {
          await logEmailSent(
            lead.email,
            vacancy.projectId,
            vacancy.title,
            vacancy.companyName,
            lead.id,
            'sent'
          );
          sentCount++;
        }
      }

      setMessage({
        type: 'success',
        text: `✅ ${sentCount} correos registrados para envío automático (Google Apps Script)`,
      });
      setSelectedVacancies([]);
      setTimeout(() => setMessage(null), 6000);
    } catch (error) {
      console.error('Error sending emails:', error);
      setMessage({ type: 'error', text: 'Error al registrar correos' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📧 Campañas de Email</h1>
            <p className="text-text-secondary">Selecciona vacantes publicadas y envía correos a los leads capturados</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vacantes disponibles - Ocupan 2 columnas */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📋 Vacantes Activas Publicadas
          </h2>

          {vacancies.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay vacantes activas publicadas por las empresas</p>
              <p className="text-sm mt-2">Las empresas deben publicar vacantes en el módulo de /vacancies</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vacancies.map((vacancy) => (
                <label
                  key={vacancy.id}
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedVacancies.some((v) => v.projectId === vacancy.id)}
                    onChange={() => toggleVacancy(vacancy)}
                    className="mt-1 w-4 h-4 text-primary cursor-pointer"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-text-primary">{vacancy.title}</p>
                    <p className="text-sm text-text-secondary">{vacancy.company?.name || 'Empresa'}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vacancy.location && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          📍 {vacancy.location}
                        </span>
                      )}
                      {vacancy.modality && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          💼 {vacancy.modality}
                        </span>
                      )}
                      {vacancy.type && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {vacancy.type}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral: Resumen y botón de acción */}
        <div className="card p-6 h-fit sticky top-6">
          <h3 className="text-lg font-semibold mb-6">📊 Resumen</h3>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-text-secondary uppercase font-semibold">Vacantes Disponibles</p>
              <p className="text-3xl font-bold text-primary mt-1">{vacancies.length}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs text-text-secondary uppercase font-semibold">Leads para Notificar</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{leads.length}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-xs text-text-secondary uppercase font-semibold">Seleccionadas</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{selectedVacancies.length}</p>
            </div>
          </div>

          <button
            onClick={handleSendEmails}
            disabled={sending || selectedVacancies.length === 0 || leads.length === 0}
            className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            {sending ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Enviar a {leads.length} leads
              </>
            )}
          </button>

          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>ℹ️ Automático:</strong> Los correos se enviarán cada día mediante Google Apps Script (sin costo adicional)
            </p>
          </div>
        </div>
      </div>

      {/* Preview: Información que se enviará */}
      {selectedVacancies.length > 0 && (
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">📬 Preview: Lo que se enviará</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Para (correos):</p>
              <div className="text-sm space-y-1 max-h-24 overflow-y-auto">
                {leads.map((lead, idx) => (
                  <p key={idx} className="text-gray-700">
                    • {lead.email}
                  </p>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Vacantes Incluidas:</p>
              <div className="space-y-2">
                {selectedVacancies.map((v) => (
                  <div key={v.projectId} className="bg-white p-2 rounded border border-gray-200">
                    <p className="font-semibold text-sm text-text-primary">{v.title}</p>
                    <p className="text-xs text-text-secondary">{v.companyName}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-xs text-blue-800">
                ✅ Al hacer click, los datos se guardarán en la BD y Google Apps Script los procesará automáticamente
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info útil */}
      <div className="card p-6 mt-8 bg-blue-50 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">ℹ️ Cómo funciona:</h4>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Las empresas publican vacantes en /vacancies (estas aparecen automáticamente aquí)</li>
          <li>Selecciona las vacantes que quieres compartir</li>
          <li>Haz click en "Enviar" para registrar los correos en la BD</li>
          <li>Google Apps Script envía automáticamente cada día (máximo 100 correos/día gratis)</li>
          <li>Los leads reciben notificaciones sobre las nuevas oportunidades</li>
        </ol>
      </div>
    </div>
  );
}
