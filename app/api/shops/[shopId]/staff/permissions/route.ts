import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/types';
import { AccessUser, canAccessShop } from '@/lib/shop-access';
import { Permission, STAFF_ROLE_PERMISSIONS } from '@/lib/permissions';

/**
 * API endpoint to get available permissions and staff roles
 * Protected by middleware for authentication and role-based access
 */

export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    
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
    
    // Only shop admins and super admins can view permissions
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.SHOP_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view staff permissions' },
        { status: 403 }
      );
    }
    
    // Format permissions for the frontend
    const permissionGroups = [
      {
        name: 'Transactions',
        permissions: [
          { id: Permission.CREATE_TRANSACTION, label: 'Create Transactions' },
          { id: Permission.VIEW_TRANSACTIONS, label: 'View Transactions' },
        ],
      },
      {
        name: 'Customers',
        permissions: [
          { id: Permission.VIEW_CUSTOMERS, label: 'View Customers' },
          { id: Permission.MANAGE_CUSTOMER_LOYALTY, label: 'Manage Customer Loyalty' },
        ],
      },
      {
        name: 'Menu',
        permissions: [
          { id: Permission.VIEW_MENU, label: 'View Menu' },
          { id: Permission.MANAGE_MENU, label: 'Manage Menu' },
        ],
      },
      {
        name: 'Loyalty Programs',
        permissions: [
          { id: Permission.VIEW_LOYALTY_PROGRAMS, label: 'View Loyalty Programs' },
          { id: Permission.MANAGE_LOYALTY_PROGRAMS, label: 'Manage Loyalty Programs' },
        ],
      },
      {
        name: 'Staff',
        permissions: [
          { id: Permission.VIEW_STAFF, label: 'View Staff' },
          { id: Permission.MANAGE_STAFF, label: 'Manage Staff' },
        ],
      },
      {
        name: 'Settings',
        permissions: [
          { id: Permission.VIEW_SETTINGS, label: 'View Settings' },
          { id: Permission.MANAGE_SETTINGS, label: 'Manage Settings' },
        ],
      },
    ];
    
    // Format staff roles for the frontend
    const staffRoles = [
      {
        id: 'MANAGER',
        name: 'Manager',
        description: 'Can manage most aspects of the shop',
        permissions: STAFF_ROLE_PERMISSIONS.MANAGER,
      },
      {
        id: 'BARISTA',
        name: 'Barista',
        description: 'Can create transactions and manage customer loyalty',
        permissions: STAFF_ROLE_PERMISSIONS.BARISTA,
      },
      {
        id: 'CASHIER',
        name: 'Cashier',
        description: 'Can create transactions and view customers',
        permissions: STAFF_ROLE_PERMISSIONS.CASHIER,
      },
    ];
    
    return NextResponse.json({
      success: true,
      data: {
        permissionGroups,
        staffRoles,
        allPermissions: Object.values(Permission),
      },
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching permissions' },
      { status: 500 }
    );
  }
}
