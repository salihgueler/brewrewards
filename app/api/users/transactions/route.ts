import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from '@aws-amplify/api';
import { listTransactionsByUser } from '@/graphql/queries';
import { getCurrentUser } from '@/lib/auth';

const client = generateClient();

// GET /api/users/transactions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const nextToken = searchParams.get('nextToken') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const userId = searchParams.get('userId') || user.id;

    // If requesting transactions for another user, check if current user is a super admin
    if (userId !== user.id && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await client.graphql({
      query: listTransactionsByUser,
      variables: {
        userId,
        limit,
        nextToken,
        startDate,
        endDate
      }
    });

    return NextResponse.json(response.data.listTransactionsByUser);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
