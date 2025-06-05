import { IUserProfile } from '../types/user';
import { ValidationResult } from '../types/utilities';

// Basic type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;
export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);
export const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;

// Complex type guards
export const isUserProfile = (obj: unknown): obj is IUserProfile => {
  return (
    isObject(obj) &&
    'username' in obj &&
    'email' in obj &&
    'bio' in obj &&
    'avatarUrl' in obj &&
    'status' in obj
  );
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): ValidationResult<string> => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? password : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
};

// Type assertion with runtime validation
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  message = 'Type assertion failed'
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(message);
  }
}

// Array type guards
export const isArrayOfType = <T>(arr: unknown, guard: (item: unknown) => item is T): arr is T[] => {
  return Array.isArray(arr) && arr.every(guard);
};

// Object type guards
export const hasProperty = <T extends object, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> => {
  return prop in obj;
};

// Async type guards
export const isValidUserProfileAsync = async (
  obj: unknown
): Promise<ValidationResult<IUserProfile>> => {
  if (!isUserProfile(obj)) {
    return {
      isValid: false,
      errors: ['Invalid user profile structure'],
    };
  }

  const errors: string[] = [];

  if (!validateEmail(obj.email)) {
    errors.push('Invalid email format');
  }

  // Add more async validations as needed

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? obj : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
};

// Type guard composition helper
export const composeGuards = <T>(
  ...guards: ((value: unknown) => value is T)[]
): ((value: unknown) => value is T) => {
  return (value: unknown): value is T => guards.every(guard => guard(value));
};

// Nullable type guard
export const isNullable = <T>(guard: (value: unknown) => value is T) => {
  return (value: unknown): value is T | null => value === null || guard(value);
};

// Optional type guard
export const isOptional = <T>(guard: (value: unknown) => value is T) => {
  return (value: unknown): value is T | undefined => value === undefined || guard(value);
};
