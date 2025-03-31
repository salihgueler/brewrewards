import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/graphql-client';
import { listUserRewardsQuery, listStampCardsQuery, listRewardsQuery } from '@/graphql/queries';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

/**
 * API endpoint to get a user's rewards across all shops
 * Protected by middleware for authentication
 */
export async function GET(req: NextRequest) {
  try {
    // Get user from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (isFeatureEnabled(FeatureFlag.USE_REAL_API)) {
      try {
        // Fetch user rewards from GraphQL API
        const userRewardsResult = await executeQuery<{ listUserRewards: { items: any[], nextToken?: string } }>(
          listUserRewardsQuery,
          { userId, limit: 50 }
        );
        
        // Transform the data into the expected format
        const shopRewards = await Promise.all(
          userRewardsResult.listUserRewards.items.map(async (userReward) => {
            const shopId = userReward.shopId;
            
            // Fetch stamp cards for this shop
            const stampCardsResult = await executeQuery<{ listStampCards: { items: any[] } }>(
              listStampCardsQuery,
              { shopId, limit: 10 }
            );
            
            // Fetch rewards for this shop
            const rewardsResult = await executeQuery<{ listRewards: { items: any[] } }>(
              listRewardsQuery,
              { shopId, limit: 10 }
            );
            
            // Map stamp cards to the expected format
            const stamps = userReward.stamps?.map((stamp: any) => {
              const stampCard = stampCardsResult.listStampCards.items.find(
                (card: any) => card.id === stamp.cardId
              );
              
              return {
                cardId: stamp.cardId,
                cardName: stampCard?.name || 'Stamp Card',
                currentStamps: stamp.currentStamps,
                requiredStamps: stampCard?.stampsRequired || 10,
              };
            }) || [];
            
            // Map rewards to the expected format
            const availableRewards = rewardsResult.listRewards.items.map((reward: any) => ({
              id: reward.id,
              name: reward.name,
              description: reward.description,
              pointsRequired: reward.pointsRequired,
            }));
            
            // Return the shop reward object
            return {
              shopId,
              shopName: userReward.shopName || `Shop ${shopId}`,
              shopLogo: userReward.shopLogo,
              points: userReward.points || 0,
              stamps,
              availableRewards,
            };
          })
        );
        
        return NextResponse.json({
          success: true,
          data: shopRewards,
        });
      } catch (graphqlError) {
        console.error('GraphQL error fetching user rewards:', graphqlError);
        // Fall through to mock data if GraphQL fails
      }
    }
    
    // Fallback to mock data
    const mockRewards = [
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
    
    return NextResponse.json({
      success: true,
      data: mockRewards,
      isMockData: !isFeatureEnabled(FeatureFlag.USE_REAL_API)
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user rewards' },
      { status: 500 }
    );
  }
}
