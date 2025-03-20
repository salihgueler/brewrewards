import { NextRequest, NextResponse } from 'next/server';
import { User, UserLoyalty, Transaction, UserReward } from '@/lib/types';
import { AccessUser, canAccessShop } from '@/lib/shop-access';

/**
 * API endpoint to manage a specific customer for a shop
 * Protected by middleware for authentication and role-based access
 */

// Get customer details
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string; userId: string } }
) {
  try {
    const { shopId, userId } = params;
    
    // Get user from request headers (set by middleware)
    const requestUserId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const userShopId = req.headers.get('x-user-shop-id');
    
    if (!requestUserId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user: AccessUser = {
      id: requestUserId,
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
    
    // Additional check: customers can only access their own data
    if (user.role === 'CUSTOMER' && user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only access your own data' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    const customer: Partial<User> & {
      loyalty?: Partial<UserLoyalty>;
      transactions?: Partial<Transaction>[];
      rewards?: Partial<UserReward>[];
    } = {
      id: userId,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CUSTOMER',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
      loyalty: {
        id: 'loyalty_1',
        userId,
        shopId,
        loyaltyProgramId: 'program_1',
        points: 320,
        stamps: 6,
      },
      transactions: [
        {
          id: 'txn_1',
          userId,
          shopId,
          amount: 12.50,
          pointsEarned: 12,
          stampsEarned: 1,
          createdAt: '2025-03-15T10:30:00Z',
        },
        {
          id: 'txn_2',
          userId,
          shopId,
          amount: 8.75,
          pointsEarned: 8,
          stampsEarned: 1,
          createdAt: '2025-03-10T11:45:00Z',
        },
      ],
      rewards: [
        {
          id: 'user_reward_1',
          userId,
          shopId,
          rewardId: 'reward_1',
          status: 'EARNED',
          earnedAt: '2025-03-01T00:00:00Z',
        },
        {
          id: 'user_reward_2',
          userId,
          shopId,
          rewardId: 'reward_2',
          status: 'REDEEMED',
          earnedAt: '2025-02-15T00:00:00Z',
          redeemedAt: '2025-03-05T00:00:00Z',
        },
      ],
    };
    
    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the customer' },
      { status: 500 }
    );
  }
}

// Update customer loyalty points/stamps
export async function PUT(
  req: NextRequest,
  { params }: { params: { shopId: string; userId: string } }
) {
  try {
    const { shopId, userId } = params;
    const { points, stamps } = await req.json();
    
    // Get user from request headers (set by middleware)
    const requestUserId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const userShopId = req.headers.get('x-user-shop-id');
    
    if (!requestUserId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user: AccessUser = {
      id: requestUserId,
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
    
    // Only shop staff, shop admins, and super admins can update loyalty points
    if (user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Forbidden: Customers cannot update loyalty points' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would update in a database
    const updatedLoyalty: Partial<UserLoyalty> = {
      id: 'loyalty_1',
      userId,
      shopId,
      loyaltyProgramId: 'program_1',
      points: points !== undefined ? points : 320,
      stamps: stamps !== undefined ? stamps : 6,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Customer loyalty updated successfully',
      data: updatedLoyalty,
    });
  } catch (error) {
    console.error('Error updating customer loyalty:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating customer loyalty' },
      { status: 500 }
    );
  }
}
