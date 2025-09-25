import { ACCEPTED_IMAGE_TYPES } from '@/lib/form-schema';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Image from 'next/image';
import { ImageIcon, Trash2 } from 'lucide-react';
import { ChangeEvent, useRef } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ImageInput({
  btnSize = 'sm',
  direction = 'row',
  field,
  imagePreview,
  setImagePreview,
}: {
  btnSize?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'column';
  field: ControllerRenderProps<any, string>;
  imagePreview: string;
  setImagePreview: (image: string) => void;
}) {
  const imageFileInput = useRef<HTMLInputElement>(null);

  function handleImageChange(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        console.error('Unable to read image file.');
        toast.error('Unable to read image file.');
      };
    }
  }

  function handleImageDelete() {
    setImagePreview('');
  }

  return (
    <div
      className={cn(
        'relative flex gap-4 items-end',
        direction === 'row'
          ? 'flex-row justify-between'
          : 'flex-col justify-start'
      )}
    >
      <Button
        type="button"
        className={cn(
          `relative flex aspect-square items-center justify-center rounded-lg border bg-background p-0 hover:bg-background cursor-pointer`,
          btnSize === 'sm'
            ? 'size-32'
            : btnSize === 'md'
              ? 'size-48'
              : 'size-60'
        )}
        onClick={() => imageFileInput.current?.click()}
      >
        <Input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="pointer-events-none absolute h-full w-full cursor-pointer select-none opacity-0"
          tabIndex={-1}
          ref={(e) => {
            field.ref(e);
            imageFileInput.current = e;
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            field.onChange(file);
            if (file) {
              handleImageChange(file);
            }
          }}
          onBlur={field.onBlur}
        />
        {imagePreview ? (
          <Image
            src={imagePreview}
            alt="Preview"
            className="pointer-events-none h-full w-full rounded-lg object-cover"
            fill
          />
        ) : (
          <ImageIcon className="text-muted-foreground" size={16} />
        )}
        {imagePreview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cursor-pointer absolute bottom-1 right-1 rounded-full bg-primary-foreground group border-1"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleImageDelete();
            }}
          >
            <Trash2
              size={16}
              className="text-primary group-hover:text-red-400 transition-colors"
            />
          </Button>
        )}
      </Button>
    </div>
  );
}
