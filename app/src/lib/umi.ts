import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { CONNECTION } from './constants';
import { PublicKey } from '@solana/web3.js';
import { PublicKey as UmiPublicKey } from '@metaplex-foundation/umi';
import {
  Edition,
  fetchEdition,
  fetchMasterEdition,
  fetchMetadata,
  findEditionMarkerFromEditionNumberPda,
  findMasterEditionPda,
  findMetadataPda,
  MasterEdition,
  Metadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';

const umi = createUmi(CONNECTION.rpcEndpoint, 'confirmed');

export function getMasterOrPrintedEditionPda(
  mintPubkey: PublicKey
): UmiPublicKey {
  return findMasterEditionPda(umi, {
    mint: fromWeb3JsPublicKey(mintPubkey),
  })[0];
}

export function getMetadataPda(mintPubkey: PublicKey): UmiPublicKey {
  return findMetadataPda(umi, {
    mint: fromWeb3JsPublicKey(mintPubkey),
  })[0];
}

export function getEditionMarkerPda(
  masterMintPubkey: PublicKey,
  editionNumber: number
): UmiPublicKey {
  return findEditionMarkerFromEditionNumberPda(umi, {
    mint: fromWeb3JsPublicKey(masterMintPubkey),
    editionNumber,
  })[0];
}

export async function getMasterEditionAcc(
  masterEditionPda: UmiPublicKey
): Promise<MasterEdition> {
  return await fetchMasterEdition(umi, masterEditionPda);
}

export async function getEditionAcc(
  editionPda: UmiPublicKey
): Promise<Edition> {
  return await fetchEdition(umi, editionPda);
}

export async function getMetadataAcc(
  metadataPda: UmiPublicKey
): Promise<Metadata> {
  return await fetchMetadata(umi, metadataPda);
}
