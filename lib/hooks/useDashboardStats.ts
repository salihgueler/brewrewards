import { useState, useEffect } from 'react';
import { useShops } from './useShops';
import { useUsers } from './useUsers';
import { useRedemptions } from './useRedemptions';

interface UseDashboardStatsOptions {
  initialLoading?: boolean;
}

export function useDashboardStats(options: UseDashboardStatsOptions = {}) {
  const [stats, setStats] = useState<any>({
    totalShops: 0,
    totalUsers: 0,
    totalRewards: 0,
    totalRedemptions: 0
  });
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data from individual hooks
  const { shops, isLoading: isLoadingShops, error: shopsError } = useShops({ limit: 1000 });
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers({ limit: 1000 });
  const { redemptions, isLoading: isLoadingRedemptions, error: redemptionsError } = useRedemptions({ limit: 1000 });

  // Calculate stats when data is available
  useEffect(() => {
    if (!isLoadingShops && !isLoadingUsers && !isLoadingRedemptions) {
      try {
        // Count rewards across all shops
        const totalRewards = shops.reduce((total, shop) => {
          // This is an approximation since we don't have a direct way to count all rewards
          // In a real implementation, you might want to fetch this separately
          return total + (shop.rewardsCount || 0);
        }, 0);

        setStats({
          totalShops: shops.length,
          totalUsers: users.length,
          totalRewards: totalRewards || shops.length * 2, // Fallback estimate if rewardsCount is not available
          totalRedemptions: redemptions.length
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error calculating dashboard stats:', err);
        setError(err instanceof Error ? err : new Error('Failed to calculate dashboard statistics'));
        setIsLoading(false);
      }
    }
  }, [isLoadingShops, isLoadingUsers, isLoadingRedemptions, shops, users, redemptions]);

  // Combine errors
  useEffect(() => {
    const firstError = shopsError || usersError || redemptionsError;
    if (firstError) {
      setError(firstError);
    }
  }, [shopsError, usersError, redemptionsError]);

  return { 
    stats, 
    isLoading: isLoadingShops || isLoadingUsers || isLoadingRedemptions, 
    error
  };
}
