'use client';

import { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { ProfileProvider } from '../providers/ProfileProvider';
import { CLUSTER, CONNECTION } from '@/lib/solana-client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { wrappedFetch } from '@/lib/api';
import { UserProvider } from '@/providers/UserProvider';
import { AllUsersProvider } from '@/providers/UsersProvider';
import { EventsProvider } from '@/providers/EventsProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        return await wrappedFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/${queryKey.join('/')}`
        );
      },
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
      config={{
        appearance: {
          showWalletLoginFirst: true,
          walletChainType: 'solana-only',
          logo: '/branding/stacked_logo.png',
          landingHeader: 'Log In / Sign Up',
        },
        loginMethods: [
          'wallet',
          'email',
          'github',
          'google',
          'discord',
          'twitter',
          'passkey',
        ],
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(),
          },
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        solanaClusters: [
          {
            name: CLUSTER,
            rpcUrl: CONNECTION.rpcEndpoint,
          },
        ],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <ProfileProvider>
          <UserProvider>
            <AllUsersProvider>
              <EventsProvider>{children}</EventsProvider>
            </AllUsersProvider>
          </UserProvider>
        </ProfileProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
