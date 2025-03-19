'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Users, Store, Settings, LogOut, BarChart3, PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, AuthUser } from '@/lib/auth';

export default function SuperAdminPage() {
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
        
        // Check if user is a super admin
        if (currentUser.role !== 'SUPER_ADMIN') {
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
              <span className="font-bold">BrewRewards Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Store className="mr-2 h-4 w-4" />
              Coffee Shops
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
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
              <h1 className="text-xl font-bold">Platform Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </header>

          <main className="container px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Coffee Shops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+3</span> new this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12,486</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+8%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Platform Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">45,320</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+12%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="shops" className="mb-8">
              <TabsList className="grid grid-cols-2 mb-8 w-full md:w-auto">
                <TabsTrigger value="shops">Coffee Shops</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="shops" className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold">Coffee Shop Management</h2>
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search shops..." className="pl-8" />
                    </div>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Shop
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Registered Coffee Shops</CardTitle>
                    <CardDescription>Manage all coffee shops on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Demo Coffee', subdomain: 'demo', owner: 'John Smith', users: 1248, status: 'active' },
                        { name: 'Brew Haven', subdomain: 'brewhaven', owner: 'Emma Johnson', users: 876, status: 'active' },
                        { name: 'Bean & Leaf', subdomain: 'beanleaf', owner: 'Michael Chen', users: 654, status: 'active' },
                        { name: 'Morning Roast', subdomain: 'morningroast', owner: 'Sarah Williams', users: 432, status: 'active' },
                        { name: 'Café Noir', subdomain: 'cafenoir', owner: 'David Miller', users: 321, status: 'pending' },
                      ].map((shop, i) => (
                        <div key={i} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md gap-4">
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-sm text-muted-foreground">{shop.subdomain}.brewrewards.com</p>
                          </div>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                            <div className="text-sm">
                              <p>Owner: {shop.owner}</p>
                              <p className="text-muted-foreground">{shop.users} users</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${shop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {shop.status === 'active' ? 'Active' : 'Pending'}
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
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
              
              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search users..." className="pl-8" />
                    </div>
                    <Button>Export Data</Button>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Users</CardTitle>
                    <CardDescription>View and manage all users across coffee shops</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER', shop: 'Demo Coffee', joined: 'Jan 15, 2025' },
                        { name: 'Emma Johnson', email: 'emma@example.com', role: 'SHOP_ADMIN', shop: 'Brew Haven', joined: 'Dec 10, 2024' },
                        { name: 'Michael Chen', email: 'michael@example.com', role: 'SHOP_ADMIN', shop: 'Bean & Leaf', joined: 'Jan 5, 2025' },
                        { name: 'Sarah Williams', email: 'sarah@example.com', role: 'SHOP_ADMIN', shop: 'Morning Roast', joined: 'Feb 20, 2025' },
                        { name: 'Robert Kim', email: 'robert@example.com', role: 'CUSTOMER', shop: 'Demo Coffee', joined: 'Feb 28, 2025' },
                      ].map((user, i) => (
                        <div key={i} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md gap-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                            <div className="text-sm">
                              <p>{user.shop}</p>
                              <p className="text-muted-foreground">Joined {user.joined}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                              user.role === 'SHOP_ADMIN' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                               user.role === 'SHOP_ADMIN' ? 'Shop Admin' : 
                               'Customer'}
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <div className="text-sm text-muted-foreground">Page 1 of 250</div>
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
