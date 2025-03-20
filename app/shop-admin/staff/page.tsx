'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Coffee,
  Shield,
  User,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '@/lib/types';
import { Permission, STAFF_ROLE_PERMISSIONS } from '@/lib/permissions';
import { auth, AuthUser } from '@/lib/auth';

// Mock staff data
const mockStaff = [
  {
    id: 'user_4',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Williams',
    role: UserRole.SHOP_STAFF,
    shopId: 'shop_1',
    staffRole: 'MANAGER',
    permissions: STAFF_ROLE_PERMISSIONS.MANAGER,
    createdAt: '2025-02-20T00:00:00Z',
    updatedAt: '2025-02-20T00:00:00Z',
  },
  {
    id: 'user_5',
    email: 'mike@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: UserRole.SHOP_STAFF,
    shopId: 'shop_1',
    staffRole: 'BARISTA',
    permissions: STAFF_ROLE_PERMISSIONS.BARISTA,
    createdAt: '2025-02-25T00:00:00Z',
    updatedAt: '2025-02-25T00:00:00Z',
  },
  {
    id: 'user_6',
    email: 'lisa@example.com',
    firstName: 'Lisa',
    lastName: 'Chen',
    role: UserRole.SHOP_STAFF,
    shopId: 'shop_1',
    staffRole: 'CASHIER',
    permissions: STAFF_ROLE_PERMISSIONS.CASHIER,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  },
];

// Permission groups for UI organization
const permissionGroups = [
  {
    name: 'Transactions',
    permissions: [
      { id: Permission.CREATE_TRANSACTION, label: 'Create Transactions' },
      { id: Permission.VIEW_TRANSACTIONS, label: 'View Transactions' },
    ],
  },
  {
    name: 'Customers',
    permissions: [
      { id: Permission.VIEW_CUSTOMERS, label: 'View Customers' },
      { id: Permission.MANAGE_CUSTOMER_LOYALTY, label: 'Manage Customer Loyalty' },
    ],
  },
  {
    name: 'Menu',
    permissions: [
      { id: Permission.VIEW_MENU, label: 'View Menu' },
      { id: Permission.MANAGE_MENU, label: 'Manage Menu' },
    ],
  },
  {
    name: 'Loyalty Programs',
    permissions: [
      { id: Permission.VIEW_LOYALTY_PROGRAMS, label: 'View Loyalty Programs' },
      { id: Permission.MANAGE_LOYALTY_PROGRAMS, label: 'Manage Loyalty Programs' },
    ],
  },
  {
    name: 'Staff',
    permissions: [
      { id: Permission.VIEW_STAFF, label: 'View Staff' },
      { id: Permission.MANAGE_STAFF, label: 'Manage Staff' },
    ],
  },
  {
    name: 'Settings',
    permissions: [
      { id: Permission.VIEW_SETTINGS, label: 'View Settings' },
      { id: Permission.MANAGE_SETTINGS, label: 'Manage Settings' },
    ],
  },
];

export default function StaffManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState(mockStaff);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  // Add staff dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    staffRole: 'BARISTA',
    permissions: [...STAFF_ROLE_PERMISSIONS.BARISTA],
  });
  
  // Edit staff dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    staffRole: '',
    permissions: [] as string[],
  });
  
  // Success/error message state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?redirect=/shop-admin/staff');
          return;
        }
        
        // Check if user is a shop admin
        if (user.role !== 'SHOP_ADMIN' && user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }
        
        setCurrentUser(user);
        
        // In a real app, we would fetch staff from the API
        // For now, we'll use the mock data
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?redirect=/shop-admin/staff');
      }
    };

    checkAuth();
  }, [router]);

  // Filter staff based on search term and filters
  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = 
      searchTerm === '' || 
      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || staffMember.staffRole === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleAddStaff = async () => {
    try {
      setErrorMessage('');
      
      // Validate form
      if (!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.staffRole) {
        setErrorMessage('Please fill in all required fields');
        return;
      }
      
      // In a real app, we would call the API to add the staff member
      // For now, we'll update the mock data
      const newStaffMember = {
        id: `user_${Date.now()}`,
        email: addForm.email,
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        role: UserRole.SHOP_STAFF,
        shopId: 'shop_1', // In a real app, this would be the current shop ID
        staffRole: addForm.staffRole,
        permissions: addForm.permissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setStaff([...staff, newStaffMember]);
      setSuccessMessage('Staff member added successfully');
      setIsAddDialogOpen(false);
      
      // Reset form
      setAddForm({
        email: '',
        firstName: '',
        lastName: '',
        staffRole: 'BARISTA',
        permissions: [...STAFF_ROLE_PERMISSIONS.BARISTA],
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error adding staff member:', error);
      setErrorMessage('An error occurred while adding the staff member');
    }
  };

  const handleEditStaff = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setEditForm({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      staffRole: staffMember.staffRole,
      permissions: [...staffMember.permissions],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    try {
      setErrorMessage('');
      
      // Validate form
      if (!editForm.firstName || !editForm.lastName || !editForm.staffRole) {
        setErrorMessage('Please fill in all required fields');
        return;
      }
      
      // In a real app, we would call the API to update the staff member
      // For now, we'll update the mock data
      const updatedStaff = staff.map(s => {
        if (s.id === selectedStaff.id) {
          return {
            ...s,
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            staffRole: editForm.staffRole,
            permissions: editForm.permissions,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      });
      
      setStaff(updatedStaff);
      setSuccessMessage('Staff member updated successfully');
      setIsEditDialogOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating staff member:', error);
      setErrorMessage('An error occurred while updating the staff member');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      // In a real app, we would call the API to delete the staff member
      // For now, we'll update the mock data
      const updatedStaff = staff.filter(s => s.id !== staffId);
      setStaff(updatedStaff);
      setSuccessMessage('Staff member removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error removing staff member:', error);
      setErrorMessage('An error occurred while removing the staff member');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleStaffRoleChange = (role: string, formSetter: any) => {
    formSetter((prev: any) => ({
      ...prev,
      staffRole: role,
      permissions: [...STAFF_ROLE_PERMISSIONS[role as keyof typeof STAFF_ROLE_PERMISSIONS]],
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean, formSetter: any, form: any) => {
    if (checked) {
      formSetter({
        ...form,
        permissions: [...form.permissions, permission],
      });
    } else {
      formSetter({
        ...form,
        permissions: form.permissions.filter((p: string) => p !== permission),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Staff Management</h1>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search staff..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="BARISTA">Barista</SelectItem>
              <SelectItem value="CASHIER">Cashier</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Add a new staff member to your coffee shop. You can set their role and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({...addForm, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({...addForm, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffRole">Staff Role</Label>
                <Select 
                  value={addForm.staffRole} 
                  onValueChange={(value) => handleStaffRoleChange(value, setAddForm)}
                >
                  <SelectTrigger id="staffRole">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="BARISTA">Barista</SelectItem>
                    <SelectItem value="CASHIER">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-md p-4 space-y-4">
                  {permissionGroups.map((group) => (
                    <div key={group.name} className="space-y-2">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`add-${permission.id}`}
                              checked={addForm.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(permission.id, checked === true, setAddForm, addForm)
                              }
                            />
                            <Label htmlFor={`add-${permission.id}`} className="text-sm font-normal">
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStaff}>Add Staff Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>Manage your coffee shop staff and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No staff members found matching your search criteria
              </div>
            ) : (
              filteredStaff.map(staffMember => (
                <div key={staffMember.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{staffMember.firstName} {staffMember.lastName}</p>
                      <p className="text-sm text-muted-foreground">{staffMember.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          staffMember.staffRole === 'MANAGER' ? 'default' :
                          staffMember.staffRole === 'BARISTA' ? 'secondary' : 'outline'
                        }>
                          {staffMember.staffRole}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={() => handleEditStaff(staffMember)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteStaff(staffMember.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <div className="text-sm text-muted-foreground">Page 1 of 1</div>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </CardFooter>
      </Card>
      
      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-staffRole">Staff Role</Label>
              <Select 
                value={editForm.staffRole} 
                onValueChange={(value) => handleStaffRoleChange(value, setEditForm)}
              >
                <SelectTrigger id="edit-staffRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="BARISTA">Barista</SelectItem>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="border rounded-md p-4 space-y-4">
                {permissionGroups.map((group) => (
                  <div key={group.name} className="space-y-2">
                    <h4 className="font-medium text-sm">{group.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-${permission.id}`}
                            checked={editForm.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked === true, setEditForm, editForm)
                            }
                          />
                          <Label htmlFor={`edit-${permission.id}`} className="text-sm font-normal">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStaff}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
