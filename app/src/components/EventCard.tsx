import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Badge, CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BN } from '@coral-xyz/anchor';
import { RegistrationStatus } from '@/types/event';
import { Button } from './ui/button';
import { statusColors } from '@/lib/colorsRecord';

function EventButtonTab({
  registrationStatus,
  isOrganizer,
}: {
  registrationStatus?: RegistrationStatus;
  isOrganizer: boolean;
}) {
  if (registrationStatus) {
    const badgeName =
      registrationStatus.charAt(0).toUpperCase() + registrationStatus.slice(1);

    return (
      <Badge
        className={`${statusColors[registrationStatus]} inline-block rounded-full px-3 py-1 text-sm font-normal`}
      >
        {badgeName}
      </Badge>
    );
  }

  if (isOrganizer) {
    return (
      <Button size="sm" className="h-9">
        Manage Event
        <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }
}

export function EventCard({
  eventPda,
  name,
  image,
  startTimestamp,
  location,
  registrationStatus,
  isOrganizer,
}: {
  eventPda: string;
  name: string;
  image: string;
  startTimestamp: BN | null;
  location: string;
  registrationStatus?: RegistrationStatus;
  isOrganizer: boolean;
}) {
  return (
    <Link
      href={isOrganizer ? `/events/${eventPda}/manage` : `/events/${eventPda}`}
    >
      <Card className="mb-2 overflow-hidden transition-shadow hover:shadow-lg">
        <div className="grid gap-4 p-4 md:grid-cols-[1fr,200px]">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{name}</h3>
            <div className="ml-1 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {new Date(Number(startTimestamp) || 0).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(Number(startTimestamp) || 0).toLocaleString(
                    'en-US',
                    { hour: 'numeric', minute: '2-digit', hour12: true }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{location || 'TBA'}</span>
              </div>
            </div>
            <EventButtonTab
              registrationStatus={registrationStatus}
              isOrganizer={isOrganizer}
            />
          </div>
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={image}
              alt={name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
