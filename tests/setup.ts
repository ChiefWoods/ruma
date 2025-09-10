import { AddedAccount, startAnchor } from 'solana-bankrun';
import { BankrunProvider } from 'anchor-bankrun';
import { Program } from '@coral-xyz/anchor';
import { Ruma } from '../target/types/ruma';
import idl from '../target/idl/ruma.json';
import { MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';
import { PublicKey } from '@solana/web3.js';

export async function getBankrunSetup(accounts: AddedAccount[] = []) {
  const context = await startAnchor(
    '',
    [
      {
        name: 'mpl_core',
        programId: new PublicKey(MPL_CORE_PROGRAM_ID),
      },
    ],
    accounts
  );

  const provider = new BankrunProvider(context);
  const program = new Program<Ruma>(idl, provider);

  return {
    context,
    provider,
    program,
  };
}
