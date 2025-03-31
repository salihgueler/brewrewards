'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ui/error-alert';
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useShops } from '@/lib/hooks/useShops';
import { useUsers } from '@/lib/hooks/useUsers';
import { LoadingState } from '@/components/ui/loading-state';

export default function SuperAdminTransactionsPage() {
  const { loading: authLoading } = useAuth();
  const [shopId, setShopId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const { data: shops, loading: shopsLoading } = useShops();
  const { data: users, loading: usersLoading } = useUsers({ role: 'CUSTOMER' });
  
  const {
    data: transactions,
    loading: transactionsLoading,
    error,
    pagination,
    fetchTransactions,
    nextPage,
    prevPage,
  } = useTransactions({
    shopId: shopId || shops?.[0]?.id || '',
    userId: userId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };
  
  if (!shopId && shops?.length > 0 && !shopsLoading) {
    setShopId(shops[0].id);
  }
  
  return (
    <LoadingState loading={authLoading || shopsLoading} error={null}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Platform Transactions</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <form onSubmit={handleFilter} className="flex flex-wrap gap-2">
                <div className="w-full sm:w-auto">
                  <Label htmlFor="shopFilter" className="sr-only">Filter by Shop</Label>
                  <Select
                    value={shopId}
                    onValueChange={setShopId}
                  >
                    <SelectTrigger id="shopFilter" className="w-[200px]">
                      <SelectValue placeholder="Select Shop" />
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
                
                <div className="w-full sm:w-auto">
                  <Label htmlFor="userFilter" className="sr-only">Filter by Customer</Label>
                  <Select
                    value={userId}
                    onValueChange={setUserId}
                  >
                    <SelectTrigger id="userFilter" className="w-[200px]">
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Customers</SelectItem>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Label htmlFor="startDate" className="sr-only">Start Date</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start Date"
                      className="w-[150px]"
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Label htmlFor="endDate" className="sr-only">End Date</Label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End Date"
                      className="w-[150px]"
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <Button type="submit">
                  Apply Filters
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading && <LoadingSpinner size="lg" text="Loading transactions..." />}
            
            {error && <ErrorAlert error={error} onRetry={fetchTransactions} />}
            
            {!transactionsLoading && !error && transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Items</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-right py-3 px-4">Rewards</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => {
                        const customer = users?.find(u => u.id === transaction.userId);
                        
                        return (
                          <tr key={transaction.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                            </td>
                            <td className="py-3 px-4">
                              {customer ? `${customer.firstName} ${customer.lastName}` : transaction.userId}
                            </td>
                            <td className="py-3 px-4">
                              <ul className="list-disc list-inside">
                                {transaction.items.map((item, index) => (
                                  <li key={index}>
                                    {item.name} x {item.quantity} ({formatCurrency(item.price)})
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div>
                                {transaction.pointsEarned > 0 && (
                                  <span className="block text-green-600">+{transaction.pointsEarned} points</span>
                                )}
                                {transaction.stampsEarned > 0 && (
                                  <span className="block text-blue-600">+{transaction.stampsEarned} stamps</span>
                                )}
                                {transaction.rewardRedeemed && (
                                  <span className="block text-purple-600">
                                    Redeemed: {transaction.rewardRedeemed.name}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {transactions.length} of {pagination.total} transactions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </LoadingState>
  );
}
