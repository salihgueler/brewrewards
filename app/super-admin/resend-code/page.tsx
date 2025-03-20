'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, Shield, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default function ResendCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // In a real implementation, this would call the API to resend the verification code
      // For now, we'll simulate a successful API call
      await auth.forgotPassword(email);
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error resending code:', err);
      setError(err.message || 'An error occurred while resending the code. Please try again.');
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
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-bold text-xl">BrewRewards Admin</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Resend Verification Code</CardTitle>
          <CardDescription className="text-center">
            Enter your email address to receive a new verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm bg-green-100 text-green-800 rounded-md">
                A new verification code has been sent to your email address.
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Resend Verification Code'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href={`/super-admin/confirm?email=${encodeURIComponent(email)}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to verification
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
