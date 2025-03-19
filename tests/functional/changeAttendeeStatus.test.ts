import { beforeEach, describe, expect, test } from 'bun:test';
import { getFundedKeypair, program, umi } from '../utils';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AnchorError, BN } from '@coral-xyz/anchor';
import {
  changeAttendeeStatus,
  createBadge,
  createEvent,
  createProfile,
  registerForEvent,
} from '../methods';
import { getEventPdaAndBump, getUserPdaAndBump } from '../pda';

describe('changeAttendeeStatus', () => {
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

    await createProfile(
      program,
      'Paul',
      'https://example.com/image.png',
      registrant
    );

    [registrantUserPda] = getUserPdaAndBump(registrant.publicKey);
  });

  test('changing attendee status', async () => {
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);

    await registerForEvent(program, registrantUserPda, eventPda);

    const newStatus = { approved: {} };

    const { attendeeAcc } = await changeAttendeeStatus(
      program,
      newStatus,
      registrantUserPda,
      eventPda
    );

    expect(attendeeAcc.status).toEqual(newStatus);
  });

  test('throws when changing status of user that has not registered', async () => {
    const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);

    const newStatus = { approved: {} };

    try {
      await changeAttendeeStatus(
        program,
        newStatus,
        registrantUserPda,
        eventPda
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('AccountNotInitialized');
      expect(err.error.errorCode.number).toEqual(3012);
      expect(err.error.origin).toEqual('attendee');
    }
  });
});
