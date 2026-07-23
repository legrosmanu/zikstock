import { create } from 'zustand';
import { normalizeUserProfile } from './userProfile.utils';

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
  login: (googleToken: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
}

const getApiUrl = (): string => import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    console.error('Error decoding JWT Token:', error);
    return null;
  }
};

const isTokenValid = (token: string): boolean => {
  const decoded = decodeJwt(token);
  if (!decoded || typeof decoded.exp !== 'number') return false;
  // Buffer of 30 seconds
  return decoded.exp > Math.floor(Date.now() / 1000) + 30;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  login: async (googleToken: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ googleToken }),
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      const data = await response.json();
      const accessToken = data.accessToken as string;
      const user = normalizeUserProfile((data.user || decodeJwt(accessToken)) as Record<string, unknown>);

      localStorage.setItem('zikstock_access_token', accessToken);
      set({
        token: accessToken,
        user,
        isAuthenticated: true,
      });
      return true;
    } catch (err) {
      console.error('Failed to log in with backend auth:', err);
      // Fallback: try decoding directly if offline / mock mode
      const decoded = decodeJwt(googleToken);
      if (decoded) {
        localStorage.setItem('zikstock_access_token', googleToken);
        set({
          token: googleToken,
          user: decoded,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    }
  },

  refreshSession: async (): Promise<boolean> => {
    try {
      const savedToken = localStorage.getItem('zikstock_access_token') || localStorage.getItem('zikstock_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      const response = await fetch(`${getApiUrl()}/auth/refresh`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ refreshToken: savedToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh session failed');
      }

      const data = await response.json();
      const accessToken = data.accessToken as string;
      const user = normalizeUserProfile((data.user || decodeJwt(accessToken)) as Record<string, unknown>);

      localStorage.setItem('zikstock_access_token', accessToken);
      set({
        token: accessToken,
        user,
        isAuthenticated: true,
        isInitializing: false,
      });
      return true;
    } catch (err) {
      console.warn('Session refresh failed:', err);
      get().logout();
      set({ isInitializing: false });
      return false;
    }
  },

  logout: () => {
    // Attempt backend logout to clear httpOnly cookie
    fetch(`${getApiUrl()}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch((err) => console.warn('Logout API request failed:', err));

    localStorage.removeItem('zikstock_access_token');
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
      isInitializing: false,
    });
  },

  initialize: async () => {
    const savedToken = localStorage.getItem('zikstock_access_token') || localStorage.getItem('zikstock_token');
    
    if (savedToken && isTokenValid(savedToken)) {
      const decoded = decodeJwt(savedToken);
      if (decoded) {
        set({
          token: savedToken,
          user: decoded,
          isAuthenticated: true,
          isInitializing: false,
        });
        return;
      }
    }

    // Token missing or expired -> attempt silent refresh using HttpOnly cookie or stored refresh token
    await get().refreshSession();
  },
}));

// Initialize the store on load
useAuthStore.getState().initialize();
