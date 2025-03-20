'use client';

import { Ruma } from '@/types/ruma';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import {
  AnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useCallback, useMemo, useState } from 'react';
import idl from '@/idl/ruma.json';
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getUserPda } from '@/lib/pda';

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState<Program<Ruma>>(
    new Program(
      idl as Ruma,
      new AnchorProvider(connection, wallet as AnchorWallet, {
        commitment: 'confirmed',
      })
    )
  );

  useMemo(() => {
    setProgram(
      new Program(
        idl as Ruma,
        new AnchorProvider(connection, wallet as AnchorWallet, {
          commitment: 'confirmed',
        })
      )
    );
  }, [connection, wallet]);

  async function getCreateProfileIx(
    userName: string,
    userImage: string
  ): Promise<TransactionInstruction> {
    return await program.methods
      .createProfile(userName, userImage)
      .accounts({
        authority: wallet.publicKey!,
      })
      .instruction();
  }

  async function getCreateEventIx(
    isPublic: boolean,
    needsApproval: boolean,
    eventName: string,
    eventImage: string,
    capacity: number | null,
    startTimeStamp: number | null,
    endTimeStamp: number | null,
    location: string | null,
    about: string | null
  ): Promise<TransactionInstruction> {
    return await program.methods
      .createEvent(
        isPublic,
        needsApproval,
        eventName,
        eventImage,
        capacity,
        startTimeStamp ? new BN(startTimeStamp) : null,
        endTimeStamp ? new BN(endTimeStamp) : null,
        location,
        about
      )
      .accounts({
        authority: wallet.publicKey!,
      })
      .instruction();
  }

  async function getCreateBadgeIx(
    badgeName: string,
    badgeSymbol: string,
    badgeUri: string,
    maxSupply: number | null,
    eventPda: PublicKey,
    masterMint: Keypair
  ): Promise<TransactionInstruction> {
    return await program.methods
      .createBadge(
        badgeName,
        badgeSymbol,
        badgeUri,
        maxSupply ? new BN(maxSupply) : null
      )
      .accounts({
        authority: wallet.publicKey!,
        event: eventPda,
        masterMint: masterMint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  async function getRegisterForEventIx(
    eventPda: PublicKey
  ): Promise<TransactionInstruction> {
    return await program.methods
      .registerForEvent()
      .accounts({
        registrant: getUserPda(wallet.publicKey!),
        event: eventPda,
      })
      .instruction();
  }

  async function getChangeAttendeeStatusIx(
    status: { approved: {} } | { rejected: {} },
    registrantPda: PublicKey,
    eventPda: PublicKey
  ): Promise<TransactionInstruction> {
    return await program.methods
      .changeAttendeeStatus(status)
      .accounts({
        registrant: registrantPda,
        event: eventPda,
      })
      .instruction();
  }

  async function getCheckIntoEventIx(
    editionNumber: number,
    registrantUserPda: PublicKey,
    attendeePda: PublicKey,
    editionMarkerPda: PublicKey,
    editionMint: Keypair,
    masterMintPubkey: PublicKey,
    masterAtaPda: PublicKey,
    masterMetadataPda: PublicKey,
    masterEditionPda: PublicKey
  ): Promise<TransactionInstruction> {
    return await program.methods
      .checkIntoEvent(new BN(editionNumber))
      .accountsPartial({
        authority: wallet.publicKey!,
        registrant: registrantUserPda,
        attendee: attendeePda,
        editionMint: editionMint.publicKey,
        editionMarkerPda,
        masterMint: masterMintPubkey,
        masterTokenAccount: masterAtaPda,
        masterMetadata: masterMetadataPda,
        masterEdition: masterEditionPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  const getAllUserAcc = useCallback(async () => {
    return await program.account.user.all();
  }, [program]);

  const getMultipleUserAcc = useCallback(
    async (userPdas: PublicKey[]) => {
      return await program.account.user.fetchMultiple(userPdas);
    },
    [program]
  );

  const getUserAcc = useCallback(
    async (userPda: PublicKey) => {
      return await program.account.user.fetchNullable(userPda);
    },
    [program]
  );

  const getAllEventAcc = useCallback(async () => {
    return await program.account.event.all();
  }, [program]);

  const getMultipleEventAcc = useCallback(
    async (eventPdas: PublicKey[]) => {
      return await program.account.event.fetchMultiple(eventPdas);
    },
    [program]
  );

  const getEventAcc = useCallback(
    async (eventPda: PublicKey) => {
      return await program.account.event.fetchNullable(eventPda);
    },
    [program]
  );

  const getAllAttendeeAcc = useCallback(async () => {
    return await program.account.attendee.all();
  }, [program]);

  const getMultipleAttendeeAcc = useCallback(
    async (attendeePdas: PublicKey[]) => {
      return await program.account.attendee.fetchMultiple(attendeePdas);
    },
    [program]
  );

  const getAttendeeAcc = useCallback(
    async (attendeePda: PublicKey) => {
      return await program.account.attendee.fetchNullable(attendeePda);
    },
    [program]
  );

  return {
    getCreateProfileIx,
    getCreateEventIx,
    getCreateBadgeIx,
    getRegisterForEventIx,
    getChangeAttendeeStatusIx,
    getCheckIntoEventIx,
    getAllUserAcc,
    getMultipleUserAcc,
    getUserAcc,
    getAllEventAcc,
    getMultipleEventAcc,
    getEventAcc,
    getAllAttendeeAcc,
    getMultipleAttendeeAcc,
    getAttendeeAcc,
  };
}
