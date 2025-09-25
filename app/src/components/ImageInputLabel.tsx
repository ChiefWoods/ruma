import { FormLabel } from './ui/form';

export function ImageInputLabel({ label = 'Image' }: { label?: string }) {
  return (
    <FormLabel className="flex items-center gap-1">
      <span>{label}</span>
    </FormLabel>
  );
}
