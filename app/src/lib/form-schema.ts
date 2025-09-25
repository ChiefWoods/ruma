import { z } from 'zod';
import { capitalizeFirstLetter, milliToUnix } from './utils';

const MIN_STRING_LENGTH = 3;
const MAX_USER_NAME_LENGTH = 32;

const u32Max = 4294967295;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
];

const zCommonString = (
  field: string,
  minLength: number = MIN_STRING_LENGTH,
  maxLength?: number
) => {
  const baseSchema = z
    .string()
    .min(
      minLength,
      `${capitalizeFirstLetter(field)} must be at least ${minLength} characters.`
    );

  if (maxLength) {
    return baseSchema.max(
      maxLength,
      `${capitalizeFirstLetter(field)} must be less than ${maxLength} characters.`
    );
  }

  return baseSchema;
};

const zImage = z
  .any()
  .optional()
  .refine((file: File) => {
    return file ? ACCEPTED_IMAGE_TYPES.includes(file.type) : true;
  }, 'Only file types of .jpg, .jpeg, .png and .svg formats are supported.');

const zTimestamp = (field: string) => {
  const capitalizedField = capitalizeFirstLetter(field);

  return z
    .number()
    .int(`${capitalizedField} must be a valid timestamp.`)
    .min(
      milliToUnix(Date.now()),
      `${capitalizedField} must be a valid timestamp.`
    )
    .max(u32Max, `${capitalizedField} must be less than ${u32Max}.`);
};

export const createProfileSchema = z.object({
  name: zCommonString('name', undefined, MAX_USER_NAME_LENGTH),
  image: zImage,
});

export const createEventSchema = z.object({
  eventName: zCommonString('event name'),
  eventImage: zImage,
  capacity: z
    .number()
    .int('Capacity must be an integer.')
    .min(1, 'Capacity must be at least 1.')
    .max(u32Max, `Capacity must be less than ${u32Max}.`)
    .optional(),
  about: z.string().optional(),
  approvalRequired: z.boolean(),
  isPublic: z.boolean(),
  badgeName: zCommonString('badge name'),
  badgeImage: zImage,
  location: zCommonString('location', 3),
  startTimestamp: zTimestamp('start timestamp').optional(),
  endTimestamp: zTimestamp('end timestamp'),
});

export type CreateProfileFormData = z.infer<typeof createProfileSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;

export function validateStartEndTimestamp(
  startTimestamp: number,
  endTimestamp?: number
): boolean {
  if (endTimestamp && startTimestamp > endTimestamp) {
    return false;
  }

  return true;
}
