import { BN, Program } from '@coral-xyz/anchor';
import { beforeEach, describe, expect, test } from 'bun:test';
import { Ruma } from '../../target/types/ruma';
import { Keypair, PublicKey } from '@solana/web3.js';
import { expectAnchorError, getSetup } from '../setup';
import { fetchTicketAcc } from '../accounts';
import { getTicketPda, getEventPda, getUserPda } from '../pda';
import { MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';
import { Umi } from '@metaplex-foundation/umi';
import { Surfpool, TimeTravelConfig } from '../surfpool';

describe('updateTicket', () => {
  let { program, umi } = {} as {
    program: Program<Ruma>;
    umi: Umi;
  };

  let walletA: Keypair;
  let walletB: Keypair;
  let collection: Keypair;
  let organizerUserPda: PublicKey;
  let attendeeUserPda: PublicKey;
  let eventPda: PublicKey;
  let ticketPda: PublicKey;

  beforeEach(async () => {
    [walletA, walletB] = Array.from({ length: 2 }, () => Keypair.generate());
    collection = Keypair.generate();
    organizerUserPda = getUserPda(walletA.publicKey);
    attendeeUserPda = getUserPda(walletB.publicKey);
    eventPda = getEventPda(organizerUserPda, collection.publicKey);
    ticketPda = getTicketPda(attendeeUserPda, eventPda);

    ({ program, umi } = await getSetup(
      [walletA, walletB].map((wallet) => {
        return {
          publicKey: wallet.publicKey,
        };
      })
    ));

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

    const unixTimestamp = Math.floor(Date.now() / 1000);

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
        user: organizerUserPda,
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
      .createTicket()
      .accountsPartial({
        authority: walletB.publicKey,
        user: attendeeUserPda,
        event: eventPda,
      })
      .signers([walletB])
      .rpc();
  });

  test('update ticket status', async () => {
    await program.methods
      .updateTicket({ approved: {} })
      .accountsPartial({
        authority: walletA.publicKey,
        ticket: ticketPda,
      })
      .signers([walletA])
      .rpc();

    const ticketAcc = await fetchTicketAcc(program, ticketPda);
    expect(ticketAcc.status.approved).toBeTruthy();
  });

  test('throws if updating ticket after event has ended', async () => {
    await Surfpool.timeTravel({
      config: TimeTravelConfig.Timestamp,
      value: Math.floor(Date.now() / 1000) + 60 * 60 * 3,
    });

    try {
      await program.methods
        .updateTicket({ approved: {} })
        .accountsPartial({
          authority: walletA.publicKey,
          ticket: ticketPda,
        })
        .signers([walletA])
        .rpc();
    } catch (err) {
      expectAnchorError(err, 'EventHasEnded');
    }
  });
});
