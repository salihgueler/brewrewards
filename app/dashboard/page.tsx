'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Ticket, Award, Star, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

// Mock data interfaces
interface ShopReward {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  points: number;
  stamps: {
    cardId: string;
    cardName: string;
    currentStamps: number;
    requiredStamps: number;
  }[];
  availableRewards: {
    id: string;
    name: string;
    description: string;
    pointsRequired: number;
  }[];
}

interface RecentActivity {
  id: string;
  type: 'stamp' | 'points' | 'redemption';
  shopName: string;
  shopLogo?: string;
  description: string;
  date: string;
  amount?: number;
}

export default function CustomerDashboardPage() {
  const { user, isAuthorized, isLoading } = useAuth();
  const router = useRouter();
  const [rewards, setRewards] = useState<ShopReward[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Check authorization
    if (!isLoading && !isAuthorized(UserRole.CUSTOMER)) {
      router.push('/login');
      return;
    }

    // Fetch customer rewards and activities - in a real app, this would be API calls
    const fetchCustomerData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockRewards: ShopReward[] = [
          {
            shopId: '1',
            shopName: 'Urban Beans',
            shopLogo: '/placeholder.svg',
            points: 85,
            stamps: [
              {
                cardId: '1',
                cardName: 'Coffee Lovers Card',
                currentStamps: 7,
                requiredStamps: 10,
              },
              {
                cardId: '2',
                cardName: 'Espresso Enthusiast',
                currentStamps: 3,
                requiredStamps: 8,
              },
            ],
            availableRewards: [
              {
                id: '1',
                name: 'Free Coffee',
                description: 'Any size coffee of your choice',
                pointsRequired: 100,
              },
              {
                id: '2',
                name: 'Pastry Discount',
                description: '50% off any pastry',
                pointsRequired: 75,
              },
            ],
          },
          {
            shopId: '2',
            shopName: 'Espresso Haven',
            shopLogo: '/placeholder.svg',
            points: 120,
            stamps: [
              {
                cardId: '3',
                cardName: 'Specialty Drinks',
                currentStamps: 4,
                requiredStamps: 6,
              },
            ],
            availableRewards: [
              {
                id: '3',
                name: 'Free Specialty Drink',
                description: 'Any specialty drink on our menu',
                pointsRequired: 150,
              },
              {
                id: '4',
                name: 'Breakfast Sandwich',
                description: 'Free breakfast sandwich',
                pointsRequired: 200,
              },
            ],
          },
        ];
        
        const mockActivities: RecentActivity[] = [
          {
            id: '1',
            type: 'stamp',
            shopName: 'Urban Beans',
            shopLogo: '/placeholder.svg',
            description: 'Earned a stamp on Coffee Lovers Card',
            date: '2025-03-24T14:30:00Z',
          },
          {
            id: '2',
            type: 'points',
            shopName: 'Espresso Haven',
            shopLogo: '/placeholder.svg',
            description: 'Earned points for purchase',
            date: '2025-03-23T10:15:00Z',
            amount: 25,
          },
          {
            id: '3',
            type: 'redemption',
            shopName: 'Urban Beans',
            shopLogo: '/placeholder.svg',
            description: 'Redeemed Free Pastry reward',
            date: '2025-03-20T16:45:00Z',
          },
          {
            id: '4',
            type: 'points',
            shopName: 'Espresso Haven',
            shopLogo: '/placeholder.svg',
            description: 'Earned points for purchase',
            date: '2025-03-18T09:20:00Z',
            amount: 15,
          },
        ];
        
        setRewards(mockRewards);
        setActivities(activities => [...mockActivities].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error fetching customer data:', error);
        setIsLoadingData(false);
      }
    };

    fetchCustomerData();
  }, [isAuthorized, isLoading, router]);

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Track your rewards and find new coffee shops.</p>
        </div>
        <Link href="/shops">
          <Button>
            <Coffee className="mr-2 h-4 w-4" />
            Discover Coffee Shops
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Your Rewards</h2>
          
          {isLoadingData ? (
            <div className="flex justify-center items-center h-64">Loading rewards...</div>
          ) : rewards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Coffee className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No rewards yet</h3>
                <p className="mt-1 text-gray-500">Join a coffee shop's loyalty program to start earning rewards.</p>
                <Button className="mt-4" asChild>
                  <Link href="/shops">
                    Find Coffee Shops
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {rewards.map((shopReward) => (
                <Card key={shopReward.shopId}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {shopReward.shopLogo ? (
                          <img 
                            src={shopReward.shopLogo} 
                            alt={shopReward.shopName} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Coffee className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <CardTitle>{shopReward.shopName}</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/shops/${shopReward.shopId}`}>
                          Visit Shop
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium">Points Balance</p>
                        <p className="text-sm font-bold">{shopReward.points} points</p>
                      </div>
                      <Progress value={shopReward.points % 100} className="h-2" />
                    </div>
                    
                    {shopReward.stamps.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Stamp Cards</p>
                        <div className="space-y-3">
                          {shopReward.stamps.map((stampCard) => (
                            <div key={stampCard.cardId} className="bg-muted/50 p-3 rounded-md">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-sm">{stampCard.cardName}</p>
                                <p className="text-sm font-bold">{stampCard.currentStamps}/{stampCard.requiredStamps}</p>
                              </div>
                              <div className="flex gap-1">
                                {Array.from({ length: stampCard.requiredStamps }).map((_, i) => (
                                  <div 
                                    key={i}
                                    className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                      i < stampCard.currentStamps 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted border border-border'
                                    }`}
                                  >
                                    {i < stampCard.currentStamps && <Star className="h-3 w-3" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {shopReward.availableRewards.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Available Rewards</p>
                        <div className="space-y-2">
                          {shopReward.availableRewards.map((reward) => (
                            <div key={reward.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                              <div>
                                <p className="text-sm font-medium">{reward.name}</p>
                                <p className="text-xs text-muted-foreground">{reward.description}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm font-bold mr-2">{reward.pointsRequired} pts</span>
                                <Button variant="outline" size="sm" disabled={shopReward.points < reward.pointsRequired}>
                                  Redeem
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          
          {isLoadingData ? (
            <div className="flex justify-center items-center h-64">Loading activity...</div>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No activity yet</h3>
                <p className="mt-1 text-gray-500">Your recent reward activity will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        activity.type === 'stamp' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'points' ? 'bg-green-100 text-green-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {activity.type === 'stamp' ? (
                          <Ticket className="h-4 w-4" />
                        ) : activity.type === 'points' ? (
                          <Award className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.shopName}</p>
                          </div>
                          {activity.type === 'points' && activity.amount && (
                            <span className="text-sm font-bold text-green-600">+{activity.amount}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Favorite Shops</h2>
            <Card>
              <CardContent className="p-0">
                <Link href="/shops/1" className="flex items-center p-4 hover:bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Coffee className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Urban Beans</p>
                    <p className="text-sm text-muted-foreground">Seattle, WA</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link href="/shops/2" className="flex items-center p-4 hover:bg-muted/50 border-t">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Coffee className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Espresso Haven</p>
                    <p className="text-sm text-muted-foreground">Portland, OR</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
