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

export async function fetchAttendeeAcc(
  program: Program<Ruma>,
  attendeePda: PublicKey
) {
  return await program.account.attendee.fetchNullable(attendeePda);
}
