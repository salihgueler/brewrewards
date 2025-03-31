import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionItem } from '@/lib/types';
import { AccessUser, canAccessShop } from '@/lib/shop-access';
import { generateClient } from '@aws-amplify/api';
import { listTransactions, getTransaction, createTransaction } from '@/graphql/queries';
import { v4 as uuidv4 } from 'uuid';

const client = generateClient();

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
    
    // Build variables for GraphQL query
    const variables: any = {
      shopId,
      limit,
      nextToken: page > 1 ? `page${page-1}` : null
    };
    
    // Add filters if provided
    if (userId) {
      variables.userId = userId;
    }
    
    if (startDate) {
      variables.startDate = startDate;
    }
    
    if (endDate) {
      variables.endDate = endDate;
    }
    
    // Query transactions from AppSync GraphQL API
    const response = await client.graphql({
      query: listTransactions,
      variables
    });
    
    const transactions = response.data.listTransactions.items;
    const nextToken = response.data.listTransactions.nextToken;
    
    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total: transactions.length + ((page - 1) * limit),
        totalPages: nextToken ? page + 1 : page,
        nextToken
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
    const { userId, amount, items, rewardRedeemed } = await req.json();
    
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
    
    // Create transaction in DynamoDB via AppSync
    const transactionInput = {
      id: uuidv4(),
      userId,
      shopId,
      amount,
      items,
      pointsEarned,
      stampsEarned,
      rewardRedeemed,
      createdAt: new Date().toISOString()
    };
    
    const response = await client.graphql({
      query: createTransaction,
      variables: {
        input: transactionInput
      }
    });
    
    const transaction = response.data.createTransaction;
    
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
