'use client';

import React, { useState } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import StaffList from './StaffList';
import InvitationsList from './InvitationsList';
import EditStaffMemberForm from './EditStaffMemberForm';
import { 
  useStaffMembers, 
  useStaffInvitations, 
  useUpdateStaffMember, 
  useDeleteStaffMember, 
  useManageStaffInvitation 
} from '@/lib/hooks/useStaffManagement';
import { StaffMember, StaffInvitation } from '@/lib/types';

interface StaffManagementProps {
  shopId: string;
  activeTab: 'staff' | 'invitations';
}

const StaffManagement: React.FC<StaffManagementProps> = ({ shopId, activeTab }) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<StaffInvitation | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Fetch staff members
  const { 
    data: staffMembers, 
    loading: staffLoading, 
    error: staffError,
    refetch: refetchStaff 
  } = useStaffMembers({ shopId });

  // Fetch pending invitations
  const { 
    data: invitations, 
    loading: invitationsLoading, 
    error: invitationsError,
    refetch: refetchInvitations 
  } = useStaffInvitations({ 
    shopId, 
    status: 'PENDING' 
  });

  // Staff management hooks
  const { updateStaff } = useUpdateStaffMember();
  const { deleteStaff } = useDeleteStaffMember();
  const { resendInvitation, cancelInvitation } = useManageStaffInvitation();

  // Handle staff actions
  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    try {
      await deleteStaff(staffToDelete.id, shopId);
      toast({
        title: 'Staff member removed',
        description: 'The staff member has been successfully removed',
      });
      refetchStaff();
    } catch (error) {
      toast({
        title: 'Failed to remove staff member',
        description: 'An error occurred while removing the staff member',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  const handleToggleActive = async (staff: StaffMember, isActive: boolean) => {
    try {
      await updateStaff(staff.id, shopId, { isActive });
      toast({
        title: isActive ? 'Staff member activated' : 'Staff member deactivated',
        description: `The staff member has been ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
      refetchStaff();
    } catch (error) {
      toast({
        title: 'Failed to update staff member',
        description: 'An error occurred while updating the staff member',
        variant: 'destructive',
      });
    }
  };

  // Handle invitation actions
  const handleResendInvitation = async (invitation: StaffInvitation) => {
    try {
      await resendInvitation(invitation.id);
      toast({
        title: 'Invitation resent',
        description: `The invitation to ${invitation.email} has been resent`,
      });
      refetchInvitations();
    } catch (error) {
      toast({
        title: 'Failed to resend invitation',
        description: 'An error occurred while resending the invitation',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvitation = (invitation: StaffInvitation) => {
    setInvitationToCancel(invitation);
    setIsCancelDialogOpen(true);
  };

  const confirmCancelInvitation = async () => {
    if (!invitationToCancel) return;
    
    try {
      await cancelInvitation(invitationToCancel.id);
      toast({
        title: 'Invitation canceled',
        description: `The invitation to ${invitationToCancel.email} has been canceled`,
      });
      refetchInvitations();
    } catch (error) {
      toast({
        title: 'Failed to cancel invitation',
        description: 'An error occurred while canceling the invitation',
        variant: 'destructive',
      });
    } finally {
      setIsCancelDialogOpen(false);
      setInvitationToCancel(null);
    }
  };

  return (
    <>
      {activeTab === 'staff' ? (
        <StaffList
          staffMembers={staffMembers}
          isLoading={staffLoading}
          error={staffError}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
          onToggleActive={handleToggleActive}
        />
      ) : (
        <InvitationsList
          invitations={invitations}
          isLoading={invitationsLoading}
          error={invitationsError}
          onResend={handleResendInvitation}
          onCancel={handleCancelInvitation}
        />
      )}

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <EditStaffMemberForm
              staffMember={selectedStaff}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                refetchStaff();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Staff Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {staffToDelete?.user?.firstName} {staffToDelete?.user?.lastName} from your staff. 
              They will no longer have access to your shop's admin features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStaff} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Confirmation */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the pending invitation sent to {invitationToCancel?.email}.
              They will no longer be able to accept this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelInvitation} className="bg-red-600 hover:bg-red-700">
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StaffManagement;
