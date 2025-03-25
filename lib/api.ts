import { Amplify, API, graphqlOperation } from 'aws-amplify';
import { awsConfig } from './aws-config';

// Configure Amplify with AWS AppSync settings
// This will be called when the application loads
const configureAmplify = () => {
  try {
    // Check if required configuration is available
    if (!awsConfig.graphqlEndpoint) {
      console.warn('GraphQL endpoint not configured. API calls will fail.');
      return false;
    }
    
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured. Authentication will fail.');
      return false;
    }
    
    // Configure Amplify
    Amplify.configure({
      aws_appsync_graphqlEndpoint: awsConfig.graphqlEndpoint,
      aws_appsync_region: awsConfig.region,
      aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
      Auth: {
        region: awsConfig.region,
        userPoolId: awsConfig.userPoolId,
        userPoolWebClientId: awsConfig.userPoolWebClientId,
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error configuring Amplify:', error);
    return false;
  }
};

// Initialize Amplify configuration
const isConfigured = configureAmplify();

// GraphQL client for making API calls
export const graphql = {
  query: async <T = any>(query: string, variables?: any): Promise<T> => {
    if (!isConfigured) {
      throw new Error('AWS AppSync is not configured. Please deploy the infrastructure first.');
    }
    
    try {
      const response = await API.graphql(graphqlOperation(query, variables));
      return response.data as T;
    } catch (error) {
      console.error('GraphQL Query Error:', error);
      throw error;
    }
  },

  mutate: async <T = any>(mutation: string, variables?: any): Promise<T> => {
    if (!isConfigured) {
      throw new Error('AWS AppSync is not configured. Please deploy the infrastructure first.');
    }
    
    try {
      const response = await API.graphql(graphqlOperation(mutation, variables));
      return response.data as T;
    } catch (error) {
      console.error('GraphQL Mutation Error:', error);
      throw error;
    }
  }
};
