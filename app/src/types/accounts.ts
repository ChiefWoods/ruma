import { BN, Idl, IdlAccounts, IdlTypes } from '@coral-xyz/anchor';
import { Ruma } from './ruma';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { ExtractDefinedKeys, extractEnumVariants } from './generators';
import idl from '@/idl/ruma.json';

type User = IdlAccounts<Ruma>['user'];
type Event = IdlAccounts<Ruma>['event'];
type Ticket = IdlAccounts<Ruma>['ticket'];
export type TicketStatus = IdlTypes<Ruma>['ticketStatus'];
export type CreateUserArgs = IdlTypes<Ruma>['createUserArgs'];
export type CreateEventArgs = IdlTypes<Ruma>['createEventArgs'];

export type ParsedTicketStatus = ExtractDefinedKeys<TicketStatus>;

export const ticketStatusOrder = extractEnumVariants(
  idl as Idl,
  'TicketStatus'
);

export class EventStateFlags {
  static readonly IS_PUBLIC = 1 << 0;
  static readonly APPROVAL_REQUIRED = 1 << 1;

  isPublic: boolean;
  approvalRequired: boolean;

  constructor(isPublic: boolean, approvalRequired: boolean) {
    this.isPublic = isPublic;
    this.approvalRequired = approvalRequired;
  }

  static fromBitflag(bitmask: number): EventStateFlags {
    const isPublic = (bitmask & EventStateFlags.IS_PUBLIC) !== 0;
    const approvalRequired =
      (bitmask & EventStateFlags.APPROVAL_REQUIRED) !== 0;
    return new EventStateFlags(isPublic, approvalRequired);
  }

  static getBitmask(isPublic: boolean, approvalRequired: boolean): number {
    let bitmask = 0b0000_0000;
    if (isPublic) bitmask |= 1 << 0;
    if (approvalRequired) bitmask |= 1 << 1;
    return bitmask;
  }
}

export function toByte<T extends string>(
  value: T,
  variantOrder: readonly T[]
): Buffer {
  const index = variantOrder.indexOf(value);
  if (index < 0 || index > 255) {
    throw new Error('Invalid enum variant.');
  }
  return Buffer.from([index]);
}

export interface ParsedProgramAccount {
  publicKey: string;
}

export interface ParsedUser extends ParsedProgramAccount {
  authority: string;
  name: string;
  image: string;
}

export interface ParsedEvent extends ParsedProgramAccount {
  organizer: string;
  stateFlags: EventStateFlags;
  capacity: number | null;
  registrations: number;
  startTimestamp: number;
  endTimestamp: number;
  badge: string;
  name: string;
  image: string;
  location: string | null;
  about: string | null;
}

export interface ParsedTicket extends ParsedProgramAccount {
  user: string;
  event: string;
  status: ParsedTicketStatus;
}

export function parseEnum<T>(field: object): T {
  return Object.keys(field)[0] as T;
}

function parsePublicKey(field: PublicKey | null): string {
  return !field || field.equals(SystemProgram.programId)
    ? ''
    : field.toBase58();
}

function parseBN(field: BN): number {
  return field.toNumber();
}

export function parseUser({
  authority,
  name,
  image,
}: User): Omit<ParsedUser, 'publicKey'> {
  return {
    authority: parsePublicKey(authority),
    name,
    image,
  };
}

export function parseEvent({
  about,
  badge,
  capacity,
  registrations,
  endTimestamp,
  image,
  location,
  name,
  organizer,
  startTimestamp,
  stateFlags,
}: Event): Omit<ParsedEvent, 'publicKey'> {
  return {
    about,
    badge: parsePublicKey(badge),
    capacity,
    registrations,
    endTimestamp: parseBN(endTimestamp),
    image,
    location,
    name,
    organizer: parsePublicKey(organizer),
    startTimestamp: parseBN(startTimestamp),
    stateFlags: EventStateFlags.fromBitflag(stateFlags),
  };
}

export function parseTicket({
  event,
  status,
  user,
}: Ticket): Omit<ParsedTicket, 'publicKey'> {
  return {
    event: parsePublicKey(event),
    user: parsePublicKey(user),
    status: parseEnum<ParsedTicketStatus>(status),
  };
}
