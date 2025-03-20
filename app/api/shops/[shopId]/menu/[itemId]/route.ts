import { NextRequest, NextResponse } from 'next/server';
import { MenuItem } from '@/lib/types';
import { AccessUser, canAccessShop, canModifyShop } from '@/lib/shop-access';

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
    
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    const menuItem: Partial<MenuItem> = {
      id: itemId,
      shopId,
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      price: 4.50,
      category: 'Coffee',
      isAvailable: true,
      tags: ['hot', 'popular'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };
    
    return NextResponse.json({
      success: true,
      data: menuItem,
    });
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
    const { name, description, price, category, tags, isAvailable } = await req.json();
    
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
    
    // In a real implementation, this would update in a database
    const updatedMenuItem: Partial<MenuItem> = {
      id: itemId,
      shopId,
      name,
      description,
      price,
      category,
      tags: tags || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedMenuItem,
    });
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
    
    // In a real implementation, this would delete from a database
    
    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the menu item' },
      { status: 500 }
    );
  }
}
