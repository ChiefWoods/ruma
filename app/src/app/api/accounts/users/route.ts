import { fetchAllUsers, fetchMultipleUsers, fetchUser } from '@/lib/accounts';
import { DISCRIMINATOR_SIZE } from '@/lib/solana';
import { utils } from '@coral-xyz/anchor';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pdas = searchParams.getAll('pda');
  const name = searchParams.get('name');

  try {
    if (!pdas.length) {
      const filters: GetProgramAccountsFilter[] = [];

      if (name) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 1 + 32 + 4,
            bytes: utils.bytes.bs58.encode(
              Buffer.from(decodeURIComponent(name))
            ),
          },
        });
      }

      return NextResponse.json(
        {
          users: await fetchAllUsers(filters),
        },
        {
          status: 200,
        }
      );
    } else if (pdas.length > 1) {
      return NextResponse.json(
        {
          users: await fetchMultipleUsers(pdas),
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          user: await fetchUser(pdas[0]),
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
            : 'Unable to fetch user account(s).',
      },
      {
        status: 500,
      }
    );
  }
}
