export enum DicebearStyle {
  User = 'personas',
  Event = 'shapes',
  Badge = 'rings',
}

export async function generateDicebear(
  style: DicebearStyle,
  seed: string
): Promise<File> {
  const res = await fetch(
    `${process.env.DICEBEAR_API}/${style}/svg?seed=${seed}`,
    {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    }
  );

  if (!res.ok) {
    throw new Error('Unable to generate image.');
  }

  const file = await res.blob();

  return new File([file], `user_${seed}`, { type: file.type });
}
