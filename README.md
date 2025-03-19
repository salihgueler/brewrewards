# BrewRewards

BrewRewards is a comprehensive loyalty and rewards platform designed specifically for coffee shops. It enables coffee shops to create digital loyalty programs, manage rewards, and engage with their customers through a modern, user-friendly interface.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Infrastructure](#infrastructure)
- [Authentication](#authentication)
- [API](#api)
- [Development](#development)
- [Deployment](#deployment)
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

## Features

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
- **Order History**: View past orders and rewards

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

## Getting Started

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

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. Deploy the AWS infrastructure:
   ```bash
   cd infrastructure
   npm install
   npm run cdk deploy
   ```

5. Run the development server:
   ```bash
   cd ..
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
├── infrastructure/         # AWS CDK infrastructure code
│   ├── bin/                # CDK app entry point
│   ├── lib/                # Stack definitions
│   └── graphql/            # GraphQL schema
├── lib/                    # Utility functions and shared code
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

## Authentication

Authentication is handled by Amazon Cognito with the following user groups:

- **Customers**: Regular users who collect rewards
- **ShopAdmins**: Coffee shop owners and managers
- **SuperAdmins**: Platform administrators

The authentication flow uses direct Cognito integration with:
- User registration with email verification
- Password-based authentication
- Password reset functionality
- Custom attributes for user roles and shop associations

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

Run the development server:
```bash
npm run dev
```

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
npm run cdk deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
