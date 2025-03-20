'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopSubdomain = searchParams.get('shop');
  const redirectTo = searchParams.get('redirect');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await auth.signIn(email, password);
      
      // If there's a redirect parameter, use it
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      
      // Otherwise, redirect based on user role
      if (user.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (user.role === 'SHOP_ADMIN') {
        router.push('/shop-admin');
      } else {
        // For customers, redirect to dashboard or shop page
        if (shopSubdomain) {
          router.push(`/shops/${shopSubdomain}/dashboard`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      // Handle specific Cognito error messages
      if (err.code === 'UserNotConfirmedException') {
        // Instead of showing an error, redirect to the confirmation page
        if (email.includes('super')) {
          router.push(`/super-admin/confirm?email=${encodeURIComponent(email)}`);
        } else {
          router.push(`/confirm?email=${encodeURIComponent(email)}`);
        }
        return;
      } else if (err.code === 'NotAuthorizedException') {
        setError('Incorrect username or password.');
      } else if (err.code === 'UserNotFoundException') {
        setError('Account not found. Please check your email or sign up.');
      } else {
        setError(err.message || 'An error occurred during sign in. Please try again.');
      }
      console.error('Login error:', err);
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
          <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your rewards
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link 
              href={shopSubdomain ? `/register?shop=${shopSubdomain}` : '/register'} 
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
          <div className="flex justify-center">
            <Link 
              href="/super-admin/register" 
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              Register as Super Admin
            </Link>
          </div>
          {shopSubdomain && (
            <Button variant="outline" asChild className="w-full">
              <Link href={`/shops/${shopSubdomain}`}>
                Return to {shopSubdomain} Coffee Shop
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
