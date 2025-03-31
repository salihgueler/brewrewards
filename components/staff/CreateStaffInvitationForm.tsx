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
import { Checkbox } from '@/components/ui/checkbox';
import { StaffRole } from '@/lib/types';
import { useCreateStaffInvitation } from '@/lib/hooks/useStaffManagement';
import { toast } from '@/components/ui/use-toast';

interface CreateStaffInvitationFormProps {
  shopId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.nativeEnum(StaffRole),
  permissions: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const availablePermissions = [
  { id: 'MANAGE_MENU', label: 'Manage Menu' },
  { id: 'MANAGE_REWARDS', label: 'Manage Rewards' },
  { id: 'VIEW_CUSTOMERS', label: 'View Customers' },
  { id: 'PROCESS_TRANSACTIONS', label: 'Process Transactions' },
  { id: 'VIEW_ANALYTICS', label: 'View Analytics' },
];

const getDefaultPermissions = (role: StaffRole): string[] => {
  switch (role) {
    case StaffRole.OWNER:
      return availablePermissions.map(p => p.id);
    case StaffRole.MANAGER:
      return ['MANAGE_MENU', 'MANAGE_REWARDS', 'VIEW_CUSTOMERS', 'PROCESS_TRANSACTIONS', 'VIEW_ANALYTICS'];
    case StaffRole.BARISTA:
      return ['PROCESS_TRANSACTIONS', 'VIEW_CUSTOMERS'];
    default:
      return [];
  }
};

const CreateStaffInvitationForm: React.FC<CreateStaffInvitationFormProps> = ({ 
  shopId,
  onSuccess 
}) => {
  const [selectedRole, setSelectedRole] = useState<StaffRole>(StaffRole.BARISTA);
  const { createInvitation, loading, error } = useCreateStaffInvitation({ shopId });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: StaffRole.BARISTA,
      permissions: getDefaultPermissions(StaffRole.BARISTA),
    },
  });

  const handleRoleChange = (role: StaffRole) => {
    setSelectedRole(role);
    form.setValue('permissions', getDefaultPermissions(role));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createInvitation({
        email: values.email,
        role: values.role,
        permissions: values.permissions || [],
      });
      
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${values.email}`,
      });
      
      form.reset();
      onSuccess?.();
    } catch (err) {
      toast({
        title: 'Failed to send invitation',
        description: error?.message || 'An error occurred while sending the invitation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="staff@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleRoleChange(value as StaffRole);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={StaffRole.BARISTA}>Barista</SelectItem>
                  <SelectItem value={StaffRole.MANAGER}>Manager</SelectItem>
                  <SelectItem value={StaffRole.OWNER}>Owner</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Permissions</FormLabel>
              </div>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                const updatedPermissions = checked
                                  ? [...(field.value || []), permission.id]
                                  : (field.value || []).filter(
                                      (value) => value !== permission.id
                                    );
                                field.onChange(updatedPermissions);
                              }}
                              disabled={selectedRole === StaffRole.OWNER}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {permission.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Sending invitation...' : 'Send Invitation'}
        </Button>
      </form>
    </Form>
  );
};

export default CreateStaffInvitationForm;
