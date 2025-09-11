import { PublicKey } from '@solana/web3.js';
import idl from '../target/idl/ruma.json';

export const RUMA_PROGRAM_ID = new PublicKey(idl.address);

export const MAX_USER_NAME_LENGTH = 32;
export const MAX_USER_IMAGE_LENGTH = 200;
export const MAX_EVENT_NAME_LENGTH = 32;
export const MAX_EVENT_IMAGE_LENGTH = 200;
export const MAX_BADGE_NAME_LENGTH = 32;
export const MAX_BADGE_SYMBOL_LENGTH = 10;
export const MAX_BADGE_URI_LENGTH = 200;
