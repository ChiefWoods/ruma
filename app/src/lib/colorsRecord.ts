import { RegistrationStatus } from '@/types/event';

export const statusColors: Record<RegistrationStatus, string> = {
  pending: 'bg-status-pending hover:bg-status-pending',
  approved: 'bg-status-approved hover:bg-status-approved',
  'checked-in': 'bg-status-checked-in hover:bg-status-checked-in',
  rejected: 'bg-status-rejected hover:bg-status-rejected',
};
