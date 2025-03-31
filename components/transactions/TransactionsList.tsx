import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { LoadingState } from '@/components/ui/loading-state';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  showShopInfo?: boolean;
  onView?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'PURCHASE':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'REWARD_REDEMPTION':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  isLoading,
  error,
  showShopInfo = false,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false
}) => {
  return (
    <LoadingState
      loading={isLoading}
      error={error}
      loadingText="Loading transactions..."
      errorText="Failed to load transactions"
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {showShopInfo && <TableHead>Shop</TableHead>}
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showShopInfo ? 8 : 7} className="text-center py-6 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  {showShopInfo && (
                    <TableCell>
                      {transaction.shop?.name || 'Unknown Shop'}
                    </TableCell>
                  )}
                  <TableCell>
                    {transaction.user?.firstName} {transaction.user?.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(transaction.type)}>
                      {transaction.type === 'PURCHASE' ? 'Purchase' : 'Redemption'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{transaction.points}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(transaction)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {canEdit && onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(transaction)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(transaction)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </LoadingState>
  );
};

export default TransactionsList;
