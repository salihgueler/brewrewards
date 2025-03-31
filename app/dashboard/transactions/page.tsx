import React from 'react';
import { Metadata } from 'next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from '@/components/ui/dialog';
import TransactionsList from '@/components/transactions/TransactionsList';
import TransactionDetails from '@/components/transactions/TransactionDetails';
import { useUserTransactions } from '@/lib/hooks/useTransactions';
import { useState } from 'react';
import { Transaction } from '@/lib/types';

export const metadata: Metadata = {
  title: 'My Transactions | BrewRewards',
  description: 'View your transaction history across all coffee shops',
};

export default function CustomerTransactionsPage() {
  const { 
    data: transactions, 
    loading, 
    error 
  } = useUserTransactions({});

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Transactions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View your transaction history across all coffee shops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsList
            transactions={transactions}
            isLoading={loading}
            error={error}
            showShopInfo={true}
            onView={handleViewTransaction}
          />
        </CardContent>
      </Card>

      {selectedTransaction && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <TransactionDetails
              transaction={selectedTransaction}
              onClose={() => setIsViewDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
