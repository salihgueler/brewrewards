# BrewRewards

BrewRewards is a comprehensive multi-tenant loyalty and rewards platform designed specifically for coffee shops. It enables coffee shops to create digital loyalty programs, manage rewards, and engage with their customers through a modern, user-friendly interface.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Multi-Tenant Design](#multi-tenant-design)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Quick Demo Setup](#quick-demo-setup)
- [Project Structure](#project-structure)
- [Infrastructure](#infrastructure)
- [Authentication & Authorization](#authentication--authorization)
- [API](#api)
- [Development](#development)
- [Deployment](#deployment)
- [Resource Management](#resource-management)
- [Implementation Status](#implementation-status)
- [Contributing](#contributing)
- [License](#license)

## Architecture Overview

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  Web Clients    │────▶│  Vercel Hosting   │────▶│  AWS Services   │
│                 │     │  (Next.js App)    │     │                 │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           AWS Cloud                                     │
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐    │
│  │                 │     │                 │     │                 │    │
│  │  Amazon Cognito │◀───▶│  AWS AppSync    │◀───▶│  DynamoDB       │    │
│  │  User Pool      │     │  GraphQL API    │     │  Tables         │    │
│  │                 │     │                 │     │                 │    │
│  └─────────────────┘     └────────┬────────┘     └─────────────────┘    │
│                                   │                                     │
│                                   ▼                                     │
│                          ┌─────────────────┐                            │
│                          │                 │                            │
│                          │  Amazon S3      │                            │
│                          │  (Image Storage)│                            │
│                          │                 │                            │
│                          └─────────────────┘                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

BrewRewards uses a serverless architecture built on AWS services. The frontend is a Next.js application hosted on Vercel, which communicates with AWS AppSync GraphQL API. Authentication is handled by Amazon Cognito, data is stored in DynamoDB tables, and images are stored in Amazon S3.

## Multi-Tenant Design

BrewRewards is built as a multi-tenant application with three distinct user roles:

### Super Admins
- Platform administrators who can manage all coffee shops
- Have access to platform-wide analytics and user management
- Can create, read, update, and delete any coffee shop and their information

### Shop Admins
- Coffee shop owners/managers who can manage their own shop
- Can create, read, update, and delete their shop's menu items
- Can define and manage loyalty programs (stamp cards and point-based rewards)
- Have access to customer insights for their shop only

### Customers
- End users who can join multiple coffee shops' loyalty programs
- Can earn and redeem rewards across different shops
- Can view coffee shop menus and track their reward progress
- Cannot modify any shop information

This multi-tenant architecture ensures proper data isolation while allowing customers to interact with multiple shops through a single platform.

## Features

### For Super Admins

- **Platform Management**: Oversee all coffee shops in the network
- **Shop Management**: Create, update, and delete coffee shops
- **Analytics Dashboard**: View platform-wide statistics and performance metrics
- **User Management**: Manage all users across the platform

### For Coffee Shop Owners

- **Shop Management**: Create and manage your coffee shop profile
- **Menu Management**: Add, edit, and organize menu items with images
- **Loyalty Programs**: Create stamp cards and point-based reward systems
- **Customer Insights**: View customer engagement and reward redemption data
- **Staff Management**: Add staff accounts with appropriate permissions

### For Customers

- **Digital Loyalty Cards**: Collect stamps and points across multiple coffee shops
- **Reward Redemption**: Redeem earned rewards at participating shops
- **Shop Discovery**: Find coffee shops in the BrewRewards network
- **Favorites**: Save favorite menu items and shops
- **Activity History**: View past orders and rewards

## Tech Stack

### Frontend
- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **React Hook Form**: Form validation and handling
- **AWS Amplify**: AWS service integration

### Backend
- **AWS CDK**: Infrastructure as code
- **AWS AppSync**: GraphQL API service
- **Amazon Cognito**: User authentication and management
- **Amazon DynamoDB**: NoSQL database
- **Amazon S3**: Object storage for images

## Quick Demo Setup

The easiest way to run the BrewRewards demo is using our one-command setup script:

```bash
./run-demo.sh
```

This script will:
1. Check for AWS CLI and proper configuration
2. Install all necessary dependencies
3. Deploy the AWS infrastructure if it's not already deployed
4. Configure all environment variables automatically
5. Start the Next.js application

### Demo Credentials

Once the application is running, you can use these demo credentials:

- **Super Admin**: superadmin@example.com / Password123
- **Shop Admin**: admin@example.com / Password123
- **Customer**: customer@example.com / Password123

### Demo URLs

- **Super Admin Portal**: http://localhost:3000/super-admin
- **Shop Admin Portal**: http://localhost:3000/shop-admin
- **Customer Dashboard**: http://localhost:3000/dashboard
- **Shop Customer View**: http://localhost:3000/shops/demo

### Requirements

- Node.js 18.x or later
- AWS account
- AWS CLI configured locally

## Getting Started

If you prefer to set up the project manually, follow these steps:

### Prerequisites

- Node.js 18.x or later
- AWS account
- AWS CLI configured locally
- Vercel account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/brewrewards.git
   cd brewrewards
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy the AWS infrastructure:
   ```bash
   cd infrastructure
   npm install
   npm run deploy
   ```

   This will:
   - Deploy all AWS resources
   - Create a `.env.local` file with all necessary environment variables

4. Run the development server:
   ```bash
   cd ..
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
brewrewards/
├── app/                    # Next.js app directory
│   ├── (auth)/             # Authentication routes
│   ├── dashboard/          # Customer dashboard
│   ├── shop-admin/         # Shop admin pages
│   ├── shops/              # Shop-specific pages
│   └── super-admin/        # Platform admin pages
├── components/             # Reusable React components
│   ├── ui/                 # UI components (buttons, cards, etc.)
│   └── ...                 # Feature-specific components
├── graphql/                # GraphQL queries and mutations
│   ├── queries.ts          # GraphQL query definitions
│   └── mutations.ts        # GraphQL mutation definitions
├── infrastructure/         # AWS CDK infrastructure code
│   ├── bin/                # CDK app entry point
│   ├── lib/                # Stack definitions
│   └── graphql/            # GraphQL schema
├── lib/                    # Utility functions and shared code
│   ├── auth.ts             # Authentication utilities
│   ├── auth-context.tsx    # Authentication context provider
│   ├── graphql-client.ts   # GraphQL client for AWS AppSync
│   ├── hooks/              # Custom React hooks
│   ├── permissions.ts      # Role-based permissions system
│   └── aws-config.ts       # AWS configuration
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Infrastructure

The AWS infrastructure is defined using AWS CDK in TypeScript. The main components are:

### DynamoDB Tables

- **ShopsTable**: Stores coffee shop information
- **UsersTable**: Stores user profiles
- **RewardsTable**: Stores reward definitions
- **StampCardsTable**: Stores stamp card templates
- **UserRewardsTable**: Stores user's earned rewards
- **MenuTable**: Stores menu items
- **FavoritesTable**: Stores user's favorite items

### S3 Bucket

An S3 bucket is used to store menu item images and shop logos. The bucket is configured with:
- CORS settings to allow uploads from the frontend
- Public read access for images
- Organized folder structure by shop ID

### AppSync GraphQL API

The GraphQL API provides a unified interface for all data operations. It includes:
- User authentication via Cognito
- DynamoDB data sources
- Resolvers for all operations
- Image upload functionality via presigned URLs

## Authentication & Authorization

Authentication is handled by Amazon Cognito with the following user groups:

- **Customers**: Regular users who collect rewards
- **ShopAdmins**: Coffee shop owners and managers
- **SuperAdmins**: Platform administrators

The authentication flow uses direct Cognito integration with:
- User registration with email verification
- Password-based authentication
- Password reset functionality
- Custom attributes for user roles and shop associations

Authorization is implemented through a role-based permission system that:
- Defines specific permissions for each user role
- Restricts access to resources based on user role
- Ensures shop admins can only access their own shop's data
- Allows super admins to access all data across the platform

## API

The GraphQL API provides the following main operations:

### Queries
- Get shop information
- List menu items
- Get user rewards
- List available rewards
- Get stamp cards

### Mutations
- Create/update shops
- Manage menu items
- Add/redeem rewards
- Add stamps to loyalty cards
- Toggle favorites

## Development

### Local Development

For local development, you must have valid AWS credentials configured. The application uses real AWS services for data operations.

1. Run the development server:
   ```bash
   npm run dev
   ```

2. If you encounter errors related to AWS services, check your AWS configuration in `.env.local` and ensure your AWS credentials are properly set up.

### Error Handling

The application includes comprehensive error handling for AWS service interactions:

- Clear error messages when AWS services are not configured
- Proper error propagation to the UI
- Toast notifications for user feedback
- Fallback UI states for error conditions

### Testing

Run tests:
```bash
npm test
```

## Deployment

### Frontend Deployment

The frontend is deployed to Vercel:
```bash
vercel
```

### Infrastructure Deployment

Deploy AWS resources:
```bash
cd infrastructure
npm run deploy
```

After deployment, your environment variables will be automatically updated in the `.env.local` file.

## Resource Management

To manage AWS resources used by BrewRewards:

### Deploying Resources

```bash
cd infrastructure
npm run deploy
```

### Removing Resources

When you're done with the application or want to clean up your AWS account:

```bash
cd infrastructure
npm run destroy
```

This will remove all AWS resources and prevent further charges.

For detailed information about resource management, see [Resource Management Documentation](docs/resource-management.md).

## Implementation Status

The project has been updated to use real AWS services for core functionality. Here's the current implementation status:

### Implemented with Real AWS Services

#### API Routes
- ✅ Menu Items API (`/app/api/shops/[shopId]/menu/route.ts`)
- ✅ Menu Item Details API (`/app/api/shops/[shopId]/menu/[itemId]/route.ts`)
- ✅ Loyalty Programs API (`/app/api/shops/[shopId]/loyalty/route.ts`)
- ✅ Customers API (`/app/api/shops/[shopId]/customers/route.ts`)
- ✅ User Rewards API (`/app/api/users/rewards/route.ts`)
- ✅ User Activities API (`/app/api/users/activities/route.ts`)

#### React Hooks
- ✅ useShop: Fetches shop details by ID or subdomain
- ✅ useShops: Fetches all shops with pagination
- ✅ useMenuItems: Fetches and manages menu items with pagination
- ✅ useMenuItem: Manages individual menu item operations
- ✅ useLoyaltyPrograms: Fetches loyalty programs (points and stamp cards)
- ✅ useUserRewards: Fetches user rewards for a specific shop
- ✅ useUsers: Fetches users with filtering by role and shop
- ✅ useRewards: Fetches rewards for a specific shop
- ✅ useRedemptions: Extracts redemption history from user rewards
- ✅ useDashboardStats: Aggregates statistics from multiple data sources

#### UI Components
- ✅ LoadingSpinner: Shows loading state with customizable size and text
- ✅ ErrorAlert: Displays error messages with retry functionality
- ✅ LoadingState: Wrapper component for handling loading/error/success states

#### Pages
- ✅ Shop Detail Page (`/app/shops/[shop]/page.tsx`)
- ✅ Customer Dashboard (`/app/dashboard/page.tsx`)
- ✅ Super Admin Dashboard (`/app/super-admin/page.tsx`)

### Still Using Mock Data

- ⏳ Transactions API (`/app/api/shops/[shopId]/transactions/route.ts`)
- ⏳ Staff Management APIs (listing, creation, permissions, invitations)
- ⏳ Shop Admin Pages (some sections)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
