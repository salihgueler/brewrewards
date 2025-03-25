'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, AuthUser } from './auth';
import { UserRole } from './permissions';

// Define the AuthContext type
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
  isAuthorized: (requiredRole: UserRole) => boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await auth.signIn(email, password);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const user = await auth.signUp(email, password, firstName, lastName);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = async () => {
    return await auth.isAuthenticated();
  };

  // Create the context value
  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated,
    isAuthorized: (requiredRole: UserRole) => {
      if (!user) return false;
      return user.role === requiredRole || (requiredRole === UserRole.SHOP_ADMIN && user.role === UserRole.SUPER_ADMIN);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
