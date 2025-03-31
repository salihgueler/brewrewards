import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// Create a GraphQL client
const client = generateClient();

// API URL for direct fetch if needed
const API_URL = process.env.NEXT_PUBLIC_APPSYNC_URL;

/**
 * Execute a GraphQL query using Amplify's generateClient
 * @param query The GraphQL query string
 * @param variables Variables for the query
 * @returns The query result
 */
export async function executeQuery<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  try {
    console.log('Executing GraphQL query...');
    
    // Check authentication status before making the call
    try {
      const { tokens } = await fetchAuthSession();
      console.log('Auth tokens before query:', tokens ? 'Exist' : 'Do not exist');
      
      if (!tokens) {
        console.error('No authentication tokens available');
        throw new Error('User needs to be authenticated to call this API');
      }
    } catch (authError) {
      console.error('Auth error before query:', authError);
      throw new Error('Authentication error: ' + (authError instanceof Error ? authError.message : 'Unknown error'));
    }
    
    // Use the generated client to execute the query
    const result = await client.graphql({
      query,
      variables,
      authMode: 'userPool' // Explicitly set auth mode
    });

    console.log('GraphQL query successful');
    return result.data as T;
  } catch (error) {
    console.error('Error executing GraphQL query:', error);
    throw error;
  }
}

/**
 * Execute a GraphQL mutation using Amplify's generateClient
 * @param mutation The GraphQL mutation string
 * @param variables Variables for the mutation
 * @returns The mutation result
 */
export async function executeMutation<T>(mutation: string, variables: Record<string, any> = {}): Promise<T> {
  try {
    console.log('Executing GraphQL mutation...');
    
    // Check authentication status before making the call
    try {
      const { tokens } = await fetchAuthSession();
      console.log('Auth tokens before mutation:', tokens ? 'Exist' : 'Do not exist');
      
      if (!tokens) {
        console.error('No authentication tokens available');
        throw new Error('User needs to be authenticated to call this API');
      }
    } catch (authError) {
      console.error('Auth error before mutation:', authError);
      throw new Error('Authentication error: ' + (authError instanceof Error ? authError.message : 'Unknown error'));
    }
    
    // Use the generated client to execute the mutation
    const result = await client.graphql({
      query: mutation,
      variables,
      authMode: 'userPool' // Explicitly set auth mode
    });

    console.log('GraphQL mutation successful');
    return result.data as T;
  } catch (error) {
    console.error('Error executing GraphQL mutation:', error);
    throw error;
  }
}

/**
 * Fallback method to execute a GraphQL query using direct fetch
 * This is used when the Amplify client is not available or for special cases
 */
export async function executeQueryWithFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('GraphQL API URL is not configured');
  }

  try {
    console.log('Executing GraphQL query with fetch...');
    
    // Get the current authenticated user's token
    const { tokens } = await fetchAuthSession();
    const token = tokens?.idToken?.toString();

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL query errors:', result.errors);
      throw new Error(result.errors[0].message || 'GraphQL query failed');
    }

    console.log('GraphQL query with fetch successful');
    return result.data as T;
  } catch (error) {
    console.error('Error executing GraphQL query with fetch:', error);
    throw error;
  }
}
