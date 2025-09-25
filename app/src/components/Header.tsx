'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { WalletButton } from './WalletButton';
import { Bell, Compass, MoveUpRight, Search, Ticket } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatDateToTimezone } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navLinks = [
  {
    label: 'Events',
    href: '/',
    Icon: Ticket,
  },
  {
    label: 'Discover',
    href: '/discover',
    Icon: Compass,
  },
];

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={'ghost'}
          className="cursor-pointer p-4 size-8 hover:bg-transparent group"
          onClick={onClick}
        >
          {Icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

export function Header() {
  const pathname = usePathname();
  const { authenticated } = usePrivy();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  function handleScroll() {
    setIsScrolled(window.scrollY > 0);
  }

  function handleSearch() {
    // TODO: Open search panel
    console.log('Open search panel');
  }

  function handleNotifications() {
    // TODO: Open dialect notifications panel
    console.log('Open dialect notifications panel');
  }

  const formattedTime = useMemo(() => {
    return formatDateToTimezone(currentTime);
  }, [currentTime]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());

    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <header
      className={cn(
        'px-4 py-3 h-14 flex items-center justify-between transition-all sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-1',
        isScrolled ? 'backdrop-blur-md border-b border-border' : ''
      )}
    >
      <Link href={'/'}>
        <Image alt="Ruma" src={'/branding/symbol.png'} width={32} height={24} />
      </Link>
      <nav className="flex items-center gap-4">
        {navLinks.map(({ href, Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex gap-2 hover-highlight',
              pathname === href ? 'text-primary!' : 'text-muted-foreground'
            )}
          >
            <Icon size={20} />
            <p className="font-semibold action-icon text-sm">{label}</p>
          </Link>
        ))}
      </nav>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{formattedTime}</p>
        <Link
          href={authenticated ? '/create' : '/discover'}
          className="hover-highlight flex items-center gap-1 group"
        >
          <p className="font-semibold text-sm">
            {authenticated ? 'Create Event' : 'Explore Events'}
          </p>
          {!authenticated && (
            <MoveUpRight
              size={16}
              className="transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.25 group-hover:-translate-y-0.25"
            />
          )}
        </Link>
        <div className="flex items-center gap-1">
          {authenticated && (
            <>
              <ActionButton
                icon={<Search className="hover-highlight" />}
                label="Search"
                onClick={handleSearch}
              />
              <ActionButton
                icon={<Bell className="hover-highlight" />}
                label="Notifications"
                onClick={handleNotifications}
              />
            </>
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
