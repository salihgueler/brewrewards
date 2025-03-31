import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from '@aws-amplify/api';
import { getStaffMember, getStaffInvitation } from '@/graphql/queries';
import { updateStaffMember, deleteStaffMember, resendStaffInvitation } from '@/graphql/mutations';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

const client = generateClient();

// GET /api/shops/[shopId]/staff/[staffId]
export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string; staffId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, staffId } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'member';

    // Check if user has permission to view staff
    if (!hasPermission(user, 'VIEW_STAFF', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let response;
    if (type === 'invitation') {
      response = await client.graphql({
        query: getStaffInvitation,
        variables: { id: staffId }
      });
      
      // Verify the invitation belongs to the shop
      if (response.data.getStaffInvitation?.shopId !== shopId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      
      return NextResponse.json(response.data.getStaffInvitation);
    } else {
      response = await client.graphql({
        query: getStaffMember,
        variables: { id: staffId }
      });
      
      // Verify the staff member belongs to the shop
      if (response.data.getStaffMember?.shopId !== shopId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      
      return NextResponse.json(response.data.getStaffMember);
    }
  } catch (error) {
    console.error('Error fetching staff details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff details' },
      { status: 500 }
    );
  }
}

// PATCH /api/shops/[shopId]/staff/[staffId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { shopId: string; staffId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, staffId } = params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'member';

    // Check if user has permission to update staff
    if (!hasPermission(user, 'MANAGE_STAFF', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (type === 'invitation') {
      // Resend invitation
      const response = await client.graphql({
        query: resendStaffInvitation,
        variables: { id: staffId }
      });
      
      // Verify the invitation belongs to the shop
      if (response.data.resendStaffInvitation?.shopId !== shopId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      
      return NextResponse.json(response.data.resendStaffInvitation);
    } else {
      // Update staff member
      const response = await client.graphql({
        query: updateStaffMember,
        variables: {
          input: {
            id: staffId,
            shopId,
            role: body.role,
            permissions: body.permissions,
            isActive: body.isActive
          }
        }
      });
      
      return NextResponse.json(response.data.updateStaffMember);
    }
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

// DELETE /api/shops/[shopId]/staff/[staffId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shopId: string; staffId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, staffId } = params;

    // Check if user has permission to delete staff
    if (!hasPermission(user, 'MANAGE_STAFF', shopId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await client.graphql({
      query: deleteStaffMember,
      variables: { id: staffId, shopId }
    });

    return NextResponse.json(response.data.deleteStaffMember);
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
