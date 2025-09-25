import {
  fetchAllTickets,
  fetchMultipleTickets,
  fetchTicket,
} from '@/lib/accounts';
import { DISCRIMINATOR_SIZE } from '@/lib/solana';
import { ticketStatusOrder, toByte } from '@/types/accounts';
import { utils } from '@coral-xyz/anchor';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pdas = searchParams.getAll('pda');
  const userPda = searchParams.get('user');
  const eventPda = searchParams.get('event');
  const status = searchParams.get('status');

  try {
    if (!pdas.length) {
      const filters: GetProgramAccountsFilter[] = [];

      if (userPda) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1,
            bytes: userPda,
          },
        });
      }

      if (eventPda) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1 + 32,
            bytes: eventPda,
          },
        });
      }

      if (status) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1 + 32 + 32,
            bytes: utils.bytes.bs58.encode(toByte(status, ticketStatusOrder)),
          },
        });
      }

      return NextResponse.json(
        {
          tickets: await fetchAllTickets(filters),
        },
        {
          status: 200,
        }
      );
    } else if (pdas.length > 1) {
      return NextResponse.json(
        {
          tickets: await fetchMultipleTickets(pdas),
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          ticket: await fetchTicket(pdas[0]),
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
            : 'Unable to fetch ticket account(s).',
      },
      {
        status: 500,
      }
    );
  }
}
