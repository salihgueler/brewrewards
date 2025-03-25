import { graphql } from '../api';

// Types
export interface Shop {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  subdomain: string;
  ownerId: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  businessHours?: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ShopConnection {
  items: Shop[];
  nextToken?: string;
}

export interface CreateShopInput {
  name: string;
  description?: string;
  logo?: string;
  subdomain: string;
  ownerId: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  businessHours?: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }>;
}

export interface UpdateShopInput {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  businessHours?: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }>;
}

// GraphQL Queries and Mutations
const GET_SHOP = `
  query GetShop($id: ID!) {
    getShop(id: $id) {
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

const GET_SHOP_BY_SUBDOMAIN = `
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

const LIST_SHOPS = `
  query ListShops($limit: Int, $nextToken: String) {
    listShops(limit: $limit, nextToken: $nextToken) {
      items {
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const CREATE_SHOP = `
  mutation CreateShop($input: CreateShopInput!) {
    createShop(input: $input) {
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

const UPDATE_SHOP = `
  mutation UpdateShop($input: UpdateShopInput!) {
    updateShop(input: $input) {
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

const DELETE_SHOP = `
  mutation DeleteShop($id: ID!) {
    deleteShop(id: $id) {
      id
      name
    }
  }
`;

// API Functions
export const shopApi = {
  /**
   * Get a shop by ID
   */
  getShop: async (id: string): Promise<Shop> => {
    try {
      const response = await graphql.query<{ getShop: Shop }>(GET_SHOP, { id });
      return response.getShop;
    } catch (error) {
      console.error('Error fetching shop:', error);
      throw error;
    }
  },

  /**
   * Get a shop by subdomain
   */
  getShopBySubdomain: async (subdomain: string): Promise<Shop> => {
    try {
      const response = await graphql.query<{ getShopBySubdomain: Shop }>(
        GET_SHOP_BY_SUBDOMAIN,
        { subdomain }
      );
      return response.getShopBySubdomain;
    } catch (error) {
      console.error('Error fetching shop by subdomain:', error);
      throw error;
    }
  },

  /**
   * List all shops with pagination
   */
  listShops: async (limit?: number, nextToken?: string): Promise<ShopConnection> => {
    try {
      const response = await graphql.query<{ listShops: ShopConnection }>(
        LIST_SHOPS,
        { limit, nextToken }
      );
      return response.listShops;
    } catch (error) {
      console.error('Error listing shops:', error);
      throw error;
    }
  },

  /**
   * Create a new shop
   */
  createShop: async (input: CreateShopInput): Promise<Shop> => {
    try {
      const response = await graphql.mutate<{ createShop: Shop }>(
        CREATE_SHOP,
        { input }
      );
      return response.createShop;
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  },

  /**
   * Update an existing shop
   */
  updateShop: async (input: UpdateShopInput): Promise<Shop> => {
    try {
      const response = await graphql.mutate<{ updateShop: Shop }>(
        UPDATE_SHOP,
        { input }
      );
      return response.updateShop;
    } catch (error) {
      console.error('Error updating shop:', error);
      throw error;
    }
  },

  /**
   * Delete a shop
   */
  deleteShop: async (id: string): Promise<{ id: string; name: string }> => {
    try {
      const response = await graphql.mutate<{ deleteShop: { id: string; name: string } }>(
        DELETE_SHOP,
        { id }
      );
      return response.deleteShop;
    } catch (error) {
      console.error('Error deleting shop:', error);
      throw error;
    }
  }
};
