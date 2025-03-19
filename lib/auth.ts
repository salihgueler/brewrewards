import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { awsConfig } from './aws-config';

// Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'SHOP_ADMIN' | 'SUPER_ADMIN';
  shopId?: string;
  token?: string;
}

// Initialize the Cognito User Pool
const getUserPool = () => {
  return new CognitoUserPool({
    UserPoolId: awsConfig.userPoolId,
    ClientId: awsConfig.userPoolWebClientId,
  });
};

// Helper to convert Cognito user to AuthUser
const cognitoUserToAuthUser = (
  cognitoUser: CognitoUser,
  session: CognitoUserSession,
  attributes: { [key: string]: any }
): AuthUser => {
  return {
    id: attributes.sub || '',
    email: attributes.email || '',
    firstName: attributes.given_name || '',
    lastName: attributes.family_name || '',
    role: attributes['custom:userRole'] || 'CUSTOMER',
    shopId: attributes['custom:shopId'] || undefined,
    token: session.getIdToken().getJwtToken(),
  };
};

// For development fallback when Cognito is not configured
let mockUser: AuthUser | null = null;

export const auth = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthUser> => {
    // If Cognito is not configured, use mock authentication
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured, using mock authentication');
      
      // Mock successful authentication
      if (email.includes('admin')) {
        mockUser = {
          id: 'admin-user-id',
          email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'SHOP_ADMIN',
          shopId: 'demo-shop-id',
        };
      } else if (email.includes('super')) {
        mockUser = {
          id: 'super-admin-id',
          email,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
        };
      } else {
        mockUser = {
          id: 'customer-id',
          email,
          firstName: 'Customer',
          lastName: 'User',
          role: 'CUSTOMER',
        };
      }
      
      return mockUser;
    }
    
    // Use actual Cognito authentication
    return new Promise((resolve, reject) => {
      const userPool = getUserPool();
      
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
      
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              reject(err);
              return;
            }
            
            const userAttributes: { [key: string]: any } = {};
            attributes?.forEach(attr => {
              userAttributes[attr.getName()] = attr.getValue();
            });
            
            const user = cognitoUserToAuthUser(cognitoUser, session, userAttributes);
            resolve(user);
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  },
  
  // Sign up a new user
  signUp: async (email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> => {
    // If Cognito is not configured, use mock registration
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured, using mock registration');
      
      // Mock successful registration
      mockUser = {
        id: 'new-user-id',
        email,
        firstName,
        lastName,
        role: 'CUSTOMER',
      };
      
      return mockUser;
    }
    
    // Use actual Cognito sign-up
    return new Promise((resolve, reject) => {
      const userPool = getUserPool();
      
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
        new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
        new CognitoUserAttribute({ Name: 'custom:userRole', Value: 'CUSTOMER' }),
      ];
      
      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!result) {
          reject(new Error('Sign up failed'));
          return;
        }
        
        const user: AuthUser = {
          id: result.userSub,
          email,
          firstName,
          lastName,
          role: 'CUSTOMER',
        };
        
        resolve(user);
      });
    });
  },
  
  // Confirm registration with verification code
  confirmSignUp: async (email: string, code: string): Promise<boolean> => {
    // If Cognito is not configured, return mock success
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured, using mock confirmation');
      return true;
    }
    
    // Use actual Cognito confirmation
    return new Promise((resolve, reject) => {
      const userPool = getUserPool();
      
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(true);
      });
    });
  },
  
  // Sign out the current user
  signOut: async (): Promise<void> => {
    // If Cognito is not configured, clear mock user
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured, using mock sign out');
      mockUser = null;
      return;
    }
    
    // Use actual Cognito sign-out
    const userPool = getUserPool();
    const currentUser = userPool.getCurrentUser();
    
    if (currentUser) {
      currentUser.signOut();
    }
  },
  
  // Get the current authenticated user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    // If Cognito is not configured, return mock user
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured, using mock current user');
      return mockUser;
    }
    
    // Use actual Cognito getCurrentUser
    return new Promise((resolve) => {
      const userPool = getUserPool();
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(null);
        return;
      }
      
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
          return;
        }
        
        cognitoUser.getUserAttributes((attrErr, attributes) => {
          if (attrErr || !attributes) {
            resolve(null);
            return;
          }
          
          const userAttributes: { [key: string]: any } = {};
          attributes.forEach(attr => {
            userAttributes[attr.getName()] = attr.getValue();
          });
          
          const user = cognitoUserToAuthUser(cognitoUser, session, userAttributes);
          resolve(user);
        });
      });
    });
  },
  
  // Check if a user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const user = await auth.getCurrentUser();
    return user !== null;
  },
  
  // Forgot password flow - request code
  forgotPassword: async (email: string): Promise<boolean> => {
    // If Cognito is not configured, return mock success
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured, using mock forgot password');
      return true;
    }
    
    // Use actual Cognito forgot password
    return new Promise((resolve, reject) => {
      const userPool = getUserPool();
      
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve(true);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  },
  
  // Forgot password flow - confirm new password with code
  confirmPassword: async (email: string, code: string, newPassword: string): Promise<boolean> => {
    // If Cognito is not configured, return mock success
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      console.warn('Cognito not configured, using mock confirm password');
      return true;
    }
    
    // Use actual Cognito confirm password
    return new Promise((resolve, reject) => {
      const userPool = getUserPool();
      
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve(true);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  },
};
