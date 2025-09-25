export async function wrappedFetch(url: string) {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export async function uploadImage(
  file: File
): Promise<{ cid: string; url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/image/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return {
    cid: data.cid,
    url: data.url,
  };
}

export async function generateImage(type: string, seed: string) {
  const res = await fetch(`/api/image/generate?type=${type}&seed=${seed}`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }

  const file = await res.blob();

  return new File([file], seed, { type: file.type });
}
