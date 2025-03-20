import { NextRequest, NextResponse } from 'next/server';
import { Permission, hasPermission, hasAnyPermission } from '@/lib/permissions';
import { UserRole } from '@/lib/types';

/**
 * Middleware to check if a user has a specific permission
 * @param req - The incoming request
 * @param permission - The permission to check for
 * @returns NextResponse
 */
export function checkPermission(req: NextRequest, permission: Permission): NextResponse | null {
  // Get user from request headers (set by auth middleware)
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role') as UserRole;
  const userPermissions = req.headers.get('x-user-permissions');
  
  if (!userId || !userRole) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Super admins and shop admins have all permissions
  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.SHOP_ADMIN) {
    return null; // Allow the request to continue
  }
  
  // Parse permissions from header
  let permissions: string[] = [];
  if (userPermissions) {
    try {
      permissions = JSON.parse(userPermissions);
    } catch (error) {
      console.error('Error parsing user permissions:', error);
    }
  }
  
  // Check if the user has the required permission
  if (!permissions.includes(permission)) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Allow the request to continue
  return null;
}

/**
 * Middleware to check if a user has any of the specified permissions
 * @param req - The incoming request
 * @param permissions - The permissions to check for
 * @returns NextResponse
 */
export function checkAnyPermission(req: NextRequest, permissions: Permission[]): NextResponse | null {
  // Get user from request headers (set by auth middleware)
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role') as UserRole;
  const userPermissions = req.headers.get('x-user-permissions');
  
  if (!userId || !userRole) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Super admins and shop admins have all permissions
  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.SHOP_ADMIN) {
    return null; // Allow the request to continue
  }
  
  // Parse permissions from header
  let parsedPermissions: string[] = [];
  if (userPermissions) {
    try {
      parsedPermissions = JSON.parse(userPermissions);
    } catch (error) {
      console.error('Error parsing user permissions:', error);
    }
  }
  
  // Check if the user has any of the required permissions
  const hasAny = permissions.some(permission => parsedPermissions.includes(permission));
  if (!hasAny) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Allow the request to continue
  return null;
}

/**
 * Middleware factory for routes that require specific permissions
 * @param permission - The permission required to access the route
 */
export function withPermission(permission: Permission) {
  return (req: NextRequest) => {
    return checkPermission(req, permission);
  };
}

/**
 * Middleware factory for routes that require any of the specified permissions
 * @param permissions - The permissions that can grant access to the route
 */
export function withAnyPermission(permissions: Permission[]) {
  return (req: NextRequest) => {
    return checkAnyPermission(req, permissions);
  };
}
