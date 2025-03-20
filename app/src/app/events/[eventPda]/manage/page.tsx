'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import Image from 'next/image';
import {
  capitalizeFirstLetter,
  getComputePriceIx,
  toCamelCase,
  truncateAddress,
  verifyTicket,
} from '@/lib/utils';
import {
  ManageAttendeeObject,
  RegistrationStatus,
  StatusObject,
} from '@/types/event';
import { QRScanner } from '@/components/QRScanner';
import { statusFormSchema } from '@/lib/formSchemas';
import useSWR from 'swr';
import { useAnchorProgram } from '@/hooks/useAnchorProgram';
import { useParams } from 'next/navigation';
import {
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  ALLOWED_CHANGED_STATUSES,
  ALLOWED_REGISTRATION_STATUSES,
  RUMA_WALLET,
} from '@/lib/constants';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  getEditionMarkerPda,
  getMasterEditionAcc,
  getMasterOrPrintedEditionPda,
  getMetadataPda,
} from '@/lib/umi';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { getUserPda } from '@/lib/pda';
import { statusColors } from '@/lib/colorsRecord';
import { getComputeLimitIx } from '@/app/actions';

export default function Page() {
  const { eventPda } = useParams<{ eventPda: string }>();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const {
    getChangeAttendeeStatusIx,
    getCheckIntoEventIx,
    getEventAcc,
    getMultipleUserAcc,
    getMultipleAttendeeAcc,
  } = useAnchorProgram();
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAttendee, setSelectedAttendee] =
    useState<ManageAttendeeObject | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] =
    useState<boolean>(false);
  const { data: event } = useSWR(
    eventPda,
    async (eventPda) => await getEventAcc(new PublicKey(eventPda))
  );
  const {
    data: eventData,
    isLoading,
    error,
  } = useSWR(
    publicKey && event && event.badge ? [publicKey, event, event.badge] : null,
    async ([publicKey, event, badge]) => {
      let attendees: ManageAttendeeObject[] = [];

      const attendeeAccs = (
        await getMultipleAttendeeAcc(event.attendees)
      ).filter((acc) => acc !== null);
      const userAccs = (
        await getMultipleUserAcc(attendeeAccs.map((acc) => acc.user))
      ).filter((acc) => acc !== null);

      attendees = attendeeAccs.map((acc, i) => {
        return {
          attendeePda: event.attendees[i].toBase58(),
          status: Object.keys(acc.status)[0],
          userPda: acc.user,
          name: userAccs[i].data.name,
          image: userAccs[i].data.image,
        };
      });

      const masterMetadataPda = getMetadataPda(badge);
      const masterEditionPda = getMasterOrPrintedEditionPda(badge);
      const masterEditionAcc = await getMasterEditionAcc(masterEditionPda);
      const nextEdition = Number(masterEditionAcc.supply) + 1;
      const editionMarkerPda = getEditionMarkerPda(badge, nextEdition);
      const masterAtaPda = getAssociatedTokenAddressSync(
        badge,
        getUserPda(publicKey),
        true
      );

      return {
        eventName: event.data.name,
        attendees,
        nextEdition,
        masterMint: badge,
        editionMarkerPda: new PublicKey(editionMarkerPda),
        masterAtaPda,
        masterMetadataPda: new PublicKey(masterMetadataPda),
        masterEditionPda: new PublicKey(masterEditionPda),
      };
    }
  );
  const { data: filteredAttendees } = useSWR(
    eventData ? [eventData.attendees, search, statusFilter] : null,
    ([attendees, search, statusFilter]) => {
      return attendees.filter((attendee) => {
        return (
          attendee.name.toLowerCase().includes(search.toLowerCase()) &&
          (statusFilter === 'all' || statusFilter === attendee.status)
        );
      });
    }
  );

  const form = useForm<z.infer<typeof statusFormSchema>>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      status: undefined,
    },
  });

  async function changeStatus(values: z.infer<typeof statusFormSchema>) {
    if (selectedAttendee) {
      setIsSendingTransaction(true);
      const status = { [toCamelCase(values.status)]: {} } as StatusObject;

      try {
        const ix = await getChangeAttendeeStatusIx(
          status,
          selectedAttendee.userPda,
          new PublicKey(eventPda)
        );
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

      form.reset();
      setSelectedAttendee(null);
      setIsSendingTransaction(false);
    }
  }

  const checkIn = useCallback(
    async (userPda: PublicKey, attendeePda: PublicKey) => {
      if (eventData) {
        setIsSendingTransaction(true);

        try {
          const editionMint = Keypair.generate();

          const ix = await getCheckIntoEventIx(
            eventData.nextEdition,
            userPda,
            attendeePda,
            eventData.editionMarkerPda,
            editionMint,
            eventData.masterMint,
            eventData.masterAtaPda,
            eventData.masterMetadataPda,
            eventData.masterEditionPda
          );
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
          tx.sign([RUMA_WALLET, editionMint]);

          const signature = await sendTransaction(tx, connection);
          await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
          });

          // TODO: add success toast
        } catch (err) {
          console.error(err);
          // TODO: add error toast
        }

        setIsSendingTransaction(false);
      }
    },
    [connection, eventData, getCheckIntoEventIx, sendTransaction]
  );

  const handleQRScan = useCallback(
    async (payload: string) => {
      // TODO: verify QR here
      console.log(payload);
      const { verified, message, attendeePda, userPda } =
        await verifyTicket(payload);

      if (verified) {
        // TODO: show promise toast for checkIn
        console.log(message);
        await checkIn(new PublicKey(userPda), new PublicKey(attendeePda));
        return true;
      } else {
        // TODO: show error toast
        console.log(message);
        return false;
      }
    },
    [checkIn]
  );

  // TODO: add error and loading states
  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    eventData && (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">{eventData.eventName}</h1>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Guests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guests</SelectItem>
              {ALLOWED_REGISTRATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {capitalizeFirstLetter(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <QRScanner onScan={handleQRScan} disabled={isSendingTransaction} />
        </div>

        <div className="divide-y rounded-lg border">
          {filteredAttendees && filteredAttendees.length ? (
            filteredAttendees.map((attendee) => (
              <Dialog
                key={attendee.attendeePda}
                onOpenChange={(open) => {
                  if (!open) {
                    setSelectedAttendee(null);
                    form.reset();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <button
                    className="flex w-full items-center justify-between p-4 hover:bg-gray-50"
                    onClick={() => {
                      setSelectedAttendee(attendee);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={attendee.image}
                        alt={attendee.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="text-left">
                        <div className="font-medium">{attendee.name}</div>
                        <div className="text-sm text-gray-500">
                          {truncateAddress(attendee.attendeePda)}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        statusColors[attendee.status as RegistrationStatus]
                      }
                    >
                      {capitalizeFirstLetter(attendee.status)}
                    </Badge>
                  </button>
                </DialogTrigger>
                {selectedAttendee && (
                  <DialogContent>
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <Image
                          src={selectedAttendee.image}
                          alt={selectedAttendee.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <DialogTitle className="text-left">
                            {selectedAttendee.name}
                          </DialogTitle>
                          <p className="text-sm text-muted-foreground">
                            {truncateAddress(selectedAttendee.attendeePda)}
                          </p>
                        </div>
                      </div>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(changeStatus)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose new status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ALLOWED_CHANGED_STATUSES.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {capitalizeFirstLetter(status)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-black text-white"
                            disabled={isSendingTransaction}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                )}
              </Dialog>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">
              No attendees registered
            </p>
          )}
        </div>
      </div>
    )
  );
}
