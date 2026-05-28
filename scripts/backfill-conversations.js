/**
 * Backfill conversation messages for ConectaU data.
 *
 * This script iterates all documents in `conversations` and ensures each one has at least
 * one message stored in the `conversations/{conversationId}/messages` subcollection. If a
 * conversation already has messages, it will be skipped. Otherwise, it will create a seed
 * message using the `lastMessage`/`lastMessageAt` metadata from the conversation document.
 *
 * Usage:
 *   1. Ensure you have a Firebase service account JSON file for the `conectau-be1a2` project.
 *   2. Export its path before running the script:
 *        export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/serviceAccountKey.json"
 *   3. Install dependencies (run `npm install` once).
 *   4. Execute:
        npm run seed-conversations
 *
 * The script uses the Firebase Admin SDK and will only add seed messages to conversations
 * that currently lack a `messages` subcollection.
 */

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  console.error('❌ Missing GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  console.error('Set it to the path of your service account JSON file before running this script.');
  process.exit(1);
}

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account file not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backfillConversations() {
  console.log('🚀 Starting conversation backfill...');

  const snapshot = await db.collection('conversations').get();
  if (snapshot.empty) {
    console.log('No conversations found. Nothing to do.');
    return;
  }

  let processed = 0;
  for (const doc of snapshot.docs) {
    const convoId = doc.id;
    const data = doc.data();
    const participants = data?.participants || [];

    const messagesRef = doc.ref.collection('messages');
    const existing = await messagesRef.limit(1).get();

    if (!existing.empty) {
      continue;
    }

    const fallbackText =
      data?.lastMessage && data.lastMessage.trim().length > 0
        ? data.lastMessage
        : 'Bienvenido al chat de ConectaU. Usa este canal para continuar la conversación.';
    const timestamp =
      data?.lastMessageAt && data.lastMessageAt.toDate
        ? data.lastMessageAt
        : admin.firestore.Timestamp.now();

    const senderId = data?.metadata?.companyId || participants[0] || 'system';
    const senderName = data?.metadata?.companyName || 'ConectaU';

    await messagesRef.add({
      conversationId: convoId,
      senderId,
      senderName,
      text: fallbackText,
      createdAt: timestamp,
      read: false,
    });

    if (!data?.lastMessage) {
      await doc.ref.update({
        lastMessage: fallbackText,
        lastMessageAt: timestamp,
      });
    }

    processed += 1;
    console.log(`✔ Conversación ${convoId} poblada con un mensaje inicial.`);
  }

  console.log(`\n✅ Backfill completo. Conversaciones actualizadas: ${processed}`);
}

backfillConversations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  });

