import { NextRequest, NextResponse } from 'next/server';
import { LoyaltyProgram } from '@/lib/types';
import { AccessUser, canAccessShop, canModifyShop } from '@/lib/shop-access';

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
    
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
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
    
    // In a real implementation, this would save to a database
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
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating loyalty program:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the loyalty program' },
      { status: 500 }
    );
  }
}
