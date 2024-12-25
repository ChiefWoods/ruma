import { Keypair, PublicKey } from '@solana/web3.js';
import idl from '@/idl/ruma.json';

export const RUMA_PROGRAM_ID = new PublicKey(idl.address);
export const RUMA_WALLET = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.NEXT_PUBLIC_RUMA_WALLET!))
);
export const USER_SEED = 'user';
export const USER_DATA_SEED = 'user_data';
export const EVENT_SEED = 'event';
export const EVENT_DATA_SEED = 'event_data';
export const ATTENDEE_SEED = 'attendee';
export const MIN_USER_NAME_LENGTH = 3;
export const MAX_USER_NAME_LENGTH = 32;
export const MAX_USER_IMAGE_LENGTH = 200;
export const MIN_EVENT_NAME_LENGTH = 3;
export const MAX_EVENT_NAME_LENGTH = 128;
export const MAX_EVENT_IMAGE_LENGTH = 200;
export const MIN_BADGE_NAME_LENGTH = 3;
export const MAX_BADGE_NAME_LENGTH = 32;
export const MIN_BADGE_SYMBOL_LENGTH = 3;
export const MAX_BADGE_SYMBOL_LENGTH = 10;
export const MAX_BADGE_IMAGE_LENGTH = 200;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
