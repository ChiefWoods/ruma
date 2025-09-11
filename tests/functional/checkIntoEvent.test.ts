import { AnchorError, BN, Program } from '@coral-xyz/anchor';
import { BankrunProvider } from 'anchor-bankrun';
import { beforeEach, describe, expect, test } from 'bun:test';
import { Clock, ProgramTestContext } from 'solana-bankrun';
import { Ruma } from '../../target/types/ruma';
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { getBankrunSetup } from '../setup';
import { fetchAttendeeAcc } from '../accounts';
import { getAttendeePda, getEventPda, getUserPda } from '../pda';
import { MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';

describe('checkIntoEvent', () => {
  let { context, provider, program } = {} as {
    context: ProgramTestContext;
    provider: BankrunProvider;
    program: Program<Ruma>;
  };

  const [walletA, walletB] = Array.from({ length: 2 }, () =>
    Keypair.generate()
  );

  const collection = Keypair.generate();
  const userAPda = getUserPda(walletA.publicKey);
  const userBPda = getUserPda(walletB.publicKey);
  const eventPda = getEventPda(userAPda, collection.publicKey);
  const attendeePda = getAttendeePda(userBPda, eventPda);

  beforeEach(async () => {
    ({ context, provider, program } = await getBankrunSetup([
      ...[walletA, walletB].map((kp) => {
        return {
          address: kp.publicKey,
          info: {
            data: new Uint8Array(Buffer.alloc(0)),
            executable: false,
            owner: SystemProgram.programId,
            lamports: LAMPORTS_PER_SOL,
          },
        };
      }),
    ]));

    await program.methods
      .createUser({
        name: 'User',
        image: 'https://example.com/image.png',
      })
      .accounts({
        authority: walletA.publicKey,
      })
      .signers([walletA])
      .rpc();

    const { unixTimestamp } = await context.banksClient.getClock();

    await program.methods
      .createEvent({
        isPublic: true,
        approvalRequired: false,
        capacity: 100,
        startTimestamp: new BN(Number(unixTimestamp) + 1000 * 60 * 60),
        endTimestamp: new BN(Number(unixTimestamp) + 1000 * 60 * 60 * 2),
        eventName: 'Event',
        eventImage: 'https://example.com/image.png',
        badgeName: 'Badge',
        badgeUri: 'https://example.com/badge.json',
        location: 'Location',
        about: 'About',
      })
      .accountsPartial({
        authority: walletA.publicKey,
        collection: collection.publicKey,
        user: userAPda,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
      })
      .signers([walletA, collection])
      .rpc();

    await program.methods
      .createUser({
        name: 'User',
        image: 'https://example.com/image.png',
      })
      .accounts({
        authority: walletB.publicKey,
      })
      .signers([walletB])
      .rpc();

    await program.methods
      .registerForEvent()
      .accountsPartial({
        authority: walletB.publicKey,
        user: userBPda,
        event: eventPda,
      })
      .signers([walletB])
      .rpc();
  });

  test('check into an event', async () => {
    await program.methods
      .updateAttendee({ approved: {} })
      .accountsPartial({
        authority: walletA.publicKey,
        attendee: attendeePda,
      })
      .signers([walletA])
      .rpc();

    const asset = Keypair.generate();

    await program.methods
      .checkIntoEvent()
      .accountsPartial({
        authority: walletA.publicKey,
        asset: asset.publicKey,
        attendee: attendeePda,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
      })
      .signers([walletA, asset])
      .rpc();

    const attendeeAcc = await fetchAttendeeAcc(program, attendeePda);

    expect(attendeeAcc.status.checkedIn).toBeTruthy();

    const assetAcc = await context.banksClient.getAccount(asset.publicKey);

    expect(assetAcc).not.toBeNull();
  });

  test('throws if attendee is not approved', async () => {
    await program.methods
      .updateAttendee({ rejected: {} })
      .accountsPartial({
        authority: walletA.publicKey,
        attendee: attendeePda,
      })
      .signers([walletA])
      .rpc();

    const asset = Keypair.generate();

    try {
      await program.methods
        .checkIntoEvent()
        .accountsPartial({
          authority: walletA.publicKey,
          asset: asset.publicKey,
          attendee: attendeePda,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([walletA, asset])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('AttendeeNotApproved');
    }
  });

  test('throws if attendee already checked in', async () => {
    await program.methods
      .updateAttendee({ approved: {} })
      .accountsPartial({
        authority: walletA.publicKey,
        attendee: attendeePda,
      })
      .signers([walletA])
      .rpc();

    const asset = Keypair.generate();

    await program.methods
      .checkIntoEvent()
      .accountsPartial({
        authority: walletA.publicKey,
        asset: asset.publicKey,
        attendee: attendeePda,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
      })
      .signers([walletA, asset])
      .rpc();

    try {
      await program.methods
        .checkIntoEvent()
        .accountsPartial({
          authority: walletA.publicKey,
          asset: asset.publicKey,
          attendee: attendeePda,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([walletA, asset])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('AttendeeAlreadyCheckedIn');
    }
  });

  test('throws if checking in after event has ended', async () => {
    await program.methods
      .updateAttendee({ approved: {} })
      .accountsPartial({
        authority: walletA.publicKey,
        attendee: attendeePda,
      })
      .signers([walletA])
      .rpc();

    const {
      epoch,
      epochStartTimestamp,
      leaderScheduleEpoch,
      slot,
      unixTimestamp,
    } = await context.banksClient.getClock();
    const clock = new Clock(
      slot,
      epochStartTimestamp,
      epoch,
      leaderScheduleEpoch,
      unixTimestamp + BigInt(1000 * 60 * 60 * 3)
    );
    context.setClock(clock);

    const asset = Keypair.generate();

    try {
      await program.methods
        .checkIntoEvent()
        .accountsPartial({
          authority: walletA.publicKey,
          asset: asset.publicKey,
          attendee: attendeePda,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([walletA, asset])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('EventHasEnded');
    }
  });
});
