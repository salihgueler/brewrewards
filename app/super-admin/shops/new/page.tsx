'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopForm } from '@/components/shops/ShopForm';
import { CreateShopInput } from '@/lib/api/shops';
import { shopApi } from '@/lib/api/shops';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';
import { toast } from '@/components/ui/use-toast';

export default function NewShopPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not a super admin
  if (!isLoading && user?.role !== UserRole.SUPER_ADMIN) {
    router.push('/login');
    return null;
  }
  
  const handleSubmit = async (data: CreateShopInput) => {
    setIsSubmitting(true);
    
    try {
      const newShop = await shopApi.createShop(data);
      
      toast({
        title: "Shop created",
        description: `${newShop.name} has been successfully created.`,
      });
      
      router.push('/super-admin/shops');
    } catch (error) {
      console.error('Error creating shop:', error);
      
      toast({
        title: "Error",
        description: "Failed to create shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Shop</h1>
      
      <ShopForm 
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
