import { Loader2 } from 'lucide-react';

export function Spinner() {
  return (
    <Loader2
      className="flex flex-1 animate-spin items-center only:my-auto"
      size={60}
    />
  );
}
