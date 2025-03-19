import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Define our domain name (or localhost for development)
  const currentHost = 
    process.env.NODE_ENV === 'production'
      ? hostname.replace(`.brewrewards.com`, '')
      : hostname.replace(`.localhost:3000`, '');
  
  // Exclude main domain and static files
  if (
    currentHost === 'brewrewards' || 
    currentHost === 'www' || 
    currentHost === 'localhost:3000' ||
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Rewrite for subdomain
  url.pathname = `/shops/${currentHost}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. all root files inside /public (robots.txt, favicon.ico, etc.)
     */
    '/((?!api|_next|static|[\\w-]+\\.\\w+).*)',
  ],
};
