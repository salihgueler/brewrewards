'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Coffee,
  Shield,
  User
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
import { UserRole } from '@/lib/types';
import { auth, AuthUser } from '@/lib/auth';

// Mock user data
const mockUsers = [
  { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: UserRole.CUSTOMER, shopId: null },
  { id: '2', email: 'emma@example.com', firstName: 'Emma', lastName: 'Johnson', role: UserRole.SHOP_ADMIN, shopId: 'shop_1' },
  { id: '3', email: 'michael@example.com', firstName: 'Michael', lastName: 'Chen', role: UserRole.SHOP_ADMIN, shopId: 'shop_2' },
  { id: '4', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Williams', role: UserRole.SHOP_STAFF, shopId: 'shop_1' },
  { id: '5', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: UserRole.SUPER_ADMIN, shopId: null },
];

// Mock shop data
const mockShops = [
  { id: 'shop_1', name: 'Demo Coffee' },
  { id: 'shop_2', name: 'Bean & Leaf' },
  { id: 'shop_3', name: 'Morning Roast' },
  { id: 'shop_4', name: 'Café Noir' },
];

export default function UsersManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState(mockUsers);
  const [shops, setShops] = useState(mockShops);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [shopFilter, setShopFilter] = useState<string>('');
  
  // Edit user dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    shopId: '',
  });
  
  // Invite user dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.CUSTOMER,
    shopId: '',
  });
  
  // Success/error message state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?userType=super-admin&redirect=/super-admin/users');
          return;
        }
        
        // Check if user is a super admin
        if (user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }
        
        setCurrentUser(user);
        
        // In a real app, we would fetch users and shops from the API
        // For now, we'll use the mock data
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?userType=super-admin&redirect=/super-admin/users');
      }
    };

    checkAuth();
  }, [router]);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    const matchesShop = shopFilter === '' || user.shopId === shopFilter;
    
    return matchesSearch && matchesRole && matchesShop;
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      shopId: user.shopId || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      setErrorMessage('');
      
      // Validate form
      if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.role) {
        setErrorMessage('Please fill in all required fields');
        return;
      }
      
      // Validate shop ID for shop roles
      if ((editForm.role === UserRole.SHOP_ADMIN || editForm.role === UserRole.SHOP_STAFF) && !editForm.shopId) {
        setErrorMessage('Please select a shop for shop admin or staff roles');
        return;
      }
      
      // In a real app, we would call the API to update the user
      // For now, we'll update the mock data
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            email: editForm.email,
            role: editForm.role as UserRole,
            shopId: editForm.shopId || null,
          };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      setSuccessMessage('User updated successfully');
      setIsEditDialogOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage('An error occurred while updating the user');
    }
  };

  const handleInviteUser = async () => {
    try {
      setErrorMessage('');
      
      // Validate form
      if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.role) {
        setErrorMessage('Please fill in all required fields');
        return;
      }
      
      // Validate shop ID for shop roles
      if ((inviteForm.role === UserRole.SHOP_ADMIN || inviteForm.role === UserRole.SHOP_STAFF) && !inviteForm.shopId) {
        setErrorMessage('Please select a shop for shop admin or staff roles');
        return;
      }
      
      // In a real app, we would call the API to invite the user
      // For now, we'll add to the mock data
      const newUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        email: inviteForm.email,
        role: inviteForm.role,
        shopId: inviteForm.shopId || null,
      };
      
      setUsers([...users, newUser]);
      setSuccessMessage('User invited successfully');
      setIsInviteDialogOpen(false);
      
      // Reset invite form
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        role: UserRole.CUSTOMER,
        shopId: '',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error inviting user:', error);
      setErrorMessage('An error occurred while inviting the user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // In a real app, we would call the API to delete the user
      // For now, we'll update the mock data
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      setSuccessMessage('User deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('An error occurred while deleting the user');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
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
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
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
              placeholder="Search users..." 
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
              <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
              <SelectItem value={UserRole.SHOP_ADMIN}>Shop Admin</SelectItem>
              <SelectItem value={UserRole.SHOP_STAFF}>Shop Staff</SelectItem>
              <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={shopFilter} onValueChange={setShopFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Shops</SelectItem>
              {shops.map(shop => (
                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to a new user. They will receive an email with instructions to set up their account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={inviteForm.role} 
                  onValueChange={(value) => setInviteForm({...inviteForm, role: value as UserRole})}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={UserRole.SHOP_ADMIN}>Shop Admin</SelectItem>
                    <SelectItem value={UserRole.SHOP_STAFF}>Shop Staff</SelectItem>
                    <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(inviteForm.role === UserRole.SHOP_ADMIN || inviteForm.role === UserRole.SHOP_STAFF) && (
                <div className="space-y-2">
                  <Label htmlFor="shop">Coffee Shop</Label>
                  <Select 
                    value={inviteForm.shopId} 
                    onValueChange={(value) => setInviteForm({...inviteForm, shopId: value})}
                  >
                    <SelectTrigger id="shop">
                      <SelectValue placeholder="Select shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map(shop => (
                        <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleInviteUser}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all users across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your search criteria
              </div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {user.role === UserRole.SUPER_ADMIN ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SHOP_STAFF ? (
                        <Coffee className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          user.role === UserRole.SUPER_ADMIN ? 'default' :
                          user.role === UserRole.SHOP_ADMIN ? 'secondary' :
                          user.role === UserRole.SHOP_STAFF ? 'outline' : 'secondary'
                        }>
                          {user.role === UserRole.SUPER_ADMIN ? 'Super Admin' :
                           user.role === UserRole.SHOP_ADMIN ? 'Shop Admin' :
                           user.role === UserRole.SHOP_STAFF ? 'Shop Staff' : 'Customer'}
                        </Badge>
                        {user.shopId && (
                          <Badge variant="outline">
                            {shops.find(shop => shop.id === user.shopId)?.name || 'Unknown Shop'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser?.id} // Prevent deleting yourself
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
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
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
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
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select 
                value={editForm.role} 
                onValueChange={(value) => setEditForm({...editForm, role: value})}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                  <SelectItem value={UserRole.SHOP_ADMIN}>Shop Admin</SelectItem>
                  <SelectItem value={UserRole.SHOP_STAFF}>Shop Staff</SelectItem>
                  <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(editForm.role === UserRole.SHOP_ADMIN || editForm.role === UserRole.SHOP_STAFF) && (
              <div className="space-y-2">
                <Label htmlFor="edit-shop">Coffee Shop</Label>
                <Select 
                  value={editForm.shopId} 
                  onValueChange={(value) => setEditForm({...editForm, shopId: value})}
                >
                  <SelectTrigger id="edit-shop">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
