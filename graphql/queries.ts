// GraphQL Queries

// Shop Queries
export const getShopQuery = `
  query GetShop($id: ID!) {
    getShop(id: $id) {
      id
      name
      description
      address
      city
      state
      zipCode
      phone
      email
      website
      logo
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

export const getShopBySubdomainQuery = `
  query GetShopBySubdomain($subdomain: String!) {
    getShopBySubdomain(subdomain: $subdomain) {
      id
      name
      description
      address
      city
      state
      zipCode
      phone
      email
      website
      logo
      subdomain
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

export const listShopsQuery = `
  query ListShops($limit: Int, $nextToken: String) {
    listShops(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        address
        city
        state
        zipCode
        logo
        subdomain
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Menu Item Queries
export const getMenuItemQuery = `
  query GetMenuItem($shopId: ID!, $id: ID!) {
    getMenuItem(shopId: $shopId, id: $id) {
      id
      shopId
      name
      description
      price
      category
      image
      imageKey
      isAvailable
      allergens
      nutritionalInfo
      createdAt
      updatedAt
    }
  }
`;

export const listMenuItemsQuery = `
  query ListMenuItems($shopId: ID!, $category: String, $limit: Int, $nextToken: String) {
    listMenuItems(shopId: $shopId, category: $category, limit: $limit, nextToken: $nextToken) {
      items {
        id
        shopId
        name
        description
        price
        category
        image
        imageKey
        isAvailable
        allergens
        nutritionalInfo
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// User Queries
export const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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

export const listUsersQuery = `
  query ListUsers($shopId: ID, $limit: Int, $nextToken: String) {
    listUsers(shopId: $shopId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        firstName
        lastName
        role
        shopId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Reward Queries
export const getRewardQuery = `
  query GetReward($shopId: ID!, $id: ID!) {
    getReward(shopId: $shopId, id: $id) {
      id
      shopId
      name
      description
      pointsRequired
      image
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const listRewardsQuery = `
  query ListRewards($shopId: ID!, $limit: Int, $nextToken: String) {
    listRewards(shopId: $shopId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        shopId
        name
        description
        pointsRequired
        image
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Stamp Card Queries
export const getStampCardQuery = `
  query GetStampCard($shopId: ID!, $id: ID!) {
    getStampCard(shopId: $shopId, id: $id) {
      id
      shopId
      name
      description
      stampsRequired
      reward
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const listStampCardsQuery = `
  query ListStampCards($shopId: ID!, $limit: Int, $nextToken: String) {
    listStampCards(shopId: $shopId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        shopId
        name
        description
        stampsRequired
        reward
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// User Reward Queries
export const getUserRewardQuery = `
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

export const listUserRewardsQuery = `
  query ListUserRewards($userId: ID, $shopId: ID, $limit: Int, $nextToken: String) {
    listUserRewards(userId: $userId, shopId: $shopId, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

// Transaction queries
export const getTransaction = /* GraphQL */ `
  query GetTransaction($id: ID!) {
    getTransaction(id: $id) {
      id
      userId
      shopId
      amount
      items {
        menuItemId
        name
        quantity
        price
      }
      pointsEarned
      stampsEarned
      rewardRedeemed {
        rewardId
        name
        value
      }
      createdAt
      updatedAt
    }
  }
`;

export const listTransactions = /* GraphQL */ `
  query ListTransactions(
    $shopId: ID!
    $userId: ID
    $startDate: AWSDateTime
    $endDate: AWSDateTime
    $limit: Int
    $nextToken: String
  ) {
    listTransactions(
      shopId: $shopId
      userId: $userId
      startDate: $startDate
      endDate: $endDate
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        shopId
        amount
        items {
          menuItemId
          name
          quantity
          price
        }
        pointsEarned
        stampsEarned
        rewardRedeemed {
          rewardId
          name
          value
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const listUserTransactions = /* GraphQL */ `
  query ListUserTransactions(
    $userId: ID!
    $shopId: ID
    $startDate: AWSDateTime
    $endDate: AWSDateTime
    $limit: Int
    $nextToken: String
  ) {
    listUserTransactions(
      userId: $userId
      shopId: $shopId
      startDate: $startDate
      endDate: $endDate
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        shopId
        amount
        items {
          menuItemId
          name
          quantity
          price
        }
        pointsEarned
        stampsEarned
        rewardRedeemed {
          rewardId
          name
          value
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
// Staff Management queries
export const getStaffMember = /* GraphQL */ `
  query GetStaffMember($id: ID!) {
    getStaffMember(id: $id) {
      id
      userId
      shopId
      role
      permissions
      isActive
      user {
        id
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

export const listStaffMembers = /* GraphQL */ `
  query ListStaffMembers(
    $shopId: ID!
    $limit: Int
    $nextToken: String
  ) {
    listStaffMembers(
      shopId: $shopId
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        shopId
        role
        permissions
        isActive
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getStaffInvitation = /* GraphQL */ `
  query GetStaffInvitation($id: ID!) {
    getStaffInvitation(id: $id) {
      id
      shopId
      email
      role
      permissions
      status
      expiresAt
      createdAt
      updatedAt
    }
  }
`;

export const listStaffInvitations = /* GraphQL */ `
  query ListStaffInvitations(
    $shopId: ID!
    $status: String
    $limit: Int
    $nextToken: String
  ) {
    listStaffInvitations(
      shopId: $shopId
      status: $status
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        shopId
        email
        role
        permissions
        status
        expiresAt
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
// Transaction queries
export const getTransaction = /* GraphQL */ `
  query GetTransaction($id: ID!, $shopId: ID!) {
    getTransaction(id: $id, shopId: $shopId) {
      id
      shopId
      userId
      amount
      points
      stamps
      type
      status
      items {
        id
        name
        quantity
        price
      }
      rewardId
      notes
      createdAt
      updatedAt
    }
  }
`;

export const listTransactionsByShop = /* GraphQL */ `
  query ListTransactionsByShop(
    $shopId: ID!
    $limit: Int
    $nextToken: String
    $startDate: AWSDateTime
    $endDate: AWSDateTime
  ) {
    listTransactionsByShop(
      shopId: $shopId
      limit: $limit
      nextToken: $nextToken
      startDate: $startDate
      endDate: $endDate
    ) {
      items {
        id
        shopId
        userId
        amount
        points
        stamps
        type
        status
        items {
          id
          name
          quantity
          price
        }
        rewardId
        notes
        createdAt
        updatedAt
        user {
          id
          email
          firstName
          lastName
        }
      }
      nextToken
    }
  }
`;

export const listTransactionsByUser = /* GraphQL */ `
  query ListTransactionsByUser(
    $userId: ID!
    $limit: Int
    $nextToken: String
    $startDate: AWSDateTime
    $endDate: AWSDateTime
  ) {
    listTransactionsByUser(
      userId: $userId
      limit: $limit
      nextToken: $nextToken
      startDate: $startDate
      endDate: $endDate
    ) {
      items {
        id
        shopId
        userId
        amount
        points
        stamps
        type
        status
        items {
          id
          name
          quantity
          price
        }
        rewardId
        notes
        createdAt
        updatedAt
        shop {
          id
          name
          logoUrl
        }
      }
      nextToken
    }
  }
`;
