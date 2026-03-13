import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Vacancy {
  id?: string;
  title: string;
  company: string;
  description: string;
  salary?: string;
  location?: string;
  createdAt?: any;
  status: 'active' | 'closed';
}

export interface EmailLog {
  leadId: string;
  leadEmail: string;
  vacancyId: string;
  sentAt: any;
  status: 'sent' | 'failed';
}

// Crear vacante
export const createVacancy = async (vacancyData: Vacancy) => {
  try {
    const docRef = await addDoc(collection(db, 'vacancies'), {
      ...vacancyData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating vacancy:', error);
    throw error;
  }
};

// Obtener todas las vacantes activas
export const getActiveVacancies = async () => {
  try {
    const q = query(collection(db, 'vacancies'), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vacancy & { id: string }));
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return [];
  }
};

// Obtener todos los leads
export const getAllLeads = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'leads'));
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
};

// Registrar correo enviado
export const logEmailSent = async (leadEmail: string, vacancyId: string, status: 'sent' | 'failed') => {
  try {
    await addDoc(collection(db, 'emails_sent'), {
      leadEmail,
      vacancyId,
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
