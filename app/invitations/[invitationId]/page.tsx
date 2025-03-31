'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Coffee } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { StaffRole } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface InvitationPageProps {
  params: {
    invitationId: string;
  };
}

const getRoleBadgeColor = (role: StaffRole) => {
  switch (role) {
    case StaffRole.OWNER:
      return 'bg-purple-100 text-purple-800';
    case StaffRole.MANAGER:
      return 'bg-blue-100 text-blue-800';
    case StaffRole.BARISTA:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function InvitationPage({ params }: InvitationPageProps) {
  const { invitationId } = params;
  const router = useRouter();
  const { user } = useAuth();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined' | 'error'>('pending');

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!user) {
        router.push(`/login?redirect=/invitations/${invitationId}`);
        return;
      }

      try {
        const response = await fetch(`/api/invitations/${invitationId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch invitation');
        }
        
        const data = await response.json();
        setInvitation(data);
        
        // Fetch shop details
        const shopResponse = await fetch(`/api/shops/${data.shopId}`);
        if (shopResponse.ok) {
          const shopData = await shopResponse.json();
          setShop(shopData);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId, user, router]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }
      
      setStatus('accepted');
      toast({
        title: 'Invitation accepted',
        description: `You are now a staff member at ${shop?.name}`,
      });
      
      // Redirect to shop admin after a short delay
      setTimeout(() => {
        router.push(`/shop-admin/${invitation.shopId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
      toast({
        title: 'Failed to accept invitation',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'decline' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline invitation');
      }
      
      setStatus('declined');
      toast({
        title: 'Invitation declined',
        description: 'You have declined the staff invitation',
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
      toast({
        title: 'Failed to decline invitation',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading invitation...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
            <CardDescription>
              We couldn't load this invitation. It may have expired or been canceled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error || 'Invitation not found'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <CardTitle>Invitation Accepted!</CardTitle>
            <CardDescription>
              You are now a staff member at {shop?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting you to the shop admin dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <CardTitle>Invitation Declined</CardTitle>
            <CardDescription>
              You have declined the invitation to join {shop?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {shop?.logoUrl ? (
              <img 
                src={shop.logoUrl} 
                alt={shop.name} 
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Coffee className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-center">{shop?.name || 'Coffee Shop'}</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join as staff
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge className={getRoleBadgeColor(invitation.role as StaffRole)}>
              {invitation.role}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Permissions:</p>
            <div className="flex flex-wrap gap-2">
              {invitation.permissions.map((permission: string) => (
                <Badge key={permission} variant="outline">
                  {permission.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            This invitation was sent to {invitation.email}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            disabled={processing}
          >
            {processing && status === 'declined' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Decline
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={processing}
          >
            {processing && status === 'accepted' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Accept Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
