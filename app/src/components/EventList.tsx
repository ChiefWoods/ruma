import { formatTimestamp } from '@/lib/utils';
import { ParsedEvent, ParsedUser } from '@/types/accounts';
import Image from 'next/image';
import Link from 'next/link';
import { SmallRoundedImage } from './SmallRoundedImage';

export function EventList({
  allUsers,
  events,
}: {
  allUsers: ParsedUser[];
  events: ParsedEvent[];
}) {
  return (
    <ul className="flex flex-col gap-y-5">
      {events.map((event) => {
        const organizer = allUsers.find(
          (user) => user.publicKey === event.organizer
        );

        if (!organizer) {
          throw new Error('Event organizer not found.');
        }

        return (
          <Link href={`/events/${event.publicKey}`} key={event.publicKey}>
            <li
              key={event.publicKey}
              className="flex gap-x-4 group cursor-pointer"
            >
              <Image
                src={event.image}
                alt={event.name}
                height={0}
                width={0}
                className="size-22 rounded-md group-hover:scale-105 transition-all duration-300 group-hover:shadow-xl"
              />
              <div className="flex flex-col gap-y-1 justify-center min-w-0">
                <h4 className="font-semibold">{event.name}</h4>
                <div className="flex items-center gap-x-2">
                  <SmallRoundedImage
                    src={organizer.image}
                    alt={organizer.name}
                  />
                  <p className="text-sm text-muted-foreground">
                    By <span>{organizer.name}</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {formatTimestamp(event.startTimestamp)}{' '}
                  {event.location && <span>• {event.location}</span>}
                </p>
              </div>
            </li>
          </Link>
        );
      })}
    </ul>
  );
}
