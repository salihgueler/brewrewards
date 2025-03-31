'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateTransaction } from '@/lib/hooks/useTransactions';
import { useUsers } from '@/lib/hooks/useUsers';
import { useMenuItems } from '@/lib/hooks/useMenuItems';
import { useRewards } from '@/lib/hooks/useRewards';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorAlert } from '@/components/ui/error-alert';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const transactionSchema = z.object({
  userId: z.string().min(1, 'Customer is required'),
  items: z.array(
    z.object({
      menuItemId: z.string().min(1, 'Menu item is required'),
      name: z.string(),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price must be at least 0'),
    })
  ).min(1, 'At least one item is required'),
  rewardRedeemed: z.object({
    rewardId: z.string(),
    name: z.string(),
    value: z.number(),
  }).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface CreateTransactionFormProps {
  shopId: string;
  onSuccess?: () => void;
}

export function CreateTransactionForm({ shopId, onSuccess }: CreateTransactionFormProps) {
  const [selectedReward, setSelectedReward] = useState<string>('');
  
  const { createTransaction, loading: submitting, error: submitError } = useCreateTransaction({ shopId });
  
  const { data: users, loading: loadingUsers, error: usersError } = useUsers({
    shopId,
    role: 'CUSTOMER',
  });
  
  const { data: menuItems, loading: loadingMenuItems, error: menuItemsError } = useMenuItems({
    shopId,
  });
  
  const { data: rewards, loading: loadingRewards, error: rewardsError } = useRewards({
    shopId,
  });
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      userId: '',
      items: [{ menuItemId: '', name: '', quantity: 1, price: 0 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  
  const watchItems = watch('items');
  const totalAmount = watchItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  const handleMenuItemChange = (index: number, menuItemId: string) => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (menuItem) {
      setValue(`items.${index}.name`, menuItem.name);
      setValue(`items.${index}.price`, menuItem.price);
    }
  };
  
  const handleRewardChange = (rewardId: string) => {
    setSelectedReward(rewardId);
    
    if (!rewardId) {
      setValue('rewardRedeemed', undefined);
      return;
    }
    
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setValue('rewardRedeemed', {
        rewardId: reward.id,
        name: reward.name,
        value: reward.pointsRequired / 10, // Example conversion of points to monetary value
      });
    }
  };
  
  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await createTransaction({
        ...data,
        amount: totalAmount - (data.rewardRedeemed?.value || 0),
      });
      
      toast.success('Transaction created successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to create transaction');
    }
  };
  
  if (loadingUsers || loadingMenuItems || loadingRewards) {
    return <LoadingSpinner size="lg" text="Loading form data..." />;
  }
  
  if (usersError || menuItemsError || rewardsError) {
    return <ErrorAlert error={usersError || menuItemsError || rewardsError} />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Transaction</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {submitError && <ErrorAlert error={submitError} />}
          
          <div className="space-y-2">
            <Label htmlFor="userId">Customer</Label>
            <Select
              onValueChange={(value) => setValue('userId', value)}
              defaultValue=""
            >
              <SelectTrigger id="userId">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && (
              <p className="text-sm text-destructive">{errors.userId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ menuItemId: '', name: '', quantity: 1, price: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row gap-2 p-3 border rounded-md">
                <div className="flex-1">
                  <Label htmlFor={`items.${index}.menuItemId`} className="sr-only">
                    Menu Item
                  </Label>
                  <Select
                    onValueChange={(value) => handleMenuItemChange(index, value)}
                    defaultValue=""
                  >
                    <SelectTrigger id={`items.${index}.menuItemId`}>
                      <SelectValue placeholder="Select a menu item" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({formatCurrency(item.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="hidden"
                    {...register(`items.${index}.menuItemId` as const)}
                  />
                  <input
                    type="hidden"
                    {...register(`items.${index}.name` as const)}
                  />
                  <input
                    type="hidden"
                    {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                  />
                  {errors.items?.[index]?.menuItemId && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.menuItemId?.message}
                    </p>
                  )}
                </div>
                
                <div className="w-20">
                  <Label htmlFor={`items.${index}.quantity`} className="sr-only">
                    Quantity
                  </Label>
                  <Input
                    id={`items.${index}.quantity`}
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                    placeholder="Qty"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>
                
                <div className="w-24 text-right flex items-center justify-between">
                  <span className="font-medium">
                    {formatCurrency(
                      (watchItems[index]?.quantity || 0) * (watchItems[index]?.price || 0)
                    )}
                  </span>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            ))}
            
            {errors.items && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rewardRedeemed">Redeem Reward</Label>
            <Select
              onValueChange={handleRewardChange}
              value={selectedReward}
            >
              <SelectTrigger id="rewardRedeemed">
                <SelectValue placeholder="Select a reward to redeem (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No reward</SelectItem>
                {rewards.map((reward) => (
                  <SelectItem key={reward.id} value={reward.id}>
                    {reward.name} ({reward.pointsRequired} points)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between text-lg font-medium">
              <span>Total Amount:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            
            {watch('rewardRedeemed') && (
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Reward Discount:</span>
                <span>-{formatCurrency(watch('rewardRedeemed')?.value || 0)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Final Amount:</span>
              <span>{formatCurrency(totalAmount - (watch('rewardRedeemed')?.value || 0))}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? <LoadingSpinner size="sm" /> : 'Create Transaction'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
