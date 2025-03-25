'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopForm } from '@/components/shops/ShopForm';
import { UpdateShopInput } from '@/lib/api/shops';
import { shopApi } from '@/lib/api/shops';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';
import { useShop } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditShopPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { shop, loading, error } = useShop(params.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Redirect if not a super admin
  if (!authLoading && user?.role !== UserRole.SUPER_ADMIN) {
    router.push('/login');
    return null;
  }
  
  const handleSubmit = async (data: UpdateShopInput) => {
    setIsSubmitting(true);
    
    try {
      const updatedShop = await shopApi.updateShop(data);
      
      toast({
        title: "Shop updated",
        description: `${updatedShop.name} has been successfully updated.`,
      });
    } catch (error) {
      console.error('Error updating shop:', error);
      
      toast({
        title: "Error",
        description: "Failed to update shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await shopApi.deleteShop(params.id);
      
      toast({
        title: "Shop deleted",
        description: "The shop has been successfully deleted.",
      });
      
      router.push('/super-admin/shops');
    } catch (error) {
      console.error('Error deleting shop:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }
  
  if (error || !shop) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Error</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium">Failed to load shop</p>
          <p className="text-sm">{error?.message || 'Shop not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/super-admin/shops')}
          >
            Back to Shops
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Shop: {shop.name}</h1>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Shop</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the shop
                and all associated data including menu items, rewards, and customer data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <ShopForm 
        shop={shop}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
