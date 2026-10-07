import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserRole, User } from '../types/app';
import { getCurrentUser, setCurrentUser as persistCurrentUser, DEFAULT_USERS } from '../utils/appStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<User | null>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
  }) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Sync state changes with localStorage
  useEffect(() => {
    persistCurrentUser(user);
  }, [user]);

  // Validate session with backend only ONCE on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('auth_token');
        }
      })
      .catch(() => {
        // Keep offline user if token verify fails
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password = 'password123'): Promise<User | null> => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.user) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        return data.user;
      }
    } catch {
      // Local fallback below
    }

    // Local fallback for demo / offline environment
    const found = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setUser(found);
      persistCurrentUser(found);
      return found;
    }
    return null;
  };

  const register = async (data: { name: string; email: string; phone: string; password?: string; role: UserRole }): Promise<User | null> => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, password: data.password || 'password123' })
      });
      const resData = await res.json();
      
      if (res.ok && resData.success && resData.user) {
        localStorage.setItem('auth_token', resData.token);
        setUser(resData.user);
        return resData.user;
      }
    } catch {
      // Local fallback below
    }

    // Local fallback for offline demo registration
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    persistCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
