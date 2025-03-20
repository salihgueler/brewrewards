import { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from './types';

/**
 * Type for API handlers with role-based access control
 */
export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Interface for the user extracted from request headers
 */
export interface RequestUser {
  id: string;
  role: UserRole;
  shopId?: string;
}

/**
 * Extract user information from request headers
 * These headers are set by the auth middleware
 */
export function getUserFromRequest(req: NextApiRequest): RequestUser | null {
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as UserRole;
  const shopId = req.headers['x-user-shop-id'] as string | undefined;

  if (!userId || !userRole) {
    return null;
  }

  return {
    id: userId,
    role: userRole,
    shopId,
  };
}

/**
 * Higher-order function to wrap API handlers with role-based access control
 * @param handler - The API handler function
 * @param allowedRoles - Array of roles allowed to access this endpoint
 * @returns Wrapped handler with role checks
 */
export function withRoleCheck(handler: ApiHandler, allowedRoles: UserRole[]): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User information not found' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Add the user object to the request for use in the handler
    (req as any).user = user;

    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Wrapper for super admin only endpoints
 */
export function withSuperAdminOnly(handler: ApiHandler): ApiHandler {
  return withRoleCheck(handler, [UserRole.SUPER_ADMIN]);
}

/**
 * Wrapper for shop admin endpoints (allows super admins too)
 */
export function withShopAdminOnly(handler: ApiHandler): ApiHandler {
  return withRoleCheck(handler, [UserRole.SUPER_ADMIN, UserRole.SHOP_ADMIN]);
}

/**
 * Wrapper for shop staff endpoints (allows admins too)
 */
export function withShopStaffOnly(handler: ApiHandler): ApiHandler {
  return withRoleCheck(handler, [UserRole.SUPER_ADMIN, UserRole.SHOP_ADMIN, UserRole.SHOP_STAFF]);
}

/**
 * Wrapper for authenticated endpoints (any role)
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return withRoleCheck(handler, [
    UserRole.SUPER_ADMIN,
    UserRole.SHOP_ADMIN,
    UserRole.SHOP_STAFF,
    UserRole.CUSTOMER,
  ]);
}

/**
 * Helper to ensure a shop admin can only access their own shop's data
 * @param req - The API request
 * @param shopId - The shop ID being accessed
 * @returns Boolean indicating if access is allowed
 */
export function canAccessShop(req: NextApiRequest, shopId: string): boolean {
  const user = (req as any).user as RequestUser;
  
  if (!user) {
    return false;
  }

  // Super admins can access any shop
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Shop admins and staff can only access their own shop
  if (
    (user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SHOP_STAFF) &&
    user.shopId === shopId
  ) {
    return true;
  }

  return false;
}
