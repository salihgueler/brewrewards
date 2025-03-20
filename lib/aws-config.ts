/**
 * AWS Configuration
 * In a real application, these values would come from environment variables
 */
export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
  userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  jwtSecret: process.env.JWT_SECRET, // Only used for demo purposes
};
