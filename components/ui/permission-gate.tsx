'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';
import { UserRole } from '@/lib/types';

interface PermissionGateProps {
  /**
   * The permission required to render the children
   */
  permission?: Permission;
  
  /**
   * Array of permissions where any one is sufficient to render the children
   */
  anyPermission?: Permission[];
  
  /**
   * Array of permissions where all are required to render the children
   */
  allPermissions?: Permission[];
  
  /**
   * Array of roles that are allowed to render the children
   */
  allowedRoles?: UserRole[];
  
  /**
   * Content to render when the user has the required permissions
   */
  children: ReactNode;
  
  /**
   * Optional content to render when the user doesn't have the required permissions
   */
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions
 */
export function PermissionGate({
  permission,
  anyPermission,
  allPermissions,
  allowedRoles,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, don't render anything
  if (isLoading) {
    return null;
  }
  
  // If no user is authenticated, render fallback
  if (!user) {
    return <>{fallback}</>;
  }
  
  // Super admins can access everything
  if (user.role === UserRole.SUPER_ADMIN) {
    return <>{children}</>;
  }
  
  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as UserRole)) {
      return <>{fallback}</>;
    }
  }
  
  // Check permission-based access
  if (permission || anyPermission || allPermissions) {
    const permissionUser = {
      id: user.id,
      role: user.role as UserRole,
      permissions: user.permissions || [],
      shopId: user.shopId,
    };
    
    // Check single permission
    if (permission && !hasPermission(permissionUser, permission)) {
      return <>{fallback}</>;
    }
    
    // Check if user has any of the specified permissions
    if (anyPermission && !hasAnyPermission(permissionUser, anyPermission)) {
      return <>{fallback}</>;
    }
    
    // Check if user has all of the specified permissions
    if (allPermissions && !hasAllPermissions(permissionUser, allPermissions)) {
      return <>{fallback}</>;
    }
  }
  
  // User has the required permissions, render children
  return <>{children}</>;
}
