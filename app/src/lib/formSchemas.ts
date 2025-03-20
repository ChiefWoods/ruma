import { z } from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_BADGE_NAME_LENGTH,
  MAX_BADGE_SYMBOL_LENGTH,
  MAX_EVENT_NAME_LENGTH,
  MAX_FILE_SIZE,
  MAX_USER_NAME_LENGTH,
  MIN_BADGE_NAME_LENGTH,
  MIN_BADGE_SYMBOL_LENGTH,
  MIN_EVENT_NAME_LENGTH,
  MIN_USER_NAME_LENGTH,
} from './constants';

function validateFileSize(file: File) {
  return file.size <= MAX_FILE_SIZE;
}

function validateFileType(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export const createProfileFormSchema = z.object({
  name: z
    .string()
    .min(MIN_USER_NAME_LENGTH, {
      message: `Name must be at least ${MIN_USER_NAME_LENGTH} characters.`,
    })
    .max(MAX_USER_NAME_LENGTH, {
      message: `Name must be less than ${MAX_USER_NAME_LENGTH} characters.`,
    }),
  profileImage: z
    .any()
    .refine(validateFileSize, {
      message: `Profile image must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    })
    .refine(validateFileType, {
      message: `Profile image must be a valid file type (${ACCEPTED_IMAGE_TYPES.join(', ')}).`,
    })
    .optional(),
});

export const createEventFormSchema = z.object({
  eventName: z
    .string()
    .min(MIN_EVENT_NAME_LENGTH, {
      message: `Event name must be at least ${MIN_EVENT_NAME_LENGTH} characters.`,
    })
    .max(MAX_EVENT_NAME_LENGTH, {
      message: `Event name must be less than ${MAX_EVENT_NAME_LENGTH} characters.`,
    }),
  eventImage: z
    .any()
    .refine(validateFileSize, {
      message: `Event image must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    })
    .refine(validateFileType, {
      message: `Event image must be a valid file type (${ACCEPTED_IMAGE_TYPES.join(', ')}).`,
    })
    .optional(),
  visibility: z.string(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable().optional(),
  location: z.string().min(1, {
    message: 'Location is required.',
  }),
  about: z.string(),
  requireApproval: z.boolean().default(false),
  capacity: z.number().nullable(),
  badgeName: z
    .string()
    .min(MIN_BADGE_NAME_LENGTH, {
      message: `Badge name must be at least ${MIN_BADGE_NAME_LENGTH} characters.`,
    })
    .max(MAX_BADGE_NAME_LENGTH, {
      message: `Badge name must be less than ${MAX_BADGE_NAME_LENGTH} characters.`,
    }),
  badgeSymbol: z
    .string()
    .min(MIN_BADGE_SYMBOL_LENGTH, {
      message: `Badge symbol must be at least ${MIN_BADGE_SYMBOL_LENGTH} characters.`,
    })
    .max(MAX_BADGE_SYMBOL_LENGTH, {
      message: `Badge symbol must be less than ${MAX_BADGE_SYMBOL_LENGTH} characters.`,
    }),
  badgeImage: z
    .any()
    .refine(validateFileSize, {
      message: `Badge image must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    })
    .refine(validateFileType, {
      message: `Badge image must be a valid file type (${ACCEPTED_IMAGE_TYPES.join(', ')}).`,
    })
    .optional(),
});

export const statusFormSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    message: 'Status must be either "approved" or "rejected".',
  }),
});
