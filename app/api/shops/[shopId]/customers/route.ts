import { NextRequest, NextResponse } from 'next/server';
import { User, UserLoyalty } from '@/lib/types';
import { AccessUser, canAccessShop } from '@/lib/shop-access';
import { executeQuery } from '@/lib/graphql-client';
import { listUsersQuery, getUserRewardQuery } from '@/graphql/queries';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

/**
 * API endpoint to manage a shop's customers
 * Protected by middleware for authentication and role-based access
 */

// Get customers for a shop
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
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
        // Fetch users with role CUSTOMER
        const usersResult = await executeQuery<{ listUsers: { items: User[], nextToken?: string } }>(
          listUsersQuery,
          { shopId, limit, nextToken }
        );
        
        // Filter by search term if provided
        let filteredUsers = usersResult.listUsers.items.filter(user => user.role === 'CUSTOMER');
        
        if (search) {
          filteredUsers = filteredUsers.filter(user => 
            user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Fetch loyalty data for each customer
        const customersWithLoyalty = await Promise.all(
          filteredUsers.map(async (user) => {
            try {
              const loyaltyResult = await executeQuery<{ getUserReward: UserLoyalty }>(
                getUserRewardQuery,
                { userId: user.id, shopId }
              );
              
              return {
                ...user,
                name: `${user.firstName} ${user.lastName}`,
                loyalty: loyaltyResult.getUserReward
              };
            } catch (error) {
              // If no loyalty data found, return user without loyalty
              return {
                ...user,
                name: `${user.firstName} ${user.lastName}`
              };
            }
          })
        );
        
        // Paginate results
        const paginatedCustomers = customersWithLoyalty.slice((page - 1) * limit, page * limit);
        
        return NextResponse.json({
          success: true,
          data: paginatedCustomers,
          pagination: {
            page,
            limit,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit),
          },
          nextToken: usersResult.listUsers.nextToken
        });
      } catch (graphqlError) {
        console.error('GraphQL error fetching customers:', graphqlError);
        // Fall through to mock data if GraphQL fails
      }
    }
    
    // Fallback to mock data
    const customers: Array<Partial<User> & { loyalty?: Partial<UserLoyalty> }> = [
      {
        id: 'user_1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        role: 'CUSTOMER',
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
        loyalty: {
          userId: 'user_1',
          shopId,
          points: 320,
          stamps: [{
            cardId: 'program_2',
            currentStamps: 6,
            lastStampDate: '2025-03-15T00:00:00Z'
          }],
        },
      },
      {
        id: 'user_2',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Miller',
        name: 'Sarah Miller',
        role: 'CUSTOMER',
        createdAt: '2025-02-03T00:00:00Z',
        updatedAt: '2025-02-03T00:00:00Z',
        loyalty: {
          userId: 'user_2',
          shopId,
          points: 450,
          stamps: [],
        },
      },
      {
        id: 'user_3',
        email: 'robert@example.com',
        firstName: 'Robert',
        lastName: 'Kim',
        name: 'Robert Kim',
        role: 'CUSTOMER',
        createdAt: '2025-02-28T00:00:00Z',
        updatedAt: '2025-02-28T00:00:00Z',
        loyalty: {
          userId: 'user_3',
          shopId,
          points: 0,
          stamps: [{
            cardId: 'program_2',
            currentStamps: 6,
            lastStampDate: '2025-03-20T00:00:00Z'
          }],
        },
      },
    ];
    
    // Filter by search term if provided
    const filteredCustomers = search
      ? customers.filter(customer => 
          customer.name?.toLowerCase().includes(search.toLowerCase()) ||
          customer.email?.toLowerCase().includes(search.toLowerCase())
        )
      : customers;
    
    // Paginate results
    const paginatedCustomers = filteredCustomers.slice((page - 1) * limit, page * limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedCustomers,
      pagination: {
        page,
        limit,
        total: filteredCustomers.length,
        totalPages: Math.ceil(filteredCustomers.length / limit),
      },
      isMockData: !isFeatureEnabled(FeatureFlag.USE_REAL_API)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching customers' },
      { status: 500 }
    );
  }
}
