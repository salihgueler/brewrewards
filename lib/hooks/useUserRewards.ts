import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { getUserRewardQuery } from '@/graphql/queries';

interface UseUserRewardsOptions {
  initialLoading?: boolean;
}

export function useUserRewards(userId: string, shopId: string, options: UseUserRewardsOptions = {}) {
  const [userRewards, setUserRewards] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserRewards = async () => {
    if (!userId || !shopId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const result = await executeQuery<{ getUserReward: any }>(
        getUserRewardQuery,
        { userId, shopId }
      );

      setUserRewards(result.getUserReward);
    } catch (err) {
      console.error('Error fetching user rewards:', err);
      setError(err instanceof Error ? err : new Error('Failed to load user rewards'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId && shopId) {
      fetchUserRewards();
    }
  }, [userId, shopId]);

  // Function to refresh the data
  const refresh = () => {
    fetchUserRewards();
  };

  return { 
    userRewards, 
    isLoading, 
    error, 
    refresh,
    setUserRewards
  };
}
