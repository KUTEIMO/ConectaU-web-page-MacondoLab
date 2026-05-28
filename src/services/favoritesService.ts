import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Favorite } from '../types';

type FavoriteField = 'userId' | 'studentId';

const favoritesCollection = collection(db, 'favorites');

const mapFavoriteDoc = (docSnapshot: any): Favorite => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    studentId: data.studentId || data.userId,
    projectId: data.projectId,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  };
};

const fetchFavoritesByField = async (field: FavoriteField, userId: string) => {
  const q = query(favoritesCollection, where(field, '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapFavoriteDoc);
};

const dedupeFavorites = (...lists: Favorite[][]): Favorite[] => {
  const map = new Map<string, Favorite>();
  lists.flat().forEach((favorite) => {
    if (!map.has(favorite.id)) {
      map.set(favorite.id, favorite);
    }
  });
  return Array.from(map.values());
};

export const getFavorites = async (studentId: string): Promise<Favorite[]> => {
  const [byUserId, byStudentId] = await Promise.all([
    fetchFavoritesByField('userId', studentId),
    fetchFavoritesByField('studentId', studentId),
  ]);
  return dedupeFavorites(byUserId, byStudentId);
};

const getFavoriteDocs = async (studentId: string, projectId: string) => {
  const [byUserId, byStudentId] = await Promise.all([
    getDocs(
      query(
        favoritesCollection,
        where('userId', '==', studentId),
        where('projectId', '==', projectId)
      )
    ),
    getDocs(
      query(
        favoritesCollection,
        where('studentId', '==', studentId),
        where('projectId', '==', projectId)
      )
    ),
  ]);

  return [...byUserId.docs, ...byStudentId.docs];
};

export const addFavorite = async (studentId: string, projectId: string) => {
  const existingDocs = await getFavoriteDocs(studentId, projectId);
  if (existingDocs.length > 0) return;

  await addDoc(favoritesCollection, {
    userId: studentId,
    studentId,
    projectId,
    createdAt: serverTimestamp(),
  });
};

export const removeFavorite = async (studentId: string, projectId: string) => {
  const docs = await getFavoriteDocs(studentId, projectId);
  await Promise.all(docs.map((docSnapshot) => deleteDoc(docSnapshot.ref)));
};

export const isFavorite = async (studentId: string, projectId: string): Promise<boolean> => {
  const docs = await getFavoriteDocs(studentId, projectId);
  return docs.length > 0;
};

