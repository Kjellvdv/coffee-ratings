import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch, readError } from '../lib/api';
import { translate } from '../i18n';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await apiFetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const message = await readError(response);
      console.error('Sign-in failed:', message);
      throw new Error(message || translate('auth.signInFailed'));
    }

    const data = await response.json();
    setUser(data.data);
  }

  async function register(username: string, email: string, password: string, displayName: string) {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ username, email, password, displayName }),
    });

    if (!response.ok) {
      const message = await readError(response);
      console.error('Registration failed:', message);
      throw new Error(message || translate('auth.registerFailed'));
    }

    const data = await response.json();
    setUser(data.data);
  }

  async function logout() {
    const response = await apiFetch('/api/auth/logout', { method: 'POST' });

    if (response.ok) {
      setUser(null);
    } else {
      throw new Error(translate('auth.signOutFailed'));
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
