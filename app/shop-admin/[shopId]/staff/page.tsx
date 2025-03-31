import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StaffManagement from '@/components/staff/StaffManagement';
import CreateStaffInvitationForm from '@/components/staff/CreateStaffInvitationForm';
import { getShopById } from '@/lib/api/shops';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';

interface StaffPageProps {
  params: {
    shopId: string;
  };
}

export const metadata = {
  title: 'Staff Management | BrewRewards',
};

export default async function StaffPage({ params }: StaffPageProps) {
  const { shopId } = params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (!hasPermission(user, 'MANAGE_STAFF', shopId)) {
    redirect('/dashboard');
  }
  
  const shop = await getShopById(shopId);
  
  if (!shop) {
    redirect('/shop-admin');
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members and invitations for {shop.name}
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a new staff member. They will receive an email with instructions to join.
              </DialogDescription>
            </DialogHeader>
            <CreateStaffInvitationForm shopId={shopId} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="staff" className="w-full">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        <TabsContent value="staff" className="mt-6">
          <StaffManagement shopId={shopId} activeTab="staff" />
        </TabsContent>
        <TabsContent value="invitations" className="mt-6">
          <StaffManagement shopId={shopId} activeTab="invitations" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
