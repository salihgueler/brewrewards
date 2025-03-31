import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { listRewardsQuery } from '@/graphql/queries';

interface UseRewardsOptions {
  initialLoading?: boolean;
  limit?: number;
  shopId: string;
}

export function useRewards(options: UseRewardsOptions) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchRewards = async (token?: string) => {
    if (!options.shopId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const variables = {
        shopId: options.shopId,
        limit: options.limit || 50,
        nextToken: token || undefined
      };

      const result = await executeQuery<{ listRewards: { items: any[], nextToken?: string } }>(
        listRewardsQuery,
        variables
      );

      if (token) {
        // Append items if we're paginating
        setRewards(prev => [...prev, ...result.listRewards.items]);
      } else {
        // Replace items if it's a fresh fetch
        setRewards(result.listRewards.items);
      }

      setNextToken(result.listRewards.nextToken || null);
      setHasMore(!!result.listRewards.nextToken);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError(err instanceof Error ? err : new Error('Failed to load rewards'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (options.shopId) {
      fetchRewards();
    }
  }, [options.shopId]);

  // Function to load more items
  const loadMore = () => {
    if (nextToken && !isLoading) {
      fetchRewards(nextToken);
    }
  };

  // Function to refresh the data
  const refresh = () => {
    fetchRewards();
  };

  return { 
    rewards, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    refresh,
    setRewards
  };
}
