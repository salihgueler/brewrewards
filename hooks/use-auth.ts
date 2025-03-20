'use client';

import { useState, useEffect } from 'react';
import { auth, AuthUser } from '@/lib/auth';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

/**
 * Hook for accessing authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    try {
      setIsLoading(true);
      const user = await auth.signIn(email, password);
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await auth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signOut,
  };
}
