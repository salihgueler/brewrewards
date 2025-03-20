import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';
import { AuditLogger, AuditLogCategory, AuditLogSeverity } from '@/lib/audit-logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { UserRole } from '@/lib/types';
import jwt from 'jsonwebtoken';

/**
 * API endpoint for user login
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting and audit logging
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Get user agent for audit logging
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Apply rate limiting for login attempts
    const rateLimitKey = `login:${clientIp}:${email.toLowerCase()}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.LOGIN);

    if (!rateLimitResult.allowed) {
      // Log rate limit exceeded
      await AuditLogger.getInstance().log({
        action: 'Login rate limit exceeded',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.WARNING,
        ipAddress: clientIp,
        userAgent,
        status: 'FAILURE',
        details: {
          email,
          resetAt: rateLimitResult.resetAt,
        },
      });

      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          resetAt: rateLimitResult.resetAt.toISOString() 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMITS.LOGIN.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt.getTime() / 1000).toString(),
          }
        }
      );
    }

    // In a real implementation, this would authenticate with Cognito
    if (awsConfig.userPoolId && awsConfig.userPoolWebClientId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      try {
        // Authenticate with Cognito
        const authResult = await cognito.adminInitiateAuth({
          UserPoolId: awsConfig.userPoolId,
          ClientId: awsConfig.userPoolWebClientId,
          AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        }).promise();

        // Get user attributes
        const userInfo = await cognito.adminGetUser({
          UserPoolId: awsConfig.userPoolId,
          Username: email,
        }).promise();

        // Extract user attributes
        const userAttributes: Record<string, string> = {};
        userInfo.UserAttributes?.forEach(attr => {
          userAttributes[attr.Name] = attr.Value;
        });

        // Get user role
        const userRole = userAttributes['custom:userRole'] || UserRole.CUSTOMER;

        // Log successful login
        await AuditLogger.getInstance().logSuccessfulAuth(
          userInfo.Username,
          userRole as UserRole,
          clientIp,
          userAgent
        );

        // Return tokens and user info
        return NextResponse.json({
          success: true,
          message: 'Login successful',
          data: {
            idToken: authResult.AuthenticationResult?.IdToken,
            accessToken: authResult.AuthenticationResult?.AccessToken,
            refreshToken: authResult.AuthenticationResult?.RefreshToken,
            expiresIn: authResult.AuthenticationResult?.ExpiresIn,
            user: {
              id: userInfo.Username,
              email: userAttributes.email || email,
              firstName: userAttributes.given_name || '',
              lastName: userAttributes.family_name || '',
              role: userRole,
              shopId: userAttributes['custom:shopId'] || undefined,
              staffRole: userAttributes['custom:staffRole'] || undefined,
            },
          },
        });
      } catch (error: any) {
        // Log failed login
        await AuditLogger.getInstance().logFailedAuth(
          email,
          error.message || 'Authentication failed',
          clientIp,
          userAgent
        );

        // Handle specific Cognito errors
        if (error.code === 'NotAuthorizedException') {
          return NextResponse.json(
            { error: 'Incorrect username or password' },
            { status: 401 }
          );
        }

        if (error.code === 'UserNotConfirmedException') {
          return NextResponse.json(
            { error: 'User is not confirmed', code: 'USER_NOT_CONFIRMED', email },
            { status: 400 }
          );
        }

        throw error;
      }
    } else {
      // For demo purposes, use mock authentication
      // In a real app, this would be removed
      if (email === 'admin@example.com' && password === 'password') {
        // Create a mock JWT token
        const token = jwt.sign(
          {
            sub: 'user_1',
            email: 'admin@example.com',
            'custom:userRole': UserRole.SUPER_ADMIN,
          },
          awsConfig.jwtSecret || 'your-jwt-secret-key',
          { expiresIn: '1h' }
        );

        // Log successful login
        await AuditLogger.getInstance().logSuccessfulAuth(
          'user_1',
          UserRole.SUPER_ADMIN,
          clientIp,
          userAgent
        );

        return NextResponse.json({
          success: true,
          message: 'Login successful',
          data: {
            idToken: token,
            accessToken: token,
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600,
            user: {
              id: 'user_1',
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User',
              role: UserRole.SUPER_ADMIN,
            },
          },
        });
      } else if (email === 'shop@example.com' && password === 'password') {
        // Create a mock JWT token for shop admin
        const token = jwt.sign(
          {
            sub: 'user_2',
            email: 'shop@example.com',
            'custom:userRole': UserRole.SHOP_ADMIN,
            'custom:shopId': 'shop_1',
          },
          awsConfig.jwtSecret || 'your-jwt-secret-key',
          { expiresIn: '1h' }
        );

        // Log successful login
        await AuditLogger.getInstance().logSuccessfulAuth(
          'user_2',
          UserRole.SHOP_ADMIN,
          clientIp,
          userAgent
        );

        return NextResponse.json({
          success: true,
          message: 'Login successful',
          data: {
            idToken: token,
            accessToken: token,
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600,
            user: {
              id: 'user_2',
              email: 'shop@example.com',
              firstName: 'Shop',
              lastName: 'Admin',
              role: UserRole.SHOP_ADMIN,
              shopId: 'shop_1',
            },
          },
        });
      } else if (email === 'staff@example.com' && password === 'password') {
        // Create a mock JWT token for shop staff
        const token = jwt.sign(
          {
            sub: 'user_3',
            email: 'staff@example.com',
            'custom:userRole': UserRole.SHOP_STAFF,
            'custom:shopId': 'shop_1',
            'custom:staffRole': 'BARISTA',
            'custom:permissions': JSON.stringify([
              'create:transaction',
              'view:transactions',
              'view:customers',
              'manage:customer_loyalty',
              'view:menu',
            ]),
          },
          awsConfig.jwtSecret || 'your-jwt-secret-key',
          { expiresIn: '1h' }
        );

        // Log successful login
        await AuditLogger.getInstance().logSuccessfulAuth(
          'user_3',
          UserRole.SHOP_STAFF,
          clientIp,
          userAgent
        );

        return NextResponse.json({
          success: true,
          message: 'Login successful',
          data: {
            idToken: token,
            accessToken: token,
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600,
            user: {
              id: 'user_3',
              email: 'staff@example.com',
              firstName: 'Staff',
              lastName: 'User',
              role: UserRole.SHOP_STAFF,
              shopId: 'shop_1',
              staffRole: 'BARISTA',
            },
          },
        });
      }

      // Log failed login
      await AuditLogger.getInstance().logFailedAuth(
        email,
        'Incorrect username or password',
        clientIp,
        userAgent
      );

      return NextResponse.json(
        { error: 'Incorrect username or password' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Login error:', error);

    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
