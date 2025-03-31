import { fetchAuthSession } from 'aws-amplify/auth';
import { configureAmplify } from './amplify-config';

export async function debugAuth() {
  console.log('Starting auth debug...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('REGION:', process.env.NEXT_PUBLIC_AWS_REGION);
  console.log('USER_POOL_ID:', process.env.NEXT_PUBLIC_USER_POOL_ID?.substring(0, 5) + '...');
  console.log('CLIENT_ID:', process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID?.substring(0, 5) + '...');
  console.log('APPSYNC_URL:', process.env.NEXT_PUBLIC_APPSYNC_URL?.substring(0, 20) + '...');
  
  // Check auth session
  try {
    const session = await fetchAuthSession();
    console.log('Auth session exists:', !!session);
    console.log('Auth tokens exist:', !!session.tokens);
    
    if (session.tokens) {
      console.log('ID token expires:', new Date(session.tokens.idToken.payload.exp * 1000).toISOString());
      console.log('Access token expires:', new Date(session.tokens.accessToken.payload.exp * 1000).toISOString());
    }
  } catch (error) {
    console.error('Error checking auth session:', error);
  }
  
  // Reconfigure Amplify
  console.log('Reconfiguring Amplify...');
  try {
    configureAmplify();
    console.log('Amplify reconfigured successfully');
  } catch (error) {
    console.error('Error reconfiguring Amplify:', error);
  }
  
  console.log('Auth debug complete');
  return 'Auth debug complete. Check console for details.';
}

// Add a button to your UI that calls this function
// <button onClick={() => debugAuth()}>Debug Auth</button>
