import { describe, test } from 'bun:test';
import { getFundedKeypair, program, umi } from './utils';
import { Keypair, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  findMasterEditionPda,
  findMetadataPda,
} from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { BN } from '@coral-xyz/anchor';
import {
  changeAttendeeStatus,
  checkIntoEvent,
  createBadge,
  createEvent,
  createProfile,
  registerForEvent,
} from './methods';
import {
  getAttendeePdaAndBump,
  getEventPdaAndBump,
  getUserPdaAndBump,
} from './pda';

describe('end-to-end', () => {
  test('ruma', async () => {
    const organizer = await getFundedKeypair();
    const registrant = await getFundedKeypair();

    await createProfile(
      program,
      'Bob',
      'https://example.com/image.png',
      organizer
    );

    const eventName = 'Test event';
    const capacity = 10;

    await createEvent(
      program,
      true,
      true,
      eventName,
      'https://example.com/image.png',
      capacity,
      new BN(Date.now()),
      new BN(Date.now() + 1000 * 60 * 60 * 24),
      'Sunway University, Subang Jaya',
      'This is a test event',
      organizer
    );

    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = 'BDG';
    const badgeUri = 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = capacity;

    await createBadge(
      program,
      umi,
      badgeName,
      badgeSymbol,
      badgeUri,
      new BN(maxSupply),
      organizer,
      eventPda,
      masterMint
    );

    await createProfile(
      program,
      'Paul',
      'https://example.com/image.png',
      registrant
    );

    const [registrantUserPda] = getUserPdaAndBump(registrant.publicKey);

    await registerForEvent(program, registrantUserPda, eventPda);

    await changeAttendeeStatus(
      program,
      { approved: {} },
      registrantUserPda,
      eventPda
    );

    const editionMint = Keypair.generate();
    const [attendeePda] = getAttendeePdaAndBump(registrantUserPda, eventPda);
    const masterAtaPda = getAssociatedTokenAddressSync(
      masterMint.publicKey,
      organizerUserPda,
      true
    );
    const [masterMetadataPda] = findMetadataPda(umi, {
      mint: fromWeb3JsPublicKey(masterMint.publicKey),
    });
    const [masterEditionPda] = findMasterEditionPda(umi, {
      mint: fromWeb3JsPublicKey(masterMint.publicKey),
    });

    await checkIntoEvent(
      program,
      umi,
      organizer,
      editionMint,
      registrantUserPda,
      attendeePda,
      masterMint.publicKey,
      masterAtaPda,
      new PublicKey(masterMetadataPda),
      new PublicKey(masterEditionPda)
    );
  });
});
