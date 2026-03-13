import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Project } from '../types';

export interface EmailLog {
  leadEmail: string;
  leadId?: string;
  projectId: string;
  projectTitle: string;
  companyName: string;
  sentAt: any;
  status: 'sent' | 'failed';
}

/**
 * Obtener vacantes ACTIVAS creadas por empresas
 * Lectura de collection 'projects' (donde empresas crean vacantes)
 * No crear vacantes desde aquí - esto es solo lectura de las existentes
 */
export const getActiveVacancies = async (): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, 'projects'),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.(),
      } as Project;
    });
  } catch (error) {
    console.error('Error fetching active projects:', error);
    return [];
  }
};

/**
 * Obtener todos los leads capturados del formulario de landing
 */
export const getAllLeads = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'leads'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
};

/**
 * Verificar si un lead ya recibió notificación sobre una vacante específica
 * Evita enviar la misma vacante al mismo lead múltiples veces (anti-spam)
 */
export const hasLeadReceivedNotification = async (
  leadEmail: string,
  projectId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'emails_sent'),
      where('leadEmail', '==', leadEmail),
      where('projectId', '==', projectId),
      where('status', '==', 'sent_successfully')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
};

/**
 * Registrar que un correo fue enviado a un lead
 * Para tracking: cuántos correos mandamos, a quién, sobre qué proyecto/vacante
 * Status: 'pending' | 'sent_successfully' | 'failed'
 */
export const logEmailSent = async (
  leadEmail: string,
  projectId: string,
  projectTitle: string,
  companyName: string,
  leadId?: string,
  status: 'pending' | 'sent_successfully' | 'failed' = 'pending'
) => {
  try {
    await addDoc(collection(db, 'emails_sent'), {
      leadEmail,
      leadId,
      projectId,
      projectTitle,
      companyName,
      sentAt: serverTimestamp(),
      status,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging email:', error);
  }
};

/**
 * Obtener historial de campañas enviadas con éxito
 */
export const getCampaignHistory = async () => {
  try {
    const q = query(
      collection(db, 'emails_sent'),
      where('status', '==', 'sent_successfully')
    );
    const snapshot = await getDocs(q);
    
    // Agrupar por fecha y resumen
    const grouped: { [key: string]: any } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.sentAt?.toDate?.().toLocaleDateString() || 'Unknown';
      
      if (!grouped[date]) {
        grouped[date] = {
          date,
          totalSent: 0,
          recipients: [],
          vacancies: new Set(),
        };
      }
      
      grouped[date].totalSent += 1;
      grouped[date].recipients.push(data.leadEmail);
      grouped[date].vacancies.add(data.projectTitle);
    });

    return Object.values(grouped).map((item: any) => ({
      ...item,
      vacancies: Array.from(item.vacancies),
    })) as any[];
  } catch (error) {
    console.error('Error fetching campaign history:', error);
    return [];
  }
};

/**
 * Obtener correos pendientes de envío
 */
export const getPendingEmails = async () => {
  try {
    const q = query(
      collection(db, 'emails_sent'),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching pending emails:', error);
    return [];
  }
};

/**
 * Marcar correo como enviado exitosamente
 */
export const markEmailAsSent = async (docId: string) => {
  try {
    const { updateDoc, doc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'emails_sent', docId), {
      status: 'sent_successfully',
      sentAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating email status:', error);
  }
};

/**
 * Limpiar datos de prueba (eliminados de 24 horas)
 */
export const cleanTestData = async () => {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas atrás
    
    const q = query(
      collection(db, 'emails_sent'),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    
    const { deleteDoc, doc, Timestamp } = await import('firebase/firestore');
    let deleted = 0;
    
    for (const docSnap of snapshot.docs) {
      const createdAt = docSnap.data().createdAt?.toDate?.();
      if (createdAt && createdAt < cutoffTime) {
        await deleteDoc(doc(db, 'emails_sent', docSnap.id));
        deleted += 1;
      }
    }
    
    return { success: true, deleted };
  } catch (error) {
    console.error('Error cleaning test data:', error);
    return { success: false, deleted: 0 };
  }
};
