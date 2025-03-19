import { beforeEach, describe, expect, test } from 'bun:test';
import { getFundedKeypair, program, umi } from '../utils';
import { Keypair, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  findMasterEditionPda,
  findMetadataPda,
  MasterEdition,
} from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { AnchorError, BN } from '@coral-xyz/anchor';
import {
  changeAttendeeStatus,
  checkIntoEvent,
  createBadge,
  createEvent,
  createProfile,
  registerForEvent,
} from '../methods';
import {
  getAttendeePdaAndBump,
  getEventPdaAndBump,
  getUserPdaAndBump,
} from '../pda';

describe('checkIntoEvent', () => {
  let organizer: Keypair;
  let registrant: Keypair;

  const eventName = 'Test event';
  const capacity = 10;

  let organizerUserPda: PublicKey;
  let eventPda: PublicKey;
  let registrantUserPda: PublicKey;
  let masterMint: Keypair;
  let masterEditionAcc: MasterEdition;

  beforeEach(async () => {
    organizer = await getFundedKeypair();
    registrant = await getFundedKeypair();

    await createProfile(
      program,
      'Bob',
      'https://example.com/image.png',
      organizer
    );

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

    masterMint = Keypair.generate();
    [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = 'BDG';
    const badgeUri = 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = capacity;

    ({ masterEditionAcc } = await createBadge(
      program,
      umi,
      badgeName,
      badgeSymbol,
      badgeUri,
      new BN(maxSupply),
      organizer,
      eventPda,
      masterMint
    ));

    await createProfile(
      program,
      'Paul',
      'https://example.com/image.png',
      registrant
    );

    [registrantUserPda] = getUserPdaAndBump(registrant.publicKey);

    await registerForEvent(program, registrantUserPda, eventPda);
  });

  test('checking into event', async () => {
    const newStatus = { approved: {} };

    await changeAttendeeStatus(program, newStatus, registrantUserPda, eventPda);

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

    const { editionAcc, registrantUserAcc, attendeeAcc } = await checkIntoEvent(
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

    const [edition] = findMasterEditionPda(umi, {
      mint: fromWeb3JsPublicKey(editionMint.publicKey),
    });
    const editionNumber = Number(masterEditionAcc.supply) + 1;

    expect(editionAcc.edition.isOriginal).toEqual(false);
    expect(editionAcc.edition.publicKey).toEqual(edition);
    // @ts-ignore
    expect(Number(editionAcc.edition.edition)).toEqual(editionNumber);
    expect(registrantUserAcc.badges[0]).toEqual(editionMint.publicKey);
    expect(attendeeAcc.status).toEqual({ checkedIn: {} });
  });

  test('throws when checking into an event with without being approved', async () => {
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

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('AttendeeNotApproved');
      expect(err.error.errorCode.number).toEqual(6401);
    }
  });
});
