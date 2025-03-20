import { generateDataBytes } from '@/lib/utils';
import { sign } from 'tweetnacl';
import { NextRequest, NextResponse } from 'next/server';
import { RUMA_WALLET } from '@/lib/constants';
import { toDataURL } from 'qrcode';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const attendeePda = searchParams.get('attendeePda');
    const eventPda = searchParams.get('eventPda');

    if (!attendeePda) {
      return NextResponse.json(
        { error: "'attendeePda' required." },
        { status: 400 }
      );
    }

    if (!eventPda) {
      return NextResponse.json(
        { error: "'eventPda' required." },
        { status: 400 }
      );
    }

    const dataBytes = generateDataBytes(attendeePda, eventPda);
    const signatureBytes = sign.detached(dataBytes, RUMA_WALLET.secretKey);
    const signature = Buffer.from(signatureBytes).toString('hex');
    const payload = `${attendeePda}-${eventPda}-${signature}`;

    // generate encoded QR code
    const ticket = await toDataURL(payload);

    return NextResponse.json({
      ticket,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to generate ticket.',
      },
      { status: 500 }
    );
  }
}
