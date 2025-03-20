import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { awsConfig } from '@/lib/aws-config';

// Types for the middleware
interface AuthMiddlewareOptions {
  requiredRoles?: string[];
  requireAuth?: boolean;
}

// Default options
const defaultOptions: AuthMiddlewareOptions = {
  requireAuth: true,
  requiredRoles: [],
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
  const { requiredRoles, requireAuth } = mergedOptions;

  // Skip auth check if not required
  if (!requireAuth) {
    return NextResponse.next();
  }

  // Get the authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing token' },
      { status: 401 }
    );
  }

  try {
    // Verify the JWT token
    // In a real implementation, you would use the Cognito JWT verification
    // with the correct JWK from your Cognito user pool
    const secret = new TextEncoder().encode(awsConfig.jwtSecret || 'your-jwt-secret-key');
    const { payload } = await jwtVerify(token, secret);

    // Check if the token has the required claims
    if (!payload.sub || !payload['custom:userRole']) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token claims' },
        { status: 401 }
      );
    }

    // Check if the user has the required role
    const userRole = payload['custom:userRole'] as string;
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user info to the request for downstream handlers
    const requestWithUser = req.clone();
    // In Next.js middleware, we can't modify the request object directly
    // So we'll add the user info to headers that can be read by API routes
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.sub as string);
    headers.set('x-user-role', userRole);
    if (payload['custom:shopId']) {
      headers.set('x-user-shop-id', payload['custom:shopId'] as string);
    }

    // Continue to the next middleware or API route
    return NextResponse.next({
      request: {
        headers,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
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
    });
}

/**
 * Middleware factory for routes that require shop admin access
 */
export function withShopAdminAuth() {
  return (req: NextRequest) =>
    authMiddleware(req, {
      requiredRoles: ['SUPER_ADMIN', 'SHOP_ADMIN'],
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
