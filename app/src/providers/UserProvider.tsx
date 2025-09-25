'use client';

import { wrappedFetch } from '@/lib/api';
import { getUserPda } from '@/lib/pda';
import { ParsedUser } from '@/types/accounts';
import { usePrivy } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

interface UserContextType {
  userData: ParsedUser | undefined;
  userError: Error | null;
  userLoading: boolean;
  setUser: (userData: ParsedUser) => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/users`;

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = usePrivy();
  const queryClient = useQueryClient();

  const userQueryKey = useMemo(
    () => ['user', user?.wallet?.address],
    [user?.wallet?.address]
  );

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useQuery({
    queryKey: userQueryKey,
    queryFn: async ({ queryKey }) => {
      if (!queryKey[1]) {
        throw new Error('User is not authenticated.');
      }

      const url = new URL(apiEndpoint);
      const userPda = getUserPda(new PublicKey(queryKey[1])).toBase58();
      url.searchParams.append('pda', userPda);

      return (await wrappedFetch(url.href)).user as ParsedUser;
    },
    enabled: !!user?.wallet?.address,
  });

  const setUser = useCallback(
    (userData: ParsedUser) => {
      queryClient.setQueryData<ParsedUser>(userQueryKey, userData);
    },
    [queryClient, userQueryKey]
  );

  return (
    <UserContext.Provider
      value={{
        userData,
        userError,
        userLoading,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
