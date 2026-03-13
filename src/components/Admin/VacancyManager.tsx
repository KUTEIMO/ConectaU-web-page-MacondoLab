import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader, RefreshCw, Send, History, Trash2 } from 'lucide-react';
import { 
  getActiveVacancies, 
  getAllLeads, 
  logEmailSent,
  hasLeadReceivedNotification,
  getCampaignHistory,
  cleanTestData,
  getPendingEmails,
} from '../../services/vacancyService';
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

interface CampaignRecord {
  date: string;
  totalSent: number;
  vacancies: string[];
}

export default function VacancyManager() {
  const [vacancies, setVacancies] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedVacancies, setSelectedVacancies] = useState<SelectedVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [view, setView] = useState<'send' | 'history'>('send');
  const [history, setHistory] = useState<CampaignRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vacsData, leadsData, histData, pendingData] = await Promise.all([
        getActiveVacancies(),
        getAllLeads(),
        getCampaignHistory(),
        getPendingEmails(),
      ]);
      setVacancies(vacsData);
      setLeads(leadsData as Lead[]);
      setHistory(histData);
      setPendingCount(pendingData.length);
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
      let skippedCount = 0;

      // Registrar correos a enviar - evitar duplicados (anti-spam)
      for (const vacancy of selectedVacancies) {
        for (const lead of leads) {
          // Verificar si ya recibió esta vacante
          const alreadyReceived = await hasLeadReceivedNotification(
            lead.email,
            vacancy.projectId
          );

          if (alreadyReceived) {
            skippedCount++;
            continue; // No enviar de nuevo
          }

          // Registrar como 'pending' - será procesado por AppScript
          await logEmailSent(
            lead.email,
            vacancy.projectId,
            vacancy.title,
            vacancy.companyName,
            lead.id,
            'pending'
          );
          sentCount++;
        }
      }

      let msgText = `✅ ${sentCount} correos pendientes de envío`;
      if (skippedCount > 0) {
        msgText += ` (${skippedCount} omitidos - already notified)`;
      }

      setMessage({
        type: 'success',
        text: msgText,
      });
      setSelectedVacancies([]);
      
      // Recargar datos después de 2 segundos para ver los cambios
      setTimeout(() => {
        loadData();
      }, 2000);
    } catch (error) {
      console.error('Error sending emails:', error);
      setMessage({ type: 'error', text: 'Error al registrar correos' });
    } finally {
      setSending(false);
    }
  };

  const handleCleanTestData = async () => {
    if (!window.confirm('¿Eliminar datos de prueba (pendientes de >24h)?')) return;
    
    try {
      const result = await cleanTestData();
      setMessage({
        type: 'success',
        text: `✅ ${result.deleted} registros de prueba eliminados`,
      });
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al limpiar datos' });
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notificaciones a Leads</h1>
            <p className="text-text-secondary">Enviar vacantes activas a leads capturados</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setView('send')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              view === 'send'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            <Send className="inline h-4 w-4 mr-2" />
            Enviar Campañas
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              view === 'history'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            <History className="inline h-4 w-4 mr-2" />
            Historial
            {history.length > 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{history.length}</span>}
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

      {/* Vista: Enviar Campañas */}
      {view === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vacantes */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-xl font-semibold mb-4">Vacantes Activas</h2>

            {vacancies.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay vacantes activas para notificar</p>
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
                      <p className="text-sm text-text-secondary">{vacancy.company?.name}</p>
                      {(vacancy.location || vacancy.modality) && (
                        <p className="text-xs text-text-secondary mt-1">
                          {vacancy.location}
                          {vacancy.location && vacancy.modality && ' • '}
                          {vacancy.modality}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Resumen y Control */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-6">Resumen</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Vacantes disponibles</p>
                  <p className="text-3xl font-bold text-primary">{vacancies.length}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-text-secondary mb-1">Leads a notificar</p>
                  <p className="text-3xl font-bold text-primary">{leads.length}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-text-secondary mb-1">Seleccionadas</p>
                  <p className="text-3xl font-bold text-primary">{selectedVacancies.length}</p>
                </div>

                {pendingCount > 0 && (
                  <div className="border-t pt-4 bg-amber-50 p-3 rounded border border-amber-200">
                    <p className="text-xs text-amber-700 font-semibold">Pendientes de envío</p>
                    <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSendEmails}
                disabled={sending || selectedVacancies.length === 0 || leads.length === 0}
                className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-3"
              >
                {sending ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Procesando
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Enviar a {leads.length} leads
                  </>
                )}
              </button>

              <p className="text-xs text-text-secondary mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                Los datos se registran como "pendientes" hasta que AppScript los procese.
              </p>
            </div>

            <div className="card p-6 bg-red-50 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Limpieza
              </h4>
              <button
                onClick={handleCleanTestData}
                className="w-full px-3 py-2 text-sm border border-red-300 text-red-800 rounded hover:bg-red-100 transition"
              >
                Eliminar datos de prueba
              </button>
              <p className="text-xs text-red-700 mt-2">
                Elimina registros pendientes más antiguos de 24h
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Historial */}
      {view === 'history' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-6">Historial de Campañas Exitosas</h2>

          {history.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay campañas exitosas registradas</p>
              <p className="text-sm mt-2">Los correos deben ser enviados por AppScript para aparecer aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((campaign, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{campaign.date}</p>
                      <p className="text-sm text-text-secondary mt-1">
                        {campaign.totalSent} correos enviados
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-text-secondary mb-2">Vacantes incluidas:</p>
                    <div className="space-y-1">
                      {campaign.vacancies.map((vac, vidx) => (
                        <p key={vidx} className="text-sm text-text-primary bg-gray-100 px-2 py-1 rounded">
                          • {vac}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detalle de envío (si hay seleccionadas) */}
      {view === 'send' && selectedVacancies.length > 0 && leads.length > 0 && (
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Detalle del envío</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="mb-4">
              <p className="text-sm font-semibold text-text-secondary mb-2">Destinatarios ({leads.length})</p>
              <div className="text-sm space-y-1 max-h-20 overflow-y-auto">
                {leads.slice(0, 5).map((lead, idx) => (
                  <p key={idx} className="text-text-primary">{lead.email}</p>
                ))}
                {leads.length > 5 && (
                  <p className="text-text-secondary text-xs">+ {leads.length - 5} más</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-text-secondary mb-2">Vacantes a incluir ({selectedVacancies.length})</p>
              <div className="space-y-2">
                {selectedVacancies.map((v) => (
                  <div key={v.projectId} className="text-sm">
                    <p className="font-semibold text-text-primary">{v.title}</p>
                    <p className="text-xs text-text-secondary">{v.companyName}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
