'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Spinner } from './Spinner';

export function LoadingOverlay() {
  const { ready } = usePrivy();

  return (
    !ready && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-50">
        <Spinner />
      </div>
    )
  );
}
