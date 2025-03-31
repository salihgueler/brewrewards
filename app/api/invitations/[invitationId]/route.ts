import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from '@aws-amplify/api';
import { getStaffInvitation } from '@/graphql/queries';
import { acceptStaffInvitation, cancelStaffInvitation } from '@/graphql/mutations';
import { getCurrentUser } from '@/lib/auth';

const client = generateClient();

// GET /api/invitations/[invitationId]
export async function GET(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationId } = params;

    const response = await client.graphql({
      query: getStaffInvitation,
      variables: { id: invitationId }
    });

    const invitation = response.data.getStaffInvitation;
    
    // Check if invitation exists
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Check if invitation is for the current user
    if (invitation.email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[invitationId]
export async function POST(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationId } = params;
    const { action } = await request.json();

    // Get the invitation first to verify it's for the current user
    const getResponse = await client.graphql({
      query: getStaffInvitation,
      variables: { id: invitationId }
    });

    const invitation = getResponse.data.getStaffInvitation;
    
    // Check if invitation exists
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Check if invitation is for the current user
    if (invitation.email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if invitation is still valid
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      const response = await client.graphql({
        query: acceptStaffInvitation,
        variables: { id: invitationId }
      });
      
      return NextResponse.json(response.data.acceptStaffInvitation);
    } else if (action === 'decline') {
      const response = await client.graphql({
        query: cancelStaffInvitation,
        variables: { id: invitationId }
      });
      
      return NextResponse.json(response.data.cancelStaffInvitation);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "accept" or "decline"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing invitation:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    );
  }
}
