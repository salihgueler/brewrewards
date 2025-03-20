import { NextApiRequest, NextApiResponse } from 'next';
import { withSuperAdminOnly } from '@/lib/api-utils';
import { Shop } from '@/lib/types';

/**
 * API endpoint to create a new coffee shop
 * Only accessible by super admins
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract shop data from request body
    const { name, subdomain, description, address, contact, ownerId } = req.body;

    // Validate required fields
    if (!name || !subdomain || !address || !contact || !ownerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if subdomain is already in use
    // In a real implementation, this would query a database
    const subdomainExists = false; // Replace with actual check

    if (subdomainExists) {
      return res.status(400).json({ error: 'Subdomain already in use' });
    }

    // Create the shop
    // In a real implementation, this would save to a database
    const shop: Partial<Shop> = {
      name,
      subdomain,
      description,
      address,
      contact,
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Return the created shop
    return res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: {
        ...shop,
        id: 'shop_' + Math.random().toString(36).substring(2, 15), // Mock ID
      },
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with super admin role check
export default withSuperAdminOnly(handler);
