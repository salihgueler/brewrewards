'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Coffee, 
  Users, 
  Store, 
  TrendingUp, 
  Award, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, AuthUser } from '@/lib/auth';

// Mock data for the dashboard
const mockStats = {
  totalShops: 12,
  activeShops: 10,
  totalUsers: 1250,
  newUsersThisMonth: 78,
  totalTransactions: 8750,
  transactionsThisMonth: 950,
  totalRevenue: 43250.75,
  revenueThisMonth: 5125.50,
  totalRewards: 1450,
  redeemedRewards: 875,
};

// Mock shop data
const mockShops = [
  { id: 'shop_1', name: 'Demo Coffee', location: 'San Francisco, CA', transactions: 1250, revenue: 6250.50, status: 'active' },
  { id: 'shop_2', name: 'Bean & Leaf', location: 'Seattle, WA', transactions: 980, revenue: 4900.25, status: 'active' },
  { id: 'shop_3', name: 'Morning Roast', location: 'Portland, OR', transactions: 1100, revenue: 5500.00, status: 'active' },
  { id: 'shop_4', name: 'Café Noir', location: 'Los Angeles, CA', transactions: 1350, revenue: 6750.00, status: 'active' },
  { id: 'shop_5', name: 'Urban Brew', location: 'Chicago, IL', transactions: 950, revenue: 4750.00, status: 'active' },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?userType=super-admin&redirect=/super-admin');
          return;
        }
        
        // Check if user is a super admin
        if (user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }
        
        setCurrentUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?userType=super-admin&redirect=/super-admin');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalShops}</div>
                <p className="text-xs text-muted-foreground">
                  {mockStats.activeShops} active shops
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">{mockStats.newUsersThisMonth}</span> new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">${mockStats.revenueThisMonth.toLocaleString()}</span> this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rewards Redeemed</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.redeemedRewards}</div>
                <p className="text-xs text-muted-foreground">
                  out of {mockStats.totalRewards} total rewards
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Revenue chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Shops</CardTitle>
                <CardDescription>
                  Based on transaction volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockShops.slice(0, 3).map((shop) => (
                    <div key={shop.id} className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Coffee className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${shop.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{shop.transactions} txns</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('shops')}>
                  View All Shops
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="shops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coffee Shops</CardTitle>
              <CardDescription>
                Manage all coffee shops in the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockShops.map((shop) => (
                  <div key={shop.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Coffee className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">{shop.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${shop.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{shop.transactions} transactions</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/super-admin/shops/${shop.id}`)}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/super-admin/shops')}>
                Manage All Shops
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage users across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">User Management</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manage users, assign roles, and view user activity
                </p>
                <Button className="mt-4" onClick={() => router.push('/super-admin/users')}>
                  Go to User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
              <CardDescription>
                View transaction data across all shops
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Transaction Reports</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  View detailed transaction reports and analytics
                </p>
                <Button className="mt-4" onClick={() => router.push('/super-admin/transactions')}>
                  View Transaction Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
