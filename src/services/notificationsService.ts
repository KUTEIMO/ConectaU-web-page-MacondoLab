import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../types';

export const getNotifications = async (userId: string, limitCount?: number): Promise<Notification[]> => {
  try {
    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Notification[];
  } catch (error: any) {
    // Si el error es por índice faltante, intentar sin orderBy
    if (error.code === 'failed-precondition') {
      console.warn('Índice compuesto faltante. Consulta Firestore Console para crear el índice.');
      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];
      
      // Ordenar manualmente
      return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    throw error;
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const markAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
};

export const markAllAsRead = async (userId: string) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snapshot = await getDocs(q);
  
  const updates = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, { isRead: true })
  );
  
  await Promise.all(updates);
};

