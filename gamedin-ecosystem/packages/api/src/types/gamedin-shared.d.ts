declare module '@gamedin/shared/types/user' {
  export interface User {
    id: string;
    email: string;
    name?: string;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  export type UserRole = 'admin' | 'user' | 'guest';
}

declare module '@gamedin/shared' {
  export * from '@gamedin/shared/types/user';
  // Add other shared types as needed
}
