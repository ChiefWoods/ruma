'use client';

import { wrappedFetch } from '@/lib/api';
import { ParsedTicket } from '@/types/accounts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

interface TicketsContextType {
  ticketsData: ParsedTicket[] | undefined;
  ticketsError: Error | null;
  ticketsLoading: boolean;
  addTicket: (ticket: ParsedTicket) => void;
  updateTicket: (ticket: ParsedTicket) => void;
}

const TicketsContext = createContext<TicketsContextType>(
  {} as TicketsContextType
);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/tickets`;

export function useTickets() {
  return useContext(TicketsContext);
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const ticketsQueryKey = useMemo(() => ['tickets'], []);

  const {
    data: ticketsData,
    error: ticketsError,
    isLoading: ticketsLoading,
  } = useQuery({
    queryKey: ticketsQueryKey,
    queryFn: async () => {
      const url = new URL(apiEndpoint);
      return (await wrappedFetch(url.href)).tickets as ParsedTicket[];
    },
  });

  const addTicket = useCallback(
    (ticket: ParsedTicket) => {
      queryClient.setQueryData(ticketsQueryKey, (oldData: ParsedTicket[]) => {
        if (oldData.length === 0) return [ticket];
        return [...oldData, ticket];
      });
    },
    [queryClient, ticketsQueryKey]
  );

  const updateTicket = useCallback(
    (ticket: ParsedTicket) => {
      queryClient.setQueryData(ticketsQueryKey, (oldData: ParsedTicket[]) => {
        if (oldData.length === 0) return [ticket];
        return oldData.map((old) =>
          old.publicKey === ticket.publicKey ? ticket : old
        );
      });
    },
    [queryClient, ticketsQueryKey]
  );

  return (
    <TicketsContext.Provider
      value={{
        ticketsData,
        ticketsError,
        ticketsLoading,
        addTicket,
        updateTicket,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
}
