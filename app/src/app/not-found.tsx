'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <section className="main-section flex-1 justify-center">
      <h2>404</h2>
      <p>Page not found.</p>
      <Button onClick={router.back}>
        <ArrowLeft />
        Go Back
      </Button>
    </section>
  );
}
