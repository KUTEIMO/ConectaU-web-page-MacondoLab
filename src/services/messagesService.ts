import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation, Message } from '../types';
import { getUserData } from './authService';

const mapConversation = async (docSnapshot: any, currentUserId: string): Promise<Conversation> => {
  const data = docSnapshot.data();
  const participants = data.participants || [];
  const otherParticipantId = participants.find((id: string) => id !== currentUserId);
  const otherParticipant = otherParticipantId ? await getUserData(otherParticipantId) : null;

  return {
    id: docSnapshot.id,
    participants,
    lastMessage: data.lastMessage || '',
    lastMessageAt: data.lastMessageAt?.toDate?.() || new Date(),
    createdAt: data.createdAt?.toDate?.() || new Date(),
    metadata: data.metadata,
    otherParticipant: otherParticipant || undefined,
  } as Conversation;
};

const mapMessage = (docSnapshot: any): Message => {
  const data = docSnapshot.data();
  const parentConversationId = docSnapshot.ref.parent.parent?.id;

  const text = data.text || data.message || data.body || '';

  const timestampSource =
    data.createdAt ||
    data.timestamp ||
    data.sentAt ||
    data.created_at ||
    data.date ||
    data.createdAt_ts ||
    null;

  const createdAt =
    timestampSource?.toDate?.() ||
    (typeof timestampSource === 'number'
      ? new Date(timestampSource)
      : typeof timestampSource === 'string'
      ? new Date(timestampSource)
      : new Date(docSnapshot.createTime?.toDate?.() || Date.now()));

  return {
    id: docSnapshot.id,
    conversationId: data.conversationId || parentConversationId,
    senderId: data.senderId,
    senderName: data.senderName || data.sender,
    senderPhoto: data.senderPhoto,
    text,
    createdAt,
    read: data.read ?? data.isRead ?? false,
  };
};

export const listenConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(
    q,
    async (snapshot) => {
      const mapped = await Promise.all(snapshot.docs.map((docSnapshot) => mapConversation(docSnapshot, userId)));
      mapped.sort(
        (a, b) =>
          (b.lastMessageAt?.getTime() || b.createdAt.getTime()) -
          (a.lastMessageAt?.getTime() || a.createdAt.getTime())
      );
      callback(mapped);
    },
    (error) => {
      console.error('Error listening conversations:', error);
    }
  );
};

export const listenMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  let preferredSource: 'sub' | 'root' | null = null;
  let rootUnsubscribe: (() => void) | null = null;
  let subUnsubscribe: (() => void) | null = null;

  const emitRootMessages = (snap: any) => {
    if (preferredSource === 'sub') return;
    const messages = snap.docs.map(mapMessage).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    preferredSource = 'root';
    callback(messages);
  };

  const ensureRootListener = () => {
    if (rootUnsubscribe) return;
    const rootQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    rootUnsubscribe = onSnapshot(
      rootQuery,
      (snap) => emitRootMessages(snap),
      (error) => console.error('Error escuchando mensajes globales:', error)
    );
  };

  const subCollectionRef = collection(doc(db, 'conversations', conversationId), 'messages');

  subUnsubscribe = onSnapshot(
    subCollectionRef,
    (snap) => {
      const messages = snap.docs
        .map(mapMessage)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      if (messages.length > 0) {
        preferredSource = 'sub';
        callback(messages);
        if (rootUnsubscribe) {
          rootUnsubscribe();
          rootUnsubscribe = null;
        }
      } else if (!preferredSource) {
        ensureRootListener();
      }
    },
    (error) => {
      console.warn('Error escuchando subcolección de mensajes, se usará la colección global.', error);
      ensureRootListener();
    }
  );

  ensureRootListener();

  return () => {
    if (subUnsubscribe) subUnsubscribe();
    if (rootUnsubscribe) rootUnsubscribe();
  };
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string,
  senderName?: string,
  senderPhoto?: string
) => {
  const message = text.trim();
  if (!message) return;

  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnapshot = await getDoc(conversationRef);

  if (!conversationSnapshot.exists()) {
    throw new Error('La conversación no existe o fue eliminada.');
  }

  const conversationData = conversationSnapshot.data() || {};
  const participants: string[] = conversationData.participants || [];
  const receiverId = participants.find((participant) => participant !== senderId);

  const timestamp = serverTimestamp();
  const payload = {
    conversationId,
    senderId,
    senderName: senderName || null,
    senderPhoto: senderPhoto || null,
    text: message,
    message,
    timestamp,
    createdAt: timestamp,
    read: false,
  };

  const subcollectionRef = collection(conversationRef, 'messages');
  const rootCollectionRef = collection(db, 'messages');

  let stored = false;

  try {
    await addDoc(subcollectionRef, payload);
    stored = true;
  } catch (error) {
    console.warn('No se pudo guardar el mensaje en la subcolección, se intentará en la colección global.', error);
  }

  if (!stored) {
    try {
      await addDoc(rootCollectionRef, payload);
      stored = true;
    } catch (error) {
      console.error('No se pudo guardar el mensaje en la colección global.', error);
      throw new Error('No se pudo enviar el mensaje. Intenta nuevamente.');
    }
  } else {
    // Intento opcional en la colección global para mantener compatibilidad legacy
    addDoc(rootCollectionRef, payload).catch((error) =>
      console.warn('No se pudo replicar el mensaje en la colección global legacy.', error)
    );
  }

  const updates: Record<string, any> = {
    lastMessage: message,
    lastMessageAt: timestamp,
    [`unreadCount.${senderId}`]: 0,
  };

  if (receiverId) {
    const currentUnread = conversationData?.unreadCount?.[receiverId] || 0;
    updates[`unreadCount.${receiverId}`] = currentUnread + 1;
  }

  await updateDoc(conversationRef, updates);

  if (receiverId) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: receiverId,
        type: 'message',
        title: 'Nuevo mensaje',
        message: conversationData.metadata?.jobTitle
          ? `Nuevo mensaje sobre ${conversationData.metadata.jobTitle}`
          : 'Tienes un nuevo mensaje',
        data: { conversationId, senderId },
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('No se pudo registrar la notificación del mensaje.', error);
    }
  }
};

export const createConversation = async (participants: string[], metadata?: Record<string, any>) => {
  if (participants.length < 2) {
    throw new Error('Se necesitan al menos dos participantes');
  }

  const uniqueParticipants = Array.from(new Set(participants));
  const sortedParticipants = [...uniqueParticipants].sort();
  const conversationId = sortedParticipants.join('_');
  const conversationRef = doc(db, 'conversations', conversationId);
  const snapshot = await getDoc(conversationRef);

  if (snapshot.exists()) {
    return snapshot.id;
  }

  await setDoc(conversationRef, {
    participants: sortedParticipants,
    metadata: metadata || {},
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return conversationId;
};

