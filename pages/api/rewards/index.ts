import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api-utils';
import { Reward } from '@/lib/types';

/**
 * API endpoint to get rewards
 * Accessible by any authenticated user
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user from the request (added by the middleware)
    const user = (req as any).user;
    const { shopId } = req.query;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // If a shopId is provided, validate it
    if (shopId && typeof shopId !== 'string') {
      return res.status(400).json({ error: 'Invalid shop ID' });
    }

    // In a real implementation, this would fetch rewards from a database
    // based on the user's role and the requested shop
    const rewards: Partial<Reward>[] = [
      {
        id: 'reward_1',
        shopId: shopId || 'shop_1',
        loyaltyProgramId: 'program_1',
        name: 'Free Coffee',
        description: 'Get a free coffee of your choice',
        pointsCost: 50,
        isActive: true,
      },
      {
        id: 'reward_2',
        shopId: shopId || 'shop_1',
        loyaltyProgramId: 'program_1',
        name: 'Free Pastry',
        description: 'Get a free pastry of your choice',
        pointsCost: 75,
        isActive: true,
      },
      {
        id: 'reward_3',
        shopId: shopId || 'shop_1',
        loyaltyProgramId: 'program_1',
        name: '10% Off Order',
        description: 'Get 10% off your next order',
        pointsCost: 25,
        isActive: true,
      },
    ];

    return res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with authentication check
export default withAuth(handler);
