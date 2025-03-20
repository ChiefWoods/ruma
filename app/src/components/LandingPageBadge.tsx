'use client';

import { getMetadataAcc, getMetadataPda } from '@/lib/umi';
import { useAnchorProgram } from '@/hooks/useAnchorProgram';
import Image from 'next/image';
import useSWR from 'swr';

export function LandingPageBadge() {
  const { getAllEventAcc } = useAnchorProgram();
  const { data: metadataAcc, error } = useSWR(
    '/landing-page-badge',
    async () => {
      const events = await getAllEventAcc();
      if (!events.length) return null;

      const { badge: randomBadge } =
        events[Math.floor(Math.random() * events.length)].account;

      if (!randomBadge) return null;
      return await getMetadataAcc(getMetadataPda(randomBadge));
    }
  );

  if (error) {
    console.error(error);
  }

  return (
    <Image
      src={metadataAcc?.uri ?? '/sample/landing-hero.jpg'}
      alt={metadataAcc?.name ?? 'Default Landing Badge'}
      fill
      className="rounded-3xl object-cover shadow-xl"
      priority
    />
  );
}
