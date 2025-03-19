import { ComputeBudgetProgram, Keypair, PublicKey } from '@solana/web3.js';
import { Ruma } from '../target/types/ruma';
import { BN, Program } from '@coral-xyz/anchor';
import {
  getAttendeePdaAndBump,
  getEventPdaAndBump,
  getUserPdaAndBump,
} from './pda';
import {
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  fetchDigitalAsset,
  fetchMasterEdition,
  fetchMetadata,
  findEditionMarkerFromEditionNumberPda,
  findMasterEditionPda,
  findMetadataPda,
} from '@metaplex-foundation/mpl-token-metadata';
import { Umi } from '@metaplex-foundation/umi';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { getAttendeeAcc, getEventAcc, getUserAcc } from './accounts';
import { RUMA_MASTER_WALLET } from './constants';

export async function createProfile(
  program: Program<Ruma>,
  userName: string,
  userImage: string,
  authority: Keypair
) {
  await program.methods
    .createProfile(userName, userImage)
    .accounts({
      authority: authority.publicKey,
    })
    .signers([authority])
    .rpc();

  const [userPda] = getUserPdaAndBump(authority.publicKey);

  return {
    userAcc: await getUserAcc(program, userPda),
  };
}

export async function createEvent(
  program: Program<Ruma>,
  isPublic: boolean,
  needsApproval: boolean,
  eventName: string,
  eventImage: string,
  capacity: number | null,
  startTimeStamp: BN | null,
  endTimeStamp: BN | null,
  location: string | null,
  about: string | null,
  authority: Keypair
) {
  await program.methods
    .createEvent(
      isPublic,
      needsApproval,
      eventName,
      eventImage,
      capacity,
      startTimeStamp,
      endTimeStamp,
      location,
      about
    )
    .accounts({
      authority: authority.publicKey,
    })
    .signers([authority])
    .rpc();

  const [organizerUserPda] = getUserPdaAndBump(authority.publicKey);
  const [eventPda] = getEventPdaAndBump(organizerUserPda, eventName);

  return {
    eventAcc: await getEventAcc(program, eventPda),
  };
}

export async function createBadge(
  program: Program<Ruma>,
  umi: Umi,
  badgeName: string,
  badgeSymbol: string,
  badgeUri: string,
  maxSupply: BN | null,
  authority: Keypair,
  eventPda: PublicKey,
  masterMint: Keypair
) {
  await program.methods
    .createBadge(badgeName, badgeSymbol, badgeUri, maxSupply)
    .accounts({
      authority: authority.publicKey,
      event: eventPda,
      masterMint: masterMint.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([authority, masterMint])
    .preInstructions(
      [
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 400000,
        }),
      ],
      true
    )
    .rpc();

  const [organizerUserPda] = getUserPdaAndBump(authority.publicKey);
  const [masterMetadataPda] = findMetadataPda(umi, {
    mint: fromWeb3JsPublicKey(masterMint.publicKey),
  });
  const [masterEditionPda] = findMasterEditionPda(umi, {
    mint: fromWeb3JsPublicKey(masterMint.publicKey),
  });
  const masterAtaPda = getAssociatedTokenAddressSync(
    masterMint.publicKey,
    organizerUserPda,
    true
  );

  return {
    metadataAcc: await fetchMetadata(umi, masterMetadataPda),
    masterEditionAcc: await fetchMasterEdition(umi, masterEditionPda),
    eventAcc: await getEventAcc(program, eventPda),
    masterTokenAcc: await getAccount(program.provider.connection, masterAtaPda),
  };
}

export async function registerForEvent(
  program: Program<Ruma>,
  registrantUserPda: PublicKey,
  eventPda: PublicKey
) {
  await program.methods
    .registerForEvent()
    .accounts({
      registrant: registrantUserPda,
      event: eventPda,
    })
    .signers([RUMA_MASTER_WALLET])
    .rpc();

  const [attendeePda] = getAttendeePdaAndBump(registrantUserPda, eventPda);

  return {
    eventAcc: await getEventAcc(program, eventPda),
    attendeeAcc: await getAttendeeAcc(program, attendeePda),
  };
}

export async function changeAttendeeStatus(
  program: Program<Ruma>,
  status: { approved: {} } | { rejected: {} },
  registrantUserPda: PublicKey,
  eventPda: PublicKey
) {
  await program.methods
    .changeAttendeeStatus(status)
    .accounts({
      registrant: registrantUserPda,
      event: eventPda,
    })
    .signers([RUMA_MASTER_WALLET])
    .rpc();

  const [attendeePda] = getAttendeePdaAndBump(registrantUserPda, eventPda);

  return { attendeeAcc: await getAttendeeAcc(program, attendeePda) };
}

export async function checkIntoEvent(
  program: Program<Ruma>,
  umi: Umi,
  organizer: Keypair,
  editionMint: Keypair,
  registrantUserPda: PublicKey,
  attendeePda: PublicKey,
  masterMintPubkey: PublicKey,
  masterAtaPda: PublicKey,
  masterMetadataPda: PublicKey,
  masterEditionPda: PublicKey
) {
  const masterEditionAcc = await fetchMasterEdition(
    umi,
    fromWeb3JsPublicKey(masterEditionPda)
  );
  const editionNumber = Number(masterEditionAcc.supply) + 1;

  const [editionMarkerPda] = findEditionMarkerFromEditionNumberPda(umi, {
    mint: fromWeb3JsPublicKey(masterMintPubkey),
    editionNumber,
  });

  await program.methods
    .checkIntoEvent(new BN(editionNumber))
    .accountsPartial({
      authority: organizer.publicKey,
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
    .preInstructions(
      [ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 })],
      true
    )
    .signers([RUMA_MASTER_WALLET, organizer, editionMint])
    .rpc();

  return {
    editionAcc: await fetchDigitalAsset(
      umi,
      fromWeb3JsPublicKey(editionMint.publicKey)
    ),
    registrantUserAcc: await getUserAcc(program, registrantUserPda),
    attendeeAcc: await getAttendeeAcc(program, attendeePda),
  };
}
