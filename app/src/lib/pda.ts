import { PublicKey } from '@solana/web3.js';
import {
  ATTENDEE_SEED,
  EVENT_SEED,
  RUMA_PROGRAM_ID,
  USER_SEED,
} from '@/lib/constants';

export function getUserPda(authority: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(USER_SEED), authority.toBuffer()],
    RUMA_PROGRAM_ID
  )[0];
}

export function getEventPda(userPda: PublicKey, eventName: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED), userPda.toBuffer(), Buffer.from(eventName)],
    RUMA_PROGRAM_ID
  )[0];
}

export function getAttendeePda(
  userPda: PublicKey,
  eventPda: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ATTENDEE_SEED), userPda.toBuffer(), eventPda.toBuffer()],
    RUMA_PROGRAM_ID
  )[0];
}
