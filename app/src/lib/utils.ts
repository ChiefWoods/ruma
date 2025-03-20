import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UseFormReturn } from 'react-hook-form';
import { RefObject } from 'react';
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { DisplayedEvent } from '@/types/event';
import { BN } from '@coral-xyz/anchor';
import { getComputeLimitIx } from '@/app/actions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleImageChange(
  event: React.ChangeEvent<HTMLInputElement>,
  form: UseFormReturn<any, any, undefined>,
  formFieldName: string,
  setProfileImageUri: (image: string) => void
) {
  const file = event.target.files?.[0];

  if (file) {
    form.setValue(formFieldName, file);

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProfileImageUri(reader.result as string);
    };
  }
}

export function handleImageClick(ref: RefObject<HTMLInputElement>) {
  ref.current?.click();
}

export function capitalizeFirstLetter(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split('-')
    .map((word: string, index: number) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
}

export function truncateAddress(address: string, length: number = 4): string {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export async function setComputeUnitLimitAndPrice(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  lookupTables: Array<AddressLookupTableAccount> = []
): Promise<Transaction> {
  const tx = new Transaction();

  const limitIx = await getComputeLimitIx(
    connection,
    instructions,
    payer,
    lookupTables
  );

  if (limitIx) {
    tx.add(limitIx);
  }

  tx.add(await getComputePriceIx(connection), ...instructions);

  return tx;
}

export async function getComputePriceIx(
  connection: Connection
): Promise<TransactionInstruction> {
  const recentFees = await connection.getRecentPrioritizationFees();
  const priorityFee =
    recentFees.reduce(
      (acc, { prioritizationFee }) => acc + prioritizationFee,
      0
    ) / recentFees.length;

  return ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: BigInt(Math.ceil(priorityFee)),
  });
}

export function sortEventsByTimestamp(
  events: DisplayedEvent[]
): DisplayedEvent[] {
  return events.sort(
    (a, b) =>
      Number(a.event.account.data.startTimestamp) -
      Number(b.event.account.data.startTimestamp)
  );
}

export function generateDataBytes(
  attendeePda: string,
  eventPda: string
): Uint8Array {
  const data = `${attendeePda}-${eventPda}`;
  return new Uint8Array(Buffer.from(data));
}

export function deserializeProgramAccount(obj: { [key: string]: any } | null) {
  if (obj === null) {
    return null;
  }

  for (const key in obj) {
    if (obj[key] instanceof PublicKey) {
      obj[key] = obj[key].toBase58();
    } else if (obj[key] instanceof BN) {
      obj[key] = Number(obj[key]);
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item) => deserializeProgramAccount(item));
    } else if (obj[key] instanceof Object) {
      obj[key] = deserializeProgramAccount(obj[key]);
    }
  }

  return obj;
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.set('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.link;
}

export async function generateTicket(
  attendeePda: PublicKey,
  eventPda: PublicKey
): Promise<string> {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append('attendeePda', attendeePda.toBase58());
  urlSearchParams.append('eventPda', eventPda.toBase58());

  const response = await fetch(
    `/api/ticket/generate?${urlSearchParams.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.ticket;
}

export async function verifyTicket(payload: string): Promise<{
  verified: boolean;
  message: string;
  attendeePda: string;
  userPda: string;
}> {
  const formData = new FormData();
  formData.set('payload', payload);

  const response = await fetch('/api/ticket/verify', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return {
    verified: data.verified,
    message: data.message,
    attendeePda: data.attendeePda,
    userPda: data.userPda,
  };
}
