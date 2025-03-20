import { upload } from '@/lib/irys';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type');

  if (!contentType || !contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Content-Type must be multipart/form-data.' },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const link = await upload(file);

    return NextResponse.json({ link });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to upload file.' },
      { status: 500 }
    );
  }
}
