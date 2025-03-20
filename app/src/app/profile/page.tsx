'use client';

import { Trophy, Users } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAnchorProgram } from '@/hooks/useAnchorProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import useSWR from 'swr';
import { getAttendeePda, getUserPda } from '@/lib/pda';
import {
  getEditionAcc,
  getMasterOrPrintedEditionPda,
  getMetadataAcc,
  getMetadataPda,
} from '@/lib/umi';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { getUserAcc, getAllEventAcc, getAttendeeAcc } = useAnchorProgram();
  const { data: userData, isLoading: isUserLoading } = useSWR(
    publicKey,
    async (publicKey) => {
      const userPda = getUserPda(publicKey);
      const userAcc = await getUserAcc(userPda);

      if (!userAcc) {
        router.push('/create-profile');
        return null;
      }

      return { userPda, userAcc };
    }
  );
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error,
  } = useSWR(userData, async ({ userPda, userAcc }) => {
    const allEvents = await getAllEventAcc();

    const badges = await Promise.all(
      userAcc.badges.map(async (badge) => {
        const { name, uri } = await getMetadataAcc(getMetadataPda(badge));
        const { publicKey: userBadgePda } = await getEditionAcc(
          getMasterOrPrintedEditionPda(badge)
        );

        return {
          pda: userBadgePda,
          name,
          image: uri,
        };
      })
    );

    let eventsHosted = 0;
    let eventsAttended = 0;

    allEvents.forEach(async ({ account, publicKey: eventPda }) => {
      if (
        account.organizer.equals(userPda) &&
        account.data.startTimestamp < Date.now()
      ) {
        eventsHosted++;
      } else {
        const attendeeAcc = await getAttendeeAcc(
          getAttendeePda(userPda, eventPda)
        );

        if (attendeeAcc && attendeeAcc.status.checkedIn) {
          eventsAttended++;
        }
      }
    });

    return { userAcc, badges, eventsHosted, eventsAttended };
  });

  // TODO: add error state
  if (error) return <p>{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      {isUserLoading ? (
        // TODO: add loading state
        <p>Loading...</p>
      ) : (
        userData && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <Image
                      src={userData.userAcc.data.image}
                      alt="Profile"
                      className="rounded-full"
                      width={80}
                      height={80}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">
                        {userData.userAcc.data.name}
                      </h1>
                    </div>
                    {isProfileLoading ? (
                      // TODO: add loading state
                      <p>Loading...</p>
                    ) : (
                      profileData && (
                        <div className="mt-2 flex gap-6">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{profileData.eventsHosted}</strong> Hosted
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{profileData.eventsAttended}</strong>{' '}
                              Attended
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {isProfileLoading ? (
        // TODO: add loading state
        <p>Loading...</p>
      ) : (
        profileData && (
          <div>
            {profileData.badges.length ? (
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Badges Collection
                </h2>
                <div className="grid grid-cols-6">
                  {profileData.badges.map(
                    ({
                      pda,
                      name,
                      image,
                    }: {
                      pda: string;
                      name: string;
                      image: string;
                    }) => (
                      <TooltipProvider key={pda}>
                        <Tooltip>
                          <TooltipTrigger asChild className="cursor-default">
                            <div>
                              <Image
                                src={image}
                                alt={name}
                                width={80}
                                height={80}
                                className="rounded-xl"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              <strong>{name}</strong>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  )}
                </div>
              </div>
            ) : (
              <h2 className="mt-12 text-center text-xl font-bold">
                No badges collected
              </h2>
            )}
          </div>
        )
      )}
    </div>
  );
}
