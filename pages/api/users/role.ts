import { NextApiRequest, NextApiResponse } from 'next';
import { withSuperAdminOnly } from '@/lib/api-utils';
import { UserRole } from '@/lib/types';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';

/**
 * API endpoint to update a user's role
 * Only accessible by super admins
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract data from request body
    const { userId, email, newRole, shopId } = req.body;

    // Validate required fields
    if (!email || !newRole) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // If assigning SHOP_ADMIN or SHOP_STAFF role, shopId is required
    if ((newRole === UserRole.SHOP_ADMIN || newRole === UserRole.SHOP_STAFF) && !shopId) {
      return res.status(400).json({ error: 'Shop ID is required for shop admin or staff roles' });
    }

    // In a real implementation, this would update the user's role in Cognito
    // Here's how it would be done:
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

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        email,
        role: newRole,
        shopId: shopId || undefined,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with super admin role check
export default withSuperAdminOnly(handler);
