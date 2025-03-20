import { IdlAccounts } from '@coral-xyz/anchor';
import { Ruma } from './ruma';

export type User = IdlAccounts<Ruma>['user'];

export type UserData = User['data'];

export type Event = IdlAccounts<Ruma>['event'];

export type EventData = Event['data'];

export type Attendee = IdlAccounts<Ruma>['attendee'];
