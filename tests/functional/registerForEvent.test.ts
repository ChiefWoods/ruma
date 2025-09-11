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

describe('registerForEvent', () => {
  let { context, provider, program } = {} as {
    context: ProgramTestContext;
    provider: BankrunProvider;
    program: Program<Ruma>;
  };

  const [walletA, walletB] = Array.from({ length: 2 }, () =>
    Keypair.generate()
  );

  const collection = Keypair.generate();
  const userPda = getUserPda(walletA.publicKey);
  const eventPda = getEventPda(userPda, collection.publicKey);

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
        user: userPda,
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
  });

  test('registers for event as attendee', async () => {
    const userPda = getUserPda(walletB.publicKey);

    await program.methods
      .registerForEvent()
      .accountsPartial({
        authority: walletB.publicKey,
        user: userPda,
        event: eventPda,
      })
      .signers([walletB])
      .rpc();

    const attendeePda = getAttendeePda(userPda, eventPda);
    const attendeeAcc = await fetchAttendeeAcc(program, attendeePda);

    expect(attendeeAcc.user).toStrictEqual(userPda);
    expect(attendeeAcc.event).toStrictEqual(eventPda);
    expect(attendeeAcc.status).toEqual({ pending: {} });
  });

  test('throws if registering after event has ended', async () => {
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

    const userPda = getUserPda(walletB.publicKey);

    try {
      await program.methods
        .registerForEvent()
        .accountsPartial({
          authority: walletB.publicKey,
          user: userPda,
          event: eventPda,
        })
        .signers([walletB])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { errorCode } = (err as AnchorError).error;
      expect(errorCode.code).toBe('EventHasEnded');
    }
  });
});
