import { API, graphqlOperation } from 'aws-amplify';
import { awsConfig } from './aws-config';
import { auth, AuthUser } from './auth';

// Initialize API with configuration
const configureAPI = () => {
  if (typeof window !== 'undefined') {
    // Only run on client-side
    import('aws-amplify').then(({ Amplify }) => {
      Amplify.configure({
        aws_project_region: awsConfig.region,
        aws_appsync_graphqlEndpoint: awsConfig.graphqlEndpoint,
        aws_appsync_region: awsConfig.region,
        aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
      });
    });
  }
};

// Call configure on module load
configureAPI();

// Helper function to get current authenticated user's token
const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = await auth.getCurrentUser();
    return user?.token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// GraphQL API wrapper with authentication
export const graphql = {
  query: async <T>(query: string, variables?: any): Promise<T> => {
    if (!awsConfig.graphqlEndpoint) {
      throw new Error('GraphQL endpoint not configured. Please set up AWS AppSync endpoint.');
    }

    try {
      const result = await API.graphql(graphqlOperation(query, variables));
      return result.data as T;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  },

  mutate: async <T>(mutation: string, variables?: any): Promise<T> => {
    if (!awsConfig.graphqlEndpoint) {
      throw new Error('GraphQL endpoint not configured. Please set up AWS AppSync endpoint.');
    }

    try {
      const result = await API.graphql(graphqlOperation(mutation, variables));
      return result.data as T;
    } catch (error) {
      console.error('GraphQL mutation error:', error);
      throw error;
    }
  },
};

// Shop-related API functions
export const shopAPI = {
  getShopBySubdomain: async (subdomain: string) => {
    const query = `
      query GetShopBySubdomain($subdomain: String!) {
        getShopBySubdomain(subdomain: $subdomain) {
          id
          name
          description
          logo
          subdomain
          ownerId
          address
          city
          state
          zipCode
          country
          phone
          email
          website
          socialMedia {
            facebook
            instagram
            twitter
          }
          businessHours {
            day
            openTime
            closeTime
            isClosed
          }
          createdAt
          updatedAt
        }
      }
    `;
    
    try {
      const response = await graphql.query(query, { subdomain });
      return response.getShopBySubdomain;
    } catch (error) {
      console.error('Error fetching shop by subdomain:', error);
      return null;
    }
  },
};

// User-related API functions
export const userAPI = {
  getCurrentUser: async () => {
    const query = `
      query GetCurrentUser {
        getCurrentUser {
          id
          email
          firstName
          lastName
          role
          shopId
          phone
          address
          city
          state
          zipCode
          country
          createdAt
          updatedAt
        }
      }
    `;
    
    try {
      const response = await graphql.query(query);
      return response.getCurrentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
};

// Rewards-related API functions
export const rewardsAPI = {
  getUserRewards: async (userId: string, shopId: string) => {
    const query = `
      query GetUserReward($userId: ID!, $shopId: ID!) {
        getUserReward(userId: $userId, shopId: $shopId) {
          userId
          shopId
          points
          stamps {
            cardId
            currentStamps
            lastStampDate
          }
          rewardHistory {
            rewardId
            rewardName
            redeemedAt
          }
          createdAt
          updatedAt
        }
      }
    `;
    
    try {
      const response = await graphql.query(query, { userId, shopId });
      return response.getUserReward;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return null;
    }
  },
  
  listRewards: async (shopId: string) => {
    const query = `
      query ListRewards($shopId: ID!, $limit: Int) {
        listRewards(shopId: $shopId, limit: $limit) {
          items {
            id
            shopId
            name
            description
            pointsRequired
            image
            expiryDays
            isActive
            createdAt
            updatedAt
          }
          nextToken
        }
      }
    `;
    
    try {
      const response = await graphql.query(query, { shopId, limit: 50 });
      return response.listRewards.items;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
  },
  
  redeemReward: async (userId: string, shopId: string, rewardId: string) => {
    const mutation = `
      mutation RedeemReward($userId: ID!, $shopId: ID!, $rewardId: ID!) {
        redeemReward(userId: $userId, shopId: $shopId, rewardId: $rewardId) {
          userId
          shopId
          points
          createdAt
          updatedAt
        }
      }
    `;
    
    try {
      const response = await graphql.mutate(mutation, { userId, shopId, rewardId });
      return response.redeemReward;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  },
};
