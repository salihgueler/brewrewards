import { StaffMember, StaffInvitation, StaffRole } from '@/lib/types';

/**
 * Fetch staff members for a shop
 */
export async function getStaffMembers(shopId: string): Promise<StaffMember[]> {
  try {
    const response = await fetch(`/api/shops/${shopId}/staff`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch staff members');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching staff members:', error);
    throw error;
  }
}

/**
 * Fetch staff invitations for a shop
 */
export async function getStaffInvitations(
  shopId: string,
  status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
): Promise<StaffInvitation[]> {
  try {
    const url = new URL(`/api/shops/${shopId}/staff`, window.location.origin);
    url.searchParams.append('type', 'invitations');
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch staff invitations');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching staff invitations:', error);
    throw error;
  }
}

/**
 * Create a staff invitation
 */
export async function createStaffInvitation(
  shopId: string,
  email: string,
  role: StaffRole,
  permissions: string[]
): Promise<StaffInvitation> {
  try {
    const response = await fetch(`/api/shops/${shopId}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role,
        permissions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create staff invitation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating staff invitation:', error);
    throw error;
  }
}

/**
 * Update a staff member
 */
export async function updateStaffMember(
  shopId: string,
  staffId: string,
  updates: {
    role?: StaffRole;
    permissions?: string[];
    isActive?: boolean;
  }
): Promise<StaffMember> {
  try {
    const response = await fetch(`/api/shops/${shopId}/staff/${staffId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update staff member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
}

/**
 * Delete a staff member
 */
export async function deleteStaffMember(
  shopId: string,
  staffId: string
): Promise<{ id: string; shopId: string }> {
  try {
    const response = await fetch(`/api/shops/${shopId}/staff/${staffId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete staff member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting staff member:', error);
    throw error;
  }
}

/**
 * Resend a staff invitation
 */
export async function resendStaffInvitation(
  shopId: string,
  invitationId: string
): Promise<StaffInvitation> {
  try {
    const response = await fetch(`/api/shops/${shopId}/staff/${invitationId}?type=invitation`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to resend invitation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error resending staff invitation:', error);
    throw error;
  }
}

/**
 * Cancel a staff invitation
 */
export async function cancelStaffInvitation(
  shopId: string,
  invitationId: string
): Promise<StaffInvitation> {
  try {
    const response = await fetch(`/api/shops/${shopId}/staff?type=invitation&id=${invitationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel invitation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling staff invitation:', error);
    throw error;
  }
}

/**
 * Accept a staff invitation
 */
export async function acceptStaffInvitation(
  invitationId: string
): Promise<StaffMember> {
  try {
    const response = await fetch(`/api/invitations/${invitationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'accept' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to accept invitation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting staff invitation:', error);
    throw error;
  }
}

/**
 * Decline a staff invitation
 */
export async function declineStaffInvitation(
  invitationId: string
): Promise<StaffInvitation> {
  try {
    const response = await fetch(`/api/invitations/${invitationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'decline' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to decline invitation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error declining staff invitation:', error);
    throw error;
  }
}
