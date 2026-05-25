import { create } from 'zustand';
import { setAccessToken } from '../api/client';

interface Business {
  id: string;
  businessName: string;
  ownerName?: string;
  email: string;
  subdomain: string;
  onboardingComplete: boolean;
}

interface AuthState {
  business: Business | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (business: Business, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  business: null,
  isAuthenticated: false,
  isLoading: true,

  login: (business, token) => {
    setAccessToken(token);
    set({ business, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    setAccessToken(null);
    set({ business: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
