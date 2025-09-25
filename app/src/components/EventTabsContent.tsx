import { ParsedEvent, ParsedTicket, ParsedUser } from '@/types/accounts';
import { Skeleton } from './ui/skeleton';
import { TabsContent } from './ui/tabs';
import { formatTimestampToTime } from '@/lib/utils';
import { SmallRoundedImage } from './SmallRoundedImage';
import { MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import Image from 'next/image';

export function EventTabsContent({
  value,
  isLoading,
  events,
  allUsers,
  userTickets,
}: {
  value: string;
  isLoading: boolean;
  events: ParsedEvent[];
  allUsers: ParsedUser[] | undefined;
  userTickets: ParsedTicket[] | undefined;
}) {
  return (
    <TabsContent value={value} className="pt-5">
      <ul>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="mb-6 last:mb-0 flex gap-x-4">
              <div className="flex flex-col gap-y-2 aspect-square w-[150px]">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex justify-between items-start border-1 flex-1 rounded-xl p-4">
                <div className="flex flex-col justify-start gap-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-7 w-32" />
                  <div className="flex items-center gap-x-2">
                    <Skeleton className="size-4 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="size-30 rounded" />
              </div>
            </li>
          ))
        ) : events.length === 0 ? (
          <p>No {value} events.</p>
        ) : (
          allUsers &&
          userTickets &&
          events.map((event) => {
            const organizer = allUsers.find(
              (user) => user.publicKey === event.organizer
            );

            if (!organizer) {
              throw new Error('Event organizer not found.');
            }

            const ticket = userTickets.find(
              (ticket) => ticket.event === event.publicKey
            );

            if (!ticket) {
              throw new Error('User ticket for event not found.');
            }

            return (
              <div
                key={event.publicKey}
                className="flex justify-between items-start"
              >
                <div className="flex flex-col justify-start">
                  <p className="text-muted">
                    {formatTimestampToTime(event.startTimestamp)}
                  </p>
                  <h3 className="font-semibold text-xl">{event.name}</h3>
                  <div className="flex items-center gap-x-2">
                    <SmallRoundedImage
                      src={organizer.image}
                      alt={organizer.name}
                    />
                    <p className="text-sm text-muted-foreground">
                      By <span>{organizer.name}</span>
                    </p>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-x-2">
                      <MapPin className="size-4" />
                      <p className="text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                  )}
                  <StatusBadge status={ticket.status} />
                </div>
                <Image
                  src={event.image}
                  alt={event.name}
                  width={0}
                  height={0}
                  className="size-30 rounded"
                />
              </div>
            );
          })
        )}
      </ul>
    </TabsContent>
  );
}
