'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShopList } from '@/components/shops/ShopList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

export default function ShopsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect if not a super admin
  if (!isLoading && user?.role !== UserRole.SUPER_ADMIN) {
    router.push('/login');
    return null;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Coffee Shops</h1>
          <p className="text-gray-500">Manage all coffee shops in the BrewRewards network</p>
        </div>
        
        <Button asChild>
          <Link href="/super-admin/shops/new">
            Add New Shop
          </Link>
        </Button>
      </div>
      
      <ShopList />
    </div>
  );
}
