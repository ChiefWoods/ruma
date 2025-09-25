// Copied from @solana-developers/helpers
// Workaround for @solana-developers/helpers@2.8.1 bug

import {
  AddressLookupTableAccount,
  Cluster,
  Commitment,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

function encodeURL(baseUrl: string, searchParams: Record<string, string>) {
  // This was a little new to me, but it's the
  // recommended way to build URLs with query params
  // (and also means you don't have to do any encoding)
  // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(searchParams).toString();
  return url.toString();
}

export function getExplorerLink(
  linkType: 'transaction' | 'tx' | 'address' | 'block',
  id: string,
  cluster: Cluster | 'localnet' = 'mainnet-beta'
): string {
  const searchParams: Record<string, string> = {};
  if (cluster !== 'mainnet-beta') {
    if (cluster === 'localnet') {
      // localnet technically isn't a cluster, so requires special handling
      searchParams['cluster'] = 'custom';
      searchParams['customUrl'] = 'http://localhost:8899';
    } else {
      searchParams['cluster'] = cluster;
    }
  }
  let baseUrl: string = '';
  if (linkType === 'address') {
    baseUrl = `https://explorer.solana.com/address/${id}`;
  }
  if (linkType === 'transaction' || linkType === 'tx') {
    baseUrl = `https://explorer.solana.com/tx/${id}`;
  }
  if (linkType === 'block') {
    baseUrl = `https://explorer.solana.com/block/${id}`;
  }
  return encodeURL(baseUrl, searchParams);
}

function isSetComputeLimitInstruction(ix: TransactionInstruction): boolean {
  return (
    ix.programId.equals(ComputeBudgetProgram.programId) && ix.data[0] === 2 // opcode for setComputeUnitLimit is 2
  );
}

export async function getSimulationComputeUnits(
  connection: Connection,
  instructions: Array<TransactionInstruction>,
  payer: PublicKey,
  lookupTables: Array<AddressLookupTableAccount> | [],
  commitment: Commitment = 'confirmed'
): Promise<number | null> {
  const simulationInstructions = [...instructions];

  // Replace or add compute limit instruction
  const computeLimitIndex = simulationInstructions.findIndex(
    isSetComputeLimitInstruction
  );
  const simulationLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  if (computeLimitIndex >= 0) {
    simulationInstructions[computeLimitIndex] = simulationLimitIx;
  } else {
    simulationInstructions.unshift(simulationLimitIx);
  }

  const testTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions: simulationInstructions,
      payerKey: payer,
      // RecentBlockhash can by any public key during simulation
      // since 'replaceRecentBlockhash' is set to 'true' below
      recentBlockhash: PublicKey.default.toString(),
    }).compileToV0Message(lookupTables)
  );

  const rpcResponse = await connection.simulateTransaction(testTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
    commitment,
  });

  if (rpcResponse?.value?.err) {
    const logs = rpcResponse.value.logs?.join('\n  • ') || 'No logs available';
    throw new Error(
      `Transaction simulation failed:\n  •${logs}` +
        JSON.stringify(rpcResponse?.value?.err)
    );
  }

  return rpcResponse.value.unitsConsumed || null;
}
