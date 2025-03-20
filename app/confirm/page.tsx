'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email) {
      setError('Email is required. Please go back to the registration page.');
      setIsLoading(false);
      return;
    }

    try {
      // Call the confirm sign up function
      await auth.confirmSignUp(email, code);
      setIsConfirmed(true);
      
      // Wait a moment before redirecting to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setError(err.message || 'An error occurred during confirmation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If no email is provided, show an error
  if (!email) {
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
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Missing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md mb-4">
              Email address is missing. Please go back to the registration page.
            </div>
            <Button asChild className="w-full">
              <Link href="/register">Return to Registration</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {isConfirmed ? (
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Account Confirmed
            </CardTitle>
          ) : (
            <CardTitle className="text-2xl text-center">Confirm Your Account</CardTitle>
          )}
          <CardDescription className="text-center">
            {isConfirmed 
              ? 'Your account has been confirmed successfully. Redirecting to login...'
              : `Please enter the verification code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfirmed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter your verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Confirming...' : 'Confirm Account'}
              </Button>
            </form>
          ) : (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
        {!isConfirmed && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Didn't receive a code?{' '}
              <Link href={`/resend-code?email=${encodeURIComponent(email)}`} className="text-primary hover:underline">
                Resend code
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-primary">
                Back to login
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
