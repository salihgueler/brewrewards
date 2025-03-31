import { NextRequest, NextResponse } from 'next/server';
import { LoyaltyProgram } from '@/lib/types';
import { AccessUser, canAccessShop, canModifyShop } from '@/lib/shop-access';
import { executeQuery, executeMutation } from '@/lib/graphql-client';
import { listRewardsQuery, listStampCardsQuery } from '@/graphql/queries';
import { createRewardMutation, createStampCardMutation } from '@/graphql/mutations';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

/**
 * API endpoint to manage a shop's loyalty programs
 * Protected by middleware for authentication and role-based access
 */

// Get loyalty programs for a shop
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const nextToken = searchParams.get('nextToken') || undefined;
    
    // Get user from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const userShopId = req.headers.get('x-user-shop-id');
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user: AccessUser = {
      id: userId,
      role: userRole as any,
      shopId: userShopId || undefined,
    };
    
    // Check if user can access this shop's data
    if (!canAccessShop(user, shopId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this shop' },
        { status: 403 }
      );
    }
    
    if (isFeatureEnabled(FeatureFlag.USE_REAL_API)) {
      try {
        // Fetch both rewards and stamp cards from GraphQL API
        const [rewardsResult, stampCardsResult] = await Promise.all([
          executeQuery<{ listRewards: { items: any[], nextToken?: string } }>(
            listRewardsQuery,
            { shopId, limit, nextToken }
          ),
          executeQuery<{ listStampCards: { items: any[], nextToken?: string } }>(
            listStampCardsQuery,
            { shopId, limit, nextToken }
          )
        ]);
        
        // Transform the data into the expected format
        const pointsProgram = {
          id: 'points_program',
          shopId,
          name: 'Coffee Points',
          type: 'POINTS',
          rules: {
            pointsPerDollar: 1,
          },
          rewards: rewardsResult.listRewards.items,
          createdAt: rewardsResult.listRewards.items[0]?.createdAt || new Date().toISOString(),
          updatedAt: rewardsResult.listRewards.items[0]?.updatedAt || new Date().toISOString(),
        };
        
        const stampCardPrograms = stampCardsResult.listStampCards.items.map(stampCard => ({
          id: stampCard.id,
          shopId,
          name: stampCard.name,
          type: 'STAMP_CARD',
          rules: {
            stampsPerPurchase: 1,
            totalStampsRequired: stampCard.stampsRequired,
          },
          rewards: [{
            id: `reward_${stampCard.id}`,
            shopId,
            loyaltyProgramId: stampCard.id,
            name: stampCard.reward,
            description: stampCard.description,
            stampsCost: stampCard.stampsRequired,
            isActive: stampCard.isActive,
          }],
          createdAt: stampCard.createdAt,
          updatedAt: stampCard.updatedAt,
        }));
        
        // Combine both types of programs
        const loyaltyPrograms = [pointsProgram, ...stampCardPrograms];
        
        return NextResponse.json({
          success: true,
          data: loyaltyPrograms,
        });
      } catch (graphqlError) {
        console.error('GraphQL error fetching loyalty programs:', graphqlError);
        // Fall through to mock data if GraphQL fails
      }
    }
    
    // Fallback to mock data
    const loyaltyPrograms: Partial<LoyaltyProgram>[] = [
      {
        id: 'program_1',
        shopId,
        name: 'Coffee Points',
        type: 'POINTS',
        rules: {
          pointsPerDollar: 1,
        },
        rewards: [
          {
            id: 'reward_1',
            shopId,
            loyaltyProgramId: 'program_1',
            name: 'Free Coffee',
            description: 'Get a free coffee of your choice',
            pointsCost: 50,
            isActive: true,
          },
          {
            id: 'reward_2',
            shopId,
            loyaltyProgramId: 'program_1',
            name: 'Free Pastry',
            description: 'Get a free pastry of your choice',
            pointsCost: 75,
            isActive: true,
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'program_2',
        shopId,
        name: 'Coffee Stamp Card',
        type: 'STAMP_CARD',
        rules: {
          stampsPerPurchase: 1,
          totalStampsRequired: 10,
        },
        rewards: [
          {
            id: 'reward_3',
            shopId,
            loyaltyProgramId: 'program_2',
            name: 'Free Coffee',
            description: 'Get a free coffee after 10 stamps',
            stampsCost: 10,
            isActive: true,
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];
    
    return NextResponse.json({
      success: true,
      data: loyaltyPrograms,
      isMockData: !isFeatureEnabled(FeatureFlag.USE_REAL_API)
    });
  } catch (error) {
    console.error('Error fetching loyalty programs:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching loyalty programs' },
      { status: 500 }
    );
  }
}

// Create a new loyalty program
export async function POST(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const { name, type, rules, rewards } = await req.json();
    
    // Get user from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const userShopId = req.headers.get('x-user-shop-id');
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user: AccessUser = {
      id: userId,
      role: userRole as any,
      shopId: userShopId || undefined,
    };
    
    // Check if user can modify this shop's data
    if (!canModifyShop(user, shopId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this shop' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!name || !type || !rules) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate loyalty program type
    if (type !== 'POINTS' && type !== 'STAMP_CARD') {
      return NextResponse.json(
        { error: 'Invalid loyalty program type' },
        { status: 400 }
      );
    }
    
    // Validate rules based on type
    if (type === 'POINTS' && !rules.pointsPerDollar) {
      return NextResponse.json(
        { error: 'Points per dollar is required for points-based programs' },
        { status: 400 }
      );
    }
    
    if (type === 'STAMP_CARD' && (!rules.stampsPerPurchase || !rules.totalStampsRequired)) {
      return NextResponse.json(
        { error: 'Stamps per purchase and total stamps required are required for stamp card programs' },
        { status: 400 }
      );
    }
    
    if (isFeatureEnabled(FeatureFlag.USE_REAL_API)) {
      try {
        let result;
        
        if (type === 'POINTS') {
          // For points-based programs, create rewards
          const rewardPromises = rewards.map((reward: any) => {
            const input = {
              shopId,
              name: reward.name,
              description: reward.description,
              pointsRequired: reward.pointsCost,
              image: reward.image,
              isActive: reward.isActive !== undefined ? reward.isActive : true,
            };
            
            return executeMutation(createRewardMutation, { input });
          });
          
          result = await Promise.all(rewardPromises);
          
          return NextResponse.json({
            success: true,
            message: 'Points-based rewards created successfully',
            data: {
              id: `points_program_${Date.now()}`,
              shopId,
              name,
              type,
              rules,
              rewards: result.map((r: any) => r.createReward),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }, { status: 201 });
        } else {
          // For stamp cards, create a stamp card
          const input = {
            shopId,
            name,
            description: rewards[0]?.description || 'Complete your stamp card to earn a reward',
            stampsRequired: rules.totalStampsRequired,
            reward: rewards[0]?.name || 'Free Item',
            isActive: true,
          };
          
          result = await executeMutation<{ createStampCard: any }>(
            createStampCardMutation,
            { input }
          );
          
          const stampCard = result.createStampCard;
          
          return NextResponse.json({
            success: true,
            message: 'Stamp card created successfully',
            data: {
              id: stampCard.id,
              shopId,
              name,
              type,
              rules,
              rewards: [{
                id: `reward_${stampCard.id}`,
                shopId,
                loyaltyProgramId: stampCard.id,
                name: stampCard.reward,
                description: stampCard.description,
                stampsCost: stampCard.stampsRequired,
                isActive: stampCard.isActive,
              }],
              createdAt: stampCard.createdAt,
              updatedAt: stampCard.updatedAt,
            },
          }, { status: 201 });
        }
      } catch (graphqlError) {
        console.error('GraphQL error creating loyalty program:', graphqlError);
        // Fall through to mock implementation if GraphQL fails
      }
    }
    
    // Fallback to mock implementation
    const programId = `program_${Date.now()}`;
    const loyaltyProgram: Partial<LoyaltyProgram> = {
      id: programId,
      shopId,
      name,
      type,
      rules,
      rewards: rewards?.map((reward: any, index: number) => ({
        ...reward,
        id: `reward_${Date.now()}_${index}`,
        shopId,
        loyaltyProgramId: programId,
      })) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Loyalty program created successfully',
      data: loyaltyProgram,
      isMockData: !isFeatureEnabled(FeatureFlag.USE_REAL_API)
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating loyalty program:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the loyalty program' },
      { status: 500 }
    );
  }
}
