import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="flex w-full justify-center bg-muted pb-5 pt-4">
      <div className="container px-[6%]">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <Image
              src="/ruma-logo.png"
              alt="Ruma Logo"
              width={40}
              height={40}
            />
            <span className="pl-4 pt-[2px] text-sm text-muted-foreground">
              © 2024. All rights reserved.
            </span>
          </div>
          <nav className="flex gap-8 text-sm text-muted-foreground">
            {[
              { href: '/events', label: 'Events' },
              { href: '/discover', label: 'Discover' },
              { href: '/profile', label: 'Profile' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="underline hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
