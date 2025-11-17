import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User, UserRole } from '../types';

interface AuthState {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  setCurrentUser: (user: FirebaseUser | null) => void;
  setUserData: (userData: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  userData: null,
  loading: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ currentUser: null, userData: null, loading: false }),
  clearAuth: () => set({ currentUser: null, userData: null, loading: false }),
}));

