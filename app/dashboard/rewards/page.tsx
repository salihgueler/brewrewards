'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Award, 
  Gift, 
  Clock, 
  Check, 
  ArrowLeft,
  Coffee,
  Cake,
  ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { auth, AuthUser } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import Link from 'next/link';

// Mock user data
const mockUserData = {
  name: 'John Doe',
  points: 320,
  stamps: 6,
  totalStampsNeeded: 10,
  shopName: 'Demo Coffee',
};

// Mock rewards data
const mockAvailableRewards = [
  { 
    id: 'reward_1', 
    name: 'Free Coffee', 
    description: 'Any size coffee of your choice', 
    pointsCost: 100, 
    expires: '2025-04-15T00:00:00Z',
    image: <Coffee className="h-8 w-8" />
  },
  { 
    id: 'reward_2', 
    name: 'Free Pastry', 
    description: 'Any pastry of your choice', 
    pointsCost: 150, 
    expires: '2025-04-30T00:00:00Z',
    image: <Cake className="h-8 w-8" />
  },
  { 
    id: 'reward_3', 
    name: '10% Off Purchase', 
    description: '10% off your next purchase', 
    pointsCost: 75, 
    expires: '2025-05-15T00:00:00Z',
    image: <ShoppingBag className="h-8 w-8" />
  },
];

const mockRedeemedRewards = [
  { 
    id: 'redeemed_1', 
    name: 'Free Coffee', 
    description: 'Any size coffee of your choice', 
    redeemedOn: '2025-03-01T00:00:00Z',
    expiresOn: '2025-04-01T00:00:00Z',
    used: false,
    image: <Coffee className="h-8 w-8" />
  },
  { 
    id: 'redeemed_2', 
    name: 'Free Pastry', 
    description: 'Any pastry of your choice', 
    redeemedOn: '2025-02-15T00:00:00Z',
    expiresOn: '2025-03-15T00:00:00Z',
    used: true,
    image: <Cake className="h-8 w-8" />
  },
];

export default function RewardsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedeemSuccess, setIsRedeemSuccess] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?redirect=/dashboard/rewards');
          return;
        }
        
        // Check if user is a customer
        if (user.role !== UserRole.CUSTOMER) {
          router.push('/dashboard');
          return;
        }
        
        setCurrentUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?redirect=/dashboard/rewards');
      }
    };

    checkAuth();
  }, [router]);

  const handleRedeemReward = (reward: any) => {
    setSelectedReward(reward);
    setIsRedeemDialogOpen(true);
  };

  const confirmRedemption = async () => {
    setIsRedeeming(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRedeeming(false);
      setIsRedeemSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsRedeemSuccess(false);
        setIsRedeemDialogOpen(false);
        setSelectedReward(null);
      }, 3000);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">My Rewards</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Loyalty Status
          </CardTitle>
          <CardDescription>Your current rewards progress at {mockUserData.shopName}</CardDescription>
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
      </Card>
      
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Rewards</TabsTrigger>
          <TabsTrigger value="redeemed">Redeemed Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockAvailableRewards.map(reward => {
              const canRedeem = mockUserData.points >= reward.pointsCost;
              const expiryDate = new Date(reward.expires);
              const formattedExpiry = expiryDate.toLocaleDateString();
              
              return (
                <Card key={reward.id} className={canRedeem ? 'border-primary/50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-2">
                          {reward.image}
                        </div>
                        {reward.name}
                      </CardTitle>
                      <Badge>{reward.pointsCost} points</Badge>
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      Expires: {formattedExpiry}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      disabled={!canRedeem}
                      onClick={() => handleRedeemReward(reward)}
                    >
                      {canRedeem ? (
                        <>
                          <Gift className="mr-2 h-4 w-4" />
                          Redeem Reward
                        </>
                      ) : (
                        `Need ${reward.pointsCost - mockUserData.points} more points`
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="redeemed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockRedeemedRewards.map(reward => {
              const redeemedDate = new Date(reward.redeemedOn);
              const formattedRedeemed = redeemedDate.toLocaleDateString();
              
              const expiryDate = new Date(reward.expiresOn);
              const formattedExpiry = expiryDate.toLocaleDateString();
              
              const isExpired = new Date() > expiryDate;
              
              return (
                <Card key={reward.id} className={reward.used || isExpired ? 'opacity-70' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-2">
                          {reward.image}
                        </div>
                        {reward.name}
                      </CardTitle>
                      <Badge variant={reward.used ? 'outline' : isExpired ? 'destructive' : 'secondary'}>
                        {reward.used ? 'Used' : isExpired ? 'Expired' : 'Active'}
                      </Badge>
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Gift className="mr-2 h-4 w-4" />
                      Redeemed: {formattedRedeemed}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {isExpired ? 'Expired' : 'Expires'}: {formattedExpiry}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={reward.used || isExpired ? 'outline' : 'default'}
                      className="w-full" 
                      disabled={reward.used || isExpired}
                    >
                      {reward.used ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Already Used
                        </>
                      ) : isExpired ? (
                        'Expired'
                      ) : (
                        'Show to Redeem'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Redeem Reward Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              Confirm that you want to redeem this reward
            </DialogDescription>
          </DialogHeader>
          {isRedeemSuccess ? (
            <div className="py-6 text-center">
              <div className="bg-green-100 text-green-800 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Reward Redeemed!</h3>
              <p className="text-muted-foreground mb-4">
                Your reward has been added to your account
              </p>
              <Button onClick={() => {
                setIsRedeemSuccess(false);
                setIsRedeemDialogOpen(false);
              }}>
                Done
              </Button>
            </div>
          ) : selectedReward ? (
            <>
              <div className="py-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    {selectedReward.image}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedReward.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cost</span>
                    <Badge>{selectedReward.pointsCost} points</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Your Balance</span>
                    <span>{mockUserData.points} points</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span>Remaining Balance</span>
                    <span>{mockUserData.points - selectedReward.pointsCost} points</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRedeemDialogOpen(false)} disabled={isRedeeming}>
                  Cancel
                </Button>
                <Button onClick={confirmRedemption} disabled={isRedeeming}>
                  {isRedeeming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2" />
                      Redeeming...
                    </>
                  ) : (
                    'Confirm Redemption'
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
