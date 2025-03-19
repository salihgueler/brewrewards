// AWS Configuration for the BrewRewards application
// This file will be populated with the outputs from CDK deployment

export const awsConfig = {
  // Cognito
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
  userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
  
  // AppSync
  graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || '',
  graphqlApiId: process.env.NEXT_PUBLIC_GRAPHQL_API_ID || '',
  
  // Authentication
  oauth: {
    domain: `brewrewards-auth.auth.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazoncognito.com`,
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/cognito` : '',
    redirectSignOut: typeof window !== 'undefined' ? window.location.origin : '',
    responseType: 'code',
  },
};
