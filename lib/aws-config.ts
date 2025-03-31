/**
 * AWS Configuration
 * These values are automatically set by the CDK deployment process
 */
export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
  userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
  graphqlApiId: process.env.NEXT_PUBLIC_GRAPHQL_API_ID,
  s3Bucket: process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME,
  s3BucketDomainName: process.env.NEXT_PUBLIC_IMAGES_BUCKET_DOMAIN_NAME,
};
