import React from 'react';
import { Metadata } from 'next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import TransactionsList from '@/components/transactions/TransactionsList';
import CreateTransactionForm from '@/components/transactions/CreateTransactionForm';
import TransactionDetails from '@/components/transactions/TransactionDetails';
import { useShopTransactions } from '@/lib/hooks/useTransactions';
import { useShop } from '@/lib/hooks/useShop';
import { useAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/permissions';
import { useState } from 'react';
import { Transaction } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Transactions | Shop Admin',
  description: 'Manage your shop transactions',
};

interface PageProps {
  params: {
    shopId: string;
  };
}

export default function TransactionsPage({ params }: PageProps) {
  const { shopId } = params;
  const { user } = useAuth();
  const { data: shop } = useShop({ shopId });
  const { 
    data: transactions, 
    loading, 
    error, 
    refetch 
  } = useShopTransactions({ shopId });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const canCreateTransactions = user ? hasPermission(user, 'CREATE_TRANSACTIONS', shopId) : false;
  const canEditTransactions = user ? hasPermission(user, 'UPDATE_TRANSACTIONS', shopId) : false;
  const canDeleteTransactions = user ? hasPermission(user, 'DELETE_TRANSACTIONS', shopId) : false;

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        {canCreateTransactions && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Transaction</DialogTitle>
              </DialogHeader>
              <CreateTransactionForm 
                shopId={shopId} 
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            View and manage transactions for {shop?.name || 'your shop'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsList
            transactions={transactions}
            isLoading={loading}
            error={error}
            onView={handleViewTransaction}
            canEdit={canEditTransactions}
            canDelete={canDeleteTransactions}
          />
        </CardContent>
      </Card>

      {selectedTransaction && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <TransactionDetails
              transaction={selectedTransaction}
              onClose={() => setIsViewDialogOpen(false)}
              canEdit={canEditTransactions}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
