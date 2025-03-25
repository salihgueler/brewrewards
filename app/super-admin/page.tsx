'use client';

import { useState, useEffect } from 'react';
import { Store, Users, Award, TrendingUp, Coffee, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data interfaces
interface PlatformStats {
  totalShops: number;
  totalUsers: number;
  totalRewards: number;
  totalRedemptions: number;
}

interface RecentShop {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

interface TopShop {
  id: string;
  name: string;
  customerCount: number;
  redemptionCount: number;
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentShops, setRecentShops] = useState<RecentShop[]>([]);
  const [topShops, setTopShops] = useState<TopShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data - in a real app, this would be API calls
    const fetchDashboardData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockStats: PlatformStats = {
          totalShops: 42,
          totalUsers: 1248,
          totalRewards: 156,
          totalRedemptions: 3752,
        };
        
        const mockRecentShops: RecentShop[] = [
          {
            id: '1',
            name: 'Morning Brew Co.',
            location: 'San Francisco, CA',
            createdAt: '2025-03-20T14:30:00Z',
          },
          {
            id: '2',
            name: 'Bean There',
            location: 'Austin, TX',
            createdAt: '2025-03-18T09:15:00Z',
          },
          {
            id: '3',
            name: 'Caffeine Corner',
            location: 'Chicago, IL',
            createdAt: '2025-03-15T11:45:00Z',
          },
        ];
        
        const mockTopShops: TopShop[] = [
          {
            id: '4',
            name: 'Urban Beans',
            customerCount: 245,
            redemptionCount: 892,
          },
          {
            id: '5',
            name: 'Espresso Haven',
            customerCount: 187,
            redemptionCount: 743,
          },
          {
            id: '6',
            name: 'The Daily Grind',
            customerCount: 163,
            redemptionCount: 621,
          },
        ];
        
        setStats(mockStats);
        setRecentShops(mockRecentShops);
        setTopShops(mockTopShops);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard data...</div>;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Coffee Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalShops}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active platform users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRewards}</div>
            <p className="text-xs text-muted-foreground">Across all shops</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">All-time reward redemptions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Shops */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Shops</CardTitle>
            <CardDescription>New coffee shops that joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShops.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coffee className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-sm text-muted-foreground">{shop.location}</p>
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
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/super-admin/shops">
                  View All Shops
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Shops */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Shops</CardTitle>
            <CardDescription>Shops with the most customers and redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topShops.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coffee className="h-5 w-5 text-primary" />
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
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/super-admin/analytics">
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
