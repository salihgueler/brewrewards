import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose?: () => void;
  onEdit?: (transaction: Transaction) => void;
  canEdit?: boolean;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  onClose,
  onEdit,
  canEdit = false
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              {formatDate(transaction.createdAt)}
            </CardDescription>
          </div>
          <Badge className={getStatusBadgeColor(transaction.status)}>
            {transaction.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Transaction Type</p>
            <p className="text-lg font-medium">
              {transaction.type === 'PURCHASE' ? 'Purchase' : 'Reward Redemption'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-lg font-medium">{formatCurrency(transaction.amount)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Points</p>
            <p className="text-lg font-medium">{transaction.points}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stamps</p>
            <p className="text-lg font-medium">{transaction.stamps || 0}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Customer</p>
          <p className="text-lg font-medium">
            {transaction.user?.firstName} {transaction.user?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{transaction.user?.email}</p>
        </div>

        {transaction.items && transaction.items.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 text-sm font-medium">Item</th>
                    <th className="text-center p-2 text-sm font-medium">Qty</th>
                    <th className="text-right p-2 text-sm font-medium">Price</th>
                    <th className="text-right p-2 text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 text-sm">{item.name}</td>
                      <td className="p-2 text-sm text-center">{item.quantity}</td>
                      <td className="p-2 text-sm text-right">{formatCurrency(item.price)}</td>
                      <td className="p-2 text-sm text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {transaction.rewardId && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Reward</p>
            <p className="text-lg font-medium">
              {transaction.rewardId}
            </p>
          </div>
        )}

        {transaction.notes && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Notes</p>
            <p className="text-sm">{transaction.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        {canEdit && onEdit && (
          <Button onClick={() => onEdit(transaction)}>
            Edit Transaction
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TransactionDetails;
