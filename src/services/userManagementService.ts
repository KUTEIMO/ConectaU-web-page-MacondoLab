import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../config/firebase';
import { UserRole } from '../types';

const ADMIN_APP_NAME = 'conectau-admin-tools';

const getManagementAuth = () => {
  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME);
  const adminApp = existing ?? initializeApp(firebaseConfig, ADMIN_APP_NAME);
  return getAuth(adminApp);
};

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  metadata?: Record<string, unknown>;
}

export const createUserWithRole = async ({
  name,
  email,
  password,
  role,
  metadata = {},
}: CreateUserPayload) => {
  const auth = getManagementAuth();
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(
      doc(db, 'users', credential.user.uid),
      {
        name,
        email,
        role,
        isActive: true,
        isVerified: role !== 'student',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...metadata,
      },
      { merge: true }
    );
    return credential.user.uid;
  } finally {
    await signOut(auth).catch(() => undefined);
  }
};

export const sendResetPasswordLink = async (email: string) => {
  const auth = getManagementAuth();
  await sendPasswordResetEmail(auth, email);
};

interface UpdatePasswordPayload {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export const updateUserPassword = async ({
  email,
  currentPassword,
  newPassword,
}: UpdatePasswordPayload) => {
  const auth = getManagementAuth();
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, currentPassword);
    await updatePassword(user, newPassword);
  } finally {
    await signOut(auth).catch(() => undefined);
  }
};

