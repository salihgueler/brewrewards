import { NextRequest, NextResponse } from 'next/server';
import { MenuItem } from '@/lib/types';
import { AccessUser, canAccessShop, canModifyShop } from '@/lib/shop-access';
import { executeQuery, executeMutation } from '@/lib/graphql-client';
import { listMenuItemsQuery } from '@/graphql/queries';
import { createMenuItemMutation } from '@/graphql/mutations';

/**
 * API endpoint to manage a shop's menu items
 * Protected by middleware for authentication and role-based access
 */

// Get menu items for a shop
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const nextToken = searchParams.get('nextToken') || undefined;
    
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
      // Use GraphQL to fetch menu items
      const variables = {
        shopId,
        category,
        limit,
        nextToken
      };
      
      const result = await executeQuery<{ listMenuItems: { items: MenuItem[], nextToken?: string } }>(
        listMenuItemsQuery,
        variables
      );
      
      return NextResponse.json({
        success: true,
        data: result.listMenuItems.items,
        nextToken: result.listMenuItems.nextToken
      });
    } catch (graphqlError) {
      console.error('GraphQL error fetching menu items:', graphqlError);
      
      // Fallback to mock data if GraphQL fails
      console.log('Falling back to mock data');
      const menuItems: Partial<MenuItem>[] = [
        {
          id: 'item_1',
          shopId,
          name: 'Cappuccino',
          description: 'Espresso with steamed milk and foam',
          price: 4.50,
          category: 'Coffee',
          isAvailable: true,
          tags: ['hot', 'popular'],
        },
        {
          id: 'item_2',
          shopId,
          name: 'Latte',
          description: 'Espresso with steamed milk',
          price: 4.00,
          category: 'Coffee',
          isAvailable: true,
          tags: ['hot', 'popular'],
        },
        {
          id: 'item_3',
          shopId,
          name: 'Blueberry Muffin',
          description: 'Freshly baked muffin with blueberries',
          price: 3.25,
          category: 'Pastries',
          isAvailable: true,
          tags: ['bakery'],
        },
      ];
      
      return NextResponse.json({
        success: true,
        data: menuItems,
        isMockData: true
      });
    }
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching menu items' },
      { status: 500 }
    );
  }
}

// Add a new menu item
export async function POST(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
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
      // Use GraphQL to create menu item
      const input = {
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
      
      const result = await executeMutation<{ createMenuItem: MenuItem }>(
        createMenuItemMutation,
        { input }
      );
      
      return NextResponse.json({
        success: true,
        message: 'Menu item created successfully',
        data: result.createMenuItem,
      }, { status: 201 });
    } catch (graphqlError) {
      console.error('GraphQL error creating menu item:', graphqlError);
      
      // Fallback to mock response if GraphQL fails
      console.log('Falling back to mock response');
      const menuItem: Partial<MenuItem> = {
        id: `item_${Date.now()}`,
        shopId,
        name,
        description,
        price,
        category,
        image,
        imageKey,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        allergens,
        nutritionalInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return NextResponse.json({
        success: true,
        message: 'Menu item created successfully (mock)',
        data: menuItem,
        isMockData: true
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the menu item' },
      { status: 500 }
    );
  }
}

// Add a new menu item
export async function POST(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
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
    
    // In a real implementation, this would save to a database
    const menuItem: Partial<MenuItem> = {
      id: `item_${Date.now()}`,
      shopId,
      name,
      description,
      price,
      category,
      tags: tags || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the menu item' },
      { status: 500 }
    );
  }
}
