import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function DiscoverEventCard({
  eventPda,
  name,
  image,
  startTimestamp,
  location,
}: {
  eventPda: string;
  name: string;
  image: string;
  startTimestamp: number | null;
  location: string | null;
}) {
  return (
    <div className="rounded-lg bg-[#F6F6F6] p-4 shadow-lg ease-in-out hover:bg-slate-300">
      <Link href={`/events/${eventPda}`} className="group flex gap-6">
        <div className="relative h-[120px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold transition-colors group-hover:text-gray-600">
            {name}
          </h3>
          {startTimestamp && (
            <p className="my-1 flex gap-2 text-gray-500">
              <Calendar className="mt-1 h-4 w-4" />
              {new Date(startTimestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          )}
          {location && (
            <p className="flex gap-2 text-gray-500">
              <MapPin className="mt-1 h-4 w-4" /> {location}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
