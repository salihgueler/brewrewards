import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, RefreshCw, XCircle } from 'lucide-react';
import { StaffInvitation, StaffRole } from '@/lib/types';
import { LoadingState } from '@/components/ui/loading-state';
import { formatDate, formatDistanceToNow } from '@/lib/utils';

interface InvitationsListProps {
  invitations: StaffInvitation[];
  isLoading: boolean;
  error: Error | null;
  onResend: (invitation: StaffInvitation) => void;
  onCancel: (invitation: StaffInvitation) => void;
}

const getRoleBadgeColor = (role: StaffRole) => {
  switch (role) {
    case StaffRole.OWNER:
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case StaffRole.MANAGER:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case StaffRole.BARISTA:
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'EXPIRED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const InvitationsList: React.FC<InvitationsListProps> = ({
  invitations,
  isLoading,
  error,
  onResend,
  onCancel
}) => {
  return (
    <LoadingState
      loading={isLoading}
      error={error}
      loadingText="Loading invitations..."
      errorText="Failed to load invitations"
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No invitations found
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(invitation.role)}>
                      {invitation.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeColor(invitation.status)}>
                      {invitation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                  <TableCell>
                    {invitation.status === 'PENDING' ? (
                      <span title={formatDate(invitation.expiresAt)}>
                        {formatDistanceToNow(new Date(invitation.expiresAt))}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {invitation.status === 'PENDING' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onResend(invitation)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onCancel(invitation)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </LoadingState>
  );
};

export default InvitationsList;
