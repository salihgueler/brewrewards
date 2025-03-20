import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/types';
import { AccessUser, canModifyShop } from '@/lib/shop-access';
import { Permission, STAFF_ROLE_PERMISSIONS } from '@/lib/permissions';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { awsConfig } from '@/lib/aws-config';
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint to invite a new staff member
 * Protected by middleware for authentication and role-based access
 */

export async function POST(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const { email, firstName, lastName, staffRole, permissions, message } = await req.json();
    
    // Get user from request headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    const userShopId = req.headers.get('x-user-shop-id');
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user: AccessUser = {
      id: userId,
      role: userRole as any,
      shopId: userShopId || undefined,
    };
    
    // Check if user can modify this shop's data
    if (!canModifyShop(user, shopId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this shop' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!email || !firstName || !lastName || !staffRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate staff role
    if (!['MANAGER', 'BARISTA', 'CASHIER'].includes(staffRole)) {
      return NextResponse.json(
        { error: 'Invalid staff role' },
        { status: 400 }
      );
    }
    
    // Get default permissions for the staff role if not provided
    const staffPermissions = permissions || STAFF_ROLE_PERMISSIONS[staffRole as keyof typeof STAFF_ROLE_PERMISSIONS];
    
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
          { Name: 'custom:userRole', Value: UserRole.SHOP_STAFF },
          { Name: 'custom:shopId', Value: shopId },
          { Name: 'custom:staffRole', Value: staffRole },
          { Name: 'custom:permissions', Value: JSON.stringify(staffPermissions) },
        ],
        MessageAction: 'SUPPRESS', // We'll send our own email
      }).promise();
      
      // In a real implementation, we would send an email with the invitation
      // For now, we'll just log the information
      console.log(`Staff invitation sent to ${email} with role ${staffRole}`);
      console.log(`Temporary password: ${temporaryPassword}`);
    } else {
      // For demo purposes, just log the invitation
      console.log(`Staff invitation would be sent to ${email} with role ${staffRole}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staff invitation sent successfully',
      data: {
        email,
        firstName,
        lastName,
        role: UserRole.SHOP_STAFF,
        shopId,
        staffRole,
        permissions: staffPermissions,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting staff member:', error);
    
    // Handle specific Cognito errors
    if (error.code === 'UsernameExistsException') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while inviting the staff member' },
      { status: 500 }
    );
  }
}
