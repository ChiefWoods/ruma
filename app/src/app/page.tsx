'use client';

import { EventTabsContent } from '@/components/EventTabsContent';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { wrappedFetch } from '@/lib/api';
import { unixToMilli } from '@/lib/utils';
import { useEvents } from '@/providers/EventsProvider';
import { useUsers } from '@/providers/UsersProvider';
import { useUser } from '@/providers/UserProvider';
import { ParsedTicket, ParsedUser } from '@/types/accounts';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export default function Page() {
  const { usersData: allUsersData, usersLoading: allUsersLoading } = useUsers();
  const { eventsData: allEventsData, eventsLoading: allEventsLoading } =
    useEvents();
  const { userData, userLoading } = useUser();

  const { data: userTicketsData, isLoading: userTicketsLoading } = useQuery({
    queryKey: ['ticket', userData],
    queryFn: async ({ queryKey }) => {
      if (!queryKey[1]) {
        throw new Error('User is not authenticated.');
      }

      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/tickets`
      );
      const userPda = (queryKey[1] as ParsedUser).publicKey;
      url.searchParams.append('user', userPda);

      return (await wrappedFetch(url.href)).tickets as ParsedTicket[];
    },
    enabled: !!userData,
  });

  const timeSortedEvents = useMemo(() => {
    if (!allEventsData) return [];

    return allEventsData.sort((a, b) => a.startTimestamp - b.startTimestamp);
  }, [allEventsData]);

  const upcomingEvents = useMemo(() => {
    return timeSortedEvents.filter(
      (event) => unixToMilli(event.endTimestamp) > Date.now()
    );
  }, [timeSortedEvents]);

  const pastEvents = useMemo(() => {
    return timeSortedEvents.filter(
      (event) => unixToMilli(event.endTimestamp) <= Date.now()
    );
  }, [timeSortedEvents]);

  return (
    <Tabs defaultValue="upcoming" className="max-w-[800px] mt-11 p-5 mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-3xl">Events</h2>
        <TabsList>
          <TabsTrigger value="upcoming" className="cursor-pointer w-[120px]">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="cursor-pointer">
            Past
          </TabsTrigger>
        </TabsList>
      </div>
      <EventTabsContent
        allUsers={allUsersData}
        events={upcomingEvents}
        isLoading={
          allUsersLoading ||
          allEventsLoading ||
          userLoading ||
          userTicketsLoading
        }
        userTickets={userTicketsData}
        value="upcoming"
      />
      <EventTabsContent
        allUsers={allUsersData}
        events={pastEvents}
        isLoading={
          allUsersLoading ||
          allEventsLoading ||
          userLoading ||
          userTicketsLoading
        }
        userTickets={userTicketsData}
        value="past"
      />
    </Tabs>
  );
}
