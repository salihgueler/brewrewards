'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useShops } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';

export function ShopList() {
  const { user } = useAuth();
  const { shops, loading, error, hasMore, loadMore } = useShops();
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  if (loading && shops.length === 0) {
    return <ShopListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
        <p className="font-medium">Error loading shops</p>
        <p className="text-sm">{error.message}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
        <p className="text-gray-500 mb-6">
          {isSuperAdmin 
            ? "There are no coffee shops in the system yet. Create your first shop to get started."
            : "No coffee shops are available at the moment. Please check back later."}
        </p>
        {isSuperAdmin && (
          <Button asChild>
            <Link href="/super-admin/shops/new">Create New Shop</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

function ShopCard({ shop }: { shop: any }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {shop.logo ? (
          <Image 
            src={shop.logo} 
            alt={shop.name} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">{shop.name.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle>{shop.name}</CardTitle>
        <CardDescription className="line-clamp-2">{shop.description || 'No description available'}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-gray-500">
          <p>{shop.city || 'Location not specified'}{shop.city && shop.state ? `, ${shop.state}` : ''}</p>
          <p>{shop.phone || 'No phone number'}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/shops/${shop.subdomain}`}>
            Visit Shop
          </Link>
        </Button>
        
        {isSuperAdmin && (
          <Button variant="secondary" asChild>
            <Link href={`/super-admin/shops/${shop.id}`}>
              Manage
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ShopListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
