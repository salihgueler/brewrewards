'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';

export default function SuperAdminConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('email'); // This could be username or email
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!username) {
      router.push('/login?userType=super-admin');
    }
  }, [username, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!username) {
        throw new Error('Username is missing. Please try again.');
      }
      
      await auth.confirmSignUp(username, code);
      setIsConfirmed(true);
      
      // Automatically redirect after a short delay
      setTimeout(() => {
        router.push('/login?userType=super-admin');
      }, 3000);
    } catch (err: any) {
      if (err.code === 'CodeMismatchException') {
        setError('Invalid verification code. Please try again.');
      } else if (err.code === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else {
        setError(err.message || 'An error occurred during confirmation. Please try again.');
      }
      console.error('Confirmation error:', err);
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
            <CardTitle className="text-2xl">
              {isConfirmed ? 'Account Confirmed' : 'Confirm Super Admin Account'}
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            {isConfirmed 
              ? 'Your super admin account has been confirmed successfully'
              : 'Enter the verification code sent to your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfirmed ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center mb-4">
                You will be redirected to the login page in a few seconds...
              </p>
              <Button asChild>
                <Link href="/login?userType=super-admin">
                  Go to Login
                </Link>
              </Button>
            </div>
          ) : (
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
                  value={username || ''}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Confirming...' : 'Confirm Account'}
              </Button>
            </form>
          )}
        </CardContent>
        {!isConfirmed && (
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Didn't receive a code?{' '}
              <Link href="/resend-code" className="text-primary hover:underline">
                Resend code
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
