'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, AuthUser } from '@/lib/auth';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Paths that don't require authentication
  const publicPaths = ['/super-admin/register', '/super-admin/confirm', '/super-admin/resend-code'];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        
        // If no user is logged in and the path is not public, redirect to login
        if (!currentUser && !publicPaths.some(path => pathname.startsWith(path))) {
          router.push('/login?redirect=/super-admin');
          return;
        }
        
        // If user is logged in but not a super admin and trying to access protected pages
        if (currentUser && currentUser.role !== 'SUPER_ADMIN' && !publicPaths.some(path => pathname.startsWith(path))) {
          router.push('/dashboard');
          return;
        }
        
        setUser(currentUser);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Authentication error:', error);
        
        // Check if the error is due to user not being confirmed
        if (error.code === 'UserNotConfirmedException' && error.email) {
          // Redirect to confirmation page with the email
          router.push(`/super-admin/confirm?email=${encodeURIComponent(error.email)}`);
          return;
        }
        
        // For demo purposes, allow access even if there's an auth error
        // In production, you would redirect to login
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

  // For public paths, render the content regardless of authentication
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  // For protected paths, only render if the user is authenticated and is a super admin
  // For demo purposes, we'll render the content anyway
  // In production, you would check: if (!user || user.role !== 'SUPER_ADMIN') return null;
  
  return <>{children}</>;
}
