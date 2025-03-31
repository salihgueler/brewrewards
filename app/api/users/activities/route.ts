import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/graphql-client';
import { listUserRewardsQuery } from '@/graphql/queries';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

/**
 * API endpoint to get a user's recent activities
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
        // Fetch user rewards from GraphQL API to extract activity history
        const userRewardsResult = await executeQuery<{ listUserRewards: { items: any[], nextToken?: string } }>(
          listUserRewardsQuery,
          { userId, limit: 50 }
        );
        
        // Extract activities from reward history and transform to expected format
        const activities = userRewardsResult.listUserRewards.items.flatMap(userReward => {
          const shopId = userReward.shopId;
          const shopName = userReward.shopName || `Shop ${shopId}`;
          const shopLogo = userReward.shopLogo;
          
          // Extract redemption activities
          const redemptions = (userReward.rewardHistory || []).map((history: any) => ({
            id: `redemption_${history.rewardId}_${history.redeemedAt}`,
            type: 'redemption' as const,
            shopName,
            shopLogo,
            description: `Redeemed ${history.rewardName}`,
            date: history.redeemedAt,
          }));
          
          // Extract stamp activities from stamps with lastStampDate
          const stampActivities = (userReward.stamps || [])
            .filter((stamp: any) => stamp.lastStampDate)
            .map((stamp: any) => ({
              id: `stamp_${stamp.cardId}_${stamp.lastStampDate}`,
              type: 'stamp' as const,
              shopName,
              shopLogo,
              description: `Earned a stamp on ${stamp.cardId}`,
              date: stamp.lastStampDate,
            }));
          
          // Add a points activity if points > 0
          const pointsActivities = userReward.points > 0 ? [{
            id: `points_${shopId}_${userReward.updatedAt}`,
            type: 'points' as const,
            shopName,
            shopLogo,
            description: 'Earned points for purchase',
            date: userReward.updatedAt,
            amount: userReward.points,
          }] : [];
          
          return [...redemptions, ...stampActivities, ...pointsActivities];
        });
        
        // Sort activities by date (newest first)
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return NextResponse.json({
          success: true,
          data: activities,
        });
      } catch (graphqlError) {
        console.error('GraphQL error fetching user activities:', graphqlError);
        // Fall through to mock data if GraphQL fails
      }
    }
    
    // Fallback to mock data
    const mockActivities = [
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
    
    return NextResponse.json({
      success: true,
      data: mockActivities,
      isMockData: !isFeatureEnabled(FeatureFlag.USE_REAL_API)
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user activities' },
      { status: 500 }
    );
  }
}
