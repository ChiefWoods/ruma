import { PublicKey } from '@solana/web3.js';
import { RUMA_PROGRAM_ID } from './constants';

export function getUserPda(authority: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), authority.toBuffer()],
    RUMA_PROGRAM_ID
  )[0];
}

export function getEventPda(userPda: PublicKey, collectionPda: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('event'), userPda.toBuffer(), collectionPda.toBuffer()],
    RUMA_PROGRAM_ID
  )[0];
}

export function getTicketPda(userPda: PublicKey, eventPda: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('ticket'), userPda.toBuffer(), eventPda.toBuffer()],
    RUMA_PROGRAM_ID
  )[0];
}
