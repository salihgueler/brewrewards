'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Coffee, 
  Award, 
  ShoppingBag, 
  User, 
  LogOut, 
  Settings,
  CreditCard,
  Gift,
  ChevronRight,
  Store
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { auth, AuthUser } from '@/lib/auth';
import { UserRole } from '@/lib/types';

// Mock user data
const mockUserData = {
  name: 'John Doe',
  email: 'john@example.com',
  points: 320,
  stamps: 6,
  totalStampsNeeded: 10,
  favoriteItems: [
    { name: 'Cappuccino', count: 12 },
    { name: 'Blueberry Muffin', count: 8 },
    { name: 'Latte', count: 5 },
  ],
  recentTransactions: [
    { id: 'txn_1', date: '2025-03-15T10:30:00Z', amount: 12.50, items: 3 },
    { id: 'txn_2', date: '2025-03-10T11:45:00Z', amount: 8.75, items: 2 },
    { id: 'txn_3', date: '2025-03-05T09:15:00Z', amount: 15.25, items: 4 },
  ],
  availableRewards: [
    { id: 'reward_1', name: 'Free Coffee', description: 'Any size coffee of your choice', pointsCost: 100, expires: '2025-04-15T00:00:00Z' },
    { id: 'reward_2', name: 'Free Pastry', description: 'Any pastry of your choice', pointsCost: 150, expires: '2025-04-30T00:00:00Z' },
  ],
  shopName: 'Demo Coffee',
};

export default function CustomerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?redirect=/dashboard');
          return;
        }
        
        setCurrentUser(user);
        setIsLoading(false);
        
        // Redirect based on role
        if (user.role === UserRole.SUPER_ADMIN) {
          router.push('/super-admin');
        } else if (user.role === UserRole.SHOP_ADMIN) {
          router.push('/shop-admin');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?redirect=/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not a customer, show loading while redirecting
  if (currentUser && currentUser.role !== UserRole.CUSTOMER) {
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
          <h1 className="text-3xl font-bold">{mockUserData.name}</h1>
          <p className="text-muted-foreground">Welcome to {mockUserData.shopName}</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/profile')}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Loyalty Status Card */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Loyalty Status
            </CardTitle>
            <CardDescription>Your current rewards progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Points Balance</span>
                <Badge variant="secondary">{mockUserData.points} points</Badge>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${Math.min(100, (mockUserData.points / 500) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0</span>
                <span>500</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Stamp Card</span>
                <span className="text-sm">{mockUserData.stamps} / {mockUserData.totalStampsNeeded}</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: mockUserData.totalStampsNeeded }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-full flex items-center justify-center text-xs ${
                      i < mockUserData.stamps ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {i < mockUserData.stamps ? '✓' : ''}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {mockUserData.totalStampsNeeded - mockUserData.stamps} more stamps for a free coffee
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/rewards')}>
              <Gift className="mr-2 h-4 w-4" />
              View Available Rewards
            </Button>
          </CardFooter>
        </Card>
        
        {/* Available Rewards Card */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="mr-2 h-5 w-5" />
              Available Rewards
            </CardTitle>
            <CardDescription>Rewards you can redeem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUserData.availableRewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rewards available yet
                </div>
              ) : (
                mockUserData.availableRewards.map(reward => {
                  const canRedeem = mockUserData.points >= reward.pointsCost;
                  const expiryDate = new Date(reward.expires);
                  const formattedExpiry = expiryDate.toLocaleDateString();
                  
                  return (
                    <div 
                      key={reward.id} 
                      className={`p-4 border rounded-md ${canRedeem ? 'border-primary/50' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Expires: {formattedExpiry}</p>
                        </div>
                        <Badge>{reward.pointsCost} points</Badge>
                      </div>
                      <Button 
                        variant={canRedeem ? "default" : "outline"} 
                        size="sm" 
                        className="w-full mt-3"
                        disabled={!canRedeem}
                      >
                        {canRedeem ? 'Redeem Reward' : `Need ${reward.pointsCost - mockUserData.points} more points`}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Transactions Card */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Your recent purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUserData.recentTransactions.map(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString();
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{formattedDate} • {transaction.items} items</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/transactions')}>
              <CreditCard className="mr-2 h-4 w-4" />
              View All Transactions
            </Button>
          </CardFooter>
        </Card>
        
        {/* Favorite Items Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coffee className="mr-2 h-5 w-5" />
              Your Favorites
            </CardTitle>
            <CardDescription>Items you order most frequently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockUserData.favoriteItems.map((item, index) => (
                <div key={index} className="flex items-center p-4 border rounded-md">
                  <div className="bg-primary/10 p-3 rounded-full mr-3">
                    <Coffee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Ordered {item.count} times</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Find Shops Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="mr-2 h-5 w-5" />
              Find Coffee Shops
            </CardTitle>
            <CardDescription>Discover coffee shops near you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Map will be displayed here</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Locations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
