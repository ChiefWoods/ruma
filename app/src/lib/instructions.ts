import {
  CreateEventArgs,
  CreateUserArgs,
  TicketStatus,
} from '@/types/accounts';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { RUMA_PROGRAM } from './solana';
import { MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';

export async function createUserIx({
  name,
  image,
  authority,
}: CreateUserArgs & {
  authority: PublicKey;
}): Promise<TransactionInstruction> {
  return await RUMA_PROGRAM.methods
    .createUser({
      name,
      image,
    })
    .accounts({
      authority,
    })
    .instruction();
}

export async function createEventIx({
  isPublic,
  approvalRequired,
  capacity,
  startTimestamp,
  endTimestamp,
  eventName,
  eventImage,
  badgeName,
  badgeUri,
  location,
  about,
  authority,
  collection,
  user,
}: CreateEventArgs & {
  authority: PublicKey;
  collection: PublicKey;
  user: PublicKey;
}): Promise<TransactionInstruction> {
  return await RUMA_PROGRAM.methods
    .createEvent({
      isPublic,
      approvalRequired,
      capacity,
      startTimestamp,
      endTimestamp,
      eventName,
      eventImage,
      badgeName,
      badgeUri,
      location,
      about,
    })
    .accountsPartial({
      authority,
      collection,
      user,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    })
    .instruction();
}

export async function createTicketIx({
  authority,
  user,
  eventPda,
}: {
  authority: PublicKey;
  user: PublicKey;
  eventPda: PublicKey;
}): Promise<TransactionInstruction> {
  return await RUMA_PROGRAM.methods
    .createTicket()
    .accountsPartial({
      authority,
      user,
      event: eventPda,
    })
    .instruction();
}

export async function updateTicketIx({
  ticketStatus,
  authority,
  ticketPda,
}: {
  ticketStatus: TicketStatus;
  authority: PublicKey;
  ticketPda: PublicKey;
}): Promise<TransactionInstruction> {
  return await RUMA_PROGRAM.methods
    .updateTicket(ticketStatus)
    .accountsPartial({
      authority,
      ticket: ticketPda,
    })
    .instruction();
}

export async function checkInIc({
  authority,
  asset,
  ticketPda,
}: {
  authority: PublicKey;
  asset: PublicKey;
  ticketPda: PublicKey;
}): Promise<TransactionInstruction> {
  return await RUMA_PROGRAM.methods
    .checkIn()
    .accountsPartial({
      authority,
      asset,
      ticket: ticketPda,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    })
    .instruction();
}
