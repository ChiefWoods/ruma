'use client';

import { wrappedFetch } from '@/lib/api';
import { ParsedEvent } from '@/types/accounts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

interface EventsContextType {
  eventsData: ParsedEvent[] | undefined;
  eventsError: Error | null;
  eventsLoading: boolean;
  addEvent: (event: ParsedEvent) => void;
  updateEvent: (event: ParsedEvent) => void;
}

const EventsContext = createContext<EventsContextType>({} as EventsContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/events`;

export function useEvents() {
  return useContext(EventsContext);
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const eventsQueryKey = useMemo(() => ['events'], []);

  const {
    data: eventsData,
    error: eventsError,
    isLoading: eventsLoading,
  } = useQuery({
    queryKey: eventsQueryKey,
    queryFn: async () => {
      const url = new URL(apiEndpoint);
      return (await wrappedFetch(url.href)).events as ParsedEvent[];
    },
  });

  const addEvent = useCallback(
    (event: ParsedEvent) => {
      queryClient.setQueryData(eventsQueryKey, (oldData: ParsedEvent[]) => {
        if (oldData.length === 0) return [event];

        return [...oldData, event];
      });
    },
    [queryClient, eventsQueryKey]
  );

  const updateEvent = useCallback(
    (event: ParsedEvent) => {
      queryClient.setQueryData(eventsQueryKey, (oldData: ParsedEvent[]) => {
        if (oldData.length === 0) return [event];

        return oldData.map((old) =>
          old.publicKey === event.publicKey ? event : old
        );
      });
    },
    [queryClient, eventsQueryKey]
  );

  return (
    <EventsContext.Provider
      value={{
        eventsData,
        eventsError,
        eventsLoading,
        addEvent,
        updateEvent,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}
