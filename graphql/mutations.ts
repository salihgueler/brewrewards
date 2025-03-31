// GraphQL Mutations

// Shop Mutations
export const createShopMutation = `
  mutation CreateShop($input: CreateShopInput!) {
    createShop(input: $input) {
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
      createdAt
      updatedAt
    }
  }
`;

export const updateShopMutation = `
  mutation UpdateShop($input: UpdateShopInput!) {
    updateShop(input: $input) {
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
      createdAt
      updatedAt
    }
  }
`;

export const deleteShopMutation = `
  mutation DeleteShop($id: ID!) {
    deleteShop(id: $id) {
      id
    }
  }
`;

// Menu Item Mutations
export const createMenuItemMutation = `
  mutation CreateMenuItem($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
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

export const updateMenuItemMutation = `
  mutation UpdateMenuItem($input: UpdateMenuItemInput!) {
    updateMenuItem(input: $input) {
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

export const deleteMenuItemMutation = `
  mutation DeleteMenuItem($shopId: ID!, $id: ID!) {
    deleteMenuItem(shopId: $shopId, id: $id) {
      id
      shopId
    }
  }
`;

// Reward Mutations
export const createRewardMutation = `
  mutation CreateReward($input: CreateRewardInput!) {
    createReward(input: $input) {
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

export const updateRewardMutation = `
  mutation UpdateReward($input: UpdateRewardInput!) {
    updateReward(input: $input) {
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

export const deleteRewardMutation = `
  mutation DeleteReward($shopId: ID!, $id: ID!) {
    deleteReward(shopId: $shopId, id: $id) {
      id
      shopId
    }
  }
`;

// Stamp Card Mutations
export const createStampCardMutation = `
  mutation CreateStampCard($input: CreateStampCardInput!) {
    createStampCard(input: $input) {
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

export const updateStampCardMutation = `
  mutation UpdateStampCard($input: UpdateStampCardInput!) {
    updateStampCard(input: $input) {
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

export const deleteStampCardMutation = `
  mutation DeleteStampCard($shopId: ID!, $id: ID!) {
    deleteStampCard(shopId: $shopId, id: $id) {
      id
      shopId
    }
  }
`;

// User Reward Mutations
export const addPointsMutation = `
  mutation AddPoints($userId: ID!, $shopId: ID!, $points: Int!) {
    addPoints(userId: $userId, shopId: $shopId, points: $points) {
      userId
      shopId
      points
      createdAt
      updatedAt
    }
  }
`;

export const addStampMutation = `
  mutation AddStamp($userId: ID!, $shopId: ID!, $cardId: ID!) {
    addStamp(userId: $userId, shopId: $shopId, cardId: $cardId) {
      userId
      shopId
      stamps {
        cardId
        currentStamps
        lastStampDate
      }
      createdAt
      updatedAt
    }
  }
`;

export const redeemRewardMutation = `
  mutation RedeemReward($userId: ID!, $shopId: ID!, $rewardId: ID!) {
    redeemReward(userId: $userId, shopId: $shopId, rewardId: $rewardId) {
      userId
      shopId
      points
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
