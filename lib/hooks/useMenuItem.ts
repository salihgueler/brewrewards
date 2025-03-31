import { useState, useEffect } from 'react';
import { executeQuery, executeMutation } from '@/lib/graphql-client';
import { getMenuItemQuery } from '@/graphql/queries';
import { updateMenuItemMutation, deleteMenuItemMutation } from '@/graphql/mutations';

interface UseMenuItemOptions {
  initialLoading?: boolean;
}

export function useMenuItem(shopId: string, itemId: string, options: UseMenuItemOptions = {}) {
  const [menuItem, setMenuItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenuItem = async () => {
    if (!shopId || !itemId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const result = await executeQuery<{ getMenuItem: any }>(
        getMenuItemQuery,
        { shopId, id: itemId }
      );

      setMenuItem(result.getMenuItem);
    } catch (err) {
      console.error('Error fetching menu item:', err);
      setError(err instanceof Error ? err : new Error('Failed to load menu item'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (shopId && itemId) {
      fetchMenuItem();
    }
  }, [shopId, itemId]);

  // Function to update the menu item
  const updateMenuItem = async (data: any) => {
    if (!shopId || !itemId) return;
    
    try {
      setIsSaving(true);
      setError(null);

      const input = {
        id: itemId,
        shopId,
        ...data
      };

      const result = await executeMutation<{ updateMenuItem: any }>(
        updateMenuItemMutation,
        { input }
      );

      setMenuItem(result.updateMenuItem);
      return result.updateMenuItem;
    } catch (err) {
      console.error('Error updating menu item:', err);
      setError(err instanceof Error ? err : new Error('Failed to update menu item'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Function to delete the menu item
  const deleteMenuItem = async () => {
    if (!shopId || !itemId) return;
    
    try {
      setIsDeleting(true);
      setError(null);

      await executeMutation(
        deleteMenuItemMutation,
        { shopId, id: itemId }
      );

      return true;
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete menu item'));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to refresh the data
  const refresh = () => {
    fetchMenuItem();
  };

  return { 
    menuItem, 
    isLoading,
    isSaving,
    isDeleting,
    error, 
    updateMenuItem,
    deleteMenuItem,
    refresh,
    setMenuItem
  };
}
