import React, { createContext, useContext, type ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { AuthUser } from '@/types/auth.types';

export type UserRole = 'admin' | 'manager' | 'recruiter' | string;

interface AuthContextType {
  user: AuthUser | null;
  // Utility checkers
  isAdmin: boolean;
  isManager: boolean;
  isRecruiter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAppSelector((state) => state.auth);

  const value: AuthContextType = {
    user,
    isAdmin: user?.role?.toLowerCase() === 'admin',
    isManager: user?.role?.toLowerCase() === 'manager',
    isRecruiter: user?.role?.toLowerCase() === 'recruiter',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
