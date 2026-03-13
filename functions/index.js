const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TU_EMAIL@gmail.com",
    pass: "TU_APP_PASSWORD"
  }
});

exports.sendCampaignEmail = functions.firestore
  .document("emails_sent/{emailId}")
  .onCreate(async (snap, context) => {

    const data = snap.data();

    if (data.status !== "pending") return null;

    const { leadEmail, projectTitle, companyName } = data;

    const mailOptions = {
      from: "ConectaU <TU_EMAIL@gmail.com>",
      to: leadEmail,
      subject: `Nueva vacante: ${projectTitle}`,
      html: `
        <h2>Nueva oportunidad en ConectaU</h2>

        <p><strong>Vacante:</strong> ${projectTitle}</p>
        <p><strong>Empresa:</strong> ${companyName}</p>

        <a href="https://conectau-be1a2.web.app/jobs"
        style="
        background:#1976d2;
        color:white;
        padding:10px 20px;
        text-decoration:none;
        border-radius:6px;">
        Ver vacante
        </a>
      `
    };

    try {

      await transporter.sendMail(mailOptions);

      await admin.firestore()
        .collection("emails_sent")
        .doc(context.params.emailId)
        .update({
          status: "sent_successfully",
          sentAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log("Email enviado a:", leadEmail);

    } catch (error) {

      console.error("Error enviando email:", error);

      await admin.firestore()
        .collection("emails_sent")
        .doc(context.params.emailId)
        .update({
          status: "failed"
        });

    }

    return null;

});