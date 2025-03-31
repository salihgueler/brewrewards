import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { getShopBySubdomainQuery, getShopQuery } from '@/graphql/queries';

interface UseShopOptions {
  initialLoading?: boolean;
}

export function useShop(shopIdOrSubdomain: string, options: UseShopOptions = {}) {
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Determine if we're using an ID or subdomain
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shopIdOrSubdomain);
        
        let result;
        if (isUuid) {
          // Fetch by ID
          result = await executeQuery<{ getShop: any }>(
            getShopQuery,
            { id: shopIdOrSubdomain }
          );
          setShop(result.getShop);
        } else {
          // Fetch by subdomain
          result = await executeQuery<{ getShopBySubdomain: any }>(
            getShopBySubdomainQuery,
            { subdomain: shopIdOrSubdomain }
          );
          setShop(result.getShopBySubdomain);
        }
      } catch (err) {
        console.error('Error fetching shop:', err);
        setError(err instanceof Error ? err : new Error('Failed to load shop data'));
      } finally {
        setIsLoading(false);
      }
    };

    if (shopIdOrSubdomain) {
      fetchShop();
    }
  }, [shopIdOrSubdomain]);

  return { shop, isLoading, error, setShop };
}
