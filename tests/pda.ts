import { PublicKey } from '@solana/web3.js';
import idl from '../target/idl/ruma.json';

const RUMA_PROGRAM_ID = new PublicKey(idl.address);

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

export function getAttendeePda(userPda: PublicKey, eventPda: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('attendee'), userPda.toBuffer(), eventPda.toBuffer()],
    RUMA_PROGRAM_ID
  )[0];
}
