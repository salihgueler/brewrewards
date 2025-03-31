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
import { CognitoUser } from 'amazon-cognito-identity-js';
import { debugAuth } from '@/lib/debug-utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopSubdomain = searchParams.get('shop');
  const redirectTo = searchParams.get('redirect');
  const userType = searchParams.get('userType'); // 'super-admin' or undefined
  
  const [identifier, setIdentifier] = useState(''); // Can be username or email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New password challenge state
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [challengeData, setChallengeData] = useState<{
    username: string;
    userAttributes: any;
    cognitoUser: CognitoUser;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting login with:', identifier);
      const user = await auth.signIn(identifier, password);
      console.log('Login successful, user:', user);
      
      // Check if new password is required
      if (user.newPasswordRequired) {
        console.log('New password required, setting up challenge form');
        setShowNewPasswordForm(true);
        setChallengeData({
          username: user.email,
          userAttributes: {},
          cognitoUser: user.cognitoUser
        });
        setIsLoading(false);
        return;
      }
      
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
      console.error('Login error details:', err);
      
      // Handle specific Cognito error messages
      if (err.code === 'UserNotConfirmedException') {
        // Determine which confirmation page to use based on the userType parameter
        if (userType === 'super-admin') {
          router.push(`/super-admin/confirm?email=${encodeURIComponent(identifier)}`);
        } else {
          router.push(`/confirm?email=${encodeURIComponent(identifier)}`);
        }
        return;
      } else if (err.code === 'NotAuthorizedException') {
        setError('Incorrect username or password.');
      } else if (err.code === 'UserNotFoundException') {
        setError('Account not found. Please check your credentials or sign up.');
      } else {
        setError(err.message || 'An error occurred during sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challengeData) {
      setError('Missing challenge data. Please try logging in again.');
      setShowNewPasswordForm(false);
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Completing new password challenge for:', challengeData.username);
      
      // Complete the new password challenge
      // We're passing an empty object for userAttributes to avoid modifying any attributes
      const user = await auth.completeNewPasswordChallenge(
        challengeData.username,
        newPassword,
        {}, // Empty object to avoid modifying any attributes
        challengeData.cognitoUser
      );
      
      console.log('New password challenge completed, user:', user);
      
      // Redirect based on user role
      if (user.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (user.role === 'SHOP_ADMIN') {
        router.push('/shop-admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('New password error details:', err);
      setError(err.message || 'Failed to set new password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const runAuthDebug = async () => {
    const result = await debugAuth();
    alert(result);
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
          <CardTitle className="text-2xl text-center">
            {showNewPasswordForm 
              ? "Set New Password" 
              : userType === 'super-admin' 
                ? 'Super Admin Login' 
                : userType === 'shop-admin'
                  ? 'Shop Admin Login'
                  : 'Sign in to your account'}
          </CardTitle>
          <CardDescription className="text-center">
            {showNewPasswordForm 
              ? "You need to set a new password to continue" 
              : userType === 'super-admin' 
                ? 'Enter your username or email to access the super admin dashboard' 
                : userType === 'shop-admin'
                  ? 'Enter your username or email to access your shop dashboard'
                  : 'Enter your email and password to access your rewards'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showNewPasswordForm ? (
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Setting Password...' : 'Set New Password'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {userType === 'super-admin' || userType === 'shop-admin' ? 'Username or Email' : 'Email'}
                </Label>
                <Input
                  id="identifier"
                  type={userType === 'super-admin' || userType === 'shop-admin' ? 'text' : 'email'}
                  placeholder={userType === 'super-admin' || userType === 'shop-admin' ? 'username or email' : 'your.email@example.com'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={runAuthDebug}
              >
                Debug Auth
              </Button>
            </form>
          )}
        </CardContent>
        {!showNewPasswordForm && (
          <CardFooter className="flex flex-col space-y-4">
            {userType === 'super-admin' ? (
              <div className="text-center text-sm">
                Don't have a super admin account?{' '}
                <Link href="/super-admin/register" className="text-primary hover:underline">
                  Register as Super Admin
                </Link>
              </div>
            ) : (
              <>
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
                    href="/login?userType=super-admin" 
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mr-4"
                  >
                    <Shield className="h-3 w-3" />
                    Super Admin Login
                  </Link>
                  <Link 
                    href="/login?userType=shop-admin" 
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <Coffee className="h-3 w-3" />
                    Shop Admin Login
                  </Link>
                </div>
              </>
            )}
            {shopSubdomain && (
              <Button variant="outline" asChild className="w-full">
                <Link href={`/shops/${shopSubdomain}`}>
                  Return to {shopSubdomain} Coffee Shop
                </Link>
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
