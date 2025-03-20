import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LandingPageBadge } from '@/components/LandingPageBadge';

export default function Home() {
  return (
    <div className="mb-[-20px] mt-[-90px] flex min-h-screen items-center justify-center bg-background">
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Collect Memories as NFTs
            </h1>
            <p className="text-xl text-muted-foreground">
              Join events, connect with like-minded people, and collect
              exclusive NFTs that prove you were there.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
              <Link href="/discover">
                <Button size="lg" className="w-full sm:w-auto">
                  Discover Events
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md flex-1 md:max-w-none">
            <div className="relative aspect-square">
              <LandingPageBadge />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
