'use client';

import { Button } from './ui/button';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import {
  cn,
  copyAddress,
  formatNameAsParam,
  truncateAddress,
} from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Copy, CopyCheck, User } from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Avatar, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useProfile } from '../providers/ProfileProvider';
import { useUser } from '@/providers/UserProvider';
import { Skeleton } from './ui/skeleton';

const WrappedButton = forwardRef<
  ElementRef<typeof Button>,
  ComponentPropsWithoutRef<typeof Button>
>(({ children, ...props }, ref) => {
  return (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  );
});

WrappedButton.displayName = 'WrappedButton';

export function WalletButton() {
  const router = useRouter();
  const { authenticated, user, login, logout } = usePrivy();
  const { exportWallet } = useSolanaWallets();
  const { setIsCreateProfileDialogOpen } = useProfile();
  const { userData, userLoading } = useUser();
  const [copied, setCopied] = useState<boolean>(false);

  function handleCopy(e: MouseEvent) {
    e.preventDefault();

    if (!user?.wallet) {
      throw new Error('User not signed in.');
    }

    copyAddress(user.wallet.address);
    setCopied(true);
  }

  async function handleExport(e: Event) {
    e.preventDefault();

    try {
      await exportWallet();
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    }
  }

  function handleProfile() {
    if (userData) {
      router.push(`/users/${formatNameAsParam(userData.name)}`);
    } else {
      setIsCreateProfileDialogOpen(true);
    }
  }

  const avatarImage = useMemo(() => {
    if (userLoading) {
      return <Skeleton className="w-6 h-6 rounded-full" />;
    }

    const userIcon = <User size={16} className="text-primary/50" />;

    if (!userData?.image) {
      return userIcon;
    }

    try {
      // check if image is valid URL
      const url = new URL(userData.image);
      return <AvatarImage src={url.href} alt={userData.name} />;
    } catch {
      return userIcon;
    }
  }, [userData, userLoading]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return authenticated && user?.wallet ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <WrappedButton
          className="flex items-center px-3 py-4 rounded-full cursor-pointer aspect-square size-8 focus-visible:ring-0 hover:bg-primary/10 transition-colors"
          variant={'ghost'}
        >
          <Avatar className="size-6 flex items-center justify-center">
            {avatarImage}
          </Avatar>
        </WrappedButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="end">
        <DropdownMenuItem
          className={cn(
            'flex items-center justify-center gap-x-2 cursor-pointer'
          )}
          onSelect={handleProfile}
        >
          <Avatar className="flex items-center justify-center">
            {avatarImage}
          </Avatar>
          <div className="flex flex-col w-full items-start">
            {userLoading ? (
              <Skeleton className="w-3/5 h-5" />
            ) : (
              userData && (
                <p className="truncate font-semibold">{userData.name}</p>
              )
            )}
            <Button
              variant={'ghost'}
              className="flex items-center gap-x-2 cursor-pointer aspect-square p-0! h-6 group hover:bg-transparent"
              onClick={handleCopy}
            >
              <p className="text-muted-foreground group-hover:text-primary transition-colors text-xs">
                {truncateAddress(user.wallet.address)}
              </p>
              {copied ? (
                <CopyCheck size={3} className="text-green-500" />
              ) : (
                <Copy
                  size={3}
                  className="text-primary/50 group-hover:text-primary transition-colors"
                />
              )}
            </Button>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-sm"
          onSelect={handleProfile}
        >
          {userData ? 'View' : 'Create'} Profile
        </DropdownMenuItem>
        {user.wallet.walletClientType === 'privy' && (
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onSelect={handleExport}
          >
            Export Wallet
          </DropdownMenuItem>
        )}
        {userData && (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => router.push('/settings')}
          >
            Settings
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer text-sm" onSelect={logout}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button
      onClick={login}
      size={'sm'}
      variant={'outline'}
      className="rounded-full cursor-pointer transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
    >
      Sign In
    </Button>
  );
}
