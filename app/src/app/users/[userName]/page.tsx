import { EventList } from '@/components/EventList';
import { PastEventsSheet } from '@/components/PastEventsSheet';
import { Separator } from '@/components/ui/separator';
import { fetchAllUsers } from '@/lib/accounts';
import { wrappedFetch } from '@/lib/api';
import { getUserPda } from '@/lib/pda';
import { getFirstSignatureDate } from '@/lib/solana';
import { removeDashesFromParam, truncateAddress } from '@/lib/utils';
import { ParsedEvent, ParsedTicket, ParsedUser } from '@/types/accounts';
import { PublicKey } from '@solana/web3.js';
import { CalendarDays } from 'lucide-react';
import Image from 'next/image';

const eventsToDisplay = 4;

function EventCountP({ amount, stat }: { amount: number; stat: string }) {
  return (
    <p className="flex gap-x-2 text-sm">
      <span className="font-semibold">{amount}</span>
      <span>{stat}</span>
    </p>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;

  const allUsers = await fetchAllUsers();
  const user: ParsedUser = (
    await wrappedFetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/users?name=${encodeURIComponent(removeDashesFromParam(userName))}`
    )
  ).users[0];

  // get date of user account creation
  const joined = await getFirstSignatureDate(user.publicKey);

  const userPda = getUserPda(new PublicKey(user.publicKey)).toBase58();

  // fetch attended events
  const ticketsCheckedIn: ParsedTicket[] = (
    await wrappedFetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/tickets?user=${userPda}&status=checkedIn`
    )
  ).tickets;
  const eventPdas = ticketsCheckedIn.map((ticket) => ticket.event);
  const eventsUrl = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/events`
  );
  eventPdas.forEach((pda) => eventsUrl.searchParams.append('pda', pda));
  const attendedEvents: ParsedEvent[] = (await wrappedFetch(eventsUrl.href))
    .events;

  // fetch hosted events
  const hostedEvents: ParsedEvent[] = (
    await wrappedFetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/events?organizer=${userPda}`
    )
  ).events;

  return (
    <section className="max-w-[600px] flex flex-col w-full px-4 py-12 mx-auto">
      <section className="flex items-start gap-x-6">
        <Image
          src={user.image}
          alt={user.name}
          className="rounded-full size-28 border-solid border-1 border-red"
          width={0}
          height={0}
        />
        <div className="flex flex-col gap-y-1">
          <h2 className="font-semibold text-2xl">{user.name}</h2>
          <p className="text-muted-foreground text-sm">
            {truncateAddress(user.publicKey)}
          </p>
          <div className="flex items-center gap-x-2">
            <CalendarDays className="text-muted-foreground" size={16} />
            <p className="text-muted-foreground text-sm">Joined {joined}</p>
          </div>
          <div className="flex items-center gap-x-3">
            <EventCountP amount={hostedEvents.length} stat="Hosted" />
            <EventCountP amount={attendedEvents.length} stat="Attended" />
          </div>
        </div>
      </section>
      <Separator className="my-6" />
      <section className="flex flex-col gap-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">Past Events</h3>
          {hostedEvents.length > eventsToDisplay && (
            <PastEventsSheet
              user={user}
              allUsers={allUsers}
              events={hostedEvents}
            />
          )}
        </div>
        {hostedEvents.length === 0 ? (
          <p>No events hosted.</p>
        ) : (
          <EventList
            allUsers={allUsers}
            events={hostedEvents.slice(0, eventsToDisplay)}
          />
        )}
      </section>
    </section>
  );
}
