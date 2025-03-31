import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { listUserRewardsQuery } from '@/graphql/queries';

interface UseRedemptionsOptions {
  initialLoading?: boolean;
  limit?: number;
  shopId?: string;
}

export function useRedemptions(options: UseRedemptionsOptions = {}) {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRedemptions = async (token?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const variables = {
        shopId: options.shopId,
        limit: options.limit || 50,
        nextToken: token || undefined
      };

      const result = await executeQuery<{ listUserRewards: { items: any[], nextToken?: string } }>(
        listUserRewardsQuery,
        variables
      );

      // Extract redemption history from user rewards
      const allRedemptions = result.listUserRewards.items.flatMap(userReward => {
        if (!userReward.rewardHistory || userReward.rewardHistory.length === 0) {
          return [];
        }
        
        return userReward.rewardHistory.map((redemption: any) => ({
          userId: userReward.userId,
          shopId: userReward.shopId,
          ...redemption
        }));
      });

      if (token) {
        // Append items if we're paginating
        setRedemptions(prev => [...prev, ...allRedemptions]);
      } else {
        // Replace items if it's a fresh fetch
        setRedemptions(allRedemptions);
      }

      setTotalCount(prev => token ? prev + allRedemptions.length : allRedemptions.length);
      setNextToken(result.listUserRewards.nextToken || null);
      setHasMore(!!result.listUserRewards.nextToken);
    } catch (err) {
      console.error('Error fetching redemptions:', err);
      setError(err instanceof Error ? err : new Error('Failed to load redemptions'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRedemptions();
  }, [options.shopId]);

  // Function to load more items
  const loadMore = () => {
    if (nextToken && !isLoading) {
      fetchRedemptions(nextToken);
    }
  };

  // Function to refresh the data
  const refresh = () => {
    fetchRedemptions();
  };

  return { 
    redemptions, 
    isLoading, 
    error, 
    hasMore, 
    totalCount,
    loadMore,
    refresh,
    setRedemptions
  };
}
