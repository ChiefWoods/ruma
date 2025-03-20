import { VERIFICATION_PUBKEY } from '@/lib/constants';
import { getAttendeeAcc, getEventAcc } from '@/lib/program';
import { generateDataBytes } from '@/lib/utils';
import { PublicKey } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'tweetnacl';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const payload = formData.get('payload') as string;

    if (!payload) {
      return NextResponse.json(
        {
          error: 'Payload required.',
        },
        {
          status: 400,
        }
      );
    }

    const [attendeePda, eventPda, signature] = payload.split('-');

    const eventAcc = await getEventAcc(eventPda);

    if (!eventAcc) {
      return NextResponse.json(
        {
          error: 'Event not found.',
        },
        {
          status: 404,
        }
      );
    }

    const attendeeAcc = await getAttendeeAcc(attendeePda);

    if (!attendeeAcc) {
      return NextResponse.json(
        {
          error: 'Attendee not found.',
        },
        {
          status: 404,
        }
      );
    }

    if (
      eventAcc.attendees.some((attendee) =>
        attendee.equals(new PublicKey(attendeePda))
      )
    ) {
      // check if signature is signed by internal secret key
      const dataBytes = generateDataBytes(attendeePda, eventPda);
      const signatureBytes = new Uint8Array(Buffer.from(signature, 'hex'));
      const verified = sign.detached.verify(
        dataBytes,
        signatureBytes,
        VERIFICATION_PUBKEY
      );

      return verified
        ? NextResponse.json({
            verified,
            message: 'Ticket verified successfully.',
            attendeePda,
            userPda: await attendeeAcc.user,
          })
        : NextResponse.json({
            verified,
            message: 'Invalid ticket signature.',
          });
    } else {
      return NextResponse.json({
        verified: false,
        message: 'Attendee is not approved for this event.',
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to verify ticket.',
      },
      { status: 500 }
    );
  }
}
