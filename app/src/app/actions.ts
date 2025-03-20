'use server';

import {
  getExplorerLink,
  getSimulationComputeUnits,
} from '@solana-developers/helpers';
import {
  AddressLookupTableAccount,
  Cluster,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';

export async function getTransactionLink(signature: string): Promise<string> {
  return getExplorerLink(
    'tx',
    signature,
    (process.env.NEXT_PUBLIC_RPC_CLUSTER as Cluster) ?? 'devnet'
  );
}

export async function getComputeLimitIx(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  lookupTables: Array<AddressLookupTableAccount> = []
): Promise<TransactionInstruction | undefined> {
  const units = await getSimulationComputeUnits(
    connection,
    instructions,
    payer,
    lookupTables
  );

  if (units) {
    return ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.ceil(units * 1.1),
    });
  }
}
