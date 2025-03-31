import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTransaction } from '@/lib/hooks/useTransactions';
import { useUsers } from '@/lib/hooks/useUsers';
import { useRewards } from '@/lib/hooks/useRewards';
import { toast } from '@/components/ui/use-toast';

interface CreateTransactionFormProps {
  shopId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  userId: z.string().min(1, { message: 'Customer is required' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0' }),
  points: z.coerce.number().int().min(0, { message: 'Points must be a positive number' }),
  stamps: z.coerce.number().int().min(0, { message: 'Stamps must be a positive number' }).optional(),
  type: z.enum(['PURCHASE', 'REWARD_REDEMPTION']),
  rewardId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({ 
  shopId,
  onSuccess,
  onCancel
}) => {
  const [transactionType, setTransactionType] = useState<'PURCHASE' | 'REWARD_REDEMPTION'>('PURCHASE');
  const { createTransaction, loading, error } = useCreateTransaction({ 
    onSuccess: () => {
      toast({
        title: 'Transaction created',
        description: 'The transaction has been successfully created',
      });
      onSuccess?.();
    }
  });

  // Fetch customers for this shop
  const { data: customers, loading: loadingCustomers } = useUsers({ 
    shopId, 
    role: 'CUSTOMER' 
  });

  // Fetch rewards for this shop
  const { data: rewards, loading: loadingRewards } = useRewards({ shopId });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      amount: 0,
      points: 0,
      stamps: 0,
      type: 'PURCHASE',
      notes: '',
    },
  });

  const handleTypeChange = (type: 'PURCHASE' | 'REWARD_REDEMPTION') => {
    setTransactionType(type);
    form.setValue('type', type);
    
    // Reset reward-specific fields if changing to purchase
    if (type === 'PURCHASE') {
      form.setValue('rewardId', undefined);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createTransaction({
        shopId,
        userId: values.userId,
        amount: values.amount,
        points: values.points,
        stamps: values.stamps,
        type: values.type,
        rewardId: values.rewardId,
        notes: values.notes,
      });
    } catch (err) {
      toast({
        title: 'Failed to create transaction',
        description: error?.message || 'An error occurred while creating the transaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select 
                onValueChange={(value) => handleTypeChange(value as 'PURCHASE' | 'REWARD_REDEMPTION')}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="REWARD_REDEMPTION">Reward Redemption</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loadingCustomers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stamps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stamps</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {transactionType === 'REWARD_REDEMPTION' && (
          <FormField
            control={form.control}
            name="rewardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loadingRewards}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reward" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rewards?.map((reward) => (
                      <SelectItem key={reward.id} value={reward.id}>
                        {reward.name} ({reward.pointsCost} points)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional notes here..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTransactionForm;
