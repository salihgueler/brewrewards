'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ui/error-alert';
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionsListProps {
  shopId: string;
  userId?: string;
  title?: string;
}

export function TransactionsList({ shopId, userId, title = 'Transactions' }: TransactionsListProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const {
    data: transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    nextPage,
    prevPage,
  } = useTransactions({
    shopId,
    userId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 10,
  });
  
  const filteredTransactions = searchTerm
    ? transactions.filter(transaction => 
        transaction.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : transactions;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };
  
  if (loading && !transactions.length) {
    return <LoadingSpinner size="lg" text="Loading transactions..." />;
  }
  
  if (error) {
    return <ErrorAlert error={error} onRetry={fetchTransactions} />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          <div className="flex gap-2">
            <div>
              <Label htmlFor="startDate" className="sr-only">Start Date</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label htmlFor="endDate" className="sr-only">End Date</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button variant="outline" onClick={fetchTransactions}>
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <LoadingSpinner size="sm" text="Refreshing..." />}
        
        {!loading && filteredTransactions.length === 0 ? (
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
                    <th className="text-left py-3 px-4">Items</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-right py-3 px-4">Rewards</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
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
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {pagination.total} transactions
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
  );
}
