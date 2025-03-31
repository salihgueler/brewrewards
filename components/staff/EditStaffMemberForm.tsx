import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { StaffMember, StaffRole } from '@/lib/types';
import { useUpdateStaffMember } from '@/lib/hooks/useStaffManagement';
import { toast } from '@/components/ui/use-toast';

interface EditStaffMemberFormProps {
  staffMember: StaffMember;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  role: z.nativeEnum(StaffRole),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const availablePermissions = [
  { id: 'MANAGE_MENU', label: 'Manage Menu' },
  { id: 'MANAGE_REWARDS', label: 'Manage Rewards' },
  { id: 'VIEW_CUSTOMERS', label: 'View Customers' },
  { id: 'PROCESS_TRANSACTIONS', label: 'Process Transactions' },
  { id: 'VIEW_ANALYTICS', label: 'View Analytics' },
];

const EditStaffMemberForm: React.FC<EditStaffMemberFormProps> = ({ 
  staffMember,
  onSuccess,
  onCancel
}) => {
  const [selectedRole, setSelectedRole] = useState<StaffRole>(staffMember.role);
  const { updateStaff, loading, error } = useUpdateStaffMember();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: staffMember.role,
      permissions: staffMember.permissions,
      isActive: staffMember.isActive,
    },
  });

  useEffect(() => {
    form.reset({
      role: staffMember.role,
      permissions: staffMember.permissions,
      isActive: staffMember.isActive,
    });
    setSelectedRole(staffMember.role);
  }, [staffMember, form]);

  const handleRoleChange = (role: StaffRole) => {
    setSelectedRole(role);
    
    // If changing to Owner, automatically select all permissions
    if (role === StaffRole.OWNER) {
      form.setValue('permissions', availablePermissions.map(p => p.id));
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateStaff(staffMember.id, staffMember.shopId, {
        role: values.role,
        permissions: values.permissions,
        isActive: values.isActive,
      });
      
      toast({
        title: 'Staff member updated',
        description: 'The staff member has been successfully updated',
      });
      
      onSuccess?.();
    } catch (err) {
      toast({
        title: 'Failed to update staff member',
        description: error?.message || 'An error occurred while updating the staff member',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {staffMember.user?.firstName} {staffMember.user?.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">{staffMember.user?.email}</p>
        </div>

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

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Account Status</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {field.value ? 'Active account can log in and perform actions' : 'Inactive accounts cannot log in'}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditStaffMemberForm;
