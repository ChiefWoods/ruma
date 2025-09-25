import { ACCEPTED_IMAGE_TYPES } from '@/lib/form-schema';
import { getUrl, upload } from '@/lib/pinata';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Image file is required.' },
        { status: 400 }
      );
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Only the following types are allowed: ${ACCEPTED_IMAGE_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const cid = await upload(file);
    const url = getUrl(cid);

    return NextResponse.json({
      cid,
      url,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to upload image.',
      },
      { status: 500 }
    );
  }
}
