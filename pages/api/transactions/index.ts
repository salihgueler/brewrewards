import { NextApiRequest, NextApiResponse } from 'next';
import { withShopStaffOnly, canAccessShop } from '@/lib/api-utils';
import { Transaction } from '@/lib/types';

/**
 * API endpoint to manage transactions
 * Accessible by shop staff, shop admins, and super admins
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getTransactions(req, res);
    case 'POST':
      return createTransaction(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get transactions for a shop
 */
async function getTransactions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { shopId, userId, startDate, endDate, limit = '10', page = '1' } = req.query;

    // Validate shopId
    if (!shopId || Array.isArray(shopId)) {
      return res.status(400).json({ error: 'Invalid shop ID' });
    }

    // Check if the user has access to this shop
    if (!canAccessShop(req, shopId)) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this shop' });
    }

    // In a real implementation, this would fetch from a database with filtering
    const transactions: Partial<Transaction>[] = [
      {
        id: 'txn_1',
        userId: 'user_1',
        shopId,
        amount: 12.50,
        pointsEarned: 12,
        stampsEarned: 1,
        createdAt: '2025-03-15T10:30:00Z',
      },
      {
        id: 'txn_2',
        userId: 'user_2',
        shopId,
        amount: 8.75,
        pointsEarned: 8,
        stampsEarned: 1,
        createdAt: '2025-03-15T11:45:00Z',
      },
    ];

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: 2,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create a new transaction
 */
async function createTransaction(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, shopId, amount, items } = req.body;

    // Validate required fields
    if (!userId || !shopId || !amount || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the user has access to this shop
    if (!canAccessShop(req, shopId)) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this shop' });
    }

    // Calculate points and stamps based on purchase
    // This is a simple example - in a real app, this would be more complex
    const pointsEarned = Math.floor(amount);
    const stampsEarned = amount >= 5 ? 1 : 0;

    // In a real implementation, this would save to a database
    const transaction: Partial<Transaction> = {
      id: 'txn_' + Math.random().toString(36).substring(2, 15),
      userId,
      shopId,
      amount,
      items,
      pointsEarned,
      stampsEarned,
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with shop staff role check
export default withShopStaffOnly(handler);
