/**
 * Feature flags to control the rollout of real AWS implementations
 * This allows for gradual migration from mock data to real AWS services
 */

export enum FeatureFlag {
  USE_REAL_AUTH = 'USE_REAL_AUTH',
  USE_REAL_API = 'USE_REAL_API',
  USE_REAL_S3 = 'USE_REAL_S3',
}

// Default values for feature flags
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.USE_REAL_AUTH]: true,  // Authentication is already implemented
  [FeatureFlag.USE_REAL_API]: true,   // We're implementing real API now
  [FeatureFlag.USE_REAL_S3]: true,    // S3 upload is implemented
};

/**
 * Check if a feature flag is enabled
 * @param flag The feature flag to check
 * @returns True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // Check environment variable first
  const envVar = `NEXT_PUBLIC_${flag}`;
  if (typeof process.env[envVar] === 'string') {
    return process.env[envVar] === 'true';
  }
  
  // Fall back to default value
  return DEFAULT_FLAGS[flag];
}

/**
 * Get all feature flags
 * @returns Record of all feature flags and their values
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  const flags: Record<FeatureFlag, boolean> = { ...DEFAULT_FLAGS };
  
  // Override with environment variables
  Object.keys(FeatureFlag).forEach(key => {
    const flag = key as FeatureFlag;
    const envVar = `NEXT_PUBLIC_${flag}`;
    if (typeof process.env[envVar] === 'string') {
      flags[flag] = process.env[envVar] === 'true';
    }
  });
  
  return flags;
}
