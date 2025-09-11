import {
  AnchorError,
  AnchorProvider,
  Program,
  Wallet,
} from '@coral-xyz/anchor';
import { Ruma } from '../target/types/ruma';
import idl from '../target/idl/ruma.json';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { DEFAULT_PAYER, SURFPOOL_RPC_URL } from './constants';
import { Surfpool } from './surfpool';
import { expect } from 'bun:test';

const connection = new Connection(SURFPOOL_RPC_URL, 'processed');
const provider = new AnchorProvider(connection, new Wallet(DEFAULT_PAYER));
const program = new Program<Ruma>(idl, provider);
const umi = createUmi(connection.rpcEndpoint, 'processed').use(mplCore());

export async function getSetup(
  accounts: {
    publicKey: PublicKey;
    lamports?: number;
  }[]
) {
  for (const { publicKey, lamports } of accounts) {
    await Surfpool.setAccount({
      publicKey: publicKey.toBase58(),
      lamports: lamports ?? LAMPORTS_PER_SOL,
    });
  }

  return { program, umi };
}

export async function expectAnchorError(error: Error, code: string) {
  expect(error).toBeInstanceOf(AnchorError);
  const { errorCode } = (error as AnchorError).error;
  expect(errorCode.code).toBe(code);
}

export async function expireBlockhash(slot: number) {
  while (true) {
    const newSlot = await program.provider.connection.getSlot('processed');
    if (newSlot > slot) break;
  }
}
