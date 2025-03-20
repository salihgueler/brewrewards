# Multi-tenant Data Isolation in BrewRewards

This document explains the multi-tenant architecture of BrewRewards and how data isolation is implemented to ensure that each coffee shop's data remains separate and secure.

## Table of Contents

1. [Multi-tenant Architecture Overview](#multi-tenant-architecture-overview)
2. [Data Isolation Strategy](#data-isolation-strategy)
3. [Shop Access Control](#shop-access-control)
4. [API Route Protection](#api-route-protection)
5. [Database Queries](#database-queries)
6. [Cross-tenant Access](#cross-tenant-access)
7. [Implementation Examples](#implementation-examples)
8. [Testing Multi-tenant Isolation](#testing-multi-tenant-isolation)

## Multi-tenant Architecture Overview

### What is Multi-tenancy?

In BrewRewards, multi-tenancy means that the application serves multiple coffee shops (tenants) from a single instance of the software. Each coffee shop has its own:

- Staff members
- Customers
- Menu items
- Loyalty programs
- Transactions
- Settings

### Tenant Hierarchy

```
Platform
├── Shop 1
│   ├── Staff Members
│   ├── Customers
│   ├── Menu Items
│   ├── Transactions
│   └── Loyalty Programs
├── Shop 2
│   ├── Staff Members
│   ├── Customers
│   └── ...
└── Shop 3
    ├── Staff Members
    ├── Customers
    └── ...
```

### User-Tenant Relationships

- **Super Admin**: Can access all shops (cross-tenant access)
- **Shop Admin**: Can access only their own shop
- **Shop Staff**: Can access only their assigned shop
- **Customer**: Can access only their own data within a shop

## Data Isolation Strategy

### Shop ID Association

All shop-specific data includes a `shopId` field that associates it with a specific coffee shop:

```typescript
interface MenuItem {
  id: string;
  shopId: string;  // Associates this menu item with a specific shop
  name: string;
  price: number;
  // ...
}
```

### Access Control Logic

Before any data access, the system verifies that the user has permission to access the requested shop:

```typescript
// Check if user can access this shop's data
if (!canAccessShop(user, shopId)) {
  return NextResponse.json(
    { error: 'Forbidden: You do not have access to this shop' },
    { status: 403 }
  );
}
```

### Data Filtering

All queries filter data based on the user's shop association:

```typescript
// For shop admins and staff, filter by their shop
if (user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SHOP_STAFF) {
  query.shopId = user.shopId;
}
```

## Shop Access Control

### Access Control Functions

The shop access control system is implemented in `lib/shop-access.ts` and provides several key functions:

#### canAccessShop

Determines if a user can access a specific shop's data:

```typescript
export function canAccessShop(user: AccessUser, shopId: string): boolean {
  if (!user) {
    return false;
  }

  // Super admins can access all shops
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Shop admins and staff can only access their assigned shop
  if (user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SHOP_STAFF) {
    return user.shopId === shopId;
  }

  // Customers can access shops they have interacted with
  if (user.role === UserRole.CUSTOMER) {
    // In a real implementation, this would check if the customer
    // has any relationship with the shop (e.g., loyalty membership)
    return true; // Simplified for this example
  }

  return false;
}
```

#### canModifyShop

Determines if a user can modify a specific shop's data:

```typescript
export function canModifyShop(user: AccessUser, shopId: string): boolean {
  if (!user) {
    return false;
  }

  // Super admins can modify all shops
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Shop admins can only modify their assigned shop
  if (user.role === UserRole.SHOP_ADMIN) {
    return user.shopId === shopId;
  }

  // Shop staff and customers cannot modify shop data
  return false;
}
```

#### getAccessibleShops

Gets all shops a user can access:

```typescript
export async function getAccessibleShops(user: AccessUser): Promise<string[]> {
  if (!user) {
    return [];
  }

  // Super admins can access all shops
  if (user.role === UserRole.SUPER_ADMIN) {
    // In a real implementation, this would fetch all shop IDs from the database
    return ['shop_1', 'shop_2', 'shop_3']; // Example shop IDs
  }

  // Shop admins and staff can only access their assigned shop
  if ((user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SHOP_STAFF) && user.shopId) {
    return [user.shopId];
  }

  // Customers can access shops they have interacted with
  if (user.role === UserRole.CUSTOMER) {
    // In a real implementation, this would fetch shops the customer has interacted with
    return []; // Simplified for this example
  }

  return [];
}
```

#### filterDataByShopAccess

Filters data collections based on shop access:

```typescript
export function filterDataByShopAccess<T extends { shopId: string }>(
  user: AccessUser,
  data: T[]
): T[] {
  if (!user) {
    return [];
  }

  // Super admins can access all data
  if (user.role === UserRole.SUPER_ADMIN) {
    return data;
  }

  // Filter data by shop ID for other roles
  return data.filter(item => canAccessShop(user, item.shopId));
}
```

## API Route Protection

### Route Structure

All shop-specific API routes follow this pattern:
```
/api/shops/[shopId]/resource
```

### Access Control Implementation

Each route implements access control checks:

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    
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
    
    // Proceed with data access
    // ...
  } catch (error) {
    // Error handling
  }
}
```

## Database Queries

### Shop ID Filtering

All database queries include shop ID filtering:

```typescript
// Example DynamoDB query (planned implementation)
const params = {
  TableName: 'MenuItems',
  FilterExpression: 'shopId = :shopId',
  ExpressionAttributeValues: {
    ':shopId': shopId,
  },
};

const result = await dynamoDb.scan(params).promise();
```

### Query Authorization

Before executing any query, the system verifies that the user has permission to access the data:

```typescript
// Check if user can access this shop's data
if (!canAccessShop(user, shopId)) {
  throw new Error('Forbidden: You do not have access to this shop');
}

// Proceed with query
const params = {
  TableName: 'MenuItems',
  FilterExpression: 'shopId = :shopId',
  ExpressionAttributeValues: {
    ':shopId': shopId,
  },
};
```

## Cross-tenant Access

### Super Admin Access

Super admins have cross-tenant access to all shops:

```typescript
// For super admins, no shop ID filtering
if (user.role === UserRole.SUPER_ADMIN) {
  // Fetch data from all shops
  const params = {
    TableName: 'MenuItems',
  };
} else {
  // For other roles, filter by shop ID
  const params = {
    TableName: 'MenuItems',
    FilterExpression: 'shopId = :shopId',
    ExpressionAttributeValues: {
      ':shopId': user.shopId,
    },
  };
}
```

### Aggregated Data

For platform-wide analytics, data is aggregated while maintaining isolation:

```typescript
// Aggregate transaction data across shops
async function getTransactionStats() {
  // Get shops the user can access
  const accessibleShops = await getAccessibleShops(user);
  
  // Fetch and aggregate data from accessible shops
  let totalTransactions = 0;
  let totalRevenue = 0;
  
  for (const shopId of accessibleShops) {
    const shopStats = await getShopTransactionStats(shopId);
    totalTransactions += shopStats.transactionCount;
    totalRevenue += shopStats.revenue;
  }
  
  return { totalTransactions, totalRevenue };
}
```

## Implementation Examples

### Menu Item API

```typescript
// GET /api/shops/[shopId]/menu
export async function GET(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    
    // Get user from request headers
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
    const menuItems = [
      { id: 'item_1', shopId, name: 'Cappuccino', price: 4.50 },
      { id: 'item_2', shopId, name: 'Latte', price: 4.00 },
      { id: 'item_3', shopId, name: 'Espresso', price: 3.00 },
    ];
    
    return NextResponse.json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching menu items' },
      { status: 500 }
    );
  }
}
```

### Transaction API

```typescript
// POST /api/shops/[shopId]/transactions
export async function POST(
  req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const { customerId, items, total } = await req.json();
    
    // Get user from request headers
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
    
    // Check if user has permission to create transactions
    const permissionUser: PermissionUser = {
      id: userId,
      role: userRole as UserRole,
      shopId: userShopId || undefined,
    };
    
    if (!hasPermission(permissionUser, Permission.CREATE_TRANSACTION)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create transactions' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would save to a database
    // For now, we'll return mock data
    const transaction = {
      id: `txn_${Date.now()}`,
      shopId,
      customerId,
      items,
      total,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };
    
    return NextResponse.json({
      success: true,
      data: transaction,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the transaction' },
      { status: 500 }
    );
  }
}
```

## Testing Multi-tenant Isolation

### Unit Tests

Unit tests for the shop access control functions:

```typescript
describe('Shop Access Control', () => {
  test('Super admin can access any shop', () => {
    const superAdmin = { id: 'user_1', role: UserRole.SUPER_ADMIN };
    expect(canAccessShop(superAdmin, 'shop_1')).toBe(true);
    expect(canAccessShop(superAdmin, 'shop_2')).toBe(true);
  });
  
  test('Shop admin can only access their own shop', () => {
    const shopAdmin = { id: 'user_2', role: UserRole.SHOP_ADMIN, shopId: 'shop_1' };
    expect(canAccessShop(shopAdmin, 'shop_1')).toBe(true);
    expect(canAccessShop(shopAdmin, 'shop_2')).toBe(false);
  });
  
  test('Shop staff can only access their assigned shop', () => {
    const shopStaff = { id: 'user_3', role: UserRole.SHOP_STAFF, shopId: 'shop_1' };
    expect(canAccessShop(shopStaff, 'shop_1')).toBe(true);
    expect(canAccessShop(shopStaff, 'shop_2')).toBe(false);
  });
});
```

### Integration Tests

Integration tests for API routes:

```typescript
describe('Menu API', () => {
  test('Shop admin can access their own shop menu', async () => {
    const response = await fetch('/api/shops/shop_1/menu', {
      headers: {
        'Authorization': `Bearer ${shopAdminToken}`,
      },
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
  
  test('Shop admin cannot access another shop menu', async () => {
    const response = await fetch('/api/shops/shop_2/menu', {
      headers: {
        'Authorization': `Bearer ${shopAdminToken}`,
      },
    });
    
    expect(response.status).toBe(403);
  });
  
  test('Super admin can access any shop menu', async () => {
    const response1 = await fetch('/api/shops/shop_1/menu', {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
      },
    });
    
    expect(response1.status).toBe(200);
    
    const response2 = await fetch('/api/shops/shop_2/menu', {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
      },
    });
    
    expect(response2.status).toBe(200);
  });
});
```

### Security Testing

Security tests for data isolation:

```typescript
describe('Data Isolation', () => {
  test('Shop admin cannot modify another shop data', async () => {
    const response = await fetch('/api/shops/shop_2/menu', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${shopAdminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Item',
        price: 5.00,
      }),
    });
    
    expect(response.status).toBe(403);
  });
  
  test('Shop staff cannot access another shop data', async () => {
    const response = await fetch('/api/shops/shop_2/transactions', {
      headers: {
        'Authorization': `Bearer ${shopStaffToken}`,
      },
    });
    
    expect(response.status).toBe(403);
  });
});
```
