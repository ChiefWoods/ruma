'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useProfile } from '../../providers/ProfileProvider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { CreateProfileFormData, createProfileSchema } from '@/lib/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Input } from '../ui/input';
import { ImageInputLabel } from '../ImageInputLabel';
import { ImageInput } from '../ImageInput';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateImage, uploadImage } from '@/lib/api';
import { createUserIx } from '@/lib/instructions';
import { PublicKey } from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';
import { useSendTransaction } from '@privy-io/react-auth/solana';
import { TransactionToast } from '../TransactionToast';
import { buildTx, CONNECTION, getTransactionLink } from '@/lib/solana-client';
import { useUser } from '@/providers/UserProvider';
import { getUserPda } from '@/lib/pda';

export function CreateProfileDialog() {
  const { user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const { isCreateProfileDialogOpen, setIsCreateProfileDialogOpen } =
    useProfile();
  const { setUser } = useUser();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  const form = useForm<CreateProfileFormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = useCallback(
    async (data: CreateProfileFormData) => {
      if (!user?.wallet) {
        toast.message('Sign in to create a profile.');
        return;
      }

      setIsSubmitting(true);
      setLoadingText('Uploading image...');

      try {
        const { url } = await uploadImage(
          data.image || (await generateImage('user', user.wallet.address))
        );

        setLoadingText('Waiting for signature...');

        const publicKey = new PublicKey(user.wallet.address);

        const tx = await buildTx(
          [
            await createUserIx({
              authority: publicKey,
              name: data.name,
              image: url,
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

        setUser({
          authority: user.wallet.address,
          image: url,
          name: data.name,
          publicKey: getUserPda(publicKey).toBase58(),
        });

        setIsCreateProfileDialogOpen(false);
        setImagePreview('');
        form.reset();

        toast.success(
          <TransactionToast
            title="Profile created!"
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
    [sendTransaction, user?.wallet, form, setIsCreateProfileDialogOpen, setUser]
  );

  return (
    <Dialog
      open={isCreateProfileDialogOpen}
      onOpenChange={setIsCreateProfileDialogOpen}
    >
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Profile</DialogTitle>
          <DialogDescription>
            A profile is required to create and join events.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <ImageInputLabel />
                  <FormControl>
                    <ImageInput
                      field={field}
                      imagePreview={imagePreview}
                      setImagePreview={setImagePreview}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin" />}
                {isSubmitting ? loadingText : 'Create Profile'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
