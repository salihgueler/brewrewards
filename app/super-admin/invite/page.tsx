'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/lib/types';
import { auth, AuthUser } from '@/lib/auth';
import Link from 'next/link';

// Mock shop data
const mockShops = [
  { id: 'shop_1', name: 'Demo Coffee' },
  { id: 'shop_2', name: 'Bean & Leaf' },
  { id: 'shop_3', name: 'Morning Roast' },
  { id: 'shop_4', name: 'Café Noir' },
];

export default function InviteUserPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shops, setShops] = useState(mockShops);
  
  // Form state
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.SHOP_ADMIN as string, // Default to shop admin for this page
    shopId: '',
    message: '',
  });
  
  // Success/error message state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?userType=super-admin&redirect=/super-admin/invite');
          return;
        }
        
        // Check if user is a super admin
        if (user.role !== 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }
        
        setCurrentUser(user);
        
        // In a real app, we would fetch shops from the API
        // For now, we'll use the mock data
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?userType=super-admin&redirect=/super-admin/invite');
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Validate form
      if (!form.firstName || !form.lastName || !form.email || !form.role) {
        setErrorMessage('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Validate shop ID for shop roles
      if ((form.role === UserRole.SHOP_ADMIN || form.role === UserRole.SHOP_STAFF) && !form.shopId) {
        setErrorMessage('Please select a shop for shop admin or staff roles');
        setIsSubmitting(false);
        return;
      }
      
      // In a real app, we would call the API to invite the user
      // For now, we'll simulate a successful invitation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(`Invitation sent to ${form.email} successfully!`);
      
      // Reset form after successful submission
      setForm({
        email: '',
        firstName: '',
        lastName: '',
        role: UserRole.SHOP_ADMIN,
        shopId: '',
        message: '',
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      setErrorMessage('An error occurred while sending the invitation');
    } finally {
      setIsSubmitting(false);
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
    <div className="container max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/super-admin/users" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Invite Shop Administrator</CardTitle>
          <CardDescription>
            Send an invitation to a new shop administrator. They will receive an email with instructions to set up their account.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({...form, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({...form, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={form.role} 
                onValueChange={(value) => setForm({...form, role: value})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                  <SelectItem value={UserRole.SHOP_ADMIN}>Shop Admin</SelectItem>
                  <SelectItem value={UserRole.SHOP_STAFF}>Shop Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(form.role === UserRole.SHOP_ADMIN || form.role === UserRole.SHOP_STAFF) && (
              <div className="space-y-2">
                <Label htmlFor="shop">Coffee Shop</Label>
                <Select 
                  value={form.shopId} 
                  onValueChange={(value) => setForm({...form, shopId: value})}
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
            
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the invitation email"
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                rows={4}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/super-admin/users">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
