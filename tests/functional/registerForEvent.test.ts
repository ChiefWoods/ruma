import { beforeEach, describe, expect, test } from 'bun:test';
import { Keypair, PublicKey, SendTransactionError } from '@solana/web3.js';
import { AnchorError, BN } from '@coral-xyz/anchor';
import { getFundedKeypair, program, umi } from '../utils';
import {
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

describe('registerForEvent', () => {
  let organizer: Keypair;
  let registrant: Keypair;

  const eventName = 'Test event';
  const capacity = 10;

  let organizerUserPda: PublicKey;
  let registrantUserPda: PublicKey;

  beforeEach(async () => {
    organizer = await getFundedKeypair();
    registrant = await getFundedKeypair();

    await createProfile(
      program,
      'Bob',
      'https://example.com/image.png',
      organizer
    );

    await createProfile(
      program,
      'Paul',
      'https://example.com/image.png',
      registrant
    );

    [registrantUserPda] = getUserPdaAndBump(registrant.publicKey);
  });

  test('registers for an event', async () => {
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
    [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
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

    const { eventAcc, attendeeAcc } = await registerForEvent(
      program,
      registrantUserPda,
      eventPda
    );

    const [attendeePda, attendeeBump] = getAttendeePdaAndBump(
      registrantUserPda,
      eventPda
    );

    expect(attendeeAcc.bump).toEqual(attendeeBump);
    expect(attendeeAcc.user).toEqual(registrantUserPda);
    expect(attendeeAcc.status).toEqual({ pending: {} });
    expect(eventAcc.attendees[0]).toEqual(attendeePda);
  });

  test('throws when registering for the same event again', async () => {
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
    [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
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

    await registerForEvent(program, registrantUserPda, eventPda);

    try {
      await registerForEvent(program, registrantUserPda, eventPda);
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

  test('throws when registering for a full event', async () => {
    const capacity = 1;

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
    [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
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

    await registerForEvent(program, registrantUserPda, eventPda);

    const newRegistrant = await getFundedKeypair();
    const [newRegistrantUserPda] = getUserPdaAndBump(newRegistrant.publicKey);

    await createProfile(
      program,
      'Paul',
      'https://example.com/image.png',
      newRegistrant
    );

    try {
      await registerForEvent(program, newRegistrantUserPda, eventPda);
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('EventCapacityMaxReached');
      expect(err.error.errorCode.number).toEqual(6204);
    }
  });
});
