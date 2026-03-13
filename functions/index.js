const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Gmail transporter - usa tu Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'tu_email@gmail.com',
    pass: process.env.GMAIL_PASSWORD || 'tu_app_password',
  },
});

// Cloud Function que se dispara cuando se crea un nuevo lead
exports.sendLeadEmails = functions.firestore
  .document('leads/{leadId}')
  .onCreate(async (snap, context) => {
    const lead = snap.data();
    const { name, email, university, role } = lead;

    try {
      // Email al usuario (confirmación)
      await transporter.sendMail({
        from: process.env.GMAIL_USER || 'tu_email@gmail.com',
        to: email,
        subject: '✅ Confirma tu registro en ConectaU',
        html: `
          <h2>¡Gracias ${name}!</h2>
          <p>Tu registro ha sido confirmado.</p>
          <p><strong>Universidad:</strong> ${university}</p>
          <p><strong>Rol:</strong> ${role === 'student' ? 'Estudiante' : 'Empresa'}</p>
          <p>Pronto recibirás actualizaciones sobre ConectaU.</p>
          <p>—<br/>Equipo ConectaU</p>
        `,
      });

      // Email al admin (notificación)
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@conectau.local';
      await transporter.sendMail({
        from: process.env.GMAIL_USER || 'tu_email@gmail.com',
        to: adminEmail,
        subject: `📋 Nuevo Lead: ${name} (${role})`,
        html: `
          <h3>Nuevo Lead Registrado</h3>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Universidad:</strong> ${university}</p>
          <p><strong>Rol:</strong> ${role}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        `,
      });

      console.log(`✅ Emails enviados para lead: ${name}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error enviando emails:', error);
      return { success: false, error: error.message };
    }
  });
