import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';

/**
 * API endpoint to get, update, or delete a user
 * Only accessible by super admins (protected by middleware)
 */

// Get user details
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // In a real implementation, this would fetch the user from Cognito and your database
    if (awsConfig.userPoolId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      // Get user from Cognito
      const cognitoUser = await cognito.adminGetUser({
        UserPoolId: awsConfig.userPoolId,
        Username: userId,
      }).promise();

      // Extract user attributes
      const userAttributes: Record<string, string> = {};
      cognitoUser.UserAttributes?.forEach(attr => {
        userAttributes[attr.Name] = attr.Value;
      });

      // Format user data
      const userData = {
        id: userId,
        email: userAttributes.email || userId,
        firstName: userAttributes.given_name || '',
        lastName: userAttributes.family_name || '',
        role: userAttributes['custom:userRole'] || 'CUSTOMER',
        shopId: userAttributes['custom:shopId'] || undefined,
        enabled: cognitoUser.Enabled,
        status: cognitoUser.UserStatus,
        createdAt: cognitoUser.UserCreateDate?.toISOString(),
        lastModifiedAt: cognitoUser.UserLastModifiedDate?.toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: userData,
      });
    } else {
      // For demo purposes, return mock data
      return NextResponse.json({
        success: true,
        data: {
          id: userId,
          email: `user-${userId}@example.com`,
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER',
          enabled: true,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          lastModifiedAt: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching user:', error);

    // Handle specific Cognito errors
    if (error.code === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while fetching the user' },
      { status: 500 }
    );
  }
}

// Update user details
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { firstName, lastName, email } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, this would update the user in Cognito
    if (awsConfig.userPoolId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      // Update user attributes in Cognito
      await cognito.adminUpdateUserAttributes({
        UserPoolId: awsConfig.userPoolId,
        Username: userId,
        UserAttributes: [
          { Name: 'given_name', Value: firstName },
          { Name: 'family_name', Value: lastName },
          // Note: Updating email would require additional verification steps
        ],
      }).promise();
    } else {
      // For demo purposes, just log the update
      console.log(`User update for ${userId}: ${firstName} ${lastName}`);
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: userId,
        email,
        firstName,
        lastName,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);

    // Handle specific Cognito errors
    if (error.code === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while updating the user' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // In a real implementation, this would delete the user from Cognito
    if (awsConfig.userPoolId) {
      const cognito = new CognitoIdentityServiceProvider({
        region: awsConfig.region,
      });

      // Delete user from Cognito
      await cognito.adminDeleteUser({
        UserPoolId: awsConfig.userPoolId,
        Username: userId,
      }).promise();
    } else {
      // For demo purposes, just log the deletion
      console.log(`User deletion for ${userId}`);
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    // Handle specific Cognito errors
    if (error.code === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while deleting the user' },
      { status: 500 }
    );
  }
}
