'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface ProfileContextType {
  isCreateProfileDialogOpen: boolean;
  setIsCreateProfileDialogOpen: (isOpen: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType>(
  {} as ProfileContextType
);

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isCreateProfileDialogOpen, setIsCreateProfileDialogOpen] =
    useState<boolean>(false);

  return (
    <ProfileContext.Provider
      value={{ isCreateProfileDialogOpen, setIsCreateProfileDialogOpen }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
