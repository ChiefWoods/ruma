import { beforeEach, describe, expect, test } from 'bun:test';
import { AnchorError, BN, ProgramError } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { getFundedKeypair, program } from '../utils';
import { createEvent, createProfile } from '../methods';
import { getEventPdaAndBump, getUserPdaAndBump } from '../pda';
import { MAX_EVENT_IMAGE_LENGTH, MAX_EVENT_NAME_LENGTH } from '../constants';

describe('createEvent', () => {
  let organizer: Keypair;

  beforeEach(async () => {
    organizer = await getFundedKeypair();

    await createProfile(
      program,
      'Zack',
      'https://example.com/image.png',
      organizer
    );
  });

  test('creates an event', async () => {
    const isPublic = true;
    const needsApproval = true;
    const eventName = 'Test event';
    const eventImage = 'https://example.com/image.png';
    const capacity = 10;
    const startTimestamp = new BN(Date.now());
    // 24 hours after start
    const endTimestamp = new BN(Date.now() + 1000 * 60 * 60 * 24);
    const location = 'Sunway University, Subang Jaya';
    const about = 'This is a test event';

    const { eventAcc } = await createEvent(
      program,
      isPublic,
      needsApproval,
      eventName,
      eventImage,
      capacity,
      startTimestamp,
      endTimestamp,
      location,
      about,
      organizer
    );

    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const eventBump = getEventPdaAndBump(organizerUserPda, eventName)[1];

    expect(eventAcc.bump).toEqual(eventBump);
    expect(eventAcc.data.isPublic).toEqual(isPublic);
    expect(eventAcc.data.needsApproval).toEqual(needsApproval);
    expect(eventAcc.data.name).toEqual(eventName);
    expect(eventAcc.data.image).toEqual(eventImage);
    expect(eventAcc.organizer).toEqual(organizerUserPda);
    expect(eventAcc.data.capacity).toEqual(capacity);
    expect(eventAcc.data.startTimestamp).toEqual(startTimestamp);
    expect(eventAcc.data.endTimestamp).toEqual(endTimestamp);
    expect(eventAcc.data.location).toEqual(location);
    expect(eventAcc.data.about).toEqual(about);
    expect(eventAcc.badge).toEqual(null);
    expect(eventAcc.attendees).toEqual([]);
  });

  test('creates an event with optional values', async () => {
    const isPublic = true;
    const needsApproval = true;
    const eventName = 'Test event';
    const eventImage = 'https://example.com/image.png';
    const capacity = null;
    const startTimestamp = null;
    const endTimestamp = null;
    const location = null;
    const about = null;

    const { eventAcc } = await createEvent(
      program,
      isPublic,
      needsApproval,
      eventName,
      eventImage,
      capacity,
      startTimestamp,
      endTimestamp,
      location,
      about,
      organizer
    );

    const [organizerUserPda] = getUserPdaAndBump(organizer.publicKey);
    const eventBump = getEventPdaAndBump(organizerUserPda, eventName)[1];

    expect(eventAcc.bump).toEqual(eventBump);
    expect(eventAcc.data.isPublic).toEqual(isPublic);
    expect(eventAcc.data.needsApproval).toEqual(needsApproval);
    expect(eventAcc.data.name).toEqual(eventName);
    expect(eventAcc.data.image).toEqual(eventImage);
    expect(eventAcc.data.capacity).toEqual(capacity);
    expect(eventAcc.data.startTimestamp).toEqual(startTimestamp);
    expect(eventAcc.data.endTimestamp).toEqual(endTimestamp);
    expect(eventAcc.data.location).toEqual(location);
    expect(eventAcc.data.about).toEqual(about);
    expect(eventAcc.badge).toEqual(null);
    expect(eventAcc.attendees).toEqual([]);
  });

  test('throws when creating an event with empty name', async () => {
    const isPublic = true;
    const needsApproval = true;
    const eventName = '';
    const eventImage = 'https://example.com/image.png';
    const capacity = 10;
    const startTimestamp = new BN(Date.now());
    // 24 hours after start
    const endTimestamp = new BN(Date.now() + 1000 * 60 * 60 * 24);
    const location = 'Sunway University, Subang Jaya';
    const about = 'This is a test event';

    try {
      await createEvent(
        program,
        isPublic,
        needsApproval,
        eventName,
        eventImage,
        capacity,
        startTimestamp,
        endTimestamp,
        location,
        about,
        organizer
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('EventNameRequired');
      expect(err.error.errorCode.number).toEqual(6200);
    }
  });

  test('throws when creating an event with a name that exceeds max length', async () => {
    const isPublic = true;
    const needsApproval = true;
    const eventName = '_'.repeat(MAX_EVENT_NAME_LENGTH + 1);
    const eventImage = 'https://example.com/image.png';
    const capacity = 10;
    const startTimestamp = new BN(Date.now());
    // 24 hours after start
    const endTimestamp = new BN(Date.now() + 1000 * 60 * 60 * 24);
    const location = 'Sunway University, Subang Jaya';
    const about = 'This is a test event';

    expect(async () => {
      await createEvent(
        program,
        isPublic,
        needsApproval,
        eventName,
        eventImage,
        capacity,
        startTimestamp,
        endTimestamp,
        location,
        about,
        organizer
      );
    }).toThrow();
  });

  test('throws when creating an event with empty image', async () => {
    const isPublic = true;
    const needsApproval = true;
    const eventName = 'Test event';
    const eventImage = '';
    const capacity = 10;
    const startTimestamp = new BN(Date.now());
    // 24 hours after start
    const endTimestamp = new BN(Date.now() + 1000 * 60 * 60 * 24);
    const location = 'Sunway University, Subang Jaya';
    const about = 'This is a test event';

    try {
      await createEvent(
        program,
        isPublic,
        needsApproval,
        eventName,
        eventImage,
        capacity,
        startTimestamp,
        endTimestamp,
        location,
        about,
        organizer
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('EventImageRequired');
      expect(err.error.errorCode.number).toEqual(6202);
    }
  });

  test('throws when creating an event with a image that exceeds max length', async () => {
    const isPublic = true;
    const needsApproval = true;
    const eventName = 'Test event';
    const eventImage = '_'.repeat(MAX_EVENT_IMAGE_LENGTH + 1);
    const capacity = 10;
    const startTimestamp = new BN(Date.now());
    // 24 hours after start
    const endTimestamp = new BN(Date.now() + 1000 * 60 * 60 * 24);
    const location = 'Sunway University, Subang Jaya';
    const about = 'This is a test event';

    try {
      await createEvent(
        program,
        isPublic,
        needsApproval,
        eventName,
        eventImage,
        capacity,
        startTimestamp,
        endTimestamp,
        location,
        about,
        organizer
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);
      expect(err.error.errorCode.code).toEqual('EventImageTooLong');
      expect(err.error.errorCode.number).toEqual(6203);
    }
  });
});
