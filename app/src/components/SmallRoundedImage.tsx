import Image from 'next/image';

export function SmallRoundedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      className="size-4 rounded-full border-[0.5px]"
      width={0}
      height={0}
    />
  );
}
