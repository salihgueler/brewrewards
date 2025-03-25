'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Users, Award, TrendingUp, Menu, ArrowUpRight, Star, Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';

// Mock data interfaces
interface ShopStats {
  totalCustomers: number;
  activeRewards: number;
  totalRedemptions: number;
  menuItems: number;
}

interface TopCustomer {
  id: string;
  name: string;
  points: number;
  visits: number;
  lastVisit: string;
}

interface PopularReward {
  id: string;
  name: string;
  type: 'stamp' | 'points';
  redemptionCount: number;
  percentUsed: number;
}

export default function ShopAdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [popularRewards, setPopularRewards] = useState<PopularReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data - in a real app, this would be API calls
    const fetchDashboardData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockStats: ShopStats = {
          totalCustomers: 245,
          activeRewards: 8,
          totalRedemptions: 892,
          menuItems: 32,
        };
        
        const mockTopCustomers: TopCustomer[] = [
          {
            id: '1',
            name: 'Emma Johnson',
            points: 320,
            visits: 24,
            lastVisit: '2025-03-24T09:30:00Z',
          },
          {
            id: '2',
            name: 'Michael Chen',
            points: 285,
            visits: 19,
            lastVisit: '2025-03-23T14:15:00Z',
          },
          {
            id: '3',
            name: 'Sophia Rodriguez',
            points: 210,
            visits: 15,
            lastVisit: '2025-03-22T11:45:00Z',
          },
        ];
        
        const mockPopularRewards: PopularReward[] = [
          {
            id: '1',
            name: 'Coffee Lovers Card',
            type: 'stamp',
            redemptionCount: 145,
            percentUsed: 75,
          },
          {
            id: '2',
            name: 'Free Coffee',
            type: 'points',
            redemptionCount: 98,
            percentUsed: 62,
          },
          {
            id: '3',
            name: 'Pastry Discount',
            type: 'points',
            redemptionCount: 76,
            percentUsed: 45,
          },
        ];
        
        setStats(mockStats);
        setTopCustomers(mockTopCustomers);
        setPopularRewards(mockPopularRewards);
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard data...</div>;
  }

  // Get shop name from user (in a real app, this would come from the user's shop association)
  const shopName = "Urban Beans"; // Placeholder

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{shopName} Dashboard</h1>
          <p className="text-muted-foreground">Manage your coffee shop's loyalty programs and customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/shop-admin/menu/create">
              <Menu className="mr-2 h-4 w-4" />
              Add Menu Item
            </Link>
          </Button>
          <Button asChild>
            <Link href="/shop-admin/loyalty-programs">
              <Award className="mr-2 h-4 w-4" />
              Manage Rewards
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered loyalty members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRewards}</div>
            <p className="text-xs text-muted-foreground">Loyalty programs & offers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">Rewards redeemed by customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.menuItems}</div>
            <p className="text-xs text-muted-foreground">Products in your menu</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Your most loyal customers by points and visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.visits} visits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                      {customer.points} points
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/shop-admin/customers/${customer.id}`}>
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
                <Link href="/shop-admin/customers">
                  View All Customers
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Rewards</CardTitle>
            <CardDescription>Most redeemed loyalty rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularRewards.map((reward) => (
                <div key={reward.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      {reward.type === 'stamp' ? (
                        <Ticket className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Award className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="font-medium">{reward.name}</span>
                    </div>
                    <span className="text-sm">{reward.redemptionCount} redemptions</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={reward.percentUsed} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Usage</span>
                      <span>{reward.percentUsed}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/shop-admin/loyalty-programs">
                  Manage Loyalty Programs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
