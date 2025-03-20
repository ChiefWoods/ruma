import { ProgramAccount } from '@coral-xyz/anchor';
import { Event } from './idlAccounts';
import { PublicKey } from '@solana/web3.js';

export type RegistrationStatus =
  | 'pending'
  | 'approved'
  | 'checked-in'
  | 'rejected';

export type DisplayedEvent = {
  event: ProgramAccount<Event>;
  isOrganizer: boolean;
};

export type EventStatus =
  | 'organizer'
  | 'not-registered'
  | 'pending'
  | 'event-not-started'
  | 'not-checked-in'
  | 'checked-in'
  | 'rejected';

export type StatusObject = { approved: {} } | { rejected: {} };

export type ManageAttendeeObject = {
  attendeePda: string;
  status: string;
  userPda: PublicKey;
  name: string;
  image: string;
};
