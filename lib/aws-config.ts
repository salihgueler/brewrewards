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
  
  // S3
  imagesBucketName: process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME || '',
  imagesBucketDomainName: process.env.NEXT_PUBLIC_IMAGES_BUCKET_DOMAIN_NAME || '',
};
