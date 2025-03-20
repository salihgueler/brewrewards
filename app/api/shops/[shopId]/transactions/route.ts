import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/types';
import { AccessUser, canAccessShop } from '@/lib/shop-access';

/**
 * API endpoint to manage a shop's transactions
 * Protected by middleware for authentication and role-based access
 */

// Get transactions for a shop
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
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
    
    // Additional check: customers can only access their own transactions
    if (user.role === 'CUSTOMER' && (!userId || userId !== user.id)) {
      // If userId is not specified, force it to be the current user's ID
      // If userId is specified but doesn't match the current user, return error
      if (userId && userId !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only access your own transactions' },
          { status: 403 }
        );
      }
    }
    
    // In a real implementation, this would fetch from a database with filtering
    // For now, we'll return mock data
    const transactions: Partial<Transaction>[] = [
      {
        id: 'txn_1',
        userId: userId || 'user_1',
        shopId,
        amount: 12.50,
        items: [
          { menuItemId: 'item_1', quantity: 1, price: 4.50 },
          { menuItemId: 'item_3', quantity: 2, price: 4.00 },
        ],
        pointsEarned: 12,
        stampsEarned: 1,
        createdAt: '2025-03-15T10:30:00Z',
      },
      {
        id: 'txn_2',
        userId: userId || 'user_1',
        shopId,
        amount: 8.75,
        items: [
          { menuItemId: 'item_2', quantity: 1, price: 4.00 },
          { menuItemId: 'item_3', quantity: 1, price: 4.75 },
        ],
        pointsEarned: 8,
        stampsEarned: 1,
        createdAt: '2025-03-10T11:45:00Z',
      },
    ];
    
    // Apply date filters if provided
    let filteredTransactions = transactions;
    if (startDate) {
      filteredTransactions = filteredTransactions.filter(
        txn => txn.createdAt && txn.createdAt >= startDate
      );
    }
    if (endDate) {
      filteredTransactions = filteredTransactions.filter(
        txn => txn.createdAt && txn.createdAt <= endDate
      );
    }
    
    // Paginate results
    const paginatedTransactions = filteredTransactions.slice((page - 1) * limit, page * limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        page,
        limit,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching transactions' },
      { status: 500 }
    );
  }
}

// Create a new transaction
export async function POST(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const { userId, amount, items } = await req.json();
    
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
    
    // Only shop staff, shop admins, and super admins can create transactions
    if (user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Forbidden: Customers cannot create transactions' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!userId || !amount || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate points and stamps based on purchase
    // This is a simple example - in a real app, this would be more complex
    const pointsEarned = Math.floor(amount);
    const stampsEarned = amount >= 5 ? 1 : 0;
    
    // In a real implementation, this would save to a database
    const transaction: Partial<Transaction> = {
      id: `txn_${Date.now()}`,
      userId,
      shopId,
      amount,
      items,
      pointsEarned,
      stampsEarned,
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the transaction' },
      { status: 500 }
    );
  }
}
