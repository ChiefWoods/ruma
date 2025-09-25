'use client';

import { wrappedFetch } from '@/lib/api';
import { ParsedUser } from '@/types/accounts';
import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';

interface UsersContextType {
  usersData: ParsedUser[] | undefined;
  usersError: Error | null;
  usersLoading: boolean;
}

const UsersContext = createContext<UsersContextType>({} as UsersContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/users`;

export function useUsers() {
  return useContext(UsersContext);
}

export function AllUsersProvider({ children }: { children: ReactNode }) {
  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const url = new URL(apiEndpoint);
      return (await wrappedFetch(url.href)).users as ParsedUser[];
    },
  });

  return (
    <UsersContext.Provider
      value={{
        usersData,
        usersError,
        usersLoading,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
