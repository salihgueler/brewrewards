# BrewRewards Permission System

This document provides a detailed overview of the permission system in BrewRewards, explaining how permissions are defined, assigned, and checked throughout the application.

## Table of Contents

1. [Permission Structure](#permission-structure)
2. [Default Role Permissions](#default-role-permissions)
3. [Staff Role Permissions](#staff-role-permissions)
4. [Permission Checking](#permission-checking)
5. [Permission-Based UI](#permission-based-ui)
6. [Adding New Permissions](#adding-new-permissions)
7. [Permission Best Practices](#permission-best-practices)

## Permission Structure

### Permission Enum

Permissions are defined as string constants in the `Permission` enum in `lib/permissions.ts`:

```typescript
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
```

### Permission Naming Convention

Permissions follow a `verb:noun` naming convention:

- The verb indicates the action (e.g., `create`, `view`, `manage`)
- The noun indicates the resource (e.g., `transaction`, `customers`, `menu`)

This makes permissions intuitive and easy to understand.

## Default Role Permissions

### Role-Based Default Permissions

Each user role has a default set of permissions defined in the `DEFAULT_PERMISSIONS` object:

```typescript
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
```

### Role Hierarchy

- **Super Admin**: Has all permissions
- **Shop Admin**: Has all permissions within their shop
- **Shop Staff**: Has a limited set of permissions based on their staff role
- **Customer**: Has no administrative permissions

## Staff Role Permissions

### Predefined Staff Roles

Shop staff members can have different roles, each with a specific set of permissions:

```typescript
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
```

### Staff Role Responsibilities

1. **Manager**:
   - Can manage most aspects of the shop
   - Can view staff and settings
   - Cannot manage staff or settings (reserved for shop admin)

2. **Barista**:
   - Can create transactions
   - Can view and manage customer loyalty
   - Can view the menu but not modify it

3. **Cashier**:
   - Limited to basic transaction operations
   - Can view customers but not manage loyalty
   - Can view the menu but not modify it

## Permission Checking

### Permission User Interface

The permission system uses a `PermissionUser` interface to represent users with permissions:

```typescript
export interface PermissionUser {
  id: string;
  role: UserRole;
  permissions?: string[];
  shopId?: string;
}
```

### Permission Check Functions

The system provides three main functions for checking permissions:

1. **hasPermission**: Checks if a user has a specific permission

```typescript
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
```

2. **hasAllPermissions**: Checks if a user has all of the specified permissions

```typescript
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
```

3. **hasAnyPermission**: Checks if a user has any of the specified permissions

```typescript
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
```

## Permission-Based UI

### PermissionGate Component

The `PermissionGate` component in `components/ui/permission-gate.tsx` conditionally renders UI elements based on user permissions:

```tsx
<PermissionGate permission={Permission.MANAGE_MENU}>
  <Button>Edit Menu</Button>
</PermissionGate>
```

### Multiple Permission Modes

The component supports different permission checking modes:

```tsx
// Check for a single permission
<PermissionGate permission={Permission.MANAGE_MENU}>
  <MenuEditor />
</PermissionGate>

// Check for any of the specified permissions
<PermissionGate anyPermission={[Permission.MANAGE_MENU, Permission.VIEW_MENU]}>
  <MenuComponent />
</PermissionGate>

// Check for all of the specified permissions
<PermissionGate allPermissions={[Permission.VIEW_CUSTOMERS, Permission.MANAGE_CUSTOMER_LOYALTY]}>
  <CustomerLoyaltyEditor />
</PermissionGate>

// Check for specific roles
<PermissionGate allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SHOP_ADMIN]}>
  <AdminPanel />
</PermissionGate>
```

### Fallback Content

The component can display alternative content when the user doesn't have the required permissions:

```tsx
<PermissionGate 
  permission={Permission.MANAGE_MENU}
  fallback={<p>You don't have permission to edit the menu</p>}
>
  <MenuEditor />
</PermissionGate>
```

## Adding New Permissions

### Steps to Add a New Permission

1. Add the permission to the `Permission` enum in `lib/permissions.ts`:

```typescript
export enum Permission {
  // Existing permissions...
  
  // New permission
  EXPORT_REPORTS = 'export:reports',
}
```

2. Update the default permissions for relevant roles:

```typescript
export const DEFAULT_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.SHOP_ADMIN]: Object.values(Permission),
  [UserRole.SHOP_STAFF]: [
    // Existing permissions...
    
    // Add to staff default permissions if appropriate
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.CUSTOMER]: [],
};
```

3. Update staff role permissions if appropriate:

```typescript
export const STAFF_ROLE_PERMISSIONS = {
  MANAGER: [
    // Existing permissions...
    
    // Add to manager permissions
    Permission.EXPORT_REPORTS,
  ],
  BARISTA: [
    // Existing permissions...
  ],
  CASHIER: [
    // Existing permissions...
  ],
};
```

4. Use the new permission in API routes and UI components:

```typescript
// In API route
if (!hasPermission(user, Permission.EXPORT_REPORTS)) {
  return NextResponse.json(
    { error: 'Forbidden: You do not have permission to export reports' },
    { status: 403 }
  );
}

// In UI component
<PermissionGate permission={Permission.EXPORT_REPORTS}>
  <ExportButton />
</PermissionGate>
```

## Permission Best Practices

### Granular Permissions

Define permissions at a granular level to allow for flexible role configurations:

- Separate `VIEW` and `MANAGE` permissions for resources
- Create specific permissions for sensitive operations
- Avoid overly broad permissions

### Permission Grouping

Group related permissions for better organization and management:

- Transaction-related permissions
- Customer-related permissions
- Menu-related permissions
- etc.

### Permission Naming

Follow consistent naming conventions:

- Use `verb:noun` format
- Use clear and descriptive names
- Be consistent with similar permissions

### Permission Checking

Implement permission checks at multiple levels:

- API route level for backend security
- UI component level for better user experience
- Middleware level for consistent enforcement

### Permission Documentation

Document all permissions clearly:

- What the permission allows
- Which roles have the permission by default
- Which components and routes use the permission
- Any dependencies between permissions
