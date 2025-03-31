#!/usr/bin/env ts-node

import { generateClient } from '@aws-amplify/api';
import { Amplify } from 'aws-amplify';
import * as dotenv from 'dotenv';
import { createTransaction } from '../graphql/mutations';
import { listShops, listUsers } from '../graphql/queries';
import { faker } from '@faker-js/faker';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Amplify
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_URL || '',
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'apiKey',
      apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY || ''
    }
  }
});

const client = generateClient();

async function generateTransactions() {
  try {
    console.log('Fetching shops...');
    const shopsResponse = await client.graphql({
      query: listShops,
      variables: { limit: 10 }
    });
    const shops = shopsResponse.data.listShops.items;
    
    console.log('Fetching users...');
    const usersResponse = await client.graphql({
      query: listUsers,
      variables: { limit: 20 }
    });
    const customers = usersResponse.data.listUsers.items.filter(
      (user: any) => user.role === 'CUSTOMER'
    );
    
    if (shops.length === 0) {
      console.error('No shops found. Please create shops first.');
      return;
    }
    
    if (customers.length === 0) {
      console.error('No customers found. Please create customers first.');
      return;
    }
    
    console.log(`Found ${shops.length} shops and ${customers.length} customers.`);
    
    // Generate transactions for each shop
    for (const shop of shops) {
      console.log(`Generating transactions for shop: ${shop.name} (${shop.id})`);
      
      // Generate 10-20 transactions per shop
      const transactionCount = faker.number.int({ min: 10, max: 20 });
      
      for (let i = 0; i < transactionCount; i++) {
        // Randomly select a customer
        const customer = customers[faker.number.int({ min: 0, max: customers.length - 1 })];
        
        // Determine transaction type (80% purchases, 20% redemptions)
        const transactionType = faker.number.int({ min: 1, max: 10 }) <= 8 ? 'PURCHASE' : 'REWARD_REDEMPTION';
        
        // Generate transaction amount
        const amount = faker.number.float({ min: 3.5, max: 15.99, precision: 0.01 });
        
        // Generate points (roughly 1 point per dollar)
        const points = transactionType === 'PURCHASE' 
          ? Math.round(amount) 
          : -Math.round(faker.number.int({ min: 5, max: 20 }));
        
        // Generate stamps (1-3 for purchases, 0 for redemptions)
        const stamps = transactionType === 'PURCHASE' 
          ? faker.number.int({ min: 1, max: 3 }) 
          : 0;
        
        // Generate items for purchases
        const items = transactionType === 'PURCHASE' 
          ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
              id: faker.string.uuid(),
              name: faker.helpers.arrayElement([
                'Espresso', 'Cappuccino', 'Latte', 'Americano', 
                'Mocha', 'Macchiato', 'Cold Brew', 'Croissant',
                'Muffin', 'Bagel', 'Cookie'
              ]),
              quantity: faker.number.int({ min: 1, max: 2 }),
              price: faker.number.float({ min: 2.5, max: 6.99, precision: 0.01 })
            }))
          : undefined;
        
        // Generate transaction date (within the last 30 days)
        const createdAt = faker.date.recent({ days: 30 }).toISOString();
        
        // Create the transaction
        const transactionInput = {
          shopId: shop.id,
          userId: customer.id,
          amount,
          points,
          stamps,
          type: transactionType,
          items,
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
          createdAt
        };
        
        try {
          const response = await client.graphql({
            query: createTransaction,
            variables: { input: transactionInput }
          });
          
          console.log(`Created transaction: ${response.data.createTransaction.id}`);
        } catch (error) {
          console.error('Error creating transaction:', error);
        }
      }
    }
    
    console.log('Demo transactions generated successfully!');
  } catch (error) {
    console.error('Error generating demo data:', error);
  }
}

generateTransactions().catch(console.error);
