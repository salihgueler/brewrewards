import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface UseTransactionsOptions {
  shopId: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

interface TransactionsResponse {
  data: Transaction[];
  loading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchTransactions: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
}

export function useTransactions({
  shopId,
  userId,
  startDate,
  endDate,
  limit = 10,
  page = 1,
}: UseTransactionsOptions): TransactionsResponse {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      if (userId) {
        params.append('userId', userId);
      }
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }

      // Make API request
      const response = await fetch(`/api/shops/${shopId}/transactions?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }
      
      const result = await response.json();
      
      setData(result.data);
      setTotalItems(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [shopId, userId, startDate, endDate, currentPage, limit]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    data,
    loading,
    error,
    pagination: {
      page: currentPage,
      limit,
      total: totalItems,
      totalPages,
    },
    fetchTransactions,
    nextPage,
    prevPage,
  };
}

export function useUserTransactions({
  userId,
  shopId,
  startDate,
  endDate,
  limit = 10,
  page = 1,
}: Omit<UseTransactionsOptions, 'shopId'> & { userId?: string, shopId?: string }): TransactionsResponse {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchTransactions = async () => {
    if (!actualUserId) {
      setError(new Error('User ID is required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      params.append('userId', actualUserId);
      
      if (shopId) {
        params.append('shopId', shopId);
      }
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }

      // Make API request
      const response = await fetch(`/api/users/transactions?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }
      
      const result = await response.json();
      
      setData(result.data);
      setTotalItems(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [actualUserId, shopId, startDate, endDate, currentPage, limit]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    data,
    loading,
    error,
    pagination: {
      page: currentPage,
      limit,
      total: totalItems,
      totalPages,
    },
    fetchTransactions,
    nextPage,
    prevPage,
  };
}

interface UseCreateTransactionOptions {
  shopId: string;
}

interface CreateTransactionInput {
  userId: string;
  amount: number;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  rewardRedeemed?: {
    rewardId: string;
    name: string;
    value: number;
  };
}

interface UseCreateTransactionResponse {
  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  loading: boolean;
  error: Error | null;
}

export function useCreateTransaction({ shopId }: UseCreateTransactionOptions): UseCreateTransactionResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createTransaction = async (input: CreateTransactionInput): Promise<Transaction> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/shops/${shopId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          shopId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTransaction,
    loading,
    error,
  };
}
