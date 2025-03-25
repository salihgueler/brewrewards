/**
 * Permissions system for BrewRewards
 * Defines what actions different user roles can perform
 */

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SHOP_ADMIN = 'SHOP_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface Permission {
  // Shop permissions
  viewShops: boolean;
  viewAllShops: boolean;
  createShop: boolean;
  updateShop: boolean;
  deleteShop: boolean;
  
  // Menu permissions
  viewMenu: boolean;
  createMenuItem: boolean;
  updateMenuItem: boolean;
  deleteMenuItem: boolean;
  
  // Loyalty program permissions
  viewLoyaltyPrograms: boolean;
  createLoyaltyProgram: boolean;
  updateLoyaltyProgram: boolean;
  deleteLoyaltyProgram: boolean;
  
  // Customer permissions
  joinLoyaltyProgram: boolean;
  earnRewards: boolean;
  redeemRewards: boolean;
  viewOwnRewards: boolean;
  
  // User management
  viewUsers: boolean;
  viewAllUsers: boolean;
  createUser: boolean;
  updateUser: boolean;
  deleteUser: boolean;
}

// Define permissions for each role
const permissions: Record<UserRole, Permission> = {
  [UserRole.CUSTOMER]: {
    // Shop permissions
    viewShops: true,
    viewAllShops: false,
    createShop: false,
    updateShop: false,
    deleteShop: false,
    
    // Menu permissions
    viewMenu: true,
    createMenuItem: false,
    updateMenuItem: false,
    deleteMenuItem: false,
    
    // Loyalty program permissions
    viewLoyaltyPrograms: true,
    createLoyaltyProgram: false,
    updateLoyaltyProgram: false,
    deleteLoyaltyProgram: false,
    
    // Customer permissions
    joinLoyaltyProgram: true,
    earnRewards: true,
    redeemRewards: true,
    viewOwnRewards: true,
    
    // User management
    viewUsers: false,
    viewAllUsers: false,
    createUser: false,
    updateUser: false,
    deleteUser: false,
  },
  
  [UserRole.SHOP_ADMIN]: {
    // Shop permissions
    viewShops: true,
    viewAllShops: false,
    createShop: false,
    updateShop: true, // Can update their own shop
    deleteShop: false,
    
    // Menu permissions
    viewMenu: true,
    createMenuItem: true,
    updateMenuItem: true,
    deleteMenuItem: true,
    
    // Loyalty program permissions
    viewLoyaltyPrograms: true,
    createLoyaltyProgram: true,
    updateLoyaltyProgram: true,
    deleteLoyaltyProgram: true,
    
    // Customer permissions
    joinLoyaltyProgram: false,
    earnRewards: false,
    redeemRewards: false,
    viewOwnRewards: false,
    
    // User management
    viewUsers: true, // Can view users of their shop
    viewAllUsers: false,
    createUser: true, // Can create staff accounts
    updateUser: true, // Can update staff accounts
    deleteUser: true, // Can delete staff accounts
  },
  
  [UserRole.SUPER_ADMIN]: {
    // Shop permissions
    viewShops: true,
    viewAllShops: true,
    createShop: true,
    updateShop: true,
    deleteShop: true,
    
    // Menu permissions
    viewMenu: true,
    createMenuItem: true,
    updateMenuItem: true,
    deleteMenuItem: true,
    
    // Loyalty program permissions
    viewLoyaltyPrograms: true,
    createLoyaltyProgram: true,
    updateLoyaltyProgram: true,
    deleteLoyaltyProgram: true,
    
    // Customer permissions
    joinLoyaltyProgram: false,
    earnRewards: false,
    redeemRewards: false,
    viewOwnRewards: false,
    
    // User management
    viewUsers: true,
    viewAllUsers: true,
    createUser: true,
    updateUser: true,
    deleteUser: true,
  },
};

/**
 * Check if a user has a specific permission
 * @param userRole The role of the user
 * @param permission The permission to check
 * @returns boolean indicating if the user has the permission
 */
export function hasPermission(userRole: UserRole, permission: keyof Permission): boolean {
  return permissions[userRole][permission];
}

/**
 * Get all permissions for a specific role
 * @param userRole The role to get permissions for
 * @returns The permission object for the role
 */
export function getRolePermissions(userRole: UserRole): Permission {
  return permissions[userRole];
}
