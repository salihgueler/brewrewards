'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Coffee, 
  Users, 
  TrendingUp, 
  Award, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, AuthUser } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';

// Mock data for the dashboard
const mockStats = {
  shopName: 'Demo Coffee',
  totalCustomers: 450,
  newCustomersThisMonth: 28,
  totalTransactions: 1250,
  transactionsThisMonth: 150,
  totalRevenue: 6250.50,
  revenueThisMonth: 750.25,
  totalRewards: 320,
  redeemedRewards: 175,
  loyaltyMembers: 380,
};

// Mock transaction data
const mockTransactions = [
  { id: 'txn_1', customer: 'John Doe', amount: 12.50, items: 3, date: '2025-03-19T10:30:00Z', points: 12 },
  { id: 'txn_2', customer: 'Sarah Miller', amount: 8.75, items: 2, date: '2025-03-19T11:45:00Z', points: 8 },
  { id: 'txn_3', customer: 'Robert Kim', amount: 15.25, items: 4, date: '2025-03-19T13:15:00Z', points: 15 },
  { id: 'txn_4', customer: 'Emma Johnson', amount: 6.50, items: 1, date: '2025-03-19T14:30:00Z', points: 6 },
  { id: 'txn_5', customer: 'Michael Chen', amount: 10.75, items: 2, date: '2025-03-19T15:45:00Z', points: 10 },
];

// Mock popular items
const mockPopularItems = [
  { name: 'Cappuccino', sold: 85, revenue: 382.50 },
  { name: 'Latte', sold: 72, revenue: 288.00 },
  { name: 'Espresso', sold: 68, revenue: 204.00 },
  { name: 'Blueberry Muffin', sold: 54, revenue: 175.50 },
  { name: 'Croissant', sold: 48, revenue: 144.00 },
];

export default function ShopAdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?redirect=/shop-admin');
          return;
        }
        
        // Check if user is a shop admin
        if (user.role !== 'SHOP_ADMIN' && user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }
        
        setCurrentUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?redirect=/shop-admin');
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{mockStats.shopName}</h1>
          <p className="text-muted-foreground">Shop Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => router.push('/shop-admin/settings')}>
            Shop Settings
          </Button>
          <Button onClick={() => router.push('/shop-admin/pos')}>
            Point of Sale
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">{mockStats.newCustomersThisMonth}</span> new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockStats.revenueThisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  from {mockStats.transactionsThisMonth} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.loyaltyMembers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((mockStats.loyaltyMembers / mockStats.totalCustomers) * 100)}% of customers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rewards Redeemed</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle>Popular Items</CardTitle>
                <CardDescription>
                  Top selling items this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPopularItems.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Coffee className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sold} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${item.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/shop-admin/menu')}>
                  View Menu
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Today's transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockTransactions.map((transaction) => {
                  const date = new Date(transaction.date);
                  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.customer}</p>
                          <p className="text-xs text-muted-foreground">{formattedTime} • {transaction.items} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{transaction.points} points</Badge>
                        <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('transactions')}>
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View and manage your customers
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Customer Management</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  View customer profiles, loyalty status, and purchase history
                </p>
                <Button className="mt-4" onClick={() => router.push('/shop-admin/customers')}>
                  Go to Customer Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View and manage your transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Transaction History</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  View detailed transaction history and reports
                </p>
                <Button className="mt-4" onClick={() => router.push('/shop-admin/transactions')}>
                  View Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="loyalty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program</CardTitle>
              <CardDescription>
                Manage your loyalty program and rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Loyalty Program</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configure your loyalty program and manage rewards
                </p>
                <Button className="mt-4" onClick={() => router.push('/shop-admin/loyalty')}>
                  Manage Loyalty Program
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
