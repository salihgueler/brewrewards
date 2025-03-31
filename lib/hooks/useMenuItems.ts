import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { listMenuItemsQuery } from '@/graphql/queries';

interface UseMenuItemsOptions {
  initialLoading?: boolean;
  category?: string;
  limit?: number;
}

export function useMenuItems(shopId: string, options: UseMenuItemsOptions = {}) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchMenuItems = async (token?: string) => {
    if (!shopId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const variables = {
        shopId,
        category: options.category,
        limit: options.limit || 50,
        nextToken: token || undefined
      };

      const result = await executeQuery<{ listMenuItems: { items: any[], nextToken?: string } }>(
        listMenuItemsQuery,
        variables
      );

      if (token) {
        // Append items if we're paginating
        setMenuItems(prev => [...prev, ...result.listMenuItems.items]);
      } else {
        // Replace items if it's a fresh fetch
        setMenuItems(result.listMenuItems.items);
      }

      setNextToken(result.listMenuItems.nextToken || null);
      setHasMore(!!result.listMenuItems.nextToken);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err instanceof Error ? err : new Error('Failed to load menu items'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (shopId) {
      fetchMenuItems();
    }
  }, [shopId, options.category]);

  // Function to load more items
  const loadMore = () => {
    if (nextToken && !isLoading) {
      fetchMenuItems(nextToken);
    }
  };

  // Function to refresh the data
  const refresh = () => {
    fetchMenuItems();
  };

  return { 
    menuItems, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    refresh,
    setMenuItems
  };
}
