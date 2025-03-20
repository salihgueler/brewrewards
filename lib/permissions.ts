import { UserRole } from './types';

/**
 * Permission types for shop staff
 */
export enum Permission {
  // Transaction permissions
  CREATE_TRANSACTION = 'create:transaction',
  VIEW_TRANSACTIONS = 'view:transactions',
  
  // Customer permissions
  VIEW_CUSTOMERS = 'view:customers',
  MANAGE_CUSTOMER_LOYALTY = 'manage:customer_loyalty',
  
  // Menu permissions
  VIEW_MENU = 'view:menu',
  MANAGE_MENU = 'manage:menu',
  
  // Loyalty program permissions
  VIEW_LOYALTY_PROGRAMS = 'view:loyalty_programs',
  MANAGE_LOYALTY_PROGRAMS = 'manage:loyalty_programs',
  
  // Staff permissions
  VIEW_STAFF = 'view:staff',
  MANAGE_STAFF = 'manage:staff',
  
  // Shop settings permissions
  VIEW_SETTINGS = 'view:settings',
  MANAGE_SETTINGS = 'manage:settings',
}

/**
 * Default permission sets for different roles
 */
export const DEFAULT_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.SHOP_ADMIN]: Object.values(Permission),
  [UserRole.SHOP_STAFF]: [
    Permission.CREATE_TRANSACTION,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMER_LOYALTY,
    Permission.VIEW_MENU,
    Permission.VIEW_LOYALTY_PROGRAMS,
  ],
  [UserRole.CUSTOMER]: [],
};

/**
 * Permission sets for different staff roles
 */
export const STAFF_ROLE_PERMISSIONS = {
  MANAGER: [
    Permission.CREATE_TRANSACTION,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMER_LOYALTY,
    Permission.VIEW_MENU,
    Permission.MANAGE_MENU,
    Permission.VIEW_LOYALTY_PROGRAMS,
    Permission.VIEW_STAFF,
    Permission.VIEW_SETTINGS,
  ],
  BARISTA: [
    Permission.CREATE_TRANSACTION,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_CUSTOMER_LOYALTY,
    Permission.VIEW_MENU,
  ],
  CASHIER: [
    Permission.CREATE_TRANSACTION,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_MENU,
  ],
};

/**
 * Interface for a user with permissions
 */
export interface PermissionUser {
  id: string;
  role: UserRole;
  permissions?: string[];
  shopId?: string;
}

/**
 * Check if a user has a specific permission
 * @param user - The user to check
 * @param permission - The permission to check for
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(user: PermissionUser, permission: Permission): boolean {
  if (!user) {
    return false;
  }

  // Super admins and shop admins have all permissions
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SHOP_ADMIN) {
    return true;
  }

  // Check if the user has the specific permission
  return user.permissions?.includes(permission) || false;
}

/**
 * Check if a user has all of the specified permissions
 * @param user - The user to check
 * @param permissions - The permissions to check for
 * @returns Boolean indicating if the user has all the permissions
 */
export function hasAllPermissions(user: PermissionUser, permissions: Permission[]): boolean {
  if (!user) {
    return false;
  }

  // Super admins and shop admins have all permissions
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SHOP_ADMIN) {
    return true;
  }

  // Check if the user has all the specified permissions
  return permissions.every(permission => user.permissions?.includes(permission));
}

/**
 * Check if a user has any of the specified permissions
 * @param user - The user to check
 * @param permissions - The permissions to check for
 * @returns Boolean indicating if the user has any of the permissions
 */
export function hasAnyPermission(user: PermissionUser, permissions: Permission[]): boolean {
  if (!user) {
    return false;
  }

  // Super admins and shop admins have all permissions
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SHOP_ADMIN) {
    return true;
  }

  // Check if the user has any of the specified permissions
  return permissions.some(permission => user.permissions?.includes(permission));
}
