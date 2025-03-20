'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FiPlusCircle } from 'react-icons/fi';
import { MenuSquareIcon, Ticket, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const navItems = [
  { name: 'Events', href: '/events', Icon: Ticket },
  { name: 'Discover', href: '/discover', Icon: Compass },
  { name: 'Profile', href: '/profile', Icon: User },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto py-1 sm:px-6 lg:px-4">
        <div className="flex h-16 items-center justify-between px-[6%]">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0" prefetch={false}>
              <Image
                src={'/ruma-banner.png'}
                alt="ruma-logo"
                width={120}
                height={80}
              />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline gap-6">
              {navItems.map(({ name, href, Icon }) => (
                <Link
                  key={name}
                  href={href}
                  className={cn(
                    pathname === href ? 'text-black' : '',
                    'flex items-center gap-2 rounded-md px-3 py-2 text-base text-[#999999] hover:text-black'
                  )}
                  prefetch={false}
                >
                  <Icon size={20} className="mr-[2px] mt-[-2px]" />
                  {name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/create-event" prefetch={false}>
              <Button
                size="sm"
                className="text-md mr-2 h-[44px] rounded bg-slate-500 px-4 font-bold hover:bg-slate-600"
              >
                <FiPlusCircle className="" />
                Create Event
              </Button>
            </Link>
            <WalletMultiButtonDynamic />
          </div>
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuSquareIcon size={24} />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col space-y-4">
                  <WalletMultiButtonDynamic />
                  {navItems.map(({ name, href }) => (
                    <Link
                      key={name}
                      href={href}
                      className="text-lg font-medium hover:underline"
                      prefetch={false}
                    >
                      {name}
                    </Link>
                  ))}
                  <Link
                    href="/create-event"
                    className="text-lg font-medium hover:underline"
                    prefetch={false}
                  >
                    Create Event
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
