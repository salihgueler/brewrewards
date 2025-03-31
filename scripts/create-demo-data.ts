/**
 * Script to create demo data for the BrewRewards application
 * 
 * This script creates:
 * - Multiple coffee shops (tenants)
 * - Shop admins for each shop
 * - Menu items for each shop
 * - Loyalty programs for each shop
 * - Customers with varying levels of engagement across shops
 * - Transactions for customers across shops
 * 
 * Run this script with:
 * npx ts-node scripts/create-demo-data.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const dynamodb = new DynamoDB({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocument.from(dynamodb);

// Table names - update these to match your deployed tables
const SHOPS_TABLE = 'BrewRewardsStack-ShopsTable';
const USERS_TABLE = 'BrewRewardsStack-UsersTable';
const MENU_TABLE = 'BrewRewardsStack-MenuTable';
const REWARDS_TABLE = 'BrewRewardsStack-RewardsTable';
const STAMP_CARDS_TABLE = 'BrewRewardsStack-StampCardsTable';
const USER_REWARDS_TABLE = 'BrewRewardsStack-UserRewardsTable';
const TRANSACTIONS_TABLE = 'BrewRewardsStack-TransactionsTable';

// Demo data
const shops = [
  {
    id: uuidv4(),
    name: 'Sunrise Coffee',
    description: 'A cozy coffee shop with a view of the sunrise.',
    logo: 'https://example.com/sunrise-logo.png',
    subdomain: 'sunrise',
    address: '123 Sunrise Ave',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'USA',
    phone: '555-123-4567',
    email: 'info@sunrisecoffee.com',
    website: 'https://sunrisecoffee.com',
  },
  {
    id: uuidv4(),
    name: 'Urban Brew',
    description: 'Modern coffee shop in the heart of downtown.',
    logo: 'https://example.com/urban-logo.png',
    subdomain: 'urban',
    address: '456 Main St',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'USA',
    phone: '555-987-6543',
    email: 'hello@urbanbrew.com',
    website: 'https://urbanbrew.com',
  },
  {
    id: uuidv4(),
    name: 'Mountain Bean',
    description: 'Coffee with a mountain view.',
    logo: 'https://example.com/mountain-logo.png',
    subdomain: 'mountain',
    address: '789 Alpine Rd',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    country: 'USA',
    phone: '555-456-7890',
    email: 'contact@mountainbean.com',
    website: 'https://mountainbean.com',
  },
];

// Create shop admins
const shopAdmins = shops.map(shop => ({
  id: uuidv4(),
  email: `admin@${shop.subdomain}.com`,
  firstName: `${shop.name.split(' ')[0]}`,
  lastName: 'Admin',
  role: 'SHOP_ADMIN',
  shopId: shop.id,
}));

// Create customers
const customers = [
  {
    id: uuidv4(),
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'CUSTOMER',
  },
  {
    id: uuidv4(),
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Smith',
    role: 'CUSTOMER',
  },
  {
    id: uuidv4(),
    email: 'charlie@example.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    role: 'CUSTOMER',
  },
  {
    id: uuidv4(),
    email: 'diana@example.com',
    firstName: 'Diana',
    lastName: 'Miller',
    role: 'CUSTOMER',
  },
];

// Create menu items for each shop
const createMenuItems = (shopId: string) => {
  const coffeeItems = [
    {
      id: uuidv4(),
      shopId,
      name: 'Espresso',
      description: 'Strong and rich espresso shot.',
      price: 3.50,
      category: 'Coffee',
      isAvailable: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam.',
      price: 4.75,
      category: 'Coffee',
      isAvailable: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: 'Latte',
      description: 'Espresso with steamed milk.',
      price: 4.50,
      category: 'Coffee',
      isAvailable: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: 'Americano',
      description: 'Espresso with hot water.',
      price: 3.75,
      category: 'Coffee',
      isAvailable: true,
    },
  ];
  
  const teaItems = [
    {
      id: uuidv4(),
      shopId,
      name: 'Green Tea',
      description: 'Refreshing green tea.',
      price: 3.25,
      category: 'Tea',
      isAvailable: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: 'Earl Grey',
      description: 'Classic black tea with bergamot.',
      price: 3.25,
      category: 'Tea',
      isAvailable: true,
    },
  ];
  
  const foodItems = [
    {
      id: uuidv4(),
      shopId,
      name: 'Croissant',
      description: 'Buttery and flaky croissant.',
      price: 3.50,
      category: 'Pastry',
      isAvailable: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: 'Blueberry Muffin',
      description: 'Moist muffin filled with blueberries.',
      price: 3.75,
      category: 'Pastry',
      isAvailable: true,
    },
  ];
  
  return [...coffeeItems, ...teaItems, ...foodItems];
};

// Create rewards for each shop
const createRewards = (shopId: string) => {
  return [
    {
      id: uuidv4(),
      shopId,
      name: 'Free Coffee',
      description: 'Redeem for any small coffee.',
      pointsRequired: 50,
      isActive: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: 'Free Pastry',
      description: 'Redeem for any pastry.',
      pointsRequired: 75,
      isActive: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: '$5 Off',
      description: '$5 off your next purchase.',
      pointsRequired: 100,
      isActive: true,
    },
  ];
};

// Create stamp cards for each shop
const createStampCards = (shopId: string) => {
  return [
    {
      id: uuidv4(),
      shopId,
      name: 'Coffee Lovers',
      description: 'Buy 10 coffees, get 1 free.',
      stampsRequired: 10,
      reward: 'Free Coffee',
      isActive: true,
    },
    {
      id: uuidv4(),
      shopId,
      name: 'Tea Time',
      description: 'Buy 8 teas, get 1 free.',
      stampsRequired: 8,
      reward: 'Free Tea',
      isActive: true,
    },
  ];
};

// Create user rewards for customers across shops
const createUserRewards = () => {
  const userRewards = [];
  
  for (const customer of customers) {
    for (const shop of shops) {
      // Vary engagement levels across shops and customers
      const points = Math.floor(Math.random() * 200);
      const stampCards = createStampCards(shop.id);
      
      userRewards.push({
        userId: customer.id,
        shopId: shop.id,
        points,
        stamps: stampCards.map(card => ({
          cardId: card.id,
          currentStamps: Math.floor(Math.random() * card.stampsRequired),
          lastStampDate: new Date().toISOString(),
        })),
        rewardHistory: [],
      });
    }
  }
  
  return userRewards;
};

// Create transactions for customers across shops
const createTransactions = () => {
  const transactions = [];
  const menuItemsByShop = {};
  
  // First, organize menu items by shop
  shops.forEach(shop => {
    menuItemsByShop[shop.id] = createMenuItems(shop.id);
  });
  
  // Create transactions for each customer at each shop
  for (const customer of customers) {
    for (const shop of shops) {
      // Create between 1-5 transactions per customer per shop
      const transactionCount = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < transactionCount; i++) {
        // Get random menu items for this shop
        const shopMenuItems = menuItemsByShop[shop.id];
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const transactionItems = [];
        let totalAmount = 0;
        
        // Add random items to the transaction
        for (let j = 0; j < itemCount; j++) {
          const menuItem = shopMenuItems[Math.floor(Math.random() * shopMenuItems.length)];
          const quantity = Math.floor(Math.random() * 2) + 1;
          const price = menuItem.price;
          
          transactionItems.push({
            menuItemId: menuItem.id,
            name: menuItem.name,
            quantity,
            price,
          });
          
          totalAmount += price * quantity;
        }
        
        // Create the transaction
        const transaction = {
          id: uuidv4(),
          userId: customer.id,
          shopId: shop.id,
          amount: totalAmount,
          items: transactionItems,
          pointsEarned: Math.floor(totalAmount),
          stampsEarned: totalAmount >= 5 ? 1 : 0,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        };
        
        transactions.push(transaction);
      }
    }
  }
  
  return transactions;
};

// Function to save data to DynamoDB
async function saveData() {
  try {
    console.log('Creating demo data...');
    
    // Save shops
    console.log('Creating shops...');
    for (const shop of shops) {
      await docClient.put({
        TableName: SHOPS_TABLE,
        Item: {
          PK: `SHOP#${shop.id}`,
          SK: `SHOP#${shop.id}`,
          ...shop,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    
    // Save shop admins
    console.log('Creating shop admins...');
    for (const admin of shopAdmins) {
      await docClient.put({
        TableName: USERS_TABLE,
        Item: {
          PK: `USER#${admin.id}`,
          SK: `USER#${admin.id}`,
          'GSI1-PK': `SHOP#${admin.shopId}`,
          'GSI1-SK': `USER#${admin.id}`,
          ...admin,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    
    // Save customers
    console.log('Creating customers...');
    for (const customer of customers) {
      await docClient.put({
        TableName: USERS_TABLE,
        Item: {
          PK: `USER#${customer.id}`,
          SK: `USER#${customer.id}`,
          ...customer,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    
    // Save menu items for each shop
    console.log('Creating menu items...');
    for (const shop of shops) {
      const menuItems = createMenuItems(shop.id);
      for (const item of menuItems) {
        await docClient.put({
          TableName: MENU_TABLE,
          Item: {
            PK: `SHOP#${shop.id}`,
            SK: `ITEM#${item.id}`,
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }
    
    // Save rewards for each shop
    console.log('Creating rewards...');
    for (const shop of shops) {
      const rewards = createRewards(shop.id);
      for (const reward of rewards) {
        await docClient.put({
          TableName: REWARDS_TABLE,
          Item: {
            PK: `SHOP#${shop.id}`,
            SK: `REWARD#${reward.id}`,
            ...reward,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }
    
    // Save stamp cards for each shop
    console.log('Creating stamp cards...');
    for (const shop of shops) {
      const stampCards = createStampCards(shop.id);
      for (const card of stampCards) {
        await docClient.put({
          TableName: STAMP_CARDS_TABLE,
          Item: {
            PK: `SHOP#${shop.id}`,
            SK: `CARD#${card.id}`,
            ...card,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }
    
    // Save user rewards
    console.log('Creating user rewards...');
    const userRewards = createUserRewards();
    for (const reward of userRewards) {
      await docClient.put({
        TableName: USER_REWARDS_TABLE,
        Item: {
          PK: `USER#${reward.userId}`,
          SK: `SHOP#${reward.shopId}`,
          ...reward,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    
    // Save transactions
    console.log('Creating transactions...');
    const transactions = createTransactions();
    for (const transaction of transactions) {
      await docClient.put({
        TableName: TRANSACTIONS_TABLE,
        Item: {
          PK: `TXN#${transaction.id}`,
          SK: `TXN#${transaction.id}`,
          'GSI1-PK': `USER#${transaction.userId}`,
          'GSI1-SK': `TXN#${transaction.createdAt}`,
          'GSI2-PK': `SHOP#${transaction.shopId}`,
          'GSI2-SK': `TXN#${transaction.createdAt}`,
          ...transaction,
          updatedAt: new Date().toISOString(),
        },
      });
    }
    
    console.log('Demo data created successfully!');
    console.log(`Created ${shops.length} shops`);
    console.log(`Created ${shopAdmins.length} shop admins`);
    console.log(`Created ${customers.length} customers`);
    console.log(`Created ${transactions.length} transactions`);
    
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
}

// Run the script
saveData();
