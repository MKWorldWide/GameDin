/**
 * Validation Utility
 * 
 * This utility provides form validation using Zod schemas.
 * It includes predefined schemas for common input types
 * and helper functions for form validation.
 */

import { z } from 'zod';

// ========== Basic Input Schemas ==========

/**
 * Email validation schema
 * - Must be a valid email format
 * - Normalized to lowercase
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .transform(val => val.toLowerCase().trim());

/**
 * Username validation schema
 * - 3-20 characters
 * - Alphanumeric with underscores and hyphens only
 * - Must start with a letter
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username cannot exceed 20 characters')
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    'Username must start with a letter and contain only letters, numbers, underscores, and hyphens'
  )
  .transform(val => val.trim());

/**
 * Password validation schema
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Optional special character requirement
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    'Password must include at least one uppercase letter, one lowercase letter, and one number'
  );

/**
 * Confirmation password validation schema
 * - Must match the password field
 */
export const confirmPasswordSchema = (passwordField: string) =>
  z.string().refine(val => val === passwordField, {
    message: 'Passwords do not match'
  });

/**
 * Display name validation schema
 * - 2-30 characters
 * - Allows letters, numbers, spaces, and common punctuation
 */
export const displayNameSchema = z
  .string()
  .min(2, 'Display name must be at least 2 characters')
  .max(30, 'Display name cannot exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9\s.,'-]+$/,
    'Display name can only contain letters, numbers, spaces, and basic punctuation'
  )
  .transform(val => val.trim());

/**
 * Bio/About validation schema
 * - Up to 500 characters
 */
export const bioSchema = z
  .string()
  .max(500, 'Bio cannot exceed 500 characters')
  .optional()
  .transform(val => val?.trim() || '');

// ========== Form Schemas ==========

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

/**
 * Registration form schema
 */
export const registrationFormSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: displayNameSchema.optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' })
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema,
  email: emailSchema.optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional()
}).refine(data => {
  // If any password field is filled, all password fields must be filled
  const { currentPassword, newPassword, confirmNewPassword } = data;
  const somePasswordFieldFilled = currentPassword || newPassword || confirmNewPassword;
  const allPasswordFieldsFilled = currentPassword && newPassword && confirmNewPassword;
  
  return !somePasswordFieldFilled || allPasswordFieldsFilled;
}, {
  message: 'All password fields are required to change your password',
  path: ['currentPassword']
}).refine(data => {
  // If password fields are filled, new password must match confirmation
  const { newPassword, confirmNewPassword } = data;
  return !newPassword || newPassword === confirmNewPassword;
}, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword']
}).refine(data => {
  // If changing password, validate the new password format
  const { newPassword } = data;
  
  if (!newPassword) return true;
  
  try {
    passwordSchema.parse(newPassword);
    return true;
  } catch (error) {
    return false;
  }
}, {
  message: 'New password must include at least one uppercase letter, one lowercase letter, and one number',
  path: ['newPassword']
});

/**
 * Message submission schema
 */
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long (max 2000 characters)'),
  attachments: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['image', 'video', 'audio', 'file']),
      url: z.string().url(),
      name: z.string(),
      size: z.number().positive(),
      mimeType: z.string()
    })
  ).optional()
});

/**
 * Conversation creation schema
 */
export const conversationSchema = z.object({
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  participantIds: z.array(z.string()).min(1, 'At least one participant is required')
});

/**
 * Rate limiting and spam prevention schema
 * - For validating user actions against rate limits
 */
export const rateCheckSchema = z.object({
  userId: z.string(),
  action: z.enum(['message', 'friend_request', 'conversation_create']),
  timestamp: z.number()
});

// ========== Validation Helper Functions ==========

/**
 * Type for validation results
 */
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  errorMessage?: string;
};

/**
 * Validate data against a schema
 */
export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      success: true,
      data: validData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert ZodError to a more usable format
      const errors: Record<string, string> = {};
      
      for (const issue of error.errors) {
        const path = issue.path.join('.');
        errors[path || 'form'] = issue.message;
      }
      
      return {
        success: false,
        errors,
        errorMessage: error.errors[0]?.message || 'Validation failed'
      };
    }
    
    // Handle non-Zod errors
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Validate a form asynchronously
 * - Useful for forms with async validation (e.g., checking if a username is taken)
 */
export async function validateFormAsync<T>(
  schema: z.ZodType<T>,
  data: unknown,
  asyncValidators?: Array<(data: T) => Promise<ValidationResult<T>>>
): Promise<ValidationResult<T>> {
  // First validate with schema
  const result = validateSchema(schema, data);
  
  if (!result.success || !result.data || !asyncValidators) {
    return result;
  }
  
  // Run async validators
  for (const validator of asyncValidators) {
    const asyncResult = await validator(result.data);
    
    if (!asyncResult.success) {
      return {
        success: false,
        data: result.data,
        errors: asyncResult.errors,
        errorMessage: asyncResult.errorMessage
      };
    }
  }
  
  return result;
}

/**
 * Check if a field has an error
 */
export function hasError(errors: Record<string, string> | undefined, field: string): boolean {
  return !!errors && !!errors[field];
}

/**
 * Get error message for a field
 */
export function getErrorMessage(errors: Record<string, string> | undefined, field: string): string | undefined {
  return errors?.[field];
}

/**
 * Validate email uniqueness
 */
export async function validateEmailUnique(email: string): Promise<ValidationResult<string>> {
  try {
    // Replace with actual API call
    const response = await fetch(`/api/validate/email?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (!data.available) {
      return {
        success: false,
        errors: { email: 'This email is already in use' },
        errorMessage: 'This email is already in use'
      };
    }
    
    return { success: true, data: email };
  } catch (error) {
    return {
      success: false,
      errorMessage: 'Could not verify email availability'
    };
  }
}

/**
 * Validate username uniqueness
 */
export async function validateUsernameUnique(username: string): Promise<ValidationResult<string>> {
  try {
    // Replace with actual API call
    const response = await fetch(`/api/validate/username?username=${encodeURIComponent(username)}`);
    const data = await response.json();
    
    if (!data.available) {
      return {
        success: false,
        errors: { username: 'This username is already taken' },
        errorMessage: 'This username is already taken'
      };
    }
    
    return { success: true, data: username };
  } catch (error) {
    return {
      success: false,
      errorMessage: 'Could not verify username availability'
    };
  }
}

/**
 * Check rate limit for actions
 */
export async function checkRateLimit(
  userId: string,
  action: 'message' | 'friend_request' | 'conversation_create'
): Promise<ValidationResult<boolean>> {
  try {
    // Replace with actual API call
    const response = await fetch('/api/ratelimit/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        timestamp: Date.now()
      })
    });
    
    const data = await response.json();
    
    if (!data.allowed) {
      return {
        success: false,
        errorMessage: data.message || `You've reached the rate limit for this action. Please try again later.`
      };
    }
    
    return { success: true, data: true };
  } catch (error) {
    // In case of error, allow the action but log the issue
    console.error('Rate limit check failed:', error);
    return { success: true, data: true };
  }
}

export default {
  validateSchema,
  validateFormAsync,
  hasError,
  getErrorMessage,
  validateEmailUnique,
  validateUsernameUnique,
  checkRateLimit,
  schemas: {
    login: loginFormSchema,
    registration: registrationFormSchema,
    profileUpdate: profileUpdateSchema,
    message: messageSchema,
    conversation: conversationSchema
  }
}; 