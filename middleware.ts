import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth, withSuperAdminAuth, withShopAdminAuth, withShopStaffAuth } from './middleware/auth';

// Define paths that should be protected by different auth levels
const superAdminPaths = ['/api/super-admin', '/api/shops/create', '/api/users/role'];
const shopAdminPaths = ['/api/shop-admin', '/api/shops/[shopId]'];
const shopStaffPaths = ['/api/staff', '/api/transactions'];
const authenticatedPaths = ['/api/user', '/api/rewards'];

/**
 * Middleware function that runs before requests
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for an API route
  if (pathname.startsWith('/api/')) {
    // Super admin routes
    if (superAdminPaths.some(path => pathname.startsWith(path))) {
      return withSuperAdminAuth()(request);
    }

    // Shop admin routes
    if (shopAdminPaths.some(path => pathname.startsWith(path))) {
      return withShopAdminAuth()(request);
    }

    // Shop staff routes
    if (shopStaffPaths.some(path => pathname.startsWith(path))) {
      return withShopStaffAuth()(request);
    }

    // Routes that require authentication but no specific role
    if (authenticatedPaths.some(path => pathname.startsWith(path))) {
      return withAuth()(request);
    }
  }

  // For non-API routes or routes without specific auth requirements, continue
  return NextResponse.next();
}

// Configure the paths that should trigger this middleware
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
