import { PublicKey } from '@solana/web3.js';
import { Ruma } from '../target/types/ruma';
import { Program } from '@coral-xyz/anchor';

export async function fetchUserAcc(program: Program<Ruma>, userPda: PublicKey) {
  return await program.account.user.fetchNullable(userPda);
}

export async function fetchEventAcc(
  program: Program<Ruma>,
  eventPda: PublicKey
) {
  return await program.account.event.fetchNullable(eventPda);
}

export async function fetchTicketAcc(
  program: Program<Ruma>,
  ticketPda: PublicKey
) {
  return await program.account.ticket.fetchNullable(ticketPda);
}

export class EventStateFlags {
  static readonly IS_PUBLIC = 1 << 0;
  static readonly APPROVAL_REQUIRED = 1 << 1;

  isPublic: boolean;
  approvalRequired: boolean;

  constructor(isPublic: boolean, approvalRequired: boolean) {
    this.isPublic = isPublic;
    this.approvalRequired = approvalRequired;
  }

  static fromBitmask(bitmask: number): EventStateFlags {
    const isPublic = (bitmask & EventStateFlags.IS_PUBLIC) !== 0;
    const approvalRequired =
      (bitmask & EventStateFlags.APPROVAL_REQUIRED) !== 0;
    return new EventStateFlags(isPublic, approvalRequired);
  }

  static getBitmask(isPublic: boolean, approvalRequired: boolean): number {
    let bitmask = 0b0000_0000;
    if (isPublic) bitmask |= 1 << 0;
    if (approvalRequired) bitmask |= 1 << 1;
    return bitmask;
  }
}
