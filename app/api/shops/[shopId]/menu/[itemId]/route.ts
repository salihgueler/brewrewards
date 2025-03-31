import { NextRequest, NextResponse } from 'next/server';
import { MenuItem } from '@/lib/types';
import { AccessUser, canAccessShop, canModifyShop } from '@/lib/shop-access';
import { executeQuery, executeMutation } from '@/lib/graphql-client';
import { getMenuItemQuery } from '@/graphql/queries';
import { updateMenuItemMutation, deleteMenuItemMutation } from '@/graphql/mutations';

/**
 * API endpoint to manage a specific menu item
 * Protected by middleware for authentication and role-based access
 */

// Get a specific menu item
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string; itemId: string } }
) {
  try {
    const { shopId, itemId } = params;
    
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
    
    // Check if user can access this shop's data
    if (!canAccessShop(user, shopId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this shop' },
        { status: 403 }
      );
    }
    
    try {
      // Fetch menu item from GraphQL API
      const result = await executeQuery<{ getMenuItem: MenuItem }>(
        getMenuItemQuery,
        { shopId, id: itemId }
      );
      
      return NextResponse.json({
        success: true,
        data: result.getMenuItem,
      });
    } catch (error) {
      console.error('Error fetching menu item from GraphQL:', error);
      
      // If GraphQL query fails, return a more specific error
      return NextResponse.json(
        { error: 'Failed to retrieve menu item. The item may not exist or there was a server error.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the menu item' },
      { status: 500 }
    );
  }
}

// Update a menu item
export async function PUT(
  req: NextRequest,
  { params }: { params: { shopId: string; itemId: string } }
) {
  try {
    const { shopId, itemId } = params;
    const { name, description, price, category, image, imageKey, isAvailable, allergens, nutritionalInfo } = await req.json();
    
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
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    try {
      // Update menu item via GraphQL API
      const input = {
        id: itemId,
        shopId,
        name,
        description,
        price,
        category,
        image,
        imageKey,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        allergens,
        nutritionalInfo
      };
      
      const result = await executeMutation<{ updateMenuItem: MenuItem }>(
        updateMenuItemMutation,
        { input }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Menu item updated successfully',
        data: result.updateMenuItem,
      });
    } catch (error) {
      console.error('Error updating menu item via GraphQL:', error);
      return NextResponse.json(
        { error: 'Failed to update menu item. The item may not exist or there was a server error.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the menu item' },
      { status: 500 }
    );
  }
}

// Delete a menu item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { shopId: string; itemId: string } }
) {
  try {
    const { shopId, itemId } = params;
    
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
    
    try {
      // Delete menu item via GraphQL API
      await executeMutation(
        deleteMenuItemMutation,
        { shopId, id: itemId }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Menu item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting menu item via GraphQL:', error);
      return NextResponse.json(
        { error: 'Failed to delete menu item. The item may not exist or there was a server error.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the menu item' },
      { status: 500 }
    );
  }
}
