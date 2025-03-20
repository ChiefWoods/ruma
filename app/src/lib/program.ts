import { Ruma } from '@/types/ruma';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { CONNECTION } from './constants';
import idl from '@/idl/ruma.json';
import { PublicKey } from '@solana/web3.js';

const provider = new AnchorProvider(CONNECTION, {} as Wallet);
const program = new Program(idl as Ruma, provider);

export async function getAllUserAcc() {
  const allAccs = await program.account.user.all();

  return allAccs;
}

export async function getMultipleUserAcc(userPdas: string[]) {
  const accs = await program.account.user.fetchMultiple(
    userPdas.map((pda) => new PublicKey(pda))
  );

  return accs;
}

export async function getUserAcc(userPda: string) {
  const acc = await program.account.user.fetchNullable(new PublicKey(userPda));

  return acc;
}

export async function getAllEventAcc() {
  const allAccs = await program.account.event.all();

  return allAccs;
}

export async function getMultipleEventAcc(eventPdas: string[]) {
  const accs = await program.account.event.fetchMultiple(
    eventPdas.map((pda) => new PublicKey(pda))
  );

  return accs;
}

export async function getEventAcc(eventPda: string) {
  const acc = await program.account.event.fetchNullable(
    new PublicKey(eventPda)
  );

  return acc;
}

export async function getAllAttendeeAcc() {
  const allAccs = await program.account.attendee.all();

  return allAccs;
}

export async function getMultipleAttendeeAcc(attendeePdas: string[]) {
  const accs = await program.account.attendee.fetchMultiple(
    attendeePdas.map((pda) => new PublicKey(pda))
  );

  return accs;
}

export async function getAttendeeAcc(attendeePda: string) {
  const acc = await program.account.attendee.fetchNullable(
    new PublicKey(attendeePda)
  );

  return acc;
}
