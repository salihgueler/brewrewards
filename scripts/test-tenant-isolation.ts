#!/usr/bin/env ts-node

import { generateClient } from '@aws-amplify/api';
import { Amplify, Auth } from 'aws-amplify';
import * as dotenv from 'dotenv';
import { listTransactionsByShop } from '../graphql/queries';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Amplify
Amplify.configure({
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
    userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
  },
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_URL || '',
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool'
    }
  }
});

const client = generateClient();

async function testTenantIsolation() {
  try {
    console.log(chalk.blue('=== Testing Multi-Tenant Isolation ==='));
    
    // Test credentials
    const shopAdminA = {
      username: 'shopadmin-a@example.com',
      password: 'Password123',
      shopId: 'shop-a-id' // Replace with actual shop ID
    };
    
    const shopAdminB = {
      username: 'shopadmin-b@example.com',
      password: 'Password123',
      shopId: 'shop-b-id' // Replace with actual shop ID
    };
    
    // Step 1: Sign in as Shop Admin A
    console.log(chalk.yellow(`\nStep 1: Signing in as Shop Admin A (${shopAdminA.username})`));
    try {
      await Auth.signIn(shopAdminA.username, shopAdminA.password);
      console.log(chalk.green('✓ Successfully signed in as Shop Admin A'));
      
      // Step 2: Fetch transactions for Shop A
      console.log(chalk.yellow(`\nStep 2: Fetching transactions for Shop A (${shopAdminA.shopId})`));
      const shopAResponse = await client.graphql({
        query: listTransactionsByShop,
        variables: { shopId: shopAdminA.shopId, limit: 5 }
      });
      
      const shopATransactions = shopAResponse.data.listTransactionsByShop.items;
      console.log(chalk.green(`✓ Successfully fetched ${shopATransactions.length} transactions for Shop A`));
      
      // Step 3: Try to fetch transactions for Shop B (should fail)
      console.log(chalk.yellow(`\nStep 3: Attempting to fetch transactions for Shop B (${shopAdminB.shopId}) as Shop Admin A`));
      try {
        await client.graphql({
          query: listTransactionsByShop,
          variables: { shopId: shopAdminB.shopId, limit: 5 }
        });
        console.log(chalk.red('✗ ERROR: Shop Admin A was able to access Shop B data! Tenant isolation failed.'));
      } catch (error) {
        console.log(chalk.green('✓ Correctly denied access to Shop B data for Shop Admin A'));
      }
      
      // Sign out Shop Admin A
      await Auth.signOut();
      console.log(chalk.blue('\nSigned out Shop Admin A'));
      
      // Step 4: Sign in as Shop Admin B
      console.log(chalk.yellow(`\nStep 4: Signing in as Shop Admin B (${shopAdminB.username})`));
      await Auth.signIn(shopAdminB.username, shopAdminB.password);
      console.log(chalk.green('✓ Successfully signed in as Shop Admin B'));
      
      // Step 5: Fetch transactions for Shop B
      console.log(chalk.yellow(`\nStep 5: Fetching transactions for Shop B (${shopAdminB.shopId})`));
      const shopBResponse = await client.graphql({
        query: listTransactionsByShop,
        variables: { shopId: shopAdminB.shopId, limit: 5 }
      });
      
      const shopBTransactions = shopBResponse.data.listTransactionsByShop.items;
      console.log(chalk.green(`✓ Successfully fetched ${shopBTransactions.length} transactions for Shop B`));
      
      // Step 6: Try to fetch transactions for Shop A (should fail)
      console.log(chalk.yellow(`\nStep 6: Attempting to fetch transactions for Shop A (${shopAdminA.shopId}) as Shop Admin B`));
      try {
        await client.graphql({
          query: listTransactionsByShop,
          variables: { shopId: shopAdminA.shopId, limit: 5 }
        });
        console.log(chalk.red('✗ ERROR: Shop Admin B was able to access Shop A data! Tenant isolation failed.'));
      } catch (error) {
        console.log(chalk.green('✓ Correctly denied access to Shop A data for Shop Admin B'));
      }
      
      // Sign out Shop Admin B
      await Auth.signOut();
      console.log(chalk.blue('\nSigned out Shop Admin B'));
      
      console.log(chalk.green('\n=== Tenant Isolation Test Completed Successfully ==='));
    } catch (error) {
      console.error(chalk.red('Error during tenant isolation test:'), error);
    }
  } catch (error) {
    console.error(chalk.red('Error setting up tenant isolation test:'), error);
  }
}

testTenantIsolation().catch(console.error);
