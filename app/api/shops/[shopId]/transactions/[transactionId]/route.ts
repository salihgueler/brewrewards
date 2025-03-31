import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from '@aws-amplify/api';
import { getTransaction } from '@/graphql/queries';
import { updateTransaction, deleteTransaction } from '@/graphql/mutations';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

const client = generateClient();

// GET /api/shops/[shopId]/transactions/[transactionId]
export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string; transactionId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, transactionId } = params;

    // Check if user has permission to view transactions for this shop
    if (!hasPermission(user, 'VIEW_TRANSACTIONS', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PATCH /api/shops/[shopId]/transactions/[transactionId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { shopId: string; transactionId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, transactionId } = params;
    const body = await request.json();

    // Check if user has permission to update transactions for this shop
    if (!hasPermission(user, 'UPDATE_TRANSACTIONS', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await client.graphql({
      query: updateTransaction,
      variables: {
        input: {
          id: transactionId,
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

// DELETE /api/shops/[shopId]/transactions/[transactionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shopId: string; transactionId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, transactionId } = params;

    // Check if user has permission to delete transactions for this shop
    if (!hasPermission(user, 'DELETE_TRANSACTIONS', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await client.graphql({
      query: deleteTransaction,
      variables: {
        id: transactionId,
        shopId
      }
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
