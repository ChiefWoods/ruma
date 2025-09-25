import {
  ParsedUser,
  parseUser,
  ParsedEvent,
  parseEvent,
  ParsedTicket,
  parseTicket,
} from '@/types/accounts';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { RUMA_PROGRAM } from './solana';

export async function fetchAllUsers(
  filters: GetProgramAccountsFilter[] = []
): Promise<ParsedUser[]> {
  const itemAccs = await RUMA_PROGRAM.account.user.all(filters);

  return itemAccs.map(({ account, publicKey }) => {
    return {
      publicKey: publicKey.toBase58(),
      ...parseUser(account),
    };
  });
}

export async function fetchMultipleUsers(
  pdas: string[]
): Promise<(ParsedUser | null)[]> {
  const itemAccs = await RUMA_PROGRAM.account.user.fetchMultiple(pdas);

  return itemAccs.map((item, i) =>
    item ? { publicKey: pdas[i], ...parseUser(item) } : null
  );
}

export async function fetchUser(pda: string): Promise<ParsedUser | null> {
  const itemAcc = await RUMA_PROGRAM.account.user.fetchNullable(pda);

  return itemAcc ? { publicKey: pda, ...parseUser(itemAcc) } : null;
}

export async function fetchAllEvents(
  filters: GetProgramAccountsFilter[] = []
): Promise<ParsedEvent[]> {
  const itemAccs = await RUMA_PROGRAM.account.event.all(filters);

  return itemAccs.map(({ account, publicKey }) => {
    return {
      publicKey: publicKey.toBase58(),
      ...parseEvent(account),
    };
  });
}

export async function fetchMultipleEvents(
  pdas: string[]
): Promise<(ParsedEvent | null)[]> {
  const itemAccs = await RUMA_PROGRAM.account.event.fetchMultiple(pdas);

  return itemAccs.map((item, i) =>
    item ? { publicKey: pdas[i], ...parseEvent(item) } : null
  );
}

export async function fetchEvent(pda: string): Promise<ParsedEvent | null> {
  const itemAcc = await RUMA_PROGRAM.account.event.fetchNullable(pda);

  return itemAcc ? { publicKey: pda, ...parseEvent(itemAcc) } : null;
}

export async function fetchAllTickets(
  filters: GetProgramAccountsFilter[] = []
): Promise<ParsedTicket[]> {
  const itemAccs = await RUMA_PROGRAM.account.ticket.all(filters);

  return itemAccs.map(({ account, publicKey }) => {
    return {
      publicKey: publicKey.toBase58(),
      ...parseTicket(account),
    };
  });
}

export async function fetchMultipleTickets(
  pdas: string[]
): Promise<(ParsedTicket | null)[]> {
  const itemAccs = await RUMA_PROGRAM.account.ticket.fetchMultiple(pdas);

  return itemAccs.map((item, i) =>
    item ? { publicKey: pdas[i], ...parseTicket(item) } : null
  );
}

export async function fetchTicket(pda: string): Promise<ParsedTicket | null> {
  const itemAcc = await RUMA_PROGRAM.account.ticket.fetchNullable(pda);

  return itemAcc ? { publicKey: pda, ...parseTicket(itemAcc) } : null;
}
