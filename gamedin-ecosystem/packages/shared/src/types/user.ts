import { z } from 'zod';

export const UserRoleSchema = z.enum(['PLAYER', 'CREATOR', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('dark'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    inApp: z.boolean().default(true),
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    activityVisible: z.boolean().default(true),
  }),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  role: UserRoleSchema.default('PLAYER'),
  settings: UserSettingsSchema.default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLogin: z.string().datetime().optional(),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;
