import { useState, useEffect } from 'react';
import { generateClient } from '@aws-amplify/api';
import { 
  listStaffMembers, 
  getStaffMember, 
  listStaffInvitations, 
  getStaffInvitation 
} from '@/graphql/queries';
import { 
  createStaffInvitation, 
  acceptStaffInvitation, 
  updateStaffMember, 
  deleteStaffMember, 
  resendStaffInvitation, 
  cancelStaffInvitation 
} from '@/graphql/mutations';
import { StaffMember, StaffInvitation, StaffRole } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const client = generateClient();

// Hook for listing staff members
interface UseStaffMembersOptions {
  shopId: string;
  limit?: number;
}

interface StaffMembersResponse {
  data: StaffMember[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  nextToken?: string;
  fetchMore: () => Promise<void>;
}

export function useStaffMembers({ shopId, limit = 20 }: UseStaffMembersOptions): StaffMembersResponse {
  const [data, setData] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  const fetchStaffMembers = async (token?: string) => {
    if (!shopId) {
      setError(new Error('Shop ID is required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: listStaffMembers,
        variables: {
          shopId,
          limit,
          nextToken: token
        }
      });

      const staffMembers = response.data.listStaffMembers.items;
      setData(token ? [...data, ...staffMembers] : staffMembers);
      setNextToken(response.data.listStaffMembers.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching staff members'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMembers();
  }, [shopId]);

  const refetch = () => fetchStaffMembers();
  const fetchMore = () => nextToken ? fetchStaffMembers(nextToken) : Promise.resolve();

  return {
    data,
    loading,
    error,
    refetch,
    nextToken,
    fetchMore
  };
}

// Hook for getting a single staff member
interface UseStaffMemberOptions {
  id: string;
}

interface StaffMemberResponse {
  data: StaffMember | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStaffMember({ id }: UseStaffMemberOptions): StaffMemberResponse {
  const [data, setData] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaffMember = async () => {
    if (!id) {
      setError(new Error('Staff member ID is required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: getStaffMember,
        variables: { id }
      });

      setData(response.data.getStaffMember);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching staff member'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMember();
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: fetchStaffMember
  };
}

// Hook for listing staff invitations
interface UseStaffInvitationsOptions {
  shopId: string;
  status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  limit?: number;
}

interface StaffInvitationsResponse {
  data: StaffInvitation[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  nextToken?: string;
  fetchMore: () => Promise<void>;
}

export function useStaffInvitations({ 
  shopId, 
  status, 
  limit = 20 
}: UseStaffInvitationsOptions): StaffInvitationsResponse {
  const [data, setData] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  const fetchStaffInvitations = async (token?: string) => {
    if (!shopId) {
      setError(new Error('Shop ID is required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: listStaffInvitations,
        variables: {
          shopId,
          status,
          limit,
          nextToken: token
        }
      });

      const invitations = response.data.listStaffInvitations.items;
      setData(token ? [...data, ...invitations] : invitations);
      setNextToken(response.data.listStaffInvitations.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching staff invitations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffInvitations();
  }, [shopId, status]);

  const refetch = () => fetchStaffInvitations();
  const fetchMore = () => nextToken ? fetchStaffInvitations(nextToken) : Promise.resolve();

  return {
    data,
    loading,
    error,
    refetch,
    nextToken,
    fetchMore
  };
}

// Hook for creating staff invitations
interface UseCreateStaffInvitationOptions {
  shopId: string;
}

interface CreateStaffInvitationInput {
  email: string;
  role: StaffRole;
  permissions: string[];
}

interface CreateStaffInvitationResponse {
  createInvitation: (input: CreateStaffInvitationInput) => Promise<StaffInvitation>;
  loading: boolean;
  error: Error | null;
}

export function useCreateStaffInvitation({ shopId }: UseCreateStaffInvitationOptions): CreateStaffInvitationResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createInvitation = async (input: CreateStaffInvitationInput): Promise<StaffInvitation> => {
    if (!shopId) {
      throw new Error('Shop ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: createStaffInvitation,
        variables: {
          input: {
            ...input,
            shopId
          }
        }
      });

      return response.data.createStaffInvitation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while creating staff invitation');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvitation,
    loading,
    error
  };
}

// Hook for accepting staff invitations
interface UseAcceptStaffInvitationResponse {
  acceptInvitation: (id: string) => Promise<StaffMember>;
  loading: boolean;
  error: Error | null;
}

export function useAcceptStaffInvitation(): UseAcceptStaffInvitationResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const acceptInvitation = async (id: string): Promise<StaffMember> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: acceptStaffInvitation,
        variables: { id }
      });

      return response.data.acceptStaffInvitation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while accepting staff invitation');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    acceptInvitation,
    loading,
    error
  };
}

// Hook for updating staff members
interface UseUpdateStaffMemberResponse {
  updateStaff: (id: string, shopId: string, updates: Partial<StaffMember>) => Promise<StaffMember>;
  loading: boolean;
  error: Error | null;
}

export function useUpdateStaffMember(): UseUpdateStaffMemberResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStaff = async (
    id: string, 
    shopId: string, 
    updates: Partial<StaffMember>
  ): Promise<StaffMember> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: updateStaffMember,
        variables: {
          input: {
            id,
            shopId,
            ...updates
          }
        }
      });

      return response.data.updateStaffMember;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while updating staff member');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStaff,
    loading,
    error
  };
}

// Hook for deleting staff members
interface UseDeleteStaffMemberResponse {
  deleteStaff: (id: string, shopId: string) => Promise<{ id: string; shopId: string }>;
  loading: boolean;
  error: Error | null;
}

export function useDeleteStaffMember(): UseDeleteStaffMemberResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteStaff = async (id: string, shopId: string): Promise<{ id: string; shopId: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: deleteStaffMember,
        variables: { id, shopId }
      });

      return response.data.deleteStaffMember;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while deleting staff member');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteStaff,
    loading,
    error
  };
}

// Hook for managing staff invitations (resend, cancel)
interface UseManageStaffInvitationResponse {
  resendInvitation: (id: string) => Promise<StaffInvitation>;
  cancelInvitation: (id: string) => Promise<StaffInvitation>;
  loading: boolean;
  error: Error | null;
}

export function useManageStaffInvitation(): UseManageStaffInvitationResponse {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const resendInvitation = async (id: string): Promise<StaffInvitation> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: resendStaffInvitation,
        variables: { id }
      });

      return response.data.resendStaffInvitation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while resending invitation');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (id: string): Promise<StaffInvitation> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.graphql({
        query: cancelStaffInvitation,
        variables: { id }
      });

      return response.data.cancelStaffInvitation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred while canceling invitation');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    resendInvitation,
    cancelInvitation,
    loading,
    error
  };
}
