import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from '@aws-amplify/api';
import { listTransactionsByShop, getTransaction } from '@/graphql/queries';
import { createTransaction, updateTransaction, deleteTransaction } from '@/graphql/mutations';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

const client = generateClient();

// GET /api/shops/[shopId]/transactions
export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopId = params.shopId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const nextToken = searchParams.get('nextToken') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const transactionId = searchParams.get('id');

    // Check if user has permission to view transactions for this shop
    if (!hasPermission(user, 'VIEW_TRANSACTIONS', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If transaction ID is provided, get a specific transaction
    if (transactionId) {
      const response = await client.graphql({
        query: getTransaction,
        variables: {
          id: transactionId,
          shopId
        }
      });

      if (!response.data.getTransaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      return NextResponse.json(response.data.getTransaction);
    }

    // Otherwise, list transactions for the shop
    const response = await client.graphql({
      query: listTransactionsByShop,
      variables: {
        shopId,
        limit,
        nextToken,
        startDate,
        endDate
      }
    });

    return NextResponse.json(response.data.listTransactionsByShop);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/shops/[shopId]/transactions
export async function POST(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopId = params.shopId;
    const body = await request.json();

    // Check if user has permission to create transactions for this shop
    if (!hasPermission(user, 'CREATE_TRANSACTIONS', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await client.graphql({
      query: createTransaction,
      variables: {
        input: {
          shopId,
          userId: body.userId,
          amount: body.amount,
          points: body.points,
          stamps: body.stamps,
          type: body.type,
          items: body.items,
          rewardId: body.rewardId,
          notes: body.notes
        }
      }
    });

    return NextResponse.json(response.data.createTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// PATCH /api/shops/[shopId]/transactions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopId = params.shopId;
    const body = await request.json();

    // Check if user has permission to update transactions for this shop
    if (!hasPermission(user, 'UPDATE_TRANSACTIONS', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!body.id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const response = await client.graphql({
      query: updateTransaction,
      variables: {
        input: {
          id: body.id,
          shopId,
          status: body.status,
          notes: body.notes
        }
      }
    });

    return NextResponse.json(response.data.updateTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/shops/[shopId]/transactions
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopId = params.shopId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    // Check if user has permission to delete transactions for this shop
    if (!hasPermission(user, 'DELETE_TRANSACTIONS', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await client.graphql({
      query: deleteTransaction,
      variables: { id, shopId }
    });

    return NextResponse.json(response.data.deleteTransaction);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
