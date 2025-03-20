import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';
import { AuditLogger, AuditLogCategory, AuditLogSeverity } from '@/lib/audit-logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

/**
 * API endpoint to request a password reset
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting and audit logging
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Get user agent for audit logging
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Apply rate limiting for password reset attempts
    const rateLimitKey = `password-reset:${clientIp}:${email.toLowerCase()}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.PASSWORD_RESET);

    if (!rateLimitResult.allowed) {
      // Log rate limit exceeded
      await AuditLogger.getInstance().log({
        action: 'Password reset rate limit exceeded',
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
          error: 'Too many password reset attempts. Please try again later.',
          resetAt: rateLimitResult.resetAt.toISOString() 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMITS.PASSWORD_RESET.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt.getTime() / 1000).toString(),
          }
        }
      );
    }

    // In a real implementation, this would send a password reset email via Cognito
    if (awsConfig.userPoolId && awsConfig.userPoolWebClientId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      try {
        // Request password reset from Cognito
        await cognito.forgotPassword({
          ClientId: awsConfig.userPoolWebClientId,
          Username: email,
        }).promise();

        // Log successful password reset request
        await AuditLogger.getInstance().log({
          action: 'Password reset requested',
          category: AuditLogCategory.AUTHENTICATION,
          severity: AuditLogSeverity.INFO,
          ipAddress: clientIp,
          userAgent,
          status: 'SUCCESS',
          details: {
            email,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Password reset instructions sent to your email',
        });
      } catch (error: any) {
        // Log the error but don't reveal if the user exists or not
        await AuditLogger.getInstance().log({
          action: 'Password reset request failed',
          category: AuditLogCategory.AUTHENTICATION,
          severity: AuditLogSeverity.WARNING,
          ipAddress: clientIp,
          userAgent,
          status: 'FAILURE',
          details: {
            email,
            error: error.message,
          },
        });

        // For security reasons, always return a success message
        // This prevents user enumeration attacks
        return NextResponse.json({
          success: true,
          message: 'If your email is registered, you will receive password reset instructions',
        });
      }
    } else {
      // For demo purposes, just log the request
      console.log(`Password reset requested for ${email}`);

      // Log the request
      await AuditLogger.getInstance().log({
        action: 'Password reset requested (demo)',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.INFO,
        ipAddress: clientIp,
        userAgent,
        status: 'SUCCESS',
        details: {
          email,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive password reset instructions',
      });
    }
  } catch (error: any) {
    console.error('Password reset error:', error);

    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
