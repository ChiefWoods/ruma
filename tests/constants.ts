import { Keypair, PublicKey } from '@solana/web3.js';
import idl from '../target/idl/ruma.json';

export const RUMA_PROGRAM_ID = new PublicKey(idl.address);
export const DEFAULT_PAYER = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.ANCHOR_WALLET))
);

export const SURFPOOL_RPC_URL = 'http://127.0.0.1:8899';

export const MAX_USER_NAME_LENGTH = 32;
