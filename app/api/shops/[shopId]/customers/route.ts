import { NextRequest, NextResponse } from 'next/server';
import { User, UserLoyalty } from '@/lib/types';
import { AccessUser, canAccessShop } from '@/lib/shop-access';

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
    
    // In a real implementation, this would fetch from a database with filtering
    // For now, we'll return mock data
    const customers: Array<Partial<User> & { loyalty?: Partial<UserLoyalty> }> = [
      {
        id: 'user_1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CUSTOMER',
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
        loyalty: {
          id: 'loyalty_1',
          userId: 'user_1',
          shopId,
          loyaltyProgramId: 'program_1',
          points: 320,
          stamps: 0,
        },
      },
      {
        id: 'user_2',
        email: 'sarah@example.com',
        name: 'Sarah Miller',
        role: 'CUSTOMER',
        createdAt: '2025-02-03T00:00:00Z',
        updatedAt: '2025-02-03T00:00:00Z',
        loyalty: {
          id: 'loyalty_2',
          userId: 'user_2',
          shopId,
          loyaltyProgramId: 'program_1',
          points: 450,
          stamps: 0,
        },
      },
      {
        id: 'user_3',
        email: 'robert@example.com',
        name: 'Robert Kim',
        role: 'CUSTOMER',
        createdAt: '2025-02-28T00:00:00Z',
        updatedAt: '2025-02-28T00:00:00Z',
        loyalty: {
          id: 'loyalty_3',
          userId: 'user_3',
          shopId,
          loyaltyProgramId: 'program_2',
          points: 0,
          stamps: 6,
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
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching customers' },
      { status: 500 }
    );
  }
}
