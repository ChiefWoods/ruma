import { clsx, type ClassValue } from 'clsx';
import { formatInTimeZone } from 'date-fns-tz';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, length: number = 4): string {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function copyAddress(address: string) {
  try {
    await navigator.clipboard.writeText(address);
  } catch (err) {
    console.error(err);
  }
}

export function formatDateToTimezone(currentTime: Date) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeString = formatInTimeZone(currentTime, timeZone, 'h:mm a');
  const offsetHours = -currentTime.getTimezoneOffset() / 60;
  const offsetString =
    offsetHours >= 0 ? `GMT+${offsetHours}` : `GMT${offsetHours}`;

  return `${timeString} ${offsetString}`;
}

export function unixToMilli(unixTimestamp: number): number {
  return unixTimestamp * 1000;
}

export function milliToUnix(milliTimestamp: number): number {
  return Math.floor(milliTimestamp / 1000);
}

export function formatTimestamp(unixTimestamp: number): string {
  const date = new Date(unixToMilli(unixTimestamp));

  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return (
    date
      // @ts-expect-error toLocaleDateString typing issue
      .toLocaleDateString('en-US', options)
      .replace(',', ', ')
      .replace(' at ', ', ')
  );
}

export function formatTimestampToTime(unixTimestamp: number) {
  const date = new Date(unixToMilli(unixTimestamp));

  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  // @ts-expect-error toLocaleDateString typing issue
  return date.toLocaleTimeString('en-US', options);
}

export function formatNameAsParam(name: string): string {
  return name.replace(/\s+/g, '-');
}

export function removeDashesFromParam(param: string): string {
  return param.replace(/-/g, ' ');
}
