import { beforeEach, describe, expect, test } from 'bun:test';
import { Keypair, SendTransactionError } from '@solana/web3.js';
import { AnchorError, BN } from '@coral-xyz/anchor';
import { getFundedKeypair, program, umi } from '../utils';
import { createBadge, createEvent, createProfile } from '../methods';
import { getEventPdaAndBump, getUserPdaAndBump } from '../pda';
import {
  MAX_BADGE_NAME_LENGTH,
  MAX_BADGE_SYMBOL_LENGTH,
  MAX_BADGE_URI_LENGTH,
} from '../constants';

describe('createBadge', () => {
  let organizer: Keypair;

  const eventName = 'Test event';
  const capacity = 10;

  beforeEach(async () => {
    organizer = await getFundedKeypair();

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
  });

  test('creates a badge with max supply', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = 'BDG';
    const badgeUri = 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = capacity;

    const { metadataAcc, masterEditionAcc, eventAcc, masterTokenAcc } =
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

    expect(metadataAcc.name).toEqual(badgeName);
    expect(metadataAcc.symbol).toEqual(badgeSymbol);
    expect(metadataAcc.uri).toEqual(badgeUri);
    // @ts-ignore
    expect(metadataAcc.creators.value[0].address).toEqual(
      organizerUserPda.toBase58()
    );
    // @ts-ignore
    expect(Number(masterEditionAcc.maxSupply.value)).toEqual(maxSupply);
    expect(Number(masterEditionAcc.supply)).toEqual(0);
    expect(eventAcc.badge).toEqual(masterMint.publicKey);
    expect(Number(masterTokenAcc.amount)).toEqual(1);
  });

  test('creates a badge without max supply', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = 'BDG';
    const badgeUri = 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = null;

    const { metadataAcc, masterEditionAcc, eventAcc, masterTokenAcc } =
      await createBadge(
        program,
        umi,
        badgeName,
        badgeSymbol,
        badgeUri,
        maxSupply,
        organizer,
        eventPda,
        masterMint
      );

    expect(metadataAcc.name).toEqual(badgeName);
    expect(metadataAcc.symbol).toEqual(badgeSymbol);
    expect(metadataAcc.uri).toEqual(badgeUri);
    // @ts-ignore
    expect(metadataAcc.creators.value[0].address).toEqual(
      organizerUserPda.toBase58()
    );
    // @ts-ignore
    expect(masterEditionAcc.maxSupply.value).toEqual(undefined);
    expect(Number(masterEditionAcc.supply)).toEqual(0);
    expect(eventAcc.badge).toEqual(masterMint.publicKey);
    expect(Number(masterTokenAcc.amount)).toEqual(1);
  });

  test('throws when creating a badge with empty name', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = '';
    const badgeSymbol = 'BDG';
    const badgeUri = 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = capacity;

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('BadgeNameRequired');
      expect(err.error.errorCode.number).toEqual(6300);
    }
  });

  test('throws when creating a badge with a name that exceeds max length', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = '_'.repeat(MAX_BADGE_NAME_LENGTH + 1);
    const badgeSymbol = 'BDG';
    const badgeUri = 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = capacity;

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('BadgeNameTooLong');
      expect(err.error.errorCode.number).toEqual(6301);
    }
  });

  test('throws when creating a badge with empty symbol', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = '';
    const badgeUri = 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = capacity;

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('BadgeSymbolRequired');
      expect(err.error.errorCode.number).toEqual(6302);
    }
  });

  test('throws when creating a badge with a symbol that exceeds max length', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = '_'.repeat(MAX_BADGE_SYMBOL_LENGTH + 1);
    const badgeUri = await 'https://example.com/image.png';
    // corresponds to capacity of event
    const maxSupply = capacity;

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('BadgeSymbolTooLong');
      expect(err.error.errorCode.number).toEqual(6303);
    }
  });

  test('throws when creating a badge with empty URI', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = 'BDG';
    const badgeUri = '';
    // corresponds to capacity of event
    const maxSupply = capacity;

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('BadgeUriRequired');
      expect(err.error.errorCode.number).toEqual(6304);
    }
  });

  test('throws when creating a badge with a URI that exceeds max length', async () => {
    const masterMint = Keypair.generate();
    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);
    const badgeName = 'Test badge';
    const badgeSymbol = 'BDG';
    const badgeUri = '_'.repeat(MAX_BADGE_URI_LENGTH + 1);
    // corresponds to capacity of event
    const maxSupply = capacity;

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('BadgeUriTooLong');
      expect(err.error.errorCode.number).toEqual(6305);
    }
  });

  test('throws when creating an event badge when badge already exists', async () => {
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

    try {
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
    } catch (err) {
      expect(err).toBeInstanceOf(SendTransactionError);
      expect(err.logs).toEqual(
        expect.arrayContaining([
          expect.stringMatching(
            /Allocate: account Address \{[^}]+\} already in use/
          ),
        ])
      );
    }
  });
});
