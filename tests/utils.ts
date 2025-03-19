import { Program, workspace } from '@coral-xyz/anchor';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Ruma } from '../target/types/ruma';
import { Keypair } from '@solana/web3.js';

export const program = workspace.Ruma as Program<Ruma>;
export const connection = program.provider.connection;

export const umi = createUmi(
  import.meta.env.ANCHOR_PROVIDER_URL,
  'confirmed'
).use(mplTokenMetadata());

export async function getFundedKeypair(): Promise<Keypair> {
  const latestBlockhash = await connection.getLatestBlockhash();

  const keypair = Keypair.generate();

  await connection.confirmTransaction({
    ...latestBlockhash,
    signature: await connection.requestAirdrop(
      keypair.publicKey,
      5_000_000_000
    ),
  });

  return keypair;
}
