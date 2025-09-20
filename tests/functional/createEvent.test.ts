import { BN, Program } from '@coral-xyz/anchor';
import { beforeEach, describe, expect, test } from 'bun:test';
import { Ruma } from '../../target/types/ruma';
import { Keypair, PublicKey } from '@solana/web3.js';
import { expectAnchorError, getSetup } from '../setup';
import { EventStateFlag, fetchEventAcc } from '../accounts';
import { getEventPda, getUserPda } from '../pda';
import {
  fetchCollection,
  MPL_CORE_PROGRAM_ID,
} from '@metaplex-foundation/mpl-core';
import { publicKey, Umi } from '@metaplex-foundation/umi';

describe('createEvent', () => {
  let { program, umi } = {} as {
    program: Program<Ruma>;
    umi: Umi;
  };

  let wallet: Keypair;
  let collection: Keypair;
  let organizerUserPda: PublicKey;

  beforeEach(async () => {
    wallet = Keypair.generate();
    collection = Keypair.generate();
    organizerUserPda = getUserPda(wallet.publicKey);

    ({ program, umi } = await getSetup([
      {
        publicKey: wallet.publicKey,
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

  test('creates an event', async () => {
    const isPublic = true;
    const approvalRequired = true;
    const capacity = 100;
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const startTimestamp = new BN(Number(unixTimestamp) + 60 * 60);
    const endTimestamp = new BN(Number(unixTimestamp) + 60 * 60 * 2);
    const eventName = 'Event';
    const eventImage = 'https://example.com/image.png';
    const badgeName = 'Badge';
    const badgeUri = 'https://example.com/badge.json';
    const location = 'Location';
    const about = 'About';

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
        user: organizerUserPda,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
      })
      .signers([wallet, collection])
      .rpc();

    const eventPda = getEventPda(organizerUserPda, collection.publicKey);
    const eventAcc = await fetchEventAcc(program, eventPda);

    expect(eventAcc.organizer).toStrictEqual(organizerUserPda);
    expect(eventAcc.capacity).toBe(capacity);
    expect(eventAcc.registrations).toBe(0);
    expect(eventAcc.startTimestamp.toNumber()).toBe(startTimestamp.toNumber());
    expect(eventAcc.endTimestamp.toNumber()).toBe(endTimestamp.toNumber());
    expect(eventAcc.badge).toStrictEqual(collection.publicKey);
    expect(eventAcc.name).toBe(eventName);
    expect(eventAcc.image).toBe(eventImage);
    expect(eventAcc.location).toBe(location);
    expect(eventAcc.about).toBe(about);

    const stateFlags = new EventStateFlag(eventAcc.stateFlags[0]);

    expect(stateFlags.isPublic).toBe(isPublic);
    expect(stateFlags.isApprovalRequired).toBe(approvalRequired);

    const collectionAcc = await fetchCollection(umi, publicKey(eventAcc.badge));

    expect(collectionAcc.name).toBe(badgeName);
    expect(collectionAcc.uri).toBe(badgeUri);
    expect(collectionAcc.masterEdition.maxSupply).toBe(capacity);
    expect(collectionAcc.masterEdition.authority.address).toBeUndefined();
    expect(collectionAcc.permanentFreezeDelegate.frozen).toBe(true);
    expect(
      collectionAcc.permanentFreezeDelegate.authority.address
    ).toBeUndefined();
  });

  test('throws if start time is after end time', async () => {
    const isPublic = true;
    const approvalRequired = true;
    const capacity = 100;
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const startTimestamp = new BN(Number(unixTimestamp) + 60 * 60);
    const endTimestamp = new BN(Number(unixTimestamp) + 60 * 60 * 2);
    const eventName = 'Event';
    const eventImage = 'https://example.com/image.png';
    const badgeName = 'Badge';
    const badgeUri = 'https://example.com/badge.json';
    const location = 'Location';
    const about = 'About';

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
          user: organizerUserPda,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([wallet, collection])
        .rpc();
    } catch (err) {
      expectAnchorError(err, 'InvalidEventTime');
    }
  });
});
