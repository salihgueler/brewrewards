import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoIdToken,
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
  newPasswordRequired?: boolean;
  session?: any;
  cognitoUser?: any;
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
  // Get the ID token to extract user groups
  const idToken = session.getIdToken();
  const payload = idToken.decodePayload();
  
  // Extract user groups from the token payload
  const cognitoGroups = payload['cognito:groups'] || [];
  
  // Map Cognito groups to application roles
  let role: 'CUSTOMER' | 'SHOP_ADMIN' | 'SUPER_ADMIN' = 'CUSTOMER'; // Default role
  
  if (Array.isArray(cognitoGroups)) {
    if (cognitoGroups.includes('SuperAdmins')) {
      role = 'SUPER_ADMIN';
    } else if (cognitoGroups.includes('ShopAdmins')) {
      role = 'SHOP_ADMIN';
    }
  }
  
  console.log('User groups from Cognito:', cognitoGroups);
  console.log('Mapped role:', role);
  
  return {
    id: attributes.sub || '',
    email: attributes.email || '',
    firstName: attributes.given_name || '',
    lastName: attributes.family_name || '',
    role: role,
    shopId: attributes['custom:shopId'] || undefined,
    token: session.getIdToken().getJwtToken(),
  };
};

export const auth = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthUser> => {
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
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
            // Add the cognitoUser object to the response for potential new password challenge
            user.cognitoUser = cognitoUser;
            user.session = session;
            resolve(user);
          });
        },
        onFailure: (err) => {
          // Add email to error object for UserNotConfirmedException
          if (err.code === 'UserNotConfirmedException') {
            (err as any).email = email;
          }
          reject(err);
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
          // User needs to set a new password
          const user: AuthUser = {
            id: '',
            email: email,
            firstName: userAttributes.given_name || '',
            lastName: userAttributes.family_name || '',
            role: 'CUSTOMER', // Default role until we get the actual role
            newPasswordRequired: true,
            cognitoUser: cognitoUser,
            session: { userAttributes, requiredAttributes, email }
          };
          resolve(user);
        }
      });
    });
  },
  
  // Sign up a new user
  signUp: async (email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> => {
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
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
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
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
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
    const userPool = getUserPool();
    const currentUser = userPool.getCurrentUser();
    
    if (currentUser) {
      currentUser.signOut();
    }
  },
  
  // Get the current authenticated user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
    return new Promise((resolve, reject) => {
      const userPool = getUserPool();
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(null);
        return;
      }
      
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          // Check if the error is due to user not being confirmed
          if ((err as any).code === 'UserNotConfirmedException') {
            const error = err as any;
            error.email = cognitoUser.getUsername();
            reject(error);
            return;
          }
          
          resolve(null);
          return;
        }
        
        if (!session || !session.isValid()) {
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
    try {
      const user = await auth.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  },
  
  // Forgot password flow - request code
  forgotPassword: async (email: string): Promise<boolean> => {
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
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
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
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
  
  // Complete new password challenge
  completeNewPasswordChallenge: async (
    username: string,
    newPassword: string,
    userAttributes: { [key: string]: string } = {},
    cognitoUser?: CognitoUser
  ): Promise<AuthUser> => {
    if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
      throw new Error('Cognito is not configured. Please set up AWS Cognito credentials.');
    }
    
    return new Promise((resolve, reject) => {
      if (!cognitoUser) {
        const userPool = getUserPool();
        cognitoUser = new CognitoUser({
          Username: username,
          Pool: userPool,
        });
      }
      
      cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
        onSuccess: (session) => {
          cognitoUser!.getUserAttributes((err, attributes) => {
            if (err) {
              reject(err);
              return;
            }
            
            const userAttrs: { [key: string]: any } = {};
            attributes?.forEach(attr => {
              userAttrs[attr.getName()] = attr.getValue();
            });
            
            const user = cognitoUserToAuthUser(cognitoUser!, session, userAttrs);
            resolve(user);
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
};
