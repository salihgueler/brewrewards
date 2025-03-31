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
