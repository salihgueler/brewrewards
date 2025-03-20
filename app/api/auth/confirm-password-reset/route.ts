import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';
import { AuditLogger, AuditLogCategory, AuditLogSeverity } from '@/lib/audit-logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

/**
 * API endpoint to confirm a password reset
 */
export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    // Validate required fields
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, code, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting and audit logging
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Get user agent for audit logging
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Apply rate limiting for password reset confirmations
    const rateLimitKey = `confirm-reset:${clientIp}:${email.toLowerCase()}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, RATE_LIMITS.PASSWORD_RESET);

    if (!rateLimitResult.allowed) {
      // Log rate limit exceeded
      await AuditLogger.getInstance().log({
        action: 'Password reset confirmation rate limit exceeded',
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
          error: 'Too many attempts. Please try again later.',
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

    // In a real implementation, this would confirm the password reset via Cognito
    if (awsConfig.userPoolId && awsConfig.userPoolWebClientId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      try {
        // Confirm password reset with Cognito
        await cognito.confirmForgotPassword({
          ClientId: awsConfig.userPoolWebClientId,
          Username: email,
          ConfirmationCode: code,
          Password: newPassword,
        }).promise();

        // Log successful password reset
        await AuditLogger.getInstance().log({
          action: 'Password reset confirmed',
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
          message: 'Password has been reset successfully',
        });
      } catch (error: any) {
        // Log the error
        await AuditLogger.getInstance().log({
          action: 'Password reset confirmation failed',
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

        // Handle specific Cognito errors
        if (error.code === 'CodeMismatchException') {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 400 }
          );
        }

        if (error.code === 'ExpiredCodeException') {
          return NextResponse.json(
            { error: 'Verification code has expired' },
            { status: 400 }
          );
        }

        if (error.code === 'LimitExceededException') {
          return NextResponse.json(
            { error: 'Too many attempts. Please try again later.' },
            { status: 429 }
          );
        }

        throw error;
      }
    } else {
      // For demo purposes, just log the request
      console.log(`Password reset confirmed for ${email} with code ${code}`);

      // Log the request
      await AuditLogger.getInstance().log({
        action: 'Password reset confirmed (demo)',
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
        message: 'Password has been reset successfully',
      });
    }
  } catch (error: any) {
    console.error('Password reset confirmation error:', error);

    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
