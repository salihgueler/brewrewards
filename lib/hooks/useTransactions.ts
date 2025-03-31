import { useState, useEffect } from 'react';
import { generateClient } from '@aws-amplify/api';
import { 
  listTransactionsByShop, 
  listTransactionsByUser, 
  getTransaction 
} from '@/graphql/queries';
import { 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '@/graphql/mutations';
import { Transaction, CreateTransactionInput, UpdateTransactionInput } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const client = generateClient();

// Hook for listing transactions for a shop
interface UseShopTransactionsOptions {
  shopId: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface ShopTransactionsResponse {
  data: Transaction[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  nextToken?: string;
  fetchMore: () => Promise<void>;
}

export function useShopTransactions({ 
  shopId, 
  limit = 20,
  startDate,
  endDate
}: UseShopTransactionsOptions): ShopTransactionsResponse {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  const fetchTransactions = async (token?: string) => {
    if (!shopId) {
      setError(new Error('Shop ID is required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: listTransactionsByShop,
        variables: {
          shopId,
          limit,
          nextToken: token,
          startDate,
          endDate
        }
      });

      const transactions = response.data.listTransactionsByShop.items;
      setData(token ? [...data, ...transactions] : transactions);
      setNextToken(response.data.listTransactionsByShop.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching transactions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [shopId, startDate, endDate]);

  const refetch = () => fetchTransactions();
  const fetchMore = () => nextToken ? fetchTransactions(nextToken) : Promise.resolve();

  return {
    data,
    loading,
    error,
    refetch,
    nextToken,
    fetchMore
  };
}

// Hook for listing transactions for a user
interface UseUserTransactionsOptions {
  userId?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface UserTransactionsResponse {
  data: Transaction[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  nextToken?: string;
  fetchMore: () => Promise<void>;
}

export function useUserTransactions({ 
  userId,
  limit = 20,
  startDate,
  endDate
}: UseUserTransactionsOptions): UserTransactionsResponse {
  const { user } = useAuth();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  const actualUserId = userId || user?.id;

  const fetchTransactions = async (token?: string) => {
    if (!actualUserId) {
      setError(new Error('User ID is required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: listTransactionsByUser,
        variables: {
          userId: actualUserId,
          limit,
          nextToken: token,
          startDate,
          endDate
        }
      });

      const transactions = response.data.listTransactionsByUser.items;
      setData(token ? [...data, ...transactions] : transactions);
      setNextToken(response.data.listTransactionsByUser.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching transactions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (actualUserId) {
      fetchTransactions();
    }
  }, [actualUserId, startDate, endDate]);

  const refetch = () => fetchTransactions();
  const fetchMore = () => nextToken ? fetchTransactions(nextToken) : Promise.resolve();

  return {
    data,
    loading,
    error,
    refetch,
    nextToken,
    fetchMore
  };
}

// Hook for getting a single transaction
interface UseTransactionOptions {
  id: string;
  shopId: string;
}

interface TransactionResponse {
  data: Transaction | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTransaction({ id, shopId }: UseTransactionOptions): TransactionResponse {
  const [data, setData] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransaction = async () => {
    if (!id || !shopId) {
      setError(new Error('Transaction ID and Shop ID are required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: getTransaction,
        variables: { id, shopId }
      });

      setData(response.data.getTransaction);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching transaction'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id, shopId]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransaction
  };
}

// Hook for creating transactions
interface UseCreateTransactionOptions {
  onSuccess?: (transaction: Transaction) => void;
}

interface CreateTransactionResponse {
  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  loading: boolean;
  error: Error | null;
}

export function useCreateTransaction({ onSuccess }: UseCreateTransactionOptions = {}): CreateTransactionResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (input: CreateTransactionInput): Promise<Transaction> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: createTransaction,
        variables: { input }
      });

      const newTransaction = response.data.createTransaction;
      
      if (onSuccess) {
        onSuccess(newTransaction);
      }
      
      return newTransaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while creating transaction');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTransaction: create,
    loading,
    error
  };
}

// Hook for updating transactions
interface UseUpdateTransactionOptions {
  onSuccess?: (transaction: Transaction) => void;
}

interface UpdateTransactionResponse {
  updateTransaction: (input: UpdateTransactionInput) => Promise<Transaction>;
  loading: boolean;
  error: Error | null;
}

export function useUpdateTransaction({ onSuccess }: UseUpdateTransactionOptions = {}): UpdateTransactionResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (input: UpdateTransactionInput): Promise<Transaction> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: updateTransaction,
        variables: { input }
      });

      const updatedTransaction = response.data.updateTransaction;
      
      if (onSuccess) {
        onSuccess(updatedTransaction);
      }
      
      return updatedTransaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while updating transaction');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTransaction: update,
    loading,
    error
  };
}

// Hook for deleting transactions
interface UseDeleteTransactionOptions {
  onSuccess?: (id: string, shopId: string) => void;
}

interface DeleteTransactionResponse {
  deleteTransaction: (id: string, shopId: string) => Promise<{ id: string; shopId: string }>;
  loading: boolean;
  error: Error | null;
}

export function useDeleteTransaction({ onSuccess }: UseDeleteTransactionOptions = {}): DeleteTransactionResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = async (id: string, shopId: string): Promise<{ id: string; shopId: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: deleteTransaction,
        variables: { id, shopId }
      });

      const result = response.data.deleteTransaction;
      
      if (onSuccess) {
        onSuccess(id, shopId);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while deleting transaction');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteTransaction: remove,
    loading,
    error
  };
}
