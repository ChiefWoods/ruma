const styleMap = {
  profile: 'big-smile',
  event: 'shapes',
  badge: 'rings',
};

export function getRandomDicebearLink(
  style: keyof typeof styleMap,
  seed: string = ''
): string {
  return `https://api.dicebear.com/9.x/${styleMap[style]}/jpg?seed=${seed}`;
}

export async function fetchDicebearAsFile(
  style: keyof typeof styleMap,
  name: string
): Promise<File> {
  const file = await fetch(getRandomDicebearLink(style), {
    headers: {
      'Content-Type': 'image/jpeg',
    },
  }).then((res) => res.blob());

  return new File([file], name, { type: 'image/jpeg' });
}
