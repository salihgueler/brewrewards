import { UserRole } from './types';

/**
 * Severity levels for audit logs
 */
export enum AuditLogSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Categories for audit logs
 */
export enum AuditLogCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SHOP_MANAGEMENT = 'SHOP_MANAGEMENT',
  LOYALTY_MANAGEMENT = 'LOYALTY_MANAGEMENT',
  TRANSACTION = 'TRANSACTION',
  SYSTEM = 'SYSTEM',
}

/**
 * Interface for audit log entries
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userRole?: UserRole;
  shopId?: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}

/**
 * Options for creating an audit log
 */
export interface AuditLogOptions {
  userId?: string;
  userRole?: UserRole;
  shopId?: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}

/**
 * Class for handling audit logging
 */
export class AuditLogger {
  private static instance: AuditLogger;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance of the AuditLogger
   */
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }
  
  /**
   * Log an audit event
   * @param options - Options for the audit log
   * @returns The created audit log entry
   */
  public async log(options: AuditLogOptions): Promise<AuditLogEntry> {
    const logEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...options,
    };
    
    // In a real implementation, this would save to a database or send to a logging service
    
    // For development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] [${logEntry.severity}] [${logEntry.category}] ${logEntry.action} - ${logEntry.status}`);
      if (logEntry.details) {
        console.log('Details:', logEntry.details);
      }
      if (logEntry.errorMessage) {
        console.log('Error:', logEntry.errorMessage);
      }
    }
    
    // In production, we might send this to CloudWatch Logs, a database, or another logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to CloudWatch Logs
      // await sendToCloudWatch(logEntry);
      
      // Example: Save to DynamoDB
      // await saveToDatabase(logEntry);
    }
    
    return logEntry;
  }
  
  /**
   * Log a successful authentication
   * @param userId - The user ID
   * @param userRole - The user role
   * @param ipAddress - The IP address
   * @param userAgent - The user agent
   * @returns The created audit log entry
   */
  public async logSuccessfulAuth(
    userId: string,
    userRole: UserRole,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      userRole,
      action: 'User authenticated',
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.INFO,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });
  }
  
  /**
   * Log a failed authentication
   * @param userId - The user ID (if known)
   * @param errorMessage - The error message
   * @param ipAddress - The IP address
   * @param userAgent - The user agent
   * @returns The created audit log entry
   */
  public async logFailedAuth(
    userId: string | undefined,
    errorMessage: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action: 'Authentication failed',
      category: AuditLogCategory.AUTHENTICATION,
      severity: AuditLogSeverity.WARNING,
      ipAddress,
      userAgent,
      status: 'FAILURE',
      errorMessage,
    });
  }
  
  /**
   * Log an access denied event
   * @param userId - The user ID
   * @param userRole - The user role
   * @param action - The attempted action
   * @param resource - The resource that was accessed
   * @param ipAddress - The IP address
   * @returns The created audit log entry
   */
  public async logAccessDenied(
    userId: string,
    userRole: UserRole,
    action: string,
    resource: string,
    ipAddress?: string
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      userRole,
      action: `Access denied: ${action}`,
      category: AuditLogCategory.AUTHORIZATION,
      severity: AuditLogSeverity.WARNING,
      ipAddress,
      details: { resource },
      status: 'FAILURE',
      errorMessage: 'Insufficient permissions',
    });
  }
  
  /**
   * Log a user management action
   * @param adminId - The admin user ID
   * @param adminRole - The admin user role
   * @param action - The action performed
   * @param targetUserId - The target user ID
   * @param details - Additional details
   * @returns The created audit log entry
   */
  public async logUserManagement(
    adminId: string,
    adminRole: UserRole,
    action: string,
    targetUserId: string,
    details?: any
  ): Promise<AuditLogEntry> {
    return this.log({
      userId: adminId,
      userRole: adminRole,
      action,
      category: AuditLogCategory.USER_MANAGEMENT,
      severity: AuditLogSeverity.INFO,
      details: {
        targetUserId,
        ...details,
      },
      status: 'SUCCESS',
    });
  }
  
  /**
   * Log a shop management action
   * @param userId - The user ID
   * @param userRole - The user role
   * @param action - The action performed
   * @param shopId - The shop ID
   * @param details - Additional details
   * @returns The created audit log entry
   */
  public async logShopManagement(
    userId: string,
    userRole: UserRole,
    action: string,
    shopId: string,
    details?: any
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      userRole,
      shopId,
      action,
      category: AuditLogCategory.SHOP_MANAGEMENT,
      severity: AuditLogSeverity.INFO,
      details,
      status: 'SUCCESS',
    });
  }
  
  /**
   * Log a transaction
   * @param userId - The user ID
   * @param userRole - The user role
   * @param shopId - The shop ID
   * @param transactionId - The transaction ID
   * @param amount - The transaction amount
   * @param details - Additional details
   * @returns The created audit log entry
   */
  public async logTransaction(
    userId: string,
    userRole: UserRole,
    shopId: string,
    transactionId: string,
    amount: number,
    details?: any
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      userRole,
      shopId,
      action: `Transaction processed: ${transactionId}`,
      category: AuditLogCategory.TRANSACTION,
      severity: AuditLogSeverity.INFO,
      details: {
        transactionId,
        amount,
        ...details,
      },
      status: 'SUCCESS',
    });
  }
}
