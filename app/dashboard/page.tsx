'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Award, Ticket, Star, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, AuthUser } from '@/lib/auth';

export default function DashboardPage() {
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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="font-bold text-xl">BrewRewards</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user?.firstName} {user?.lastName}</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.firstName}!</h1>

        <Tabs defaultValue="rewards" className="mb-8">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="rewards">My Rewards</TabsTrigger>
            <TabsTrigger value="stamps">Stamp Cards</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Total Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">250</div>
                  <p className="text-muted-foreground mt-2">Points available to redeem</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Rewards</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-primary" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Purchase at Demo Coffee</p>
                      <p className="text-sm text-muted-foreground">March 18, 2025</p>
                    </div>
                    <div className="text-green-600 font-medium">+15 pts</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Redeemed Free Coffee</p>
                      <p className="text-sm text-muted-foreground">March 15, 2025</p>
                    </div>
                    <div className="text-red-600 font-medium">-50 pts</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Activity</Button>
                </CardFooter>
              </Card>
            </div>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Available Rewards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Free Coffee', points: 50, shop: 'Demo Coffee' },
                { name: 'Free Pastry', points: 75, shop: 'Demo Coffee' },
                { name: 'Free Smoothie', points: 100, shop: 'Demo Coffee' },
                { name: '10% Off Order', points: 25, shop: 'Demo Coffee' },
              ].map((reward, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>{reward.name}</CardTitle>
                    <CardDescription>{reward.shop}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">{reward.points} points</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={reward.points <= 250 ? 'default' : 'outline'} 
                      className="w-full"
                      disabled={reward.points > 250}
                    >
                      {reward.points <= 250 ? 'Redeem' : 'Not Enough Points'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="stamps" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span>Coffee Stamp Card</span>
                  </CardTitle>
                  <CardDescription>Demo Coffee Shop</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-full flex items-center justify-center ${i < 6 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                      >
                        {i < 6 && <Coffee className="h-4 w-4" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">6/10 stamps collected</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm">Collect 10 stamps to get a free coffee!</p>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span>Smoothie Stamp Card</span>
                  </CardTitle>
                  <CardDescription>Demo Coffee Shop</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-full flex items-center justify-center ${i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                      >
                        {i < 3 && <Coffee className="h-4 w-4" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">3/8 stamps collected</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm">Collect 8 stamps to get a free smoothie!</p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Cappuccino', price: 4.50, shop: 'Demo Coffee' },
                { name: 'Blueberry Muffin', price: 3.25, shop: 'Demo Coffee' },
                { name: 'Iced Latte', price: 5.00, shop: 'Demo Coffee' },
                { name: 'Avocado Toast', price: 7.50, shop: 'Demo Coffee' },
              ].map((item, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.name}</CardTitle>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <CardDescription>{item.shop}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">${item.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
