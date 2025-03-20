'use client';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  BitgetWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SalmonWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ReactNode, useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';
import { toast } from '@/hooks/use-toast';
import { CONNECTION } from '@/lib/constants';

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => CONNECTION.rpcEndpoint, []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BitgetWalletAdapter(),
      new SalmonWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect
        onError={() =>
          toast({
            title: 'Unable to connect wallet',
            description: 'Please try again or use a different wallet.',
            variant: 'destructive',
          })
        }
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
