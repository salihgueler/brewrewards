import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  // Make sure we're only configuring on the client side
  if (typeof window === 'undefined') return;

  console.log('Configuring Amplify with:');
  console.log('Region:', process.env.NEXT_PUBLIC_AWS_REGION);
  console.log('User Pool ID:', process.env.NEXT_PUBLIC_USER_POOL_ID ? 'Set' : 'Not set');
  console.log('Client ID:', process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ? 'Set' : 'Not set');
  console.log('AppSync URL:', process.env.NEXT_PUBLIC_APPSYNC_URL ? 'Set' : 'Not set');

  Amplify.configure({
    // Region is required for all AWS services
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    
    // Auth configuration
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
        loginWith: {
          email: true,
          phone: false,
          username: true
        }
      }
    },
    
    // API configuration
    API: {
      GraphQL: {
        endpoint: process.env.NEXT_PUBLIC_APPSYNC_URL || '',
        region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
        defaultAuthMode: 'userPool'
      }
    }
  });
  
  console.log('Amplify configured successfully');
}
