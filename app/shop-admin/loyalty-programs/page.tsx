'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Edit, Trash2, Plus, Coffee, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

// Mock data interfaces
interface StampCard {
  id: string;
  name: string;
  description: string;
  stampsRequired: number;
  reward: string;
  isActive: boolean;
  participantCount: number;
  redemptionCount: number;
}

interface PointsReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  isActive: boolean;
  participantCount: number;
  redemptionCount: number;
}

export default function ShopAdminLoyaltyProgramsPage() {
  const { user, isAuthorized, isLoading } = useAuth();
  const router = useRouter();
  const [stampCards, setStampCards] = useState<StampCard[]>([]);
  const [pointsRewards, setPointsRewards] = useState<PointsReward[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [activeTab, setActiveTab] = useState('stamp-cards');

  useEffect(() => {
    // Check authorization
    if (!isLoading && !isAuthorized(UserRole.SHOP_ADMIN)) {
      router.push('/login');
      return;
    }

    // Fetch loyalty programs - in a real app, this would be an API call
    const fetchLoyaltyPrograms = async () => {
      try {
        // Mock data - replace with actual API call
        const mockStampCards: StampCard[] = [
          {
            id: '1',
            name: 'Coffee Lovers Card',
            description: 'Buy 10 coffees, get 1 free',
            stampsRequired: 10,
            reward: 'Free coffee of any size',
            isActive: true,
            participantCount: 124,
            redemptionCount: 45,
          },
          {
            id: '2',
            name: 'Espresso Enthusiast',
            description: 'Buy 8 espresso drinks, get 1 free',
            stampsRequired: 8,
            reward: 'Free espresso drink',
            isActive: true,
            participantCount: 87,
            redemptionCount: 32,
          },
          {
            id: '3',
            name: 'Seasonal Special',
            description: 'Try 5 seasonal drinks, get a free pastry',
            stampsRequired: 5,
            reward: 'Free pastry of choice',
            isActive: false,
            participantCount: 56,
            redemptionCount: 21,
          },
        ];
        
        const mockPointsRewards: PointsReward[] = [
          {
            id: '1',
            name: 'Free Coffee',
            description: 'Redeem points for a free coffee',
            pointsRequired: 100,
            isActive: true,
            participantCount: 98,
            redemptionCount: 37,
          },
          {
            id: '2',
            name: 'Pastry Discount',
            description: '50% off any pastry',
            pointsRequired: 75,
            isActive: true,
            participantCount: 112,
            redemptionCount: 54,
          },
          {
            id: '3',
            name: 'Merchandise Discount',
            description: '20% off merchandise',
            pointsRequired: 150,
            isActive: true,
            participantCount: 43,
            redemptionCount: 12,
          },
        ];
        
        setStampCards(mockStampCards);
        setPointsRewards(mockPointsRewards);
        setIsLoadingPrograms(false);
      } catch (error) {
        console.error('Error fetching loyalty programs:', error);
        setIsLoadingPrograms(false);
      }
    };

    fetchLoyaltyPrograms();
  }, [isAuthorized, isLoading, router]);

  const handleDeleteStampCard = async (id: string) => {
    // In a real app, this would be an API call
    if (confirm('Are you sure you want to delete this stamp card?')) {
      try {
        // Mock deletion - replace with actual API call
        setStampCards(stampCards.filter(card => card.id !== id));
        alert('Stamp card deleted successfully');
      } catch (error) {
        console.error('Error deleting stamp card:', error);
        alert('Failed to delete stamp card');
      }
    }
  };

  const handleDeletePointsReward = async (id: string) => {
    // In a real app, this would be an API call
    if (confirm('Are you sure you want to delete this points reward?')) {
      try {
        // Mock deletion - replace with actual API call
        setPointsRewards(pointsRewards.filter(reward => reward.id !== id));
        alert('Points reward deleted successfully');
      } catch (error) {
        console.error('Error deleting points reward:', error);
        alert('Failed to delete points reward');
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Loyalty Programs</h1>
        <div className="flex gap-2">
          <Link href="/shop-admin/loyalty-programs/stamp-cards/create">
            <Button variant="outline">
              <Ticket className="mr-2 h-4 w-4" />
              New Stamp Card
            </Button>
          </Link>
          <Link href="/shop-admin/loyalty-programs/points-rewards/create">
            <Button>
              <Award className="mr-2 h-4 w-4" />
              New Points Reward
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="stamp-cards" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stamp-cards">Stamp Cards</TabsTrigger>
          <TabsTrigger value="points-rewards">Points Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stamp-cards">
          {isLoadingPrograms ? (
            <div className="flex justify-center items-center h-64">Loading stamp cards...</div>
          ) : stampCards.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No stamp cards found</h3>
              <p className="mt-1 text-gray-500">Create your first stamp card to start rewarding customers.</p>
              <Button className="mt-4" asChild>
                <Link href="/shop-admin/loyalty-programs/stamp-cards/create">
                  Create Stamp Card
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {stampCards.map((card) => (
                <Card key={card.id} className={card.isActive ? '' : 'opacity-70'}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Ticket className="mr-2 h-5 w-5" />
                          {card.name}
                        </CardTitle>
                        {!card.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/shop-admin/loyalty-programs/stamp-cards/${card.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteStampCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium">Stamps Required</p>
                        <p className="text-2xl font-bold">{card.stampsRequired}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reward</p>
                        <p className="text-sm">{card.reward}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-4">
                      <div>
                        <p className="font-medium">{card.participantCount}</p>
                        <p className="text-muted-foreground">Participants</p>
                      </div>
                      <div>
                        <p className="font-medium">{card.redemptionCount}</p>
                        <p className="text-muted-foreground">Redemptions</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/shop-admin/loyalty-programs/stamp-cards/${card.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="points-rewards">
          {isLoadingPrograms ? (
            <div className="flex justify-center items-center h-64">Loading points rewards...</div>
          ) : pointsRewards.length === 0 ? (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No points rewards found</h3>
              <p className="mt-1 text-gray-500">Create your first points reward to start rewarding customers.</p>
              <Button className="mt-4" asChild>
                <Link href="/shop-admin/loyalty-programs/points-rewards/create">
                  Create Points Reward
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {pointsRewards.map((reward) => (
                <Card key={reward.id} className={reward.isActive ? '' : 'opacity-70'}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Award className="mr-2 h-5 w-5" />
                          {reward.name}
                        </CardTitle>
                        {!reward.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/shop-admin/loyalty-programs/points-rewards/${reward.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeletePointsReward(reward.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium">Points Required</p>
                        <p className="text-2xl font-bold">{reward.pointsRequired}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-4">
                      <div>
                        <p className="font-medium">{reward.participantCount}</p>
                        <p className="text-muted-foreground">Participants</p>
                      </div>
                      <div>
                        <p className="font-medium">{reward.redemptionCount}</p>
                        <p className="text-muted-foreground">Redemptions</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/shop-admin/loyalty-programs/points-rewards/${reward.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
