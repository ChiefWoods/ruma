import { DicebearStyle, generateDicebear } from '@/lib/dicebear';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json(
      { error: 'Image type is required.' },
      { status: 400 }
    );
  }

  const seed = searchParams.get('seed');

  if (!seed) {
    return NextResponse.json(
      { error: 'Image seed is required.' },
      { status: 400 }
    );
  }

  let style: DicebearStyle;

  switch (type) {
    case 'user':
      style = DicebearStyle.User;
      break;
    case 'event':
      style = DicebearStyle.Event;
      break;
    case 'badge':
      style = DicebearStyle.Badge;
      break;
    default:
      return NextResponse.json(
        { error: 'Invalid image type.' },
        { status: 400 }
      );
  }

  try {
    const file = await generateDicebear(style, seed);

    return new NextResponse(file, {
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
      },
      status: 200,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unable to generate image.',
      },
      {
        status: 500,
      }
    );
  }
}
