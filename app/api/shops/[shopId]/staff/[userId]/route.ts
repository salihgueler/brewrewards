import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/types';
import { AccessUser, canAccessShop, canModifyShop } from '@/lib/shop-access';
import { Permission, STAFF_ROLE_PERMISSIONS } from '@/lib/permissions';

/**
 * API endpoint to manage a specific staff member
 * Protected by middleware for authentication and role-based access
 */

// Get staff member details
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string; userId: string } }
) {
  try {
    const { shopId, userId } = params;
    
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
    
    // Only shop admins and super admins can view staff details
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.SHOP_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view staff details' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    const staffMember = {
      id: userId,
      email: 'sarah@example.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      role: UserRole.SHOP_STAFF,
      shopId,
      staffRole: 'MANAGER',
      permissions: STAFF_ROLE_PERMISSIONS.MANAGER,
      createdAt: '2025-02-20T00:00:00Z',
      updatedAt: '2025-02-20T00:00:00Z',
    };
    
    return NextResponse.json({
      success: true,
      data: staffMember,
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the staff member' },
      { status: 500 }
    );
  }
}

// Update staff member
export async function PUT(
  req: NextRequest,
  { params }: { params: { shopId: string; userId: string } }
) {
  try {
    const { shopId, userId } = params;
    const { firstName, lastName, staffRole, permissions } = await req.json();
    
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
    
    // Check if user can modify this shop's data
    if (!canModifyShop(user, shopId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this shop' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!firstName || !lastName || !staffRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate staff role
    if (!['MANAGER', 'BARISTA', 'CASHIER'].includes(staffRole)) {
      return NextResponse.json(
        { error: 'Invalid staff role' },
        { status: 400 }
      );
    }
    
    // Get default permissions for the staff role if not provided
    const staffPermissions = permissions || STAFF_ROLE_PERMISSIONS[staffRole as keyof typeof STAFF_ROLE_PERMISSIONS];
    
    // In a real implementation, this would update in a database
    const updatedStaffMember = {
      id: userId,
      email: 'sarah@example.com', // In a real app, we'd fetch this from the database
      firstName,
      lastName,
      role: UserRole.SHOP_STAFF,
      shopId,
      staffRole,
      permissions: staffPermissions,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully',
      data: updatedStaffMember,
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the staff member' },
      { status: 500 }
    );
  }
}

// Delete staff member
export async function DELETE(
  req: NextRequest,
  { params }: { params: { shopId: string; userId: string } }
) {
  try {
    const { shopId, userId } = params;
    
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
    
    // Check if user can modify this shop's data
    if (!canModifyShop(user, shopId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this shop' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would delete from a database or mark as inactive
    
    return NextResponse.json({
      success: true,
      message: 'Staff member removed successfully',
    });
  } catch (error) {
    console.error('Error removing staff member:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing the staff member' },
      { status: 500 }
    );
  }
}
