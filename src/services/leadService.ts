import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Lead {
  name: string;
  email: string;
  university: string;
  role: 'student' | 'company';
}

export const submitLead = async (leadData: Lead) => {
  try {
    const leadsCollection = collection(db, 'leads');
    const docRef = await addDoc(leadsCollection, {
      ...leadData,
      createdAt: serverTimestamp(),
      status: 'pending',
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting lead:', error);
    throw new Error('No se pudo guardar el registro. Intenta de nuevo.');
  }
};
