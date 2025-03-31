import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from '@aws-amplify/api';
import { listStaffMembers, listStaffInvitations } from '@/graphql/queries';
import { createStaffInvitation, updateStaffMember, deleteStaffMember, resendStaffInvitation, cancelStaffInvitation } from '@/graphql/mutations';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

const client = generateClient();

// GET /api/shops/[shopId]/staff
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
    const type = searchParams.get('type') || 'members';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const nextToken = searchParams.get('nextToken') || undefined;

    // Check if user has permission to view staff
    if (!hasPermission(user, 'VIEW_STAFF', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let response;
    if (type === 'invitations') {
      response = await client.graphql({
        query: listStaffInvitations,
        variables: {
          shopId,
          status,
          limit,
          nextToken
        }
      });
      return NextResponse.json(response.data.listStaffInvitations);
    } else {
      response = await client.graphql({
        query: listStaffMembers,
        variables: {
          shopId,
          limit,
          nextToken
        }
      });
      return NextResponse.json(response.data.listStaffMembers);
    }
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST /api/shops/[shopId]/staff
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

    // Check if user has permission to create staff invitations
    if (!hasPermission(user, 'MANAGE_STAFF', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await client.graphql({
      query: createStaffInvitation,
      variables: {
        input: {
          shopId,
          email: body.email,
          role: body.role,
          permissions: body.permissions || []
        }
      }
    });

    return NextResponse.json(response.data.createStaffInvitation, { status: 201 });
  } catch (error) {
    console.error('Error creating staff invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create staff invitation' },
      { status: 500 }
    );
  }
}

// PATCH /api/shops/[shopId]/staff
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

    // Check if user has permission to update staff
    if (!hasPermission(user, 'MANAGE_STAFF', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!body.id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const response = await client.graphql({
      query: updateStaffMember,
      variables: {
        input: {
          id: body.id,
          shopId,
          role: body.role,
          permissions: body.permissions,
          isActive: body.isActive
        }
      }
    });

    return NextResponse.json(response.data.updateStaffMember);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/shops/[shopId]/staff
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
    const type = searchParams.get('type') || 'member';

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if user has permission to delete staff
    if (!hasPermission(user, 'MANAGE_STAFF', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let response;
    if (type === 'invitation') {
      response = await client.graphql({
        query: cancelStaffInvitation,
        variables: { id }
      });
      return NextResponse.json(response.data.cancelStaffInvitation);
    } else {
      response = await client.graphql({
        query: deleteStaffMember,
        variables: { id, shopId }
      });
      return NextResponse.json(response.data.deleteStaffMember);
    }
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}
