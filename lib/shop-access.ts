import { UserRole } from './types';

/**
 * Interface for the user extracted from request or session
 */
export interface AccessUser {
  id: string;
  role: UserRole;
  shopId?: string;
}

/**
 * Check if a user can access a specific shop's data
 * @param user - The user attempting to access the data
 * @param shopId - The shop ID being accessed
 * @returns Boolean indicating if access is allowed
 */
export function canAccessShop(user: AccessUser, shopId: string): boolean {
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

  // Customers can access shops they're associated with
  // This would typically involve checking if the customer has any loyalty or transaction
  // history with the shop, but for simplicity we'll just check if they have a shopId
  if (user.role === UserRole.CUSTOMER && user.shopId === shopId) {
    return true;
  }

  return false;
}

/**
 * Get the shops a user can access
 * @param user - The user
 * @param allShops - All available shops
 * @returns Array of shop IDs the user can access
 */
export function getAccessibleShops(user: AccessUser, allShops: string[]): string[] {
  if (!user) {
    return [];
  }

  // Super admins can access all shops
  if (user.role === UserRole.SUPER_ADMIN) {
    return allShops;
  }

  // Shop admins and staff can only access their own shop
  if (
    (user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SHOP_STAFF) &&
    user.shopId
  ) {
    return [user.shopId];
  }

  // For customers, we would typically return shops they have interacted with
  // For simplicity, we'll just return their associated shop if any
  if (user.role === UserRole.CUSTOMER && user.shopId) {
    return [user.shopId];
  }

  return [];
}

/**
 * Filter data by shop access
 * @param user - The user accessing the data
 * @param data - Array of data objects with shopId property
 * @returns Filtered array containing only data the user can access
 */
export function filterDataByShopAccess<T extends { shopId: string }>(
  user: AccessUser,
  data: T[]
): T[] {
  if (!user) {
    return [];
  }

  // Super admins can access all data
  if (user.role === UserRole.SUPER_ADMIN) {
    return data;
  }

  // Other users can only access data from their shop
  return data.filter(item => {
    if (user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SHOP_STAFF) {
      return item.shopId === user.shopId;
    }
    
    // For customers, we might have additional logic
    if (user.role === UserRole.CUSTOMER) {
      return item.shopId === user.shopId;
    }
    
    return false;
  });
}

/**
 * Check if a user can modify a specific shop's data
 * @param user - The user attempting to modify the data
 * @param shopId - The shop ID being modified
 * @returns Boolean indicating if modification is allowed
 */
export function canModifyShop(user: AccessUser, shopId: string): boolean {
  if (!user) {
    return false;
  }

  // Super admins can modify any shop
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Shop admins can only modify their own shop
  if (user.role === UserRole.SHOP_ADMIN && user.shopId === shopId) {
    return true;
  }

  // Shop staff and customers cannot modify shop data
  return false;
}
