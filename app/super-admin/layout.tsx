'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, AuthUser } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        
        // If no user is logged in, redirect to login
        if (!currentUser) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        
        // If user is not a super admin, redirect to dashboard
        // For demo purposes, we'll allow the registration page to be accessed without being a super admin
        if (currentUser.role !== 'SUPER_ADMIN' && !pathname.includes('/super-admin/register')) {
          router.push('/dashboard');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For the registration page, we don't need to check if the user is a super admin
  if (pathname === '/super-admin/register') {
    return <>{children}</>;
  }

  // For all other super admin pages, ensure the user is authenticated and is a super admin
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null; // This shouldn't render as the useEffect will redirect
  }

  return <>{children}</>;
}
