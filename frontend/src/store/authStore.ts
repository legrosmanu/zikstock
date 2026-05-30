import { create } from 'zustand';

export interface UserProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string) => boolean;
  devLogin: () => void;
  logout: () => void;
  initialize: () => void;
}

// Pure utility to safely decode a JWT payload in the browser
const decodeJwt = (token: string): UserProfile | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    const payloadPart = parts[1];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding Google ID Token:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  login: (token: string) => {
    const decoded = decodeJwt(token);
    if (!decoded) {
      return false;
    }

    localStorage.setItem('zikstock_token', token);
    set({
      token,
      user: decoded,
      isAuthenticated: true,
    });
    return true;
  },

  devLogin: () => {
    const mockToken = 'valid-test-token';
    const mockUser: UserProfile = {
      sub: 'dev-user-999',
      email: 'rockstar.developer@zikstock.dev',
      name: 'Rockstar Developer',
      picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    };

    localStorage.setItem('zikstock_token', mockToken);
    localStorage.setItem('zikstock_mock_user', JSON.stringify(mockUser));
    
    set({
      token: mockToken,
      user: mockUser,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('zikstock_token');
    localStorage.removeItem('zikstock_mock_user');
    
    // Disable Google auto-select if GIS is loaded
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (err) {
        console.warn('Failed to disable Google auto select:', err);
      }
    }

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  initialize: () => {
    const savedToken = localStorage.getItem('zikstock_token');
    if (!savedToken) {
      set({ isInitializing: false });
      return;
    }

    if (savedToken === 'valid-test-token') {
      // Restore developer login session
      const savedMockUser = localStorage.getItem('zikstock_mock_user');
      const mockUser = savedMockUser 
        ? JSON.parse(savedMockUser) 
        : {
            sub: 'dev-user-999',
            email: 'rockstar.developer@zikstock.dev',
            name: 'Rockstar Developer',
            picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
          };
      set({
        token: savedToken,
        user: mockUser,
        isAuthenticated: true,
        isInitializing: false,
      });
      return;
    }

    // Restore real Google Sign In session
    const decoded = decodeJwt(savedToken);
    if (decoded) {
      set({
        token: savedToken,
        user: decoded,
        isAuthenticated: true,
        isInitializing: false,
      });
    } else {
      localStorage.removeItem('zikstock_token');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },
}));
