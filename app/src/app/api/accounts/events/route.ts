import {
  fetchAllEvents,
  fetchMultipleEvents,
  fetchEvent,
} from '@/lib/accounts';
import { DISCRIMINATOR_SIZE } from '@/lib/solana';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { utils } from '@coral-xyz/anchor';
import { NextRequest, NextResponse } from 'next/server';
import { EventStateFlags } from '@/types/accounts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pdas = searchParams.getAll('pda');
  const organizer = searchParams.get('organizer');
  const isPublic = searchParams.get('isPublic');
  const approvalRequired = searchParams.get('approvalRequired');
  const full = searchParams.get('full');
  const started = searchParams.get('started');
  const ended = searchParams.get('ended');
  const badge = searchParams.get('badge');
  const name = searchParams.get('name');

  try {
    if (!pdas.length) {
      const filters: GetProgramAccountsFilter[] = [];

      if (organizer) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1,
            bytes: organizer,
          },
        });
      }

      if (isPublic !== null && approvalRequired !== null) {
        const bitflag = EventStateFlags.getBitmask(
          Boolean(isPublic),
          Boolean(approvalRequired)
        );

        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1 + 32,
            bytes: utils.bytes.bs58.encode(Buffer.from([bitflag])),
          },
        });
      }

      if (badge) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1 + 32 + 1 + (1 + 4) + 4 + 8 + 8,
            bytes: badge,
          },
        });
      }

      if (name) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1 + 32 + 1 + (1 + 4) + 4 + 8 + 8 + 4,
            bytes: utils.bytes.bs58.encode(Buffer.from(name)),
          },
        });
      }

      let events = await fetchAllEvents(filters);

      if (Boolean(full)) {
        events = events.filter((event) => {
          return !event.capacity || event.registrations < event.capacity;
        });
      }

      if (Boolean(ended)) {
        events = events.filter((event) => {
          return event.endTimestamp <= Date.now();
        });
      } else if (Boolean(started)) {
        events = events.filter((event) => {
          return event.startTimestamp <= Date.now();
        });
      }

      return NextResponse.json(
        {
          events,
        },
        {
          status: 200,
        }
      );
    } else if (pdas.length > 1) {
      return NextResponse.json(
        {
          events: await fetchMultipleEvents(pdas),
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          event: await fetchEvent(pdas[0]),
        },
        {
          status: 200,
        }
      );
    }
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Unable to fetch event account(s).',
      },
      {
        status: 500,
      }
    );
  }
}
