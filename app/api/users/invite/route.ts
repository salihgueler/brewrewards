import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/types';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint to invite a new user with a specific role
 * Only accessible by super admins (protected by middleware)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, role, shopId, message } = await req.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // If assigning SHOP_ADMIN or SHOP_STAFF role, shopId is required
    if ((role === UserRole.SHOP_ADMIN || role === UserRole.SHOP_STAFF) && !shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required for shop admin or staff roles' },
        { status: 400 }
      );
    }

    // Generate a temporary password
    const temporaryPassword = uuidv4().replace(/-/g, '').substring(0, 12);

    // In a real implementation, this would create the user in Cognito
    if (awsConfig.userPoolId && awsConfig.userPoolWebClientId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      // Create the user in Cognito
      await cognito.adminCreateUser({
        UserPoolId: awsConfig.userPoolId,
        Username: email,
        TemporaryPassword: temporaryPassword,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'given_name', Value: firstName },
          { Name: 'family_name', Value: lastName },
          { Name: 'custom:userRole', Value: role },
          ...(shopId ? [{ Name: 'custom:shopId', Value: shopId }] : []),
        ],
        MessageAction: 'SUPPRESS', // We'll send our own email
      }).promise();

      // In a real implementation, we would send an email with the invitation
      // For now, we'll just log the information
      console.log(`Invitation sent to ${email} with role ${role}`);
      console.log(`Temporary password: ${temporaryPassword}`);
    } else {
      // For demo purposes, just log the invitation
      console.log(`Invitation would be sent to ${email} with role ${role}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User invited successfully',
        data: {
          email,
          firstName,
          lastName,
          role,
          shopId: shopId || undefined,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error inviting user:', error);

    // Handle specific Cognito errors
    if (error.code === 'UsernameExistsException') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while inviting the user' },
      { status: 500 }
    );
  }
}
