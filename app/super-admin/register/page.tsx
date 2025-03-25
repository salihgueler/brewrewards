'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';

export default function SuperAdminRegisterPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real application, this would be a secure code or process
  // For demo purposes, we're using a simple code
  const SUPER_ADMIN_REGISTRATION_CODE = 'BREW-SUPER-2025';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate registration code
    if (registrationCode !== SUPER_ADMIN_REGISTRATION_CODE) {
      setError('Invalid registration code. Please contact system administrator.');
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // Register the super admin
      await auth.signUpSuperAdmin(username, email, password, firstName, lastName);
      
      // Redirect to confirmation page
      router.push(`/super-admin/confirm?email=${encodeURIComponent(username)}`);
    } catch (err: any) {
      if (err.code === 'UsernameExistsException') {
        setError('Username or email already exists. Please try another one.');
      } else if (err.code === 'InvalidPasswordException') {
        setError('Password does not meet requirements. It should include uppercase, lowercase, numbers, and be at least 8 characters long.');
      } else {
        setError(err.message || 'An error occurred during registration. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Coffee className="h-6 w-6" />
              <span className="font-bold text-xl">BrewRewards</span>
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-2xl">Super Admin Registration</CardTitle>
          </div>
          <CardDescription className="text-center">
            Create a new super admin account to manage the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="superadmin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationCode">Registration Code</Label>
              <Input
                id="registrationCode"
                type="text"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the super admin registration code provided by the system administrator
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login?userType=super-admin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
