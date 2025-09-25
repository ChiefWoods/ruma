'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="main-section flex-1 justify-center">
      <h2>{error.digest ?? error.name}</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>
        <RotateCcw />
        Try Again
      </Button>
    </section>
  );
}
