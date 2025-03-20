# BrewRewards Security Documentation

This document outlines the security features and best practices implemented in the BrewRewards application.

## Table of Contents

1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Data Isolation](#data-isolation)
4. [JWT Security](#jwt-security)
5. [Rate Limiting](#rate-limiting)
6. [Audit Logging](#audit-logging)
7. [Password Security](#password-security)
8. [API Security](#api-security)
9. [Security Headers](#security-headers)
10. [Security Best Practices](#security-best-practices)

## Authentication

### AWS Cognito Integration

BrewRewards uses AWS Cognito for user authentication, providing:

- Secure user sign-up and sign-in
- Multi-factor authentication (MFA)
- User attribute management
- Password policies
- Account recovery flows

### JWT Token Handling

- Tokens are stored securely and never exposed to JavaScript
- Token validation occurs on every authenticated request
- Tokens include user role and permissions
- Short expiration times with refresh token rotation

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Credentials are verified against Cognito
3. JWT tokens are returned and stored securely
4. Tokens are included in subsequent API requests
5. Middleware validates tokens before processing requests

## Authorization

### Role-Based Access Control (RBAC)

The application implements a comprehensive RBAC system with four primary roles:

1. **Super Admin**: Platform administrators
2. **Shop Admin**: Coffee shop owners/managers
3. **Shop Staff**: Employees with role-specific permissions
4. **Customer**: End users

### Permission System

- Granular permissions defined in `lib/permissions.ts`
- Default permission sets for different roles
- Permission inheritance hierarchy
- Permission checking utilities

### Authorization Middleware

- `middleware/auth.ts`: Validates JWT tokens and checks user roles
- `middleware/permission-check.ts`: Verifies specific permissions
- Role-specific middleware factories for route protection

## Data Isolation

### Multi-tenant Architecture

- Each coffee shop is a separate tenant
- Data is isolated between tenants
- Cross-tenant access is strictly controlled

### Shop Access Control

- `lib/shop-access.ts` implements tenant isolation logic
- All shop-specific data includes `shopId`
- API endpoints verify shop access before processing requests
- Data queries filter by shop ID

### Access Control Functions

- `canAccessShop`: Determines if a user can access a shop's data
- `canModifyShop`: Determines if a user can modify a shop's data
- `getAccessibleShops`: Gets all shops a user can access
- `filterDataByShopAccess`: Filters data based on shop access

## JWT Security

### Token Validation

- `lib/jwt-validator.ts` implements secure JWT validation
- Tokens are validated using JWKs from Cognito
- JWK caching for performance optimization
- Proper signature verification
- Audience and issuer validation
- Expiration time checking

### Token Claims

- `sub`: User ID
- `custom:userRole`: User role
- `custom:shopId`: Associated shop ID (if applicable)
- `custom:staffRole`: Staff role (if applicable)
- `custom:permissions`: User permissions (if applicable)

## Rate Limiting

### Rate Limiting Implementation

- `lib/rate-limiter.ts` implements rate limiting
- In-memory rate limiting for development
- Redis-based rate limiting for production (planned)
- IP-based and user-based rate limiting
- Automatic cleanup of expired records

### Rate Limit Configurations

- Login: 5 attempts per minute
- Password Reset: 3 attempts per 5 minutes
- General API: 100 requests per minute
- Sensitive API: 20 requests per minute

### Rate Limit Response Headers

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when the limit resets
- `Retry-After`: Seconds to wait before retrying

## Audit Logging

### Audit Logging System

- `lib/audit-logger.ts` implements comprehensive audit logging
- Structured log entries with consistent fields
- Severity levels (INFO, WARNING, ERROR, CRITICAL)
- Event categorization

### Logged Events

- Authentication attempts (successful and failed)
- Access denied events
- User management actions
- Shop management actions
- Sensitive data access
- Configuration changes
- Transactions

### Log Entry Fields

- Timestamp
- User ID and role
- Shop ID (if applicable)
- Action performed
- Category and severity
- IP address and user agent
- Success/failure status
- Error messages (if applicable)

## Password Security

### Password Policies

- Minimum length: 8 characters
- Complexity requirements:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Password history enforcement
- Maximum age policies

### Password Reset Flow

1. User requests password reset
2. Rate limiting prevents abuse
3. Reset link sent to verified email
4. Time-limited reset token
5. Secure reset confirmation
6. Audit logging of all steps

## API Security

### API Route Protection

- All API routes are protected by authentication middleware
- Role and permission checks for each endpoint
- Input validation and sanitization
- Error handling that doesn't leak sensitive information

### Request Validation

- Required field validation
- Data type validation
- Format validation
- Business rule validation

### Response Security

- No sensitive data in responses
- Consistent error format
- Appropriate HTTP status codes
- No detailed error information in production

## Security Headers

The application implements the following security headers:

- **Content-Security-Policy (CSP)**: Prevents XSS attacks
- **X-XSS-Protection**: Additional XSS protection
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **X-Frame-Options**: Prevents clickjacking
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS
- **Permissions-Policy**: Controls browser features

## Security Best Practices

### Secure Coding Practices

- Input validation on all user inputs
- Output encoding to prevent XSS
- Parameterized queries to prevent injection
- Least privilege principle
- Defense in depth approach

### Data Protection

- Sensitive data encryption at rest
- Secure data transmission (HTTPS)
- Data minimization
- Proper error handling
- Secure session management

### Infrastructure Security

- AWS security best practices
- Regular security updates
- Network security controls
- Monitoring and alerting
- Backup and recovery procedures

### Security Testing

- Regular security assessments
- Vulnerability scanning
- Penetration testing
- Code security reviews
- Dependency vulnerability checking
