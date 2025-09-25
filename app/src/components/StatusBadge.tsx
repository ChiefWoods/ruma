import { capitalizeFirstLetter, cn } from '@/lib/utils';
import { ParsedTicketStatus } from '@/types/accounts';
import { Badge } from './ui/badge';
import { cva } from 'class-variance-authority';

const badgeVariants = cva('', {
  variants: {
    status: {
      approved: 'bg-approved hover:bg-approved',
      checkedIn: 'bg-checkIn hover:bg-checkIn',
      pending: 'bg-pending hover:bg-pending',
      rejected: 'bg-rejected hover:bg-rejected',
    },
  },
});

export function StatusBadge({
  status,
  className,
}: {
  status: ParsedTicketStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(badgeVariants({ status }), className)}>
      {capitalizeFirstLetter(status)}
    </Badge>
  );
}
