/**
 * User roles in the system
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SHOP_ADMIN = 'SHOP_ADMIN',
  SHOP_STAFF = 'SHOP_STAFF',
  CUSTOMER = 'CUSTOMER',
}

/**
 * Permission types for different actions
 */
export enum Permission {
  // Shop permissions
  CREATE_SHOP = 'CREATE_SHOP',
  READ_SHOP = 'READ_SHOP',
  UPDATE_SHOP = 'UPDATE_SHOP',
  DELETE_SHOP = 'DELETE_SHOP',
  
  // Menu permissions
  CREATE_MENU_ITEM = 'CREATE_MENU_ITEM',
  READ_MENU_ITEM = 'READ_MENU_ITEM',
  UPDATE_MENU_ITEM = 'UPDATE_MENU_ITEM',
  DELETE_MENU_ITEM = 'DELETE_MENU_ITEM',
  
  // Loyalty program permissions
  CREATE_LOYALTY_PROGRAM = 'CREATE_LOYALTY_PROGRAM',
  READ_LOYALTY_PROGRAM = 'READ_LOYALTY_PROGRAM',
  UPDATE_LOYALTY_PROGRAM = 'UPDATE_LOYALTY_PROGRAM',
  DELETE_LOYALTY_PROGRAM = 'DELETE_LOYALTY_PROGRAM',
  
  // User permissions
  CREATE_USER = 'CREATE_USER',
  READ_USER = 'READ_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  
  // Transaction permissions
  CREATE_TRANSACTION = 'CREATE_TRANSACTION',
  READ_TRANSACTION = 'READ_TRANSACTION',
  
  // Reward permissions
  REDEEM_REWARD = 'REDEEM_REWARD',
  ISSUE_REWARD = 'ISSUE_REWARD',
}

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  
  [UserRole.SHOP_ADMIN]: [
    // Shop permissions (only their own shop)
    Permission.READ_SHOP,
    Permission.UPDATE_SHOP,
    
    // Menu permissions
    Permission.CREATE_MENU_ITEM,
    Permission.READ_MENU_ITEM,
    Permission.UPDATE_MENU_ITEM,
    Permission.DELETE_MENU_ITEM,
    
    // Loyalty program permissions
    Permission.CREATE_LOYALTY_PROGRAM,
    Permission.READ_LOYALTY_PROGRAM,
    Permission.UPDATE_LOYALTY_PROGRAM,
    Permission.DELETE_LOYALTY_PROGRAM,
    
    // User permissions (only for their shop's users)
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    
    // Transaction permissions
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    
    // Reward permissions
    Permission.ISSUE_REWARD,
  ],
  
  [UserRole.SHOP_STAFF]: [
    // Shop permissions
    Permission.READ_SHOP,
    
    // Menu permissions
    Permission.READ_MENU_ITEM,
    
    // Loyalty program permissions
    Permission.READ_LOYALTY_PROGRAM,
    
    // User permissions (limited)
    Permission.READ_USER,
    
    // Transaction permissions
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    
    // Reward permissions
    Permission.ISSUE_REWARD,
  ],
  
  [UserRole.CUSTOMER]: [
    // Shop permissions
    Permission.READ_SHOP,
    
    // Menu permissions
    Permission.READ_MENU_ITEM,
    
    // Loyalty program permissions
    Permission.READ_LOYALTY_PROGRAM,
    
    // Reward permissions
    Permission.REDEEM_REWARD,
  ],
};

/**
 * Staff role permissions for different staff roles within a shop
 */
export const STAFF_ROLE_PERMISSIONS = {
  MANAGER: [
    Permission.READ_SHOP,
    Permission.UPDATE_SHOP,
    Permission.CREATE_MENU_ITEM,
    Permission.READ_MENU_ITEM,
    Permission.UPDATE_MENU_ITEM,
    Permission.DELETE_MENU_ITEM,
    Permission.CREATE_LOYALTY_PROGRAM,
    Permission.READ_LOYALTY_PROGRAM,
    Permission.UPDATE_LOYALTY_PROGRAM,
    Permission.READ_USER,
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    Permission.ISSUE_REWARD,
  ],
  
  BARISTA: [
    Permission.READ_SHOP,
    Permission.READ_MENU_ITEM,
    Permission.READ_LOYALTY_PROGRAM,
    Permission.READ_USER,
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    Permission.ISSUE_REWARD,
  ],
  
  CASHIER: [
    Permission.READ_SHOP,
    Permission.READ_MENU_ITEM,
    Permission.READ_LOYALTY_PROGRAM,
    Permission.CREATE_TRANSACTION,
    Permission.READ_TRANSACTION,
    Permission.ISSUE_REWARD,
  ],
};
