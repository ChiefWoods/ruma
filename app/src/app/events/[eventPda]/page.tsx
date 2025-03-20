'use client';

import Image from 'next/image';
import {
  ArrowRight,
  CalendarIcon,
  Clock,
  MapPin,
  QrCode,
  Ticket,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAnchorProgram } from '@/hooks/useAnchorProgram';
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { EventStatus, RegistrationStatus } from '@/types/event';
import {
  capitalizeFirstLetter,
  generateTicket,
  getComputePriceIx,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAttendeePda, getUserPda } from '@/lib/pda';
import { getMetadataAcc, getMetadataPda } from '@/lib/umi';
import { RUMA_WALLET } from '@/lib/constants';
import { QRTicket } from '@/components/QRTicket';
import { statusColors } from '@/lib/colorsRecord';
import { getComputeLimitIx } from '@/app/actions';

function EventStatusDetailsButton({
  onClick,
  Icon,
  text,
  disabled,
}: {
  onClick?: () => void;
  Icon: FC<React.SVGProps<SVGSVGElement>>;
  text?: string;
  disabled?: boolean;
}) {
  return (
    <Button className="h-8" onClick={onClick} disabled={disabled}>
      {text}
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function EventStatusDetailsBadge({ status }: { status: RegistrationStatus }) {
  return (
    <Badge className={`${statusColors[status]} text-white`}>
      {capitalizeFirstLetter(status)}
    </Badge>
  );
}

function EventBadge({
  status,
  title,
  symbol,
}: {
  status: EventStatus;
  title: string;
  symbol: string;
}) {
  return (
    <div className="ml-2">
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="ml-[1px] text-left text-sm text-muted-foreground">
        {['organizer', 'not-registered', 'pending', 'rejected'].includes(status)
          ? symbol
          : ['event-not-started', 'not-checked-in'].includes(status)
            ? 'Earn this badge when you check into this event!'
            : 'Badge earned!'}
      </p>
    </div>
  );
}

export default function Page() {
  const { eventPda } = useParams<{ eventPda: string }>();
  const router = useRouter();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [isSendingTransaction, setIsSendingTransaction] =
    useState<boolean>(false);
  const {
    getEventAcc,
    getAttendeeAcc,
    getRegisterForEventIx: registerForEventIx,
  } = useAnchorProgram();
  const { data: event, isLoading: isEventLoading } = useSWR(
    eventPda,
    async (eventPda) => {
      const eventAcc = await getEventAcc(new PublicKey(eventPda));

      if (!eventAcc) {
        throw new Error('Event not found.');
      }

      return eventAcc;
    }
  );
  const {
    data: attendeeData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useSWR(
    event && publicKey ? [event, publicKey] : null,
    async ([event, publicKey]) => {
      const userPda = getUserPda(publicKey);

      let status: EventStatus = 'not-registered';

      if (event.organizer.equals(userPda)) {
        status = 'organizer';
      }

      for (const attendeePda of event.attendees) {
        const attendeeAcc = await getAttendeeAcc(attendeePda);

        if (!attendeeAcc) {
          status = 'not-registered';
          break;
        }

        if (attendeeAcc.user.equals(userPda)) {
          if (attendeeAcc.status.pending) {
            status = 'pending';
          } else if (attendeeAcc.status.rejected) {
            status = 'rejected';
          } else if (attendeeAcc.status.approved) {
            if (attendeeAcc.status.checkedIn) {
              status = 'checked-in';
            } else if (Number(event.data.startTimestamp) < Date.now()) {
              status = 'not-checked-in';
            } else {
              status = 'event-not-started';
            }
          }
          break;
        }
      }

      const attendeePda = getAttendeePda(userPda, new PublicKey(eventPda));
      const qrUri = await generateTicket(attendeePda, new PublicKey(eventPda));

      return { userPda, attendeePda, status, qrUri };
    }
  );
  const {
    data: badge,
    isLoading: isBadgeLoading,
    error: badgeError,
  } = useSWR(event && event.badge ? event.badge : null, async (badge) => {
    const masterMetadataPda = getMetadataPda(badge);
    const { name, uri, symbol } = await getMetadataAcc(masterMetadataPda);

    return {
      name,
      uri,
      symbol,
    };
  });

  async function handleRegister() {
    setIsSendingTransaction(true);

    try {
      const ix = await registerForEventIx(new PublicKey(eventPda));
      const limitIx = await getComputeLimitIx(
        connection,
        [ix],
        RUMA_WALLET.publicKey
      );
      const priceIx = await getComputePriceIx(connection);

      const instructions: TransactionInstruction[] = [priceIx, ix];

      if (limitIx) {
        instructions.unshift(limitIx);
      }

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: RUMA_WALLET.publicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      const tx = new VersionedTransaction(messageV0);
      tx.sign([RUMA_WALLET]);

      const signature = await connection.sendTransaction(tx);
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // TODO: add mutation

      // TODO: add success toast
    } catch (err) {
      console.error(err);
      // TODO: add error toast
    }

    setIsSendingTransaction(false);
  }

  // TODO: add error and loading states
  if (statusError) return <p>{statusError.message}</p>;
  if (badgeError) return <p>{badgeError.message}</p>;
  if (isEventLoading) return <p>Loading...</p>;

  return (
    event && (
      <div className="container mx-auto max-w-5xl space-y-8 px-40 py-8">
        <div className="grid gap-8 md:grid-cols-[1fr,2fr]">
          <div className="space-y-6">
            <div className="relative aspect-square w-full">
              <Image
                src={event.data.image}
                alt={event.data.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="mb-4 text-3xl font-bold">{event.data.name}</h1>
              <div className="ml-1 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {Number(event.data.startTimestamp)
                      ? `${new Date(Number(event.data.startTimestamp)).toLocaleDateString()}`
                      : 'Not available'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {Number(event.data.startTimestamp) !== 0 && (
                    <span>
                      {new Date(
                        Number(event.data.startTimestamp)
                      ).toLocaleString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                      {Number(event.data.endTimestamp) !== 0 &&
                        ` to ${new Date(Number(event.data.endTimestamp)).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.data.location}</span>
                </div>
              </div>
            </div>

            {isStatusLoading ? (
              // TODO: add loading state
              <p>Loading...</p>
            ) : (
              attendeeData && (
                <div className="flex w-full items-center">
                  <div className="flex-1">
                    {!['checked-in', 'rejected', 'not-checked-in'].includes(
                      attendeeData.status
                    ) && (
                      <EventStatusDetailsButton
                        onClick={
                          attendeeData.status === 'organizer'
                            ? () => router.push(`/events/${eventPda}/manage`)
                            : attendeeData.status === 'not-registered'
                              ? handleRegister
                              : undefined
                        }
                        Icon={
                          attendeeData.status === 'organizer'
                            ? ArrowRight
                            : attendeeData.status === 'not-registered'
                              ? Ticket
                              : QrCode
                        }
                        text={
                          attendeeData.status === 'organizer'
                            ? 'Manage Event'
                            : attendeeData.status === 'not-registered'
                              ? 'Register for Event'
                              : ['pending', 'checked-in'].includes(
                                    attendeeData.status
                                  )
                                ? 'Check-in'
                                : ''
                        }
                        disabled={
                          ['pending', 'event-not-started'].includes(
                            attendeeData.status
                          ) || isSendingTransaction
                        }
                      />
                    )}
                    {['event-not-started', 'not-checked-in'].includes(
                      attendeeData.status
                    ) && (
                      <QRTicket
                        qrUri={attendeeData.qrUri}
                        disabled={
                          'event-not-started' === attendeeData.status ||
                          isSendingTransaction
                        }
                      />
                    )}
                  </div>
                  <div>
                    {!['organizer', 'not-registered'].includes(
                      attendeeData.status
                    ) && (
                      <EventStatusDetailsBadge
                        status={
                          attendeeData.status === 'pending'
                            ? 'pending'
                            : ['event-not-started', 'not-checked-in'].includes(
                                  attendeeData.status
                                )
                              ? 'approved'
                              : attendeeData.status === 'checked-in'
                                ? 'checked-in'
                                : 'rejected'
                        }
                      />
                    )}
                  </div>
                </div>
              )
            )}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">About</h2>
              <p className="ml-[1px] text-justify text-muted-foreground">
                {event.data.about}
              </p>
            </div>

            {isBadgeLoading ? (
              // TODO: add loading state
              <p>Loading...</p>
            ) : (
              badge &&
              attendeeData && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 rounded-lg">
                    <div className="relative flex h-24 w-24">
                      <Image
                        src={badge.uri}
                        alt="NFT Badge"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div>
                      <EventBadge
                        status={attendeeData.status}
                        title={badge.name}
                        symbol={badge.symbol}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    )
  );
}
