import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/types';
import { AccessUser, canAccessShop, canModifyShop } from '@/lib/shop-access';
import { Permission, STAFF_ROLE_PERMISSIONS } from '@/lib/permissions';

/**
 * API endpoint to manage a shop's staff members
 * Protected by middleware for authentication and role-based access
 */

// Get staff members for a shop
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Get user from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const userShopId = req.headers.get('x-user-shop-id');
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user: AccessUser = {
      id: userId,
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
    
    // Only shop admins and super admins can view staff
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.SHOP_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view staff' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would fetch from a database with filtering
    // For now, we'll return mock data
    const staffMembers = [
      {
        id: 'user_4',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Williams',
        role: UserRole.SHOP_STAFF,
        shopId,
        staffRole: 'MANAGER',
        permissions: STAFF_ROLE_PERMISSIONS.MANAGER,
        createdAt: '2025-02-20T00:00:00Z',
        updatedAt: '2025-02-20T00:00:00Z',
      },
      {
        id: 'user_5',
        email: 'mike@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: UserRole.SHOP_STAFF,
        shopId,
        staffRole: 'BARISTA',
        permissions: STAFF_ROLE_PERMISSIONS.BARISTA,
        createdAt: '2025-02-25T00:00:00Z',
        updatedAt: '2025-02-25T00:00:00Z',
      },
      {
        id: 'user_6',
        email: 'lisa@example.com',
        firstName: 'Lisa',
        lastName: 'Chen',
        role: UserRole.SHOP_STAFF,
        shopId,
        staffRole: 'CASHIER',
        permissions: STAFF_ROLE_PERMISSIONS.CASHIER,
        createdAt: '2025-03-01T00:00:00Z',
        updatedAt: '2025-03-01T00:00:00Z',
      },
    ];
    
    // Filter by search term if provided
    const filteredStaff = search
      ? staffMembers.filter(staff => 
          `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          staff.email.toLowerCase().includes(search.toLowerCase())
        )
      : staffMembers;
    
    // Paginate results
    const paginatedStaff = filteredStaff.slice((page - 1) * limit, page * limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedStaff,
      pagination: {
        page,
        limit,
        total: filteredStaff.length,
        totalPages: Math.ceil(filteredStaff.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching staff' },
      { status: 500 }
    );
  }
}

// Add a new staff member
export async function POST(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const { email, firstName, lastName, staffRole, permissions } = await req.json();
    
    // Get user from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const userShopId = req.headers.get('x-user-shop-id');
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user: AccessUser = {
      id: userId,
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
    if (!email || !firstName || !lastName || !staffRole) {
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
    
    // In a real implementation, this would create a user in Cognito and save to a database
    // For now, we'll return mock data
    const newStaffMember = {
      id: `user_${Date.now()}`,
      email,
      firstName,
      lastName,
      role: UserRole.SHOP_STAFF,
      shopId,
      staffRole,
      permissions: staffPermissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Staff member added successfully',
      data: newStaffMember,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding staff member:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding the staff member' },
      { status: 500 }
    );
  }
}
