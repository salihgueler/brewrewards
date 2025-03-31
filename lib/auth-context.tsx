'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from './permissions';
import { AuthUser, loginUser, logoutUser, getAuthenticatedUser, completeNewPassword } from './auth';
import { useRouter } from 'next/navigation';
import { configureAmplify } from './amplify-config';

// Configure Amplify on the client side
if (typeof window !== 'undefined') {
  configureAmplify();
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ newPasswordRequired: boolean; session: any }>;
  completeNewPasswordChallenge: (session: any, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthorized: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        console.log('Loading user...');
        
        // Add a small delay to ensure Amplify is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentUser = await getAuthenticatedUser();
        console.log('User loaded:', currentUser ? 'Success' : 'No user found');
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      const { user, newPasswordRequired, session } = await loginUser(email, password);
      
      console.log('Login response:', { newPasswordRequired, user: user ? 'User exists' : 'No user' });
      
      if (!newPasswordRequired) {
        setUser(user);
      }
      
      return { newPasswordRequired, session };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const completeNewPasswordChallenge = async (session: any, newPassword: string) => {
    try {
      const user = await completeNewPassword(session, newPassword);
      setUser(user);
    } catch (error) {
      console.error('Error completing new password challenge:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const isAuthorized = (role: UserRole) => {
    if (!user) return false;
    
    // Super admin can access everything
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    // Shop admin can access shop admin and customer pages
    if (user.role === UserRole.SHOP_ADMIN) {
      return role === UserRole.SHOP_ADMIN || role === UserRole.CUSTOMER;
    }
    
    // Shop staff can access shop staff and customer pages
    if (user.role === UserRole.SHOP_STAFF) {
      return role === UserRole.SHOP_STAFF || role === UserRole.CUSTOMER;
    }
    
    // Customer can only access customer pages
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      completeNewPasswordChallenge,
      logout, 
      isAuthorized 
    }}>
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
