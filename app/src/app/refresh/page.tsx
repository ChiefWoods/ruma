'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ready) return;

    if (authenticated) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    } else {
      router.replace('/');
    }
  }, [ready, authenticated, router, searchParams]);

  return <p>Redirecting...</p>;
}
