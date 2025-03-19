# BrewRewards Architecture

This document provides a detailed overview of the BrewRewards application architecture.

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                   │
│                                        Client Applications                                        │
│                                                                                                   │
│  ┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────┐    │
│  │                         │          │                         │          │                 │    │
│  │  Web Application        │          │  Mobile Browser         │          │  Admin Portal   │    │
│  │  (Next.js)              │          │                         │          │                 │    │
│  │                         │          │                         │          │                 │    │
│  └───────────┬─────────────┘          └───────────┬─────────────┘          └────────┬────────┘    │
│              │                                    │                                  │            │
└──────────────┼────────────────────────────────────┼──────────────────────────────────┼────────────┘
               │                                    │                                  │
               │                                    │                                  │
               │                                    │                                  │
┌──────────────┼────────────────────────────────────┼──────────────────────────────────┼────────────┐
│              │                                    │                                  │            │
│              │                                    │                                  │            │
│              ▼                                    ▼                                  ▼            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                             │  │
│  │                                  AWS AppSync GraphQL API                                    │  │
│  │                                                                                             │  │
│  └───────────────────────────────────────┬─────────────────────────────────────────────────────┘  │
│                                          │                                                        │
│                                          │                                                        │
│                                          │                                                        │
│  ┌─────────────────────┐     ┌───────────┼───────────┐     ┌─────────────────────────────────┐    │
│  │                     │     │           │           │     │                                 │    │
│  │  Amazon Cognito     │◀───▶│  Resolvers           │◀───▶│  IAM Roles & Policies           │    │
│  │  User Pool          │     │                      │     │                                 │    │
│  │                     │     └───────────┬───────────┘     └─────────────────────────────────┘    │
│  └─────────────────────┘                 │                                                        │
│                                          │                                                        │
│                                          │                                                        │
│                                          ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                             │  │
│  │                                    Data Sources                                             │  │
│  │                                                                                             │  │
│  │  ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐           │  │
│  │  │                     │     │                     │     │                     │           │  │
│  │  │  DynamoDB Tables    │     │  S3 Bucket          │     │  Lambda Functions   │           │  │
│  │  │                     │     │  (Image Storage)    │     │  (Future Use)       │           │  │
│  │  │  - ShopsTable       │     │                     │     │                     │           │  │
│  │  │  - UsersTable       │     │                     │     │                     │           │  │
│  │  │  - RewardsTable     │     │                     │     │                     │           │  │
│  │  │  - StampCardsTable  │     │                     │     │                     │           │  │
│  │  │  - UserRewardsTable │     │                     │     │                     │           │  │
│  │  │  - MenuTable        │     │                     │     │                     │           │  │
│  │  │  - FavoritesTable   │     │                     │     │                     │           │  │
│  │  │                     │     │                     │     │                     │           │  │
│  │  └─────────────────────┘     └─────────────────────┘     └─────────────────────┘           │  │
│  │                                                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Client Applications

1. **Web Application (Next.js)**
   - Server-side rendered React application
   - Responsive design for desktop and mobile
   - Hosted on Vercel

2. **Mobile Browser**
   - Progressive Web App (PWA) capabilities
   - Optimized mobile experience
   - Access to device features (camera for QR codes)

3. **Admin Portal**
   - Shop management interface
   - Analytics and reporting
   - User management

### AWS AppSync GraphQL API

The central API gateway that handles all data operations:

- **GraphQL Schema**: Defines the API contract
- **Authentication Modes**:
  - Cognito User Pools for user authentication
  - IAM for service-to-service communication
- **Resolvers**: Map GraphQL operations to data sources

### Authentication

**Amazon Cognito User Pool**:
- User registration and authentication
- Email verification
- Password reset flow
- User groups and attributes
- JWT token issuance

### Data Sources

1. **DynamoDB Tables**:
   - **ShopsTable**: Coffee shop profiles with GSI for subdomain lookup
   - **UsersTable**: User profiles with GSI for shop-user relationships
   - **RewardsTable**: Reward definitions for each shop
   - **StampCardsTable**: Stamp card templates
   - **UserRewardsTable**: User's earned rewards and stamps
   - **MenuTable**: Menu items for each shop
   - **FavoritesTable**: User's favorite items

2. **S3 Bucket**:
   - Storage for menu item images
   - Shop logos and branding assets
   - Organized by shop ID
   - Public read access
   - Secure upload via presigned URLs

3. **Lambda Functions** (Future Use):
   - Custom business logic
   - Integrations with third-party services
   - Scheduled tasks and background processing

### IAM Roles & Policies

- AppSync service role for DynamoDB access
- S3 access policies for image uploads
- Cognito user pool access

## Data Flow

### Authentication Flow

1. User submits credentials to the client application
2. Client sends authentication request to Cognito
3. Cognito validates credentials and returns JWT tokens
4. Client includes tokens in subsequent API requests
5. AppSync validates tokens and authorizes operations

### Image Upload Flow

1. Client requests a presigned URL from AppSync
2. AppSync generates a presigned URL for S3
3. Client uploads the image directly to S3 using the presigned URL
4. Client saves the image reference (key) in the database via AppSync

### Shop Data Query Flow

1. Client requests shop data by subdomain
2. AppSync queries the ShopsTable using the SubdomainIndex GSI
3. DynamoDB returns the shop data
4. AppSync resolves any related data (menu items, rewards)
5. Client receives the complete shop data

## Security Considerations

- All API requests are authenticated
- S3 objects are organized by shop ID to prevent unauthorized access
- IAM roles follow the principle of least privilege
- Cognito handles sensitive authentication operations
- DynamoDB access is controlled through IAM policies

## Scalability

- DynamoDB auto-scaling for handling traffic spikes
- S3 provides virtually unlimited storage for images
- AppSync automatically scales to handle API requests
- Serverless architecture eliminates infrastructure management

## Future Enhancements

- CloudFront distribution for image delivery
- Lambda functions for custom business logic
- EventBridge for event-driven architecture
- Step Functions for complex workflows
- SQS for asynchronous processing
