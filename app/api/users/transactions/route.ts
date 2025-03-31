import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/types';
import { generateClient } from '@aws-amplify/api';
import { listUserTransactions } from '@/graphql/queries';

const client = generateClient();

/**
 * API endpoint to fetch a user's transactions across all shops
 * Protected by middleware for authentication
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const shopId = searchParams.get('shopId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Get user from request headers (set by middleware)
    const requestUserId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!requestUserId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Users can only access their own transactions unless they are admins
    const targetUserId = userId || requestUserId;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'SHOP_ADMIN' && targetUserId !== requestUserId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only access your own transactions' },
        { status: 403 }
      );
    }
    
    // Build variables for GraphQL query
    const variables: any = {
      userId: targetUserId,
      limit,
      nextToken: page > 1 ? `page${page-1}` : null
    };
    
    // Add filters if provided
    if (shopId) {
      variables.shopId = shopId;
    }
    
    if (startDate) {
      variables.startDate = startDate;
    }
    
    if (endDate) {
      variables.endDate = endDate;
    }
    
    // Query transactions from AppSync GraphQL API
    const response = await client.graphql({
      query: listUserTransactions,
      variables
    });
    
    const transactions = response.data.listUserTransactions.items;
    const nextToken = response.data.listUserTransactions.nextToken;
    
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
    console.error('Error fetching user transactions:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching transactions' },
      { status: 500 }
    );
  }
}
