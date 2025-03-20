import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/api-utils';

/**
 * API endpoint to get the current user's information
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
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real implementation, this would fetch additional user data from a database
    const userData = {
      id: user.id,
      email: 'user@example.com', // This would come from the database
      firstName: 'John',
      lastName: 'Doe',
      role: user.role,
      shopId: user.shopId,
      preferences: {
        notifications: true,
        marketing: false,
      },
      // Add more user data as needed
    };

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with authentication check
export default withAuth(handler);
