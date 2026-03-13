/**
 * SIMPLE EMAIL SENDER - Google Apps Script
 * 
 * Solución GRATUITA para enviar correos a leads desde Firestore
 * Usando SendGrid Free Tier (100 emails/día)
 * 
 * SETUP:
 * 1. Crea una cuenta en sendgrid.com (FREE)
 * 2. Genera una API Key
 * 3. Reemplaza SENDGRID_API_KEY en Property Store
 * 4. Reemplaza miEmail@gmail.com con tu email
 * 5. Script → Ejecutar → testSendSimpleEmail
 * 
 * NO NECESITA OAuth complicado - todo es HTTP REST simple
 */

const SENDGRID_API_KEY = 'SG.YOUR_API_KEY_HERE'; // Reemplaza con tu API Key de SendGrid
const FROM_EMAIL = 'noreply@conectau.com'; // O tu email personal
const FIRESTORE_URL = 'https://conectau-be1a2.firebaseio.com/emails_sent.json';

/**
 * Obtener correos pendientes de Firestore via REST HTTP
 * NO requiere OAuth - solo REST pública
 */
function getPendingEmailsFromFirestore() {
  try {
    const url = FIRESTORE_URL + '?orderBy="status"&equalTo="pending"';
    
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
      muteHttpExceptions: true
    });

    const result = JSON.parse(response.getContentText());
    
    if (!result || typeof result !== 'object') {
      Logger.log('No pending emails found');
      return [];
    }

    const emails = [];
    for (const key in result) {
      if (result[key].status === 'pending') {
        emails.push({
          docId: key,
          ...result[key],
        });
      }
    }

    return emails;
  } catch (error) {
    Logger.log('Error getting pending emails: ' + error);
    return [];
  }
}

/**
 * Enviar email vía SendGrid (GRATUITO, 100/día)
 */
function sendEmailViaSendGrid(to, subject, body, projectTitle, companyName) {
  try {
    const payload = {
      personalizations: [{
        to: [{ email: to }],
        subject: subject,
      }],
      from: {
        email: FROM_EMAIL,
        name: 'ConectaU - Oportunidades',
      },
      content: [{
        type: 'text/html',
        value: buildEmailHTML(projectTitle, companyName, body),
      }],
    };

    const options = {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + SENDGRID_API_KEY,
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch('https://api.sendgrid.com/v3/mail/send', options);
    
    if (response.getResponseCode() === 202) {
      Logger.log('Email sent successfully to ' + to);
      return true;
    } else {
      Logger.log('Failed to send email: ' + response.getContentText());
      return false;
    }
  } catch (error) {
    Logger.log('Error sending email: ' + error);
    return false;
  }
}

/**
 * Construir HTML profesional del email
 */
function buildEmailHTML(projectTitle, companyName, description) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          
          <h2 style="color: #1976d2; margin-bottom: 20px;">Nueva Oportunidad en ConectaU</h2>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">${projectTitle}</h3>
            <p style="color: #666; font-size: 14px;"><strong>Empresa:</strong> ${companyName}</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-left: 4px solid #1976d2;">
              <p style="margin: 0; color: #0d47a1;">${description || 'Revisa los detalles de esta nueva oportunidad.'}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://conectau-be1a2.web.app/jobs" style="background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Ver en ConectaU
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Este correo fue enviado porque registraste tu email con ConectaU.<br>
            <a href="https://conectau-be1a2.web.app/profile" style="color: #1976d2; text-decoration: none;">Actualizar preferencias</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * FUNCIÓN PRINCIPAL: Enviar todos los emails pendientes
 * Ejecuta esto manualmente: Script → Ejecutar → processPendingEmails
 */
function processPendingEmails() {
  try {
    Logger.log('Iniciando envío de emails pendientes...');
    
    const pendingEmails = getPendingEmailsFromFirestore();
    Logger.log('Encontrados ' + pendingEmails.length + ' emails pendientes');
    
    if (pendingEmails.length === 0) {
      Logger.log('No hay emails pendientes para enviar');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const email of pendingEmails) {
      const sent = sendEmailViaSendGrid(
        email.leadEmail,
        `Nueva Vacante: ${email.projectTitle}`,
        `Se ha publicado una nueva oportunidad de ${email.companyName}`,
        email.projectTitle,
        email.companyName
      );

      if (sent) {
        successCount++;
        markEmailAsSent(email.docId);
      } else {
        failCount++;
      }

      // Esperar 1 segundo entre emails para no superar límites
      Utilities.sleep(1000);
    }

    Logger.log(`\nRESULTADO:\n Enviados: ${successCount}\n Fallidos: ${failCount}`);
  } catch (error) {
    Logger.log('Error en processPendingEmails: ' + error);
  }
}

/**
 * Marcar email como enviado exitosamente en Firestore
 */
function markEmailAsSent(docId) {
  try {
    const updateUrl = FIRESTORE_URL + '/' + docId + '.json';
    
    const options = {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({
        status: 'sent_successfully',
        sentAt: new Date().toISOString(),
      }),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(updateUrl, options);
    Logger.log('Marcado como enviado: ' + docId);
  } catch (error) {
    Logger.log('Error marking email as sent: ' + error);
  }
}

/**
 * TEST: Enviar email de prueba
 */
function testSendSimpleEmail() {
  Logger.log('Enviando email de prueba...');
  
  const success = sendEmailViaSendGrid(
    'ejsotoherrera1@gmail.com', // Tu email para pruebas
    'TEST - Email desde ConectaU',
    'Este es un email de prueba',
    'Desarrollador Full Stack',
    'ConectaU'
  );

  if (success) {
    Logger.log(' Email de prueba enviado exitosamente');
  } else {
    Logger.log(' Falló el envío de email de prueba');
    Logger.log('Verifica: 1) SENDGRID_API_KEY es correcto 2) Se ejecutó con la cuenta correcta');
  }
}

/**
 * TRIGGER DIARIO: Ejecutar automáticamente cada día a las 9 AM
 * Configurar en: Script → Triggers → New trigger
 * - Function: processPendingEmails
 * - Deployment: Head
 * - Event source: Time-driven
 * - Type: Day timer
 * - Time: 9 AM to 10 AM
 */
function createDailyTrigger() {
  ScriptApp.newTrigger('processPendingEmails')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();
  
  Logger.log('Trigger diario creado para ejecutar a las 9 AM');
}

function removeTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'processPendingEmails') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log('Trigger eliminado');
    }
  }
}
