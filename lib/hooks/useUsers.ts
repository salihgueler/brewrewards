import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/graphql-client';
import { listUsersQuery } from '@/graphql/queries';

interface UseUsersOptions {
  initialLoading?: boolean;
  limit?: number;
  shopId?: string;
  role?: string;
}

export function useUsers(options: UseUsersOptions = {}) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async (token?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const variables = {
        shopId: options.shopId,
        limit: options.limit || 50,
        nextToken: token || undefined
      };

      const result = await executeQuery<{ listUsers: { items: any[], nextToken?: string } }>(
        listUsersQuery,
        variables
      );

      // Filter by role if specified
      let filteredUsers = options.role 
        ? result.listUsers.items.filter(user => user.role === options.role)
        : result.listUsers.items;

      if (token) {
        // Append items if we're paginating
        setUsers(prev => [...prev, ...filteredUsers]);
      } else {
        // Replace items if it's a fresh fetch
        setUsers(filteredUsers);
      }

      setTotalCount(prev => token ? prev + filteredUsers.length : filteredUsers.length);
      setNextToken(result.listUsers.nextToken || null);
      setHasMore(!!result.listUsers.nextToken);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err : new Error('Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [options.shopId, options.role]);

  // Function to load more items
  const loadMore = () => {
    if (nextToken && !isLoading) {
      fetchUsers(nextToken);
    }
  };

  // Function to refresh the data
  const refresh = () => {
    fetchUsers();
  };

  return { 
    users, 
    isLoading, 
    error, 
    hasMore, 
    totalCount,
    loadMore,
    refresh,
    setUsers
  };
}
