'use client';

import { useState, useEffect } from 'react';
import { Store, Users, Award, TrendingUp, Coffee, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';
import { useDashboardStats } from '@/lib/hooks/useDashboardStats';
import { useShops } from '@/lib/hooks/useShops';
import { useUsers } from '@/lib/hooks/useUsers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthorized, isLoading: isLoadingAuth } = useAuth();
  
  // Fetch dashboard statistics
  const { stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  
  // Fetch recent shops
  const { 
    shops: allShops, 
    isLoading: isLoadingShops, 
    error: shopsError 
  } = useShops({ limit: 100 });
  
  // Derive recent shops (sorted by creation date)
  const recentShops = [...(allShops || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Derive top shops (this would ideally be based on customer count or redemptions)
  // For now, we'll just use the first few shops as a placeholder
  const topShops = [...(allShops || [])]
    .slice(0, 3)
    .map(shop => ({
      ...shop,
      customerCount: Math.floor(Math.random() * 300) + 50, // Placeholder data
      redemptionCount: Math.floor(Math.random() * 1000) + 100 // Placeholder data
    }));

  // Check authorization
  useEffect(() => {
    if (!isLoadingAuth && !isAuthorized(UserRole.SUPER_ADMIN)) {
      router.push('/login');
    }
  }, [isLoadingAuth, isAuthorized, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoadingAuth) {
    return <div className="flex justify-center items-center h-screen">Checking authorization...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <Button asChild>
          <Link href="/super-admin/shops/create">
            Add New Shop
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <LoadingState
        isLoading={isLoadingStats}
        error={statsError}
        loadingText="Loading statistics..."
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Coffee Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalShops || 0}</div>
              <p className="text-xs text-muted-foreground">Across all locations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Active platform users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRewards || 0}</div>
              <p className="text-xs text-muted-foreground">Across all shops</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRedemptions || 0}</div>
              <p className="text-xs text-muted-foreground">All-time reward redemptions</p>
            </CardContent>
          </Card>
        </div>
      </LoadingState>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Shops */}
        <LoadingState
          isLoading={isLoadingShops}
          error={shopsError}
          loadingText="Loading shops..."
        >
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Shops</CardTitle>
              <CardDescription>New coffee shops that joined the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {recentShops.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No shops have been added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentShops.map((shop) => (
                    <div key={shop.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {shop.logo ? (
                            <img 
                              src={shop.logo} 
                              alt={shop.name} 
                              className="h-10 w-10 rounded-full object-cover" 
                            />
                          ) : (
                            <Coffee className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {shop.city}, {shop.state}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(shop.createdAt)}
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/super-admin/shops/${shop.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/super-admin/shops">
                    View All Shops
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </LoadingState>

        {/* Top Performing Shops */}
        <LoadingState
          isLoading={isLoadingShops}
          error={shopsError}
          loadingText="Loading shops..."
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Shops</CardTitle>
              <CardDescription>Shops with the most customers and redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              {topShops.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No performance data available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topShops.map((shop) => (
                    <div key={shop.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {shop.logo ? (
                            <img 
                              src={shop.logo} 
                              alt={shop.name} 
                              className="h-10 w-10 rounded-full object-cover" 
                            />
                          ) : (
                            <Coffee className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          <p className="text-sm text-muted-foreground">{shop.customerCount} customers</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                          {shop.redemptionCount} redemptions
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/super-admin/shops/${shop.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/super-admin/analytics">
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </LoadingState>
      </div>
    </div>
  );
}
