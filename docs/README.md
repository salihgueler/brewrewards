# BrewRewards Documentation

BrewRewards is a loyalty program and shop management application for coffee shops. This documentation provides an overview of the system architecture, security features, and role-based access control implementation.

## Table of Contents

1. [System Overview](#system-overview)
2. [Role-Based Access Control](#role-based-access-control)
3. [Multi-tenant Data Isolation](#multi-tenant-data-isolation)
4. [Security Features](#security-features)
5. [API Documentation](#api-documentation)
6. [User Interfaces](#user-interfaces)
7. [Development Guide](#development-guide)

## System Overview

BrewRewards is built using the following technologies:

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Next.js API routes
- **Authentication**: AWS Cognito
- **Database**: DynamoDB (planned)
- **Hosting**: AWS Amplify (planned)

The application follows a multi-tenant architecture where each coffee shop is a tenant with its own data, staff, and customers.

## Role-Based Access Control

### User Roles

The system implements four primary user roles:

1. **Super Admin**: Platform administrators who can manage all shops and users
2. **Shop Admin**: Coffee shop owners/managers who can manage their own shop
3. **Shop Staff**: Employees of a coffee shop with role-specific permissions
4. **Customer**: End users who participate in loyalty programs

### Role Hierarchy

```
Super Admin
    |
    ├── Access to all shops
    └── Full system access
        
Shop Admin
    |
    ├── Access to own shop only
    └── Full access to shop management
        
Shop Staff
    |
    ├── Access to assigned shop only
    └── Role-specific permissions:
        ├── Manager
        ├── Barista
        └── Cashier
        
Customer
    |
    └── Access to own data only
```

### Staff Roles and Permissions

Shop staff members can have different roles with specific permissions:

#### Manager
- Create transactions
- View transactions
- View and manage customers
- View and manage menu
- View loyalty programs
- View staff
- View settings

#### Barista
- Create transactions
- View transactions
- View customers
- Manage customer loyalty
- View menu

#### Cashier
- Create transactions
- View transactions
- View customers
- View menu

### Permission System

The permission system is implemented in `lib/permissions.ts` and provides:

- Granular permission definitions
- Role-based default permissions
- Permission checking utilities
- Permission inheritance

## Multi-tenant Data Isolation

### Data Isolation Strategy

1. **Shop ID Association**: All shop-specific data includes a `shopId` field
2. **Access Control Logic**: API endpoints verify the user has access to the requested shop
3. **Data Filtering**: Queries filter data based on the user's shop association

### Shop Access Control

The shop access control system is implemented in `lib/shop-access.ts` and provides:

- `canAccessShop`: Determines if a user can access a specific shop's data
- `canModifyShop`: Determines if a user can modify a specific shop's data
- `getAccessibleShops`: Gets all shops a user can access
- `filterDataByShopAccess`: Filters data collections based on shop access

### API Route Protection

All shop-specific API routes follow this pattern:
```
/api/shops/[shopId]/resource
```

Each route implements access control checks to ensure data isolation.

## Security Features

### JWT Token Validation

The JWT validation system in `lib/jwt-validator.ts` provides:

- Proper JWT verification using JWKs from Cognito
- JWK caching for performance
- Development fallback for testing

### Audit Logging

The audit logging system in `lib/audit-logger.ts` provides:

- Structured logging with severity levels
- Categorized events
- Detailed context capture
- Specialized logging methods for common events

### Rate Limiting

The rate limiting system in `lib/rate-limiter.ts` provides:

- In-memory rate limiting (Redis-based in production)
- Configurable limits for different operations
- Automatic cleanup of expired records
- Standard rate limit headers

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login`: Authenticate a user
- `POST /api/auth/password-reset`: Request a password reset
- `POST /api/auth/confirm-password-reset`: Confirm a password reset

### Shop Management Endpoints

- `GET /api/shops`: List all shops (Super Admin only)
- `POST /api/shops`: Create a new shop (Super Admin only)
- `GET /api/shops/[shopId]`: Get shop details
- `PUT /api/shops/[shopId]`: Update shop details
- `DELETE /api/shops/[shopId]`: Delete a shop (Super Admin only)

### Menu Management Endpoints

- `GET /api/shops/[shopId]/menu`: Get all menu items
- `POST /api/shops/[shopId]/menu`: Add a new menu item
- `GET /api/shops/[shopId]/menu/[itemId]`: Get a specific menu item
- `PUT /api/shops/[shopId]/menu/[itemId]`: Update a menu item
- `DELETE /api/shops/[shopId]/menu/[itemId]`: Delete a menu item

### Customer Management Endpoints

- `GET /api/shops/[shopId]/customers`: List customers
- `GET /api/shops/[shopId]/customers/[userId]`: Get customer details
- `PUT /api/shops/[shopId]/customers/[userId]`: Update customer loyalty

### Staff Management Endpoints

- `GET /api/shops/[shopId]/staff`: List staff members
- `POST /api/shops/[shopId]/staff`: Add a new staff member
- `GET /api/shops/[shopId]/staff/[userId]`: Get staff details
- `PUT /api/shops/[shopId]/staff/[userId]`: Update staff details
- `DELETE /api/shops/[shopId]/staff/[userId]`: Remove a staff member
- `GET /api/shops/[shopId]/staff/permissions`: Get available permissions
- `POST /api/shops/[shopId]/staff/invite`: Invite a new staff member

### Transaction Endpoints

- `GET /api/shops/[shopId]/transactions`: List transactions
- `POST /api/shops/[shopId]/transactions`: Create a new transaction

### Loyalty Program Endpoints

- `GET /api/shops/[shopId]/loyalty`: Get loyalty programs
- `POST /api/shops/[shopId]/loyalty`: Create a loyalty program

## User Interfaces

### Super Admin Dashboard

- Platform overview with key metrics
- Shop management
- User management
- Transaction reports

### Shop Admin Dashboard

- Shop overview with key metrics
- Menu management
- Customer management
- Staff management
- Loyalty program management
- Transaction history

### Point of Sale (POS)

- Menu interface
- Cart management
- Customer selection
- Payment processing

### Customer Dashboard

- Loyalty status
- Available rewards
- Transaction history
- Reward redemption

## Development Guide

### Project Structure

```
brewrewards/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── dashboard/          # Customer dashboard
│   ├── shop-admin/         # Shop admin dashboard
│   ├── super-admin/        # Super admin dashboard
│   └── ...
├── components/             # React components
│   ├── ui/                 # UI components
│   └── layout/             # Layout components
├── lib/                    # Utility libraries
│   ├── auth.ts             # Authentication utilities
│   ├── permissions.ts      # Permission system
│   ├── shop-access.ts      # Shop access control
│   ├── jwt-validator.ts    # JWT validation
│   ├── audit-logger.ts     # Audit logging
│   ├── rate-limiter.ts     # Rate limiting
│   └── types.ts            # TypeScript types
├── middleware/             # Next.js middleware
│   ├── auth.ts             # Authentication middleware
│   └── permission-check.ts # Permission middleware
└── hooks/                  # React hooks
    └── use-auth.ts         # Authentication hook
```

### Setting Up Development Environment

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
   NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID=your-client-id
   JWT_SECRET=your-jwt-secret-for-dev
   ```
4. Run the development server: `npm run dev`

### Authentication Flow

1. User signs in via `/api/auth/login`
2. JWT token is stored in local storage
3. Token is included in API requests
4. Middleware validates token and adds user info to request

### Adding New Permissions

1. Add the permission to the `Permission` enum in `lib/permissions.ts`
2. Update the `DEFAULT_PERMISSIONS` and `STAFF_ROLE_PERMISSIONS` objects
3. Use the permission in API routes and UI components

### Creating Protected Routes

Use the middleware factories in `middleware/auth.ts`:

```typescript
// For super admin only routes
export const config = {
  matcher: ['/super-admin/:path*'],
};

export default withSuperAdminAuth();

// For shop admin routes
export const config = {
  matcher: ['/shop-admin/:path*'],
};

export default withShopAdminAuth();

// For shop staff routes
export const config = {
  matcher: ['/staff/:path*'],
};

export default withShopStaffAuth();
```

### Implementing Permission-Based UI

Use the `PermissionGate` component:

```tsx
<PermissionGate permission={Permission.MANAGE_MENU}>
  <Button>Edit Menu</Button>
</PermissionGate>
```

Or with multiple permissions:

```tsx
<PermissionGate anyPermission={[Permission.MANAGE_MENU, Permission.VIEW_MENU]}>
  <MenuComponent />
</PermissionGate>
```
