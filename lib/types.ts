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

export interface TransactionItem {
  menuItemId: string;
  name?: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  userId: string;
  shopId: string;
  amount: number;
  items: TransactionItem[];
  pointsEarned: number;
  stampsEarned: number;
  rewardRedeemed?: {
    rewardId: string;
    name: string;
    value: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTransactionInput {
  userId: string;
  shopId: string;
  amount: number;
  items: TransactionItem[];
  rewardRedeemed?: {
    rewardId: string;
    name: string;
    value: number;
  };
}
export enum StaffRole {
  BARISTA = 'BARISTA',
  MANAGER = 'MANAGER',
  OWNER = 'OWNER',
}

export interface StaffMember {
  id: string;
  userId: string;
  shopId: string;
  role: StaffRole;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffInvitation {
  id: string;
  shopId: string;
  email: string;
  role: StaffRole;
  permissions: string[];
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStaffInvitationInput {
  shopId: string;
  email: string;
  role: StaffRole;
  permissions: string[];
}

export interface UpdateStaffMemberInput {
  id: string;
  shopId: string;
  role?: StaffRole;
  permissions?: string[];
  isActive?: boolean;
}
