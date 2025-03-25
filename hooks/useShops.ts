import { useState, useEffect, useCallback } from 'react';
import { shopApi, Shop, ShopConnection, CreateShopInput, UpdateShopInput } from '@/lib/api/shops';
import { useAuth } from '@/lib/auth-context';

interface UseShopsOptions {
  initialLimit?: number;
  autoLoad?: boolean;
}

export function useShops(options: UseShopsOptions = {}) {
  const { initialLimit = 20, autoLoad = true } = options;
  const { user, isLoading: authLoading } = useAuth();
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load shops
  const loadShops = useCallback(async (limit = initialLimit, token?: string) => {
    if (authLoading) return; // Don't load shops until auth is resolved
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await shopApi.listShops(limit, token || undefined);
      
      if (token) {
        // Append to existing shops if we're paginating
        setShops(prev => [...prev, ...response.items]);
      } else {
        // Replace shops if this is a fresh load
        setShops(response.items);
      }
      
      setNextToken(response.nextToken || null);
      setHasMore(!!response.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load shops'));
      console.error('Error loading shops:', err);
    } finally {
      setLoading(false);
    }
  }, [initialLimit, authLoading]);

  // Load more shops (pagination)
  const loadMore = useCallback(() => {
    if (nextToken && !loading) {
      loadShops(initialLimit, nextToken);
    }
  }, [nextToken, loading, loadShops, initialLimit]);

  // Create a new shop
  const createShop = useCallback(async (input: CreateShopInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const newShop = await shopApi.createShop(input);
      setShops(prev => [newShop, ...prev]);
      return newShop;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create shop'));
      console.error('Error creating shop:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing shop
  const updateShop = useCallback(async (input: UpdateShopInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedShop = await shopApi.updateShop(input);
      setShops(prev => 
        prev.map(shop => shop.id === updatedShop.id ? updatedShop : shop)
      );
      return updatedShop;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update shop'));
      console.error('Error updating shop:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a shop
  const deleteShop = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await shopApi.deleteShop(id);
      setShops(prev => prev.filter(shop => shop.id !== id));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete shop'));
      console.error('Error deleting shop:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load shops on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad && !authLoading) {
      loadShops();
    }
  }, [autoLoad, loadShops, authLoading]);

  return {
    shops,
    loading: loading || authLoading,
    error,
    hasMore,
    loadShops,
    loadMore,
    createShop,
    updateShop,
    deleteShop,
  };
}

export function useShop(shopId?: string, subdomain?: string) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isLoading: authLoading } = useAuth();

  const loadShop = useCallback(async () => {
    if (!shopId && !subdomain) {
      setError(new Error('Either shopId or subdomain must be provided'));
      return;
    }

    if (authLoading) return; // Don't load shop until auth is resolved
    
    setLoading(true);
    setError(null);
    
    try {
      let loadedShop: Shop;
      
      if (shopId) {
        loadedShop = await shopApi.getShop(shopId);
      } else if (subdomain) {
        loadedShop = await shopApi.getShopBySubdomain(subdomain);
      } else {
        throw new Error('Either shopId or subdomain must be provided');
      }
      
      setShop(loadedShop);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load shop'));
      console.error('Error loading shop:', err);
    } finally {
      setLoading(false);
    }
  }, [shopId, subdomain, authLoading]);

  // Update the current shop
  const updateShop = useCallback(async (input: UpdateShopInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedShop = await shopApi.updateShop(input);
      setShop(updatedShop);
      return updatedShop;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update shop'));
      console.error('Error updating shop:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load shop on mount or when shopId/subdomain changes
  useEffect(() => {
    if ((shopId || subdomain) && !authLoading) {
      loadShop();
    }
  }, [shopId, subdomain, loadShop, authLoading]);

  return {
    shop,
    loading: loading || authLoading,
    error,
    loadShop,
    updateShop,
  };
}
