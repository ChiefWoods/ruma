import { Cluster, clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Ruma } from '@/types/ruma';
import idl from '@/idl/ruma.json';

const CLUSTER: Cluster = (process.env.SOLANA_RPC_CLUSTER ??
  'devnet') as Cluster;
const CONNECTION = new Connection(
  process.env.SOLANA_RPC_URL ?? clusterApiUrl(CLUSTER),
  'confirmed'
);

const provider = { connection: CONNECTION } as AnchorProvider;
export const RUMA_PROGRAM = new Program<Ruma>(idl, provider);

export const DISCRIMINATOR_SIZE = 8;

export async function getFirstSignatureDate(address: string): Promise<string> {
  const limit = 1000;
  let blockTime: number | null | undefined;
  let before: string | undefined = undefined;

  try {
    while (true) {
      const signatures = await CONNECTION.getSignaturesForAddress(
        new PublicKey(address),
        {
          before,
          limit,
          until: undefined,
        }
      );

      if (signatures.length > 0)
        before = signatures[signatures.length - 1].signature;
      if (signatures.length < limit) {
        blockTime = signatures[signatures.length - 1].blockTime;
        break;
      }
    }
  } catch (err) {
    console.error(err);
  }

  // convert blockTime to date format of "October 2023"
  if (!blockTime) {
    throw new Error('No block time found.');
  }

  const date = new Date(blockTime * 1000);

  const options = {
    year: 'numeric',
    month: 'long',
  };

  // @ts-expect-error toLocaleDateString typing issue
  return date.toLocaleDateString('en-US', options);
}
