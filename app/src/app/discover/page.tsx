'use client';

import { DiscoverEventCard } from '@/components/DiscoverEventCard';
import { useAnchorProgram } from '@/hooks/useAnchorProgram';
import useSWR from 'swr';

export default function Page() {
  const { getAllEventAcc } = useAnchorProgram();
  const {
    data: events,
    isLoading,
    error,
  } = useSWR('/api/events', async () => {
    const allEvents = await getAllEventAcc();

    allEvents.filter(({ account }) => {
      return (
        Number(account.data.startTimestamp) > Date.now() &&
        account.data.isPublic
      );
    });

    return allEvents;
  });

  // TODO: add error and loading states
  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading...</p>;

  if (events) {
    return events.length ? (
      <div className="mb-6 mt-2 px-72">
        <h1 className="mb-4 text-3xl font-bold">Discover Events</h1>
        <div className="grid w-full grid-cols-2 gap-8 justify-self-center">
          {events.map(({ publicKey, account }) => {
            const { data } = account;

            return (
              <DiscoverEventCard
                key={publicKey.toBase58()}
                eventPda={publicKey.toBase58()}
                name={data.name}
                image={data.image}
                startTimestamp={Number(data.startTimestamp)}
                location={data.location}
              />
            );
          })}
        </div>
      </div>
    ) : (
      // TODO: add no events found state
      <p>No new events. Check back later!</p>
    );
  }
}
