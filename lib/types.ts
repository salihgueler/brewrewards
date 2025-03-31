export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SHOP_ADMIN = 'SHOP_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface CreateShopInput {
  name: string;
  description?: string;
  logo?: string;
  subdomain: string;
  ownerId: string;
  address?: string;
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

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  shopId?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  subdomain: string;
  ownerId: string;
  address?: string;
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  shopId?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}
