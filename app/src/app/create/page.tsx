'use client';

import { DateTimePicker } from '@/components/DateTimePicker';
import { ImageInput } from '@/components/ImageInput';
import { ImageInputLabel } from '@/components/ImageInputLabel';
import { TransactionToast } from '@/components/TransactionToast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { generateImage, uploadImage } from '@/lib/api';
import { CreateEventFormData, createEventSchema } from '@/lib/form-schema';
import { createEventIx } from '@/lib/instructions';
import { getEventPda, getUserPda } from '@/lib/pda';
import { buildTx, CONNECTION, getTransactionLink } from '@/lib/solana-client';
import { milliToUnix, unixToMilli } from '@/lib/utils';
import { useEvents } from '@/providers/EventsProvider';
import { useProfile } from '@/providers/ProfileProvider';
import { useUser } from '@/providers/UserProvider';
import { EventStateFlags } from '@/types/accounts';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePrivy } from '@privy-io/react-auth';
import { useSendTransaction } from '@privy-io/react-auth/solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';
import {
  ArrowUpToLine,
  Globe,
  Loader2,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const isPublicSelectOptions = [
  {
    value: 'true',
    label: 'Public',
    Icon: Globe,
  },
  {
    value: 'false',
    label: 'Private',
    Icon: Sparkles,
  },
];

export default function Page() {
  const now = new Date();

  const startingDate = new Date(now);
  startingDate.setMilliseconds(0);
  if (now.getMinutes() >= 30) {
    startingDate.setHours(now.getHours() + 1, 0);
  } else {
    startingDate.setMinutes(30);
  }

  const endingDate = new Date(startingDate);
  endingDate.setHours(startingDate.getHours() + 1, startingDate.getMinutes());

  const { user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const { userData, userLoading } = useUser();
  const { addEvent } = useEvents();
  const { setIsCreateProfileDialogOpen } = useProfile();
  const [eventImagePreview, setEventImagePreview] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(startingDate);
  const [endDate, setEndDate] = useState<Date | undefined>(endingDate);
  const [badgeImagePreview, setBadgeImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      about: '',
      approvalRequired: false,
      badgeName: '',
      badgeImage: '',
      capacity: undefined,
      endTimestamp: milliToUnix(endingDate.getTime()),
      eventName: '',
      eventImage: '',
      location: '',
      isPublic: true,
      startTimestamp: milliToUnix(startingDate.getTime()),
    },
  });

  const onSubmit = useCallback(
    async (data: CreateEventFormData) => {
      if (!user?.wallet) {
        toast.message('Sign in to create a profile.');
        return;
      }

      if (!userData) {
        setIsCreateProfileDialogOpen(true);
        return;
      }

      setIsSubmitting(true);
      setLoadingText('Uploading image...');

      try {
        const { url: eventImage } = await uploadImage(
          data.eventImage || (await generateImage('event', user.wallet.address))
        );

        const { url: badgeUri } = await uploadImage(
          data.badgeImage || (await generateImage('badge', user.wallet.address))
        );

        setLoadingText('Waiting for signature...');

        const publicKey = new PublicKey(user.wallet.address);
        const collection = Keypair.generate().publicKey;
        const organizer = getUserPda(publicKey);

        const tx = await buildTx(
          [
            await createEventIx({
              about: data.about ?? null,
              approvalRequired: data.approvalRequired,
              authority: publicKey,
              badgeName: data.badgeName,
              badgeUri,
              capacity: data.capacity ?? null,
              collection,
              endTimestamp: new BN(data.endTimestamp),
              eventImage,
              eventName: data.eventName,
              isPublic: data.isPublic,
              location: data.location ?? null,
              startTimestamp: new BN(
                data.startTimestamp ?? milliToUnix(Date.now())
              ),
              user: organizer,
            }),
          ],
          publicKey
        );

        const { signature } = await sendTransaction({
          transaction: tx,
          connection: CONNECTION,
          address: user.wallet.address,
        });

        await CONNECTION.confirmTransaction(signature);

        addEvent({
          about: data.about ?? null,
          badge: collection.toBase58(),
          capacity: data.capacity ?? null,
          endTimestamp: unixToMilli(data.endTimestamp),
          image: eventImage,
          location: data.location ?? null,
          name: data.eventName,
          organizer: organizer.toBase58(),
          publicKey: getEventPda(organizer, collection).toBase58(),
          registrations: 0,
          startTimestamp: unixToMilli(data.startTimestamp ?? Date.now()),
          stateFlags: new EventStateFlags(data.isPublic, data.approvalRequired),
        });

        setEventImagePreview('');
        setBadgeImagePreview('');
        form.reset();

        toast.success(
          <TransactionToast
            title="Event created!"
            link={getTransactionLink(signature)}
          />
        );
      } catch (err) {
        console.error(err);
        toast.error((err as Error).message);
      } finally {
        setIsSubmitting(false);
        setLoadingText('');
      }
    },
    [
      addEvent,
      form,
      sendTransaction,
      setIsCreateProfileDialogOpen,
      user?.wallet,
      userData,
    ]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-x-6 justify-center p-5"
      >
        <FormField
          control={form.control}
          name="eventImage"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageInput
                  btnSize={'lg'}
                  direction="column"
                  field={field}
                  imagePreview={eventImagePreview}
                  setImagePreview={setEventImagePreview}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="self-end">
                <Select
                  defaultValue={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                >
                  <SelectTrigger className="cursor-pointer font-medium bg-background hover:bg-background/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {isPublicSelectOptions.map(({ Icon, label, value }) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="cursor-pointer flex items-center gap-x-2"
                      >
                        <Icon className="text-muted-foreground" />
                        <span>{label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Event Name"
                    {...field}
                    className="text-5xl! h-fit w-fit p-0 border-none outline-none shadow-none ring-0! border-transparent placeholder:text-primary/30"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="startTimestamp"
                render={({ field }) => (
                  <FormItem className="flex justify-between gap-4 rounded-xl">
                    <FormLabel className="text-base">Start</FormLabel>
                    <DateTimePicker
                      date={startDate}
                      onChange={(date) => {
                        setStartDate(date);

                        field.onChange(milliToUnix(date.getTime()));
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTimestamp"
                render={({ field }) => (
                  <FormItem className="flex justify-between gap-4 rounded-xl">
                    <FormLabel className="text-base">End</FormLabel>
                    <DateTimePicker
                      date={endDate}
                      onChange={(date) => {
                        setEndDate(date);

                        field.onChange(milliToUnix(date.getTime()));
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add event location"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Event Options</p>
            <div className="flex flex-col gap-2 rounded-md border-1 p-2">
              <FormField
                control={form.control}
                name="approvalRequired"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-center h-7">
                    <UserCheck size={16} className="text-muted-foreground" />
                    <FormLabel className="text-sm">Require Approval</FormLabel>
                    <FormControl className="ml-auto">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-center h-7">
                    <ArrowUpToLine
                      size={16}
                      className="text-muted-foreground"
                    />
                    <FormLabel className="text-sm">Capacity</FormLabel>
                    <FormControl className="ml-auto">
                      <Input
                        placeholder="Unlimited"
                        type="number"
                        {...field}
                        value={field.value?.toString() ?? ''}
                        min={0}
                        step={1}
                        onChange={(e) => {
                          const capacity = parseInt(e.target.value);
                          field.onChange(
                            isNaN(capacity) ? undefined : capacity
                          );
                        }}
                        className="max-w-[120px] h-full rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="badgeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge Name</FormLabel>
                <FormControl>
                  <Input placeholder="Badge name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="badgeImage"
            render={({ field }) => (
              <FormItem>
                <ImageInputLabel label="Badge Image" />
                <FormControl>
                  <ImageInput
                    direction="row"
                    field={field}
                    imagePreview={badgeImagePreview}
                    setImagePreview={setBadgeImagePreview}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting || userLoading}
            className="cursor-pointer"
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? loadingText : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
