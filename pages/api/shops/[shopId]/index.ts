import { NextApiRequest, NextApiResponse } from 'next';
import { withShopAdminOnly, canAccessShop } from '@/lib/api-utils';

/**
 * API endpoint to manage a specific coffee shop
 * Accessible by super admins and the shop's admin
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shopId } = req.query;

  if (!shopId || Array.isArray(shopId)) {
    return res.status(400).json({ error: 'Invalid shop ID' });
  }

  // Check if the user has access to this shop
  if (!canAccessShop(req, shopId)) {
    return res.status(403).json({ error: 'Forbidden: You do not have access to this shop' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getShopDetails(req, res, shopId);
    case 'PUT':
      return updateShop(req, res, shopId);
    case 'DELETE':
      return deleteShop(req, res, shopId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get shop details
 */
async function getShopDetails(req: NextApiRequest, res: NextApiResponse, shopId: string) {
  try {
    // In a real implementation, this would fetch from a database
    const shop = {
      id: shopId,
      name: 'Demo Coffee Shop',
      subdomain: 'demo',
      description: 'A cozy coffee shop in downtown',
      address: '123 Main St, Anytown, USA',
      contact: {
        phone: '555-123-4567',
        email: 'contact@democoffee.com',
        website: 'https://democoffee.com',
      },
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
      ownerId: 'user_123',
    };

    return res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    console.error('Error fetching shop details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update shop details
 */
async function updateShop(req: NextApiRequest, res: NextApiResponse, shopId: string) {
  try {
    const { name, description, address, contact, settings } = req.body;

    // Validate required fields
    if (!name || !address || !contact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real implementation, this would update the database
    const updatedShop = {
      id: shopId,
      name,
      description,
      address,
      contact,
      settings,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data: updatedShop,
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a shop (only super admins can do this)
 */
async function deleteShop(req: NextApiRequest, res: NextApiResponse, shopId: string) {
  try {
    // Check if the user is a super admin
    const user = (req as any).user;
    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only super admins can delete shops' });
    }

    // In a real implementation, this would delete from the database
    // or mark as inactive

    return res.status(200).json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with shop admin role check
export default withShopAdminOnly(handler);
