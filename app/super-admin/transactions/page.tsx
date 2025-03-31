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
import { useShops } from '@/lib/hooks/useShops';
import { useShopTransactions } from '@/lib/hooks/useTransactions';
import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'All Transactions | Super Admin',
  description: 'View and manage transactions across all shops',
};

export default function SuperAdminTransactionsPage() {
  const { data: shops, loading: loadingShops } = useShops();
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  
  const { 
    data: transactions, 
    loading, 
    error 
  } = useShopTransactions({ 
    shopId: selectedShopId,
    // Don't fetch if no shop is selected
    limit: selectedShopId ? 50 : 0
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Transactions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction Management</CardTitle>
          <CardDescription>
            View and manage transactions across all coffee shops
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Select Shop</label>
            <Select
              value={selectedShopId}
              onValueChange={setSelectedShopId}
              disabled={loadingShops}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a shop" />
              </SelectTrigger>
              <SelectContent>
                {shops?.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedShopId ? (
            <TransactionsList
              transactions={transactions}
              isLoading={loading}
              error={error}
              onView={handleViewTransaction}
              canEdit={true}
              canDelete={true}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Select a shop to view transactions
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransaction && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <TransactionDetails
              transaction={selectedTransaction}
              onClose={() => setIsViewDialogOpen(false)}
              canEdit={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
