import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/types';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';

/**
 * API endpoint to update a user's role
 * Only accessible by super admins (protected by middleware)
 */
export async function PUT(req: NextRequest) {
  try {
    const { email, newRole, shopId } = await req.json();

    // Validate required fields
    if (!email || !newRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // If assigning SHOP_ADMIN or SHOP_STAFF role, shopId is required
    if ((newRole === UserRole.SHOP_ADMIN || newRole === UserRole.SHOP_STAFF) && !shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required for shop admin or staff roles' },
        { status: 400 }
      );
    }

    // In a real implementation, this would update the user's role in Cognito
    if (awsConfig.userPoolId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      const userAttributes = [
        {
          Name: 'custom:userRole',
          Value: newRole,
        },
      ];

      // Add shopId attribute if provided
      if (shopId) {
        userAttributes.push({
          Name: 'custom:shopId',
          Value: shopId,
        });
      } else if (newRole === UserRole.CUSTOMER || newRole === UserRole.SUPER_ADMIN) {
        // Remove shopId attribute for customers and super admins
        // Note: In Cognito, we can't directly remove an attribute, so we'd need to
        // implement a different approach in a real application
      }

      // Update user attributes in Cognito
      await cognito.adminUpdateUserAttributes({
        UserPoolId: awsConfig.userPoolId,
        Username: email,
        UserAttributes: userAttributes,
      }).promise();
    } else {
      // For demo purposes, just log the change
      console.log(`Role update for ${email}: ${newRole} ${shopId ? `(Shop: ${shopId})` : ''}`);
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        email,
        role: newRole,
        shopId: shopId || undefined,
      },
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);

    // Handle specific Cognito errors
    if (error.code === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while updating the user role' },
      { status: 500 }
    );
  }
}
