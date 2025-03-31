'use client';

import { useEffect, useState } from 'react';
import { Coffee, CoffeeIcon, Heart, MapPin, Star, CircleCheck, Clock, Phone, Globe, Instagram, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { useShop } from '@/lib/hooks/useShop';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import { useLoyaltyPrograms } from '@/lib/hooks/useLoyaltyPrograms';
import { useUserRewards } from '@/lib/hooks/useUserRewards';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function ShopPage({ params }: { params: { shop: string } }) {
  const { user } = useAuth();
  const { shop, isLoading: isLoadingShop, error: shopError } = useShop(params.shop);
  const { menuItems, isLoading: isLoadingMenu, error: menuError } = useMenuItems(shop?.id || '');
  const { loyaltyPrograms, isLoading: isLoadingLoyalty, error: loyaltyError } = useLoyaltyPrograms(shop?.id || '');
  
  // Only fetch user rewards if we have a logged-in user
  const { userRewards, isLoading: isLoadingUserRewards } = useUserRewards(
    user?.id || '', 
    shop?.id || '',
    { initialLoading: !!user }
  );

  // Organize menu items by category
  const menuByCategory = menuItems.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Format menu categories for display
  const formattedMenu = Object.keys(menuByCategory).map(category => ({
    category,
    items: menuByCategory[category].map((item: any) => ({
      name: item.name,
      price: item.price,
      description: item.description || '',
      image: item.image,
      isAvailable: item.isAvailable
    }))
  }));

  // Get user's stamp card progress if available
  const userStampCard = userRewards?.stamps?.find((stamp: any) => 
    loyaltyPrograms.some((program: any) => 
      program.type === 'STAMP_CARD' && program.id === stamp.cardId
    )
  );

  const stampCardProgram = loyaltyPrograms.find((program: any) => 
    program.type === 'STAMP_CARD' && program.id === userStampCard?.cardId
  );

  const stampCardProgress = {
    currentStamps: userStampCard?.currentStamps || 0,
    totalStamps: stampCardProgram?.rules?.totalStampsRequired || 10,
    reward: stampCardProgram?.rewards?.[0]?.name || 'Free Item'
  };

  // Calculate stamp card progress percentage
  const progressPercent = (stampCardProgress.currentStamps / stampCardProgress.totalStamps) * 100;

  // Check if all data is loading
  const isLoading = isLoadingShop || isLoadingMenu || isLoadingLoyalty;
  
  // Combine all errors
  const error = shopError || menuError || loyaltyError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading shop information..." />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Coffee className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Shop Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center">
          {error?.message || "We couldn't find the coffee shop you're looking for."}
        </p>
        <Button asChild>
          <Link href="/">Return to BrewRewards Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background z-10">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <CoffeeIcon className="h-6 w-6" />
          <span>BrewRewards</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/shops">
            All Shops
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            My Rewards
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <ModeToggle />
          {!user ? (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img 
            src={shop.logo || "/placeholder.svg"} 
            alt={shop.name} 
            className="w-full h-full object-cover" 
          />
          <Link
            href="/shops"
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Button
            size="icon"
            variant="outline"
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.address}, {shop.city}, {shop.state}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button className="bg-amber-600 hover:bg-amber-700">Check In</Button>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-muted-foreground">{shop.description}</p>
              </div>

              <Tabs defaultValue="menu" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="info">Shop Info</TabsTrigger>
                  <TabsTrigger value="loyalty">Loyalty Programs</TabsTrigger>
                </TabsList>

                <TabsContent value="menu" className="pt-4">
                  <LoadingState
                    isLoading={isLoadingMenu}
                    error={menuError}
                    loadingText="Loading menu items..."
                  >
                    {formattedMenu.length === 0 ? (
                      <div className="text-center py-8">
                        <Coffee className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">No menu items available</h3>
                        <p className="mt-1 text-gray-500">This shop hasn't added any menu items yet.</p>
                      </div>
                    ) : (
                      formattedMenu.map((category: any, index: number) => (
                        <div key={index} className="mb-8">
                          <h3 className="text-xl font-bold mb-4">{category.category}</h3>
                          <div className="grid gap-4">
                            {category.items.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">${item.price.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </LoadingState>
                </TabsContent>

                <TabsContent value="info" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold mb-3">Contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{shop.phone || 'Not available'}</span>
                        </div>
                        {shop.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a href={`https://${shop.website}`} className="text-blue-600 hover:underline">
                              {shop.website}
                            </a>
                          </div>
                        )}
                        {shop.socialMedia?.instagram && (
                          <div className="flex items-center gap-2">
                            <Instagram className="h-4 w-4 text-muted-foreground" />
                            <span>{shop.socialMedia.instagram}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-3">Hours</h3>
                      <div className="space-y-2 text-sm">
                        {shop.businessHours ? (
                          shop.businessHours.map((hours: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>{hours.day}</span>
                              <span>{hours.isClosed ? 'Closed' : `${hours.openTime} - ${hours.closeTime}`}</span>
                            </div>
                          ))
                        ) : (
                          <p>Business hours not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="loyalty" className="pt-4">
                  <LoadingState
                    isLoading={isLoadingLoyalty}
                    error={loyaltyError}
                    loadingText="Loading loyalty programs..."
                  >
                    {loyaltyPrograms.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">No loyalty programs available</h3>
                        <p className="mt-1 text-gray-500">This shop hasn't set up any loyalty programs yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {loyaltyPrograms.map((program: any) => (
                          <Card key={program.id}>
                            <CardContent className="pt-6">
                              <h3 className="text-lg font-bold mb-3">{program.name}</h3>
                              {program.type === 'POINTS' ? (
                                <div>
                                  <p className="mb-4">Earn {program.rules.pointsPerDollar} point for every dollar spent</p>
                                  <h4 className="font-medium mb-2">Available Rewards:</h4>
                                  <ul className="space-y-2">
                                    {program.rewards.map((reward: any) => (
                                      <li key={reward.id} className="flex justify-between items-center">
                                        <span>{reward.name} - {reward.description}</span>
                                        <span className="font-bold">{reward.pointsRequired} points</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <div>
                                  <p className="mb-4">
                                    Collect {program.rules.totalStampsRequired} stamps to earn: {program.rewards[0]?.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    {program.rewards[0]?.description}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </LoadingState>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <LoadingState
                isLoading={isLoadingUserRewards && !!user}
                error={null}
                loadingText="Loading your rewards..."
              >
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-bold mb-3">Loyalty Program</h3>
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CircleCheck className="h-5 w-5 text-green-500" />
                          <span>
                            Stamp Card: {stampCardProgress.reward}
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Your progress</span>
                            <span>
                              {stampCardProgress.currentStamps}/{stampCardProgress.totalStamps} stamps
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-600 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                          {Array(stampCardProgress.totalStamps)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className={`aspect-square rounded-full flex items-center justify-center border ${
                                  i < stampCardProgress.currentStamps
                                    ? "bg-amber-600 border-amber-700 text-white"
                                    : "bg-gray-100 border-gray-200"
                                }`}
                              >
                                {i < stampCardProgress.currentStamps && <CoffeeIcon className="h-4 w-4" />}
                              </div>
                            ))}
                        </div>

                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Points Balance</span>
                            <span>{userRewards?.points || 0} points</span>
                          </div>
                        </div>

                        <Button className="w-full">Check In to Earn Stamp</Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="mb-4">Sign in to track your rewards and earn stamps!</p>
                        <Button asChild className="w-full">
                          <Link href="/login">Sign In</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </LoadingState>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3">Location</h3>
                  <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{shop.address}, {shop.city}, {shop.state} {shop.zipCode}</p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      const address = encodeURIComponent(`${shop.address}, ${shop.city}, ${shop.state} ${shop.zipCode}`);
                      window.open(`https://maps.google.com/?q=${address}`, '_blank');
                    }}
                  >
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2025 BrewRewards. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
