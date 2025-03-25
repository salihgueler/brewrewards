'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const { user, isLoading, logout } = useAuth();
  const [userDetails, setUserDetails] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setUserDetails(JSON.stringify(user, null, 2));
    }
  }, [user]);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>User Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold">User Role: {user.role}</h2>
                <p>This user should be redirected to: <strong>
                  {user.role === 'SUPER_ADMIN' ? '/super-admin' : 
                   user.role === 'SHOP_ADMIN' ? '/shop-admin' : 
                   '/dashboard'}
                </strong></p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold">User Details:</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto mt-2">
                  {userDetails}
                </pre>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={() => router.push('/')}>
                  Go to Home (Test Redirection)
                </Button>
                
                <Button onClick={() => router.push(`/${user.role === 'SUPER_ADMIN' ? 'super-admin' : 
                                                    user.role === 'SHOP_ADMIN' ? 'shop-admin' : 
                                                    'dashboard'}`)}>
                  Go to Dashboard
                </Button>
                
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div>
              <p>No user is currently logged in.</p>
              <Button onClick={() => router.push('/login')} className="mt-4">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
