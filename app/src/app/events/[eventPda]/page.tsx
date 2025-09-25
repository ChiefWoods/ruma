'use client';

import { useParams } from 'next/navigation';

export default function Page() {
  const { eventPda } = useParams<{ eventPda: string }>();

  return <p>Event: {eventPda}</p>;
}
