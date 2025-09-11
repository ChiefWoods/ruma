import { AnchorError, BN, Program } from '@coral-xyz/anchor';
import { BankrunProvider } from 'anchor-bankrun';
import { beforeEach, describe, expect, test } from 'bun:test';
import { ProgramTestContext } from 'solana-bankrun';
import { Ruma } from '../../target/types/ruma';
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { getBankrunSetup } from '../setup';
import { EventStateFlag, fetchEventAcc } from '../accounts';
import { getEventPda, getUserPda } from '../pda';
import { MAX_EVENT_IMAGE_LENGTH, MAX_EVENT_NAME_LENGTH } from '../constants';
import { MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';

describe('createEvent', () => {
  let { context, provider, program } = {} as {
    context: ProgramTestContext;
    provider: BankrunProvider;
    program: Program<Ruma>;
  };

  const wallet = Keypair.generate();

  beforeEach(async () => {
    ({ context, provider, program } = await getBankrunSetup([
      {
        address: wallet.publicKey,
        info: {
          data: new Uint8Array(Buffer.alloc(0)),
          executable: false,
          owner: SystemProgram.programId,
          lamports: LAMPORTS_PER_SOL,
        },
      },
    ]));

    await program.methods
      .createUser({
        name: 'User',
        image: 'https://example.com/image.png',
      })
      .accounts({
        authority: wallet.publicKey,
      })
      .signers([wallet])
      .rpc();
  });

  test('creates an event account', async () => {
    const isPublic = true;
    const approvalRequired = false;
    const capacity = 100;
    const { unixTimestamp } = await context.banksClient.getClock();
    const startTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60);
    const endTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60 * 2);
    const eventName = 'Event';
    const eventImage = 'https://example.com/image.png';
    const badgeName = 'Badge';
    const badgeUri = 'https://example.com/badge.json';
    const location = 'Location';
    const about = 'About';
    const collection = Keypair.generate();
    const userPda = getUserPda(wallet.publicKey);

    await program.methods
      .createEvent({
        isPublic,
        approvalRequired,
        capacity,
        startTimestamp,
        endTimestamp,
        eventName,
        eventImage,
        badgeName,
        badgeUri,
        location,
        about,
      })
      .accountsPartial({
        authority: wallet.publicKey,
        collection: collection.publicKey,
        user: userPda,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
      })
      .signers([wallet, collection])
      .rpc();

    const eventPda = getEventPda(userPda, collection.publicKey);
    const eventAcc = await fetchEventAcc(program, eventPda);

    expect(eventAcc.organizer).toStrictEqual(userPda);
    expect(eventAcc.capacity).toBe(capacity);
    expect(eventAcc.startTimestamp.toNumber()).toBe(startTimestamp.toNumber());
    expect(eventAcc.endTimestamp.toNumber()).toBe(endTimestamp.toNumber());
    expect(eventAcc.badge).toStrictEqual(collection.publicKey);
    expect(eventAcc.name).toBe(eventName);
    expect(eventAcc.image).toBe(eventImage);
    expect(eventAcc.location).toBe(location);
    expect(eventAcc.about).toBe(about);

    const stateFlags = new EventStateFlag(eventAcc.stateFlags);

    expect(stateFlags.isPublic).toBe(isPublic);
    expect(stateFlags.isApprovalRequired).toBe(approvalRequired);

    const collectionAcc = await context.banksClient.getAccount(eventAcc.badge);

    expect(collectionAcc).not.toBeNull();
  });

  test('throws if event name is too long', async () => {
    const isPublic = true;
    const approvalRequired = false;
    const capacity = 100;
    const { unixTimestamp } = await context.banksClient.getClock();
    const startTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60);
    const endTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60 * 2);
    const eventName = '_'.repeat(MAX_EVENT_NAME_LENGTH);
    const eventImage = 'https://example.com/image.png';
    const badgeName = 'Badge';
    const badgeUri = 'https://example.com/badge.json';
    const location = 'Location';
    const about = 'About';
    const collection = Keypair.generate();
    const userPda = getUserPda(wallet.publicKey);

    try {
      await program.methods
        .createEvent({
          isPublic,
          approvalRequired,
          capacity,
          startTimestamp,
          endTimestamp,
          eventName,
          eventImage,
          badgeName,
          badgeUri,
          location,
          about,
        })
        .accountsPartial({
          authority: wallet.publicKey,
          collection: collection.publicKey,
          user: userPda,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([wallet, collection])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('EventNameTooLong');
    }
  });

  test('throws if event image is too long', async () => {
    const isPublic = true;
    const approvalRequired = false;
    const capacity = 100;
    const { unixTimestamp } = await context.banksClient.getClock();
    const startTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60);
    const endTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60 * 2);
    const eventName = 'Event';
    const eventImage = '_'.repeat(MAX_EVENT_IMAGE_LENGTH);
    const badgeName = 'Badge';
    const badgeUri = 'https://example.com/badge.json';
    const location = 'Location';
    const about = 'About';
    const collection = Keypair.generate();
    const userPda = getUserPda(wallet.publicKey);

    try {
      await program.methods
        .createEvent({
          public: isPublic,
          approvalRequired,
          capacity,
          startTimestamp,
          endTimestamp,
          eventName,
          eventImage,
          badgeName,
          badgeUri,
          location,
          about,
        })
        .accountsPartial({
          authority: wallet.publicKey,
          collection: collection.publicKey,
          user: userPda,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([wallet, collection])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('EventImageTooLong');
    }
  });

  test('throws if start time is after end time', async () => {
    const isPublic = true;
    const approvalRequired = false;
    const capacity = 100;
    const { unixTimestamp } = await context.banksClient.getClock();
    const startTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60 * 2);
    const endTimestamp = new BN(Number(unixTimestamp) + 1000 * 60 * 60);
    const eventName = '_'.repeat(MAX_EVENT_NAME_LENGTH);
    const eventImage = 'https://example.com/image.png';
    const badgeName = 'Badge';
    const badgeUri = 'https://example.com/badge.json';
    const location = 'Location';
    const about = 'About';
    const collection = Keypair.generate();
    const userPda = getUserPda(wallet.publicKey);

    try {
      await program.methods
        .createEvent({
          public: isPublic,
          approvalRequired,
          capacity,
          startTimestamp,
          endTimestamp,
          eventName,
          eventImage,
          badgeName,
          badgeUri,
          location,
          about,
        })
        .accountsPartial({
          authority: wallet.publicKey,
          collection: collection.publicKey,
          user: userPda,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([wallet, collection])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('InvalidEventTime');
    }
  });
});
