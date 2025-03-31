import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { listRewardsQuery, listStampCardsQuery } from '@/graphql/queries';

interface UseLoyaltyProgramsOptions {
  initialLoading?: boolean;
}

export function useLoyaltyPrograms(shopId: string, options: UseLoyaltyProgramsOptions = {}) {
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLoyaltyPrograms = async () => {
    if (!shopId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both rewards and stamp cards
      const [rewardsResult, stampCardsResult] = await Promise.all([
        executeQuery<{ listRewards: { items: any[] } }>(
          listRewardsQuery,
          { shopId, limit: 50 }
        ),
        executeQuery<{ listStampCards: { items: any[] } }>(
          listStampCardsQuery,
          { shopId, limit: 50 }
        )
      ]);

      // Transform the data into the expected format
      const pointsProgram = {
        id: 'points_program',
        shopId,
        name: 'Coffee Points',
        type: 'POINTS',
        rules: {
          pointsPerDollar: 1,
        },
        rewards: rewardsResult.listRewards.items,
        createdAt: rewardsResult.listRewards.items[0]?.createdAt || new Date().toISOString(),
        updatedAt: rewardsResult.listRewards.items[0]?.updatedAt || new Date().toISOString(),
      };
      
      const stampCardPrograms = stampCardsResult.listStampCards.items.map(stampCard => ({
        id: stampCard.id,
        shopId,
        name: stampCard.name,
        type: 'STAMP_CARD',
        rules: {
          stampsPerPurchase: 1,
          totalStampsRequired: stampCard.stampsRequired,
        },
        rewards: [{
          id: `reward_${stampCard.id}`,
          shopId,
          loyaltyProgramId: stampCard.id,
          name: stampCard.reward,
          description: stampCard.description,
          stampsCost: stampCard.stampsRequired,
          isActive: stampCard.isActive,
        }],
        createdAt: stampCard.createdAt,
        updatedAt: stampCard.updatedAt,
      }));
      
      // Combine both types of programs
      setLoyaltyPrograms([pointsProgram, ...stampCardPrograms]);
    } catch (err) {
      console.error('Error fetching loyalty programs:', err);
      setError(err instanceof Error ? err : new Error('Failed to load loyalty programs'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (shopId) {
      fetchLoyaltyPrograms();
    }
  }, [shopId]);

  // Function to refresh the data
  const refresh = () => {
    fetchLoyaltyPrograms();
  };

  return { 
    loyaltyPrograms, 
    isLoading, 
    error, 
    refresh,
    setLoyaltyPrograms
  };
}
