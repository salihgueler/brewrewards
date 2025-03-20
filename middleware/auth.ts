import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt-validator';
import { AuditLogger, AuditLogCategory, AuditLogSeverity } from '@/lib/audit-logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { UserRole } from '@/lib/types';

// Types for the middleware
interface AuthMiddlewareOptions {
  requiredRoles?: string[];
  requireAuth?: boolean;
  sensitiveOperation?: boolean;
}

// Default options
const defaultOptions: AuthMiddlewareOptions = {
  requireAuth: true,
  requiredRoles: [],
  sensitiveOperation: false,
};

/**
 * Middleware to validate JWT tokens and check user roles
 * @param req - The incoming request
 * @param options - Options for the middleware
 * @returns NextResponse
 */
export async function authMiddleware(
  req: NextRequest,
  options: AuthMiddlewareOptions = defaultOptions
): Promise<NextResponse> {
  const mergedOptions = { ...defaultOptions, ...options };
  const { requiredRoles, requireAuth, sensitiveOperation } = mergedOptions;

  // Skip auth check if not required
  if (!requireAuth) {
    return NextResponse.next();
  }

  // Get client IP for rate limiting and audit logging
  const clientIp = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   '127.0.0.1';
  
  // Get user agent for audit logging
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  // Apply rate limiting based on IP address
  const rateLimitKey = `auth:${clientIp}`;
  const rateLimitConfig = sensitiveOperation ? RATE_LIMITS.API_SENSITIVE : RATE_LIMITS.API_GENERAL;
  const rateLimitResult = checkRateLimit(rateLimitKey, rateLimitConfig);

  if (!rateLimitResult.allowed) {
    // Log rate limit exceeded
    await AuditLogger.getInstance().log({
      action: 'Rate limit exceeded',
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.WARNING,
      ipAddress: clientIp,
      userAgent,
      status: 'FAILURE',
      details: {
        path: req.nextUrl.pathname,
        resetAt: rateLimitResult.resetAt,
      },
    });

    return NextResponse.json(
      { 
        error: 'Too many requests', 
        resetAt: rateLimitResult.resetAt.toISOString() 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimitConfig.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt.getTime() / 1000).toString(),
        }
      }
    );
  }

  // Get the authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await AuditLogger.getInstance().log({
      action: 'Missing or invalid authorization header',
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.WARNING,
      ipAddress: clientIp,
      userAgent,
      status: 'FAILURE',
      details: {
        path: req.nextUrl.pathname,
      },
    });

    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    await AuditLogger.getInstance().log({
      action: 'Missing token',
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.WARNING,
      ipAddress: clientIp,
      userAgent,
      status: 'FAILURE',
      details: {
        path: req.nextUrl.pathname,
      },
    });

    return NextResponse.json(
      { error: 'Unauthorized: Missing token' },
      { status: 401 }
    );
  }

  try {
    // Verify the JWT token using our enhanced validator
    const { payload } = await verifyToken(token);

    // Check if the token has the required claims
    if (!payload.sub || !payload['custom:userRole']) {
      await AuditLogger.getInstance().log({
        action: 'Invalid token claims',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.WARNING,
        ipAddress: clientIp,
        userAgent,
        status: 'FAILURE',
        details: {
          path: req.nextUrl.pathname,
          missingClaims: !payload.sub ? 'sub' : 'custom:userRole',
        },
      });

      return NextResponse.json(
        { error: 'Unauthorized: Invalid token claims' },
        { status: 401 }
      );
    }

    // Check if the user has the required role
    const userRole = payload['custom:userRole'] as string;
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      await AuditLogger.getInstance().logAccessDenied(
        payload.sub as string,
        userRole as UserRole,
        'access protected route',
        req.nextUrl.pathname,
        clientIp
      );

      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Log successful authentication
    await AuditLogger.getInstance().log({
      userId: payload.sub as string,
      userRole: userRole as UserRole,
      action: 'Authenticated successfully',
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.INFO,
      ipAddress: clientIp,
      userAgent,
      status: 'SUCCESS',
      details: {
        path: req.nextUrl.pathname,
      },
    });

    // Add user info to the request for downstream handlers
    const requestWithUser = req.clone();
    // In Next.js middleware, we can't modify the request object directly
    // So we'll add the user info to headers that can be read by API routes
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.sub as string);
    headers.set('x-user-role', userRole);
    
    // Add shop ID if available
    if (payload['custom:shopId']) {
      headers.set('x-user-shop-id', payload['custom:shopId'] as string);
    }
    
    // Add staff role if available
    if (payload['custom:staffRole']) {
      headers.set('x-user-staff-role', payload['custom:staffRole'] as string);
    }
    
    // Add permissions if available
    if (payload['custom:permissions']) {
      headers.set('x-user-permissions', payload['custom:permissions'] as string);
    } else if (userRole === 'SHOP_STAFF' && payload['custom:staffRole']) {
      // If permissions aren't explicitly set but we have a staff role,
      // we can use the default permissions for that role
      // In a real implementation, this would be handled more robustly
      const staffRole = payload['custom:staffRole'] as string;
      const defaultPermissions = {
        'MANAGER': ['create:transaction', 'view:transactions', 'view:customers', 'manage:customer_loyalty', 'view:menu', 'manage:menu', 'view:loyalty_programs', 'view:staff', 'view:settings'],
        'BARISTA': ['create:transaction', 'view:transactions', 'view:customers', 'manage:customer_loyalty', 'view:menu'],
        'CASHIER': ['create:transaction', 'view:transactions', 'view:customers', 'view:menu'],
      };
      
      if (staffRole in defaultPermissions) {
        headers.set('x-user-permissions', JSON.stringify(defaultPermissions[staffRole as keyof typeof defaultPermissions]));
      }
    }

    // Add rate limit headers
    headers.set('X-RateLimit-Limit', rateLimitConfig.limit.toString());
    headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetAt.getTime() / 1000).toString());

    // Continue to the next middleware or API route
    return NextResponse.next({
      request: {
        headers,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    
    await AuditLogger.getInstance().log({
      action: 'Token verification failed',
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.WARNING,
      ipAddress: clientIp,
      userAgent,
      status: 'FAILURE',
      details: {
        path: req.nextUrl.pathname,
        error: (error as Error).message,
      },
    });

    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }
}

/**
 * Middleware factory for routes that require super admin access
 */
export function withSuperAdminAuth() {
  return (req: NextRequest) =>
    authMiddleware(req, {
      requiredRoles: ['SUPER_ADMIN'],
      sensitiveOperation: true,
    });
}

/**
 * Middleware factory for routes that require shop admin access
 */
export function withShopAdminAuth() {
  return (req: NextRequest) =>
    authMiddleware(req, {
      requiredRoles: ['SUPER_ADMIN', 'SHOP_ADMIN'],
      sensitiveOperation: true,
    });
}

/**
 * Middleware factory for routes that require shop staff access
 */
export function withShopStaffAuth() {
  return (req: NextRequest) =>
    authMiddleware(req, {
      requiredRoles: ['SUPER_ADMIN', 'SHOP_ADMIN', 'SHOP_STAFF'],
    });
}

/**
 * Middleware factory for routes that require authentication but no specific role
 */
export function withAuth() {
  return (req: NextRequest) =>
    authMiddleware(req, {
      requireAuth: true,
    });
}

/**
 * Middleware factory for sensitive operations that require authentication
 */
export function withSensitiveAuth() {
  return (req: NextRequest) =>
    authMiddleware(req, {
      requireAuth: true,
      sensitiveOperation: true,
    });
}
