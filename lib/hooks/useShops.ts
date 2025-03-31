import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { listShopsQuery } from '@/graphql/queries';

interface UseShopsOptions {
  initialLoading?: boolean;
  limit?: number;
}

export function useShops(options: UseShopsOptions = {}) {
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchShops = async (token?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const variables = {
        limit: options.limit || 50,
        nextToken: token || undefined
      };

      const result = await executeQuery<{ listShops: { items: any[], nextToken?: string } }>(
        listShopsQuery,
        variables
      );

      if (token) {
        // Append items if we're paginating
        setShops(prev => [...prev, ...result.listShops.items]);
      } else {
        // Replace items if it's a fresh fetch
        setShops(result.listShops.items);
      }

      setNextToken(result.listShops.nextToken || null);
      setHasMore(!!result.listShops.nextToken);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError(err instanceof Error ? err : new Error('Failed to load shops'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchShops();
  }, []);

  // Function to load more items
  const loadMore = () => {
    if (nextToken && !isLoading) {
      fetchShops(nextToken);
    }
  };

  // Function to refresh the data
  const refresh = () => {
    fetchShops();
  };

  return { 
    shops, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    refresh,
    setShops
  };
}
