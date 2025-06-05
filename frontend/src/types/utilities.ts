// Basic type utilities
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T | null>;
export type ValidationResult<T> = {
  isValid: boolean;
  data?: T;
  errors?: string[];
};

// API response types
export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// Common domain types
export type Timestamp = number;
export type UUID = string;
export type ISO8601Date = string;

// Function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type ErrorCallback = (error: Error) => void;
export type SuccessCallback<T> = (data: T) => void;

// React specific types
export type ReactChildren = {
  children: React.ReactNode;
};

export type WithClassName = {
  className?: string;
};

export type WithStyle = {
  style?: React.CSSProperties;
};

// Form handling types
export type FormErrors<T> = {
  [K in keyof T]?: string[];
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

// Event handler types
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T> = (data: T) => void | Promise<void>;

// Generic record types
export type Dictionary<T> = {
  [key: string]: T;
};

export type Immutable<T> = {
  readonly [K in keyof T]: T[K];
};

// Type guards
export type TypeGuard<T> = (value: unknown) => value is T;
export type AsyncTypeGuard<T> = (value: unknown) => Promise<boolean>;

// Utility types for type manipulation
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
};

// Error handling types
export interface IApplicationError extends Error {
  code?: string;
  statusCode?: number;
  details?: unknown;
}

// State management types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface IAsyncState<T, E = string> {
  data: Nullable<T>;
  loading: boolean;
  error: Nullable<E>;
}

// Validation types
export interface IValidationRule<T> {
  validate: (value: T) => boolean | Promise<boolean>;
  message: string;
}

export interface IValidator<T> {
  rules: IValidationRule<T>[];
  validate: (value: T) => Promise<ValidationResult<T>>;
}
