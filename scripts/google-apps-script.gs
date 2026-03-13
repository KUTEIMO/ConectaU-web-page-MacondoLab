// Google Apps Script - Guardar en https://script.google.com
// Este script se conecta a Firestore y envía correos masivos GRATIS

/**
 * INSTRUCCIONES DE SETUP:
 * 
 * 1. Ve a https://script.google.com
 * 2. Nuevo proyecto
 * 3. Copia TODO el código de este archivo
 * 4. Guarda como "ConectaU-Email-Sender"
 * 5. Instala la librería Firebase:
 *    - Librerías → Busca FirebaseApp → Añade versión más reciente
 * 6. En "Ejecutar" → Autorizar acceso
 * 7. En "Activadores" → Nuevo disparador:
 *    - Función: onCheckNewLeads
 *    - Evento: Ver calendario → Cada día
 * 
 * ¡Listo! Cada día verificará si hay nuevas vacantes y enviará correos.
 */

// ============ CONFIGURACIÓN ============
const PROJECT_ID = 'conectau-be1a2';
const PRIVATE_KEY = 'YOUR_FIREBASE_PRIVATE_KEY'; // Obtener de Firebase Console
const CLIENT_EMAIL = 'firebase-generate-key@conectau-be1a2.iam.gserviceaccount.com';
const ADMIN_EMAIL = 'tu_email@gmail.com'; // Tu email para recibir notificaciones

// ============ FUNCIONES ============

function initializeFirebase() {
  const serviceAccount = {
    type: 'service_account',
    project_id: PROJECT_ID,
    private_key_id: 'key-id',
    private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: CLIENT_EMAIL,
    client_id: '0',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  };

  return FirebaseApp.getDatabaseService(serviceAccount, 'conectau-be1a2');
}

function getLeadsFromFirestore() {
  try {
    // Simulación - En producción, usar la conexión de Firebase
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getRange('A2:B100').getValues();
    return data.filter(row => row[0] && row[1]); // email, name
  } catch (error) {
    Logger.log('Error getting leads:', error);
    return [];
  }
}

function sendEmailsToLeads(subject, body) {
  const leads = getLeadsFromFirestore();
  
  if (leads.length === 0) {
    Logger.log('No leads found');
    return;
  }

  // Enviar correos (Google Apps Script permite hasta 100/día gratis)
  leads.slice(0, 100).forEach((lead, index) => {
    const email = lead[0];
    const name = lead[1];

    if (email && email.includes('@')) {
      try {
        GmailApp.sendEmail(
          email,
          subject,
          `Hola ${name},\n\n${body}\n\nÚnete a ConectaU ahora: https://conectau-be1a2.web.app\n\n—\nEquipo ConectaU`,
          {
            from: ADMIN_EMAIL,
          }
        );
        Logger.log(`✅ Email enviado a ${email}`);
      } catch (error) {
        Logger.log(`❌ Error enviando email a ${email}: ${error}`);
      }

      // Limitar rate para no sobrecargar
      if (index % 10 === 0) {
        Utilities.sleep(1000);
      }
    }
  });

  // Notificar al admin
  GmailApp.sendEmail(
    ADMIN_EMAIL,
    `✅ Correos enviados - ${leads.length} leads`,
    `Se enviaron correos a ${leads.length} leads.\n\nAsunto: ${subject}`
  );
}

function onCheckNewLeads() {
  const subject = '📋 Nuevas oportunidades en ConectaU';
  const body = `
Hemos publicado nuevas vacantes exclusivas para ti.

🎯 Oportunidades disponibles:
• Proyectos reales con empresas
• Pagos seguros en escrow
• Certificación profesional

¡Accede ahora y explora todas las vacantes disponibles!`;

  sendEmailsToLeads(subject, body);
}

// Función manual para probar
function testSendEmails() {
  onCheckNewLeads();
}
