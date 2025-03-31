'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TransactionsList } from '@/components/transactions/TransactionsList';
import { CreateTransactionForm } from '@/components/transactions/CreateTransactionForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState } from '@/components/ui/loading-state';
import { Plus, List } from 'lucide-react';

export default function ShopAdminTransactionsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('list');
  
  return (
    <LoadingState loading={loading} error={null}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <div className="hidden sm:block">
            <Button
              onClick={() => setActiveTab(activeTab === 'list' ? 'create' : 'list')}
              variant={activeTab === 'list' ? 'default' : 'outline'}
            >
              {activeTab === 'list' ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction
                </>
              ) : (
                <>
                  <List className="h-4 w-4 mr-2" />
                  View Transactions
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="sm:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Transactions</TabsTrigger>
              <TabsTrigger value="create">New Transaction</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {user?.shopId ? (
          <div>
            {activeTab === 'list' ? (
              <TransactionsList shopId={user.shopId} />
            ) : (
              <CreateTransactionForm 
                shopId={user.shopId} 
                onSuccess={() => setActiveTab('list')} 
              />
            )}
          </div>
        ) : (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              You need to be associated with a shop to manage transactions.
            </p>
          </Card>
        )}
      </div>
    </LoadingState>
  );
}
