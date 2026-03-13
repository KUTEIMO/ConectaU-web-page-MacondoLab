import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
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
 * Registrar que un correo fue enviado a un lead
 * Para tracking: cuántos correos mandamos, a quién, sobre qué proyecto/vacante
 */
export const logEmailSent = async (
  leadEmail: string,
  projectId: string,
  projectTitle: string,
  companyName: string,
  leadId?: string,
  status: 'sent' | 'failed' = 'sent'
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
    });
  } catch (error) {
    console.error('Error logging email:', error);
  }
};

// Eliminar vacante
export const deleteVacancy = async (vacancyId: string) => {
  try {
    await updateDoc(doc(db, 'vacancies', vacancyId), { status: 'closed' });
    return { success: true };
  } catch (error) {
    console.error('Error deleting vacancy:', error);
    throw error;
  }
};
