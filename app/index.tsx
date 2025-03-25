'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on user role
        if (user.role === UserRole.SUPER_ADMIN) {
          router.push('/super-admin');
        } else if (user.role === UserRole.SHOP_ADMIN) {
          router.push('/shop-admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        // If not logged in, redirect to login page
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">BrewRewards</h1>
        <p>Redirecting to the appropriate dashboard...</p>
      </div>
    </div>
  );
}
