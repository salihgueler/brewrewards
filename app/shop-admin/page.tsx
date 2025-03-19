'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Users, Award, Ticket, Menu, Settings, LogOut, BarChart3, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, AuthUser } from '@/lib/auth';

export default function ShopAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        // Check if user is a shop admin
        if (currentUser.role !== 'SHOP_ADMIN') {
          router.push('/dashboard');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 border-r h-screen">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6" />
              <span className="font-bold">Shop Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Customers
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Award className="mr-2 h-4 w-4" />
              Rewards
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Ticket className="mr-2 h-4 w-4" />
              Stamp Cards
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Menu className="mr-2 h-4 w-4" />
              Menu
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="border-b">
            <div className="container px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="container px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,248</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+12%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Points Redeemed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">5,320</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+8%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$3,450</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+15%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="grid grid-cols-3 mb-8 w-full md:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Overview</CardTitle>
                    <CardDescription>Customer engagement over the past 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center border rounded-md">
                      <p className="text-muted-foreground">Chart visualization would go here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Rewards</CardTitle>
                      <CardDescription>Most redeemed rewards this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: 'Free Coffee', redeemed: 124 },
                          { name: 'Free Pastry', redeemed: 87 },
                          { name: '10% Off Order', redeemed: 65 },
                          { name: 'Free Smoothie', redeemed: 42 },
                        ].map((reward, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Award className="h-4 w-4 text-primary" />
                              </div>
                              <span>{reward.name}</span>
                            </div>
                            <span className="font-medium">{reward.redeemed}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest customer transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: 'John D.', action: 'Redeemed Free Coffee', time: '10 minutes ago' },
                          { name: 'Sarah M.', action: 'Earned 15 points', time: '25 minutes ago' },
                          { name: 'Robert K.', action: 'Completed stamp card', time: '1 hour ago' },
                          { name: 'Emily L.', action: 'Redeemed 10% Off', time: '2 hours ago' },
                        ].map((activity, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{activity.name}</p>
                              <p className="text-sm text-muted-foreground">{activity.action}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="rewards" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Rewards Management</h2>
                  <Button>
                    <Award className="mr-2 h-4 w-4" />
                    Add New Reward
                  </Button>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Active Rewards</CardTitle>
                    <CardDescription>Manage your shop's reward offerings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Free Coffee', points: 50, redeemed: 124, active: true },
                        { name: 'Free Pastry', points: 75, redeemed: 87, active: true },
                        { name: '10% Off Order', points: 25, redeemed: 65, active: true },
                        { name: 'Free Smoothie', points: 100, redeemed: 42, active: true },
                        { name: 'BOGO Coffee', points: 60, redeemed: 38, active: false },
                      ].map((reward, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                          <div>
                            <p className="font-medium">{reward.name}</p>
                            <p className="text-sm text-muted-foreground">{reward.points} points required</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{reward.redeemed} redeemed</span>
                            <div className={`px-2 py-1 rounded-full text-xs ${reward.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {reward.active ? 'Active' : 'Inactive'}
                            </div>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Stamp Cards</CardTitle>
                    <CardDescription>Manage your shop's stamp card programs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Coffee Stamp Card', stamps: 10, reward: 'Free Coffee', active: true },
                        { name: 'Smoothie Stamp Card', stamps: 8, reward: 'Free Smoothie', active: true },
                      ].map((card, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                          <div>
                            <p className="font-medium">{card.name}</p>
                            <p className="text-sm text-muted-foreground">{card.stamps} stamps for {card.reward}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`px-2 py-1 rounded-full text-xs ${card.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {card.active ? 'Active' : 'Inactive'}
                            </div>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Ticket className="mr-2 h-4 w-4" />
                      Add New Stamp Card
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="customers" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Customer Management</h2>
                  <Button>Export Data</Button>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Customer List</CardTitle>
                    <CardDescription>View and manage your customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'John Doe', email: 'john@example.com', points: 320, joined: 'Jan 15, 2025' },
                        { name: 'Sarah Miller', email: 'sarah@example.com', points: 450, joined: 'Feb 3, 2025' },
                        { name: 'Robert Kim', email: 'robert@example.com', points: 180, joined: 'Feb 28, 2025' },
                        { name: 'Emily Liu', email: 'emily@example.com', points: 275, joined: 'Mar 10, 2025' },
                        { name: 'Michael Johnson', email: 'michael@example.com', points: 120, joined: 'Mar 15, 2025' },
                      ].map((customer, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-medium">{customer.points}</span> points
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Joined {customer.joined}
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <div className="text-sm text-muted-foreground">Page 1 of 3</div>
                    <Button variant="outline" size="sm">Next</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
