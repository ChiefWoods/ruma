'use client';

import { ChevronsRight } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import Image from 'next/image';
import { ParsedEvent, ParsedUser } from '@/types/accounts';
import { Separator } from './ui/separator';
import { EventList } from './EventList';

export function PastEventsSheet({
  user,
  allUsers,
  events,
}: {
  user: ParsedUser;
  allUsers: ParsedUser[];
  events: ParsedEvent[];
}) {
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer text-muted-foreground font-semibold text-sm hover-highlight">
        View All
      </SheetTrigger>
      <SheetContent
        className="rounded-md w-[600px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="flex flex-row items-center gap-x-2 rounded-t-xl px-3 py-2 border-b">
          <SheetClose asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={'ghost'}
                  size={'icon'}
                  className="cursor-pointer hover:invert hover:bg-muted-foreground transition-colors duration-300 group"
                >
                  <ChevronsRight className="text-muted-foreground group-hover:text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </SheetClose>
          <SheetTitle className="font-semibold text-base">Events</SheetTitle>
        </SheetHeader>
        <section className="overflow-y-auto px-4 py-5 flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Image
              src={user.image}
              alt={user.name}
              className="rounded-full size-16 border-solid border-1 border-red"
              width={0}
              height={0}
            />
            <div className="flex flex-col">
              <h2 className="text-muted-foreground">{user.name}</h2>
              <h3 className="font-semibold text-xl">Past Events</h3>
            </div>
          </div>
          <Separator />
          <EventList allUsers={allUsers} events={events} />
        </section>
      </SheetContent>
    </Sheet>
  );
}
