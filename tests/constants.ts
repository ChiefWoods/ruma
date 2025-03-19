import { Keypair, PublicKey } from '@solana/web3.js';
import idl from '../target/idl/ruma.json';

export const RUMA_MASTER_WALLET = Keypair.fromSecretKey(
  new Uint8Array(await Bun.file('ruma-wallet.json').json())
);
export const RUMA_PROGRAM_ID = new PublicKey(idl.address);
export const USER_SEED = 'user';
export const EVENT_SEED = 'event';
export const ATTENDEE_SEED = 'attendee';
export const MAX_USER_NAME_LENGTH = 32;
export const MAX_USER_IMAGE_LENGTH = 200;
export const MAX_EVENT_NAME_LENGTH = 128;
export const MAX_EVENT_IMAGE_LENGTH = 200;
export const MAX_BADGE_NAME_LENGTH = 32;
export const MAX_BADGE_SYMBOL_LENGTH = 10;
export const MAX_BADGE_URI_LENGTH = 200;
