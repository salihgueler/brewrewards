import { API, graphqlOperation } from 'aws-amplify';
import { CreateShopInput, CreateUserInput, UserRole } from '@/lib/types';

// GraphQL Mutations
const createShopMutation = /* GraphQL */ `
  mutation CreateShop($input: CreateShopInput!) {
    createShop(input: $input) {
      id
      name
      description
      subdomain
      ownerId
      address
      phone
      email
      website
      socialMedia {
        instagram
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

const createUserMutation = /* GraphQL */ `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      firstName
      lastName
      role
      shopId
      createdAt
      updatedAt
    }
  }
`;

interface CreateShopWithAdminInput {
  shop: {
    name: string;
    description?: string;
    subdomain: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
    };
    businessHours?: Array<{
      day: string;
      openTime: string;
      closeTime: string;
      isClosed?: boolean;
    }>;
  };
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

export async function createShopWithAdmin(input: CreateShopWithAdminInput) {
  try {
    // First, create the shop
    const shopInput: CreateShopInput = {
      ...input.shop,
      ownerId: 'TEMP_OWNER_ID', // This will be updated with the admin's ID
    };

    const shopResult = await API.graphql(
      graphqlOperation(createShopMutation, { input: shopInput })
    );
    const newShop = shopResult.data.createShop;

    // Create the admin user
    const userInput: CreateUserInput = {
      email: input.admin.email,
      firstName: input.admin.firstName,
      lastName: input.admin.lastName,
      role: UserRole.SHOP_ADMIN,
      shopId: newShop.id,
    };

    const userResult = await API.graphql(
      graphqlOperation(createUserMutation, { input: userInput })
    );
    const newUser = userResult.data.createUser;

    // Update the shop's ownerId with the new admin's ID
    const updateShopMutation = /* GraphQL */ `
      mutation UpdateShop($input: UpdateShopInput!) {
        updateShop(input: { id: "${newShop.id}", ownerId: "${newUser.id}" }) {
          id
          ownerId
        }
      }
    `;

    await API.graphql(graphqlOperation(updateShopMutation));

    // Create Cognito user
    // Note: In a real implementation, you would use Cognito API to create the user
    // and set their password. This is just a placeholder.
    await createCognitoUser(input.admin.email, input.admin.password);

    return {
      shop: newShop,
      admin: newUser,
    };
  } catch (error) {
    console.error('Error creating shop with admin:', error);
    throw error;
  }
}

async function createCognitoUser(email: string, password: string) {
  // This is a placeholder for the actual Cognito user creation
  // In a real implementation, you would use the AWS SDK or Amplify Auth
  // to create the user in Cognito
  try {
    const params = {
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    };

    // Here you would use AWS SDK to create the Cognito user
    // const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
    // await cognitoIdentityServiceProvider.adminCreateUser(params).promise();

    console.log('Created Cognito user:', email);
  } catch (error) {
    console.error('Error creating Cognito user:', error);
    throw error;
  }
}
