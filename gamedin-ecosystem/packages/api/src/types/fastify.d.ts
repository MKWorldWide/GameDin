import { FastifyReply, FastifyRequest } from 'fastify';
import { JWT } from '@fastify/jwt';

// Define User interface
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  role: string;
  isVerified: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  password?: string; // For internal use only
}

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
    user: User; // Make user non-optional to match JWT type
  }

  // Extend the JWT type to include our user type
  interface JWT {
    user: User;
  }

  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'lax' | 'strict' | 'none' | boolean;
        maxAge: number;
        path: string;
      }
    ): FastifyReply;

    clearCookie(
      name: string,
      options?: {
        path: string;
      }
    ): FastifyReply;
  }
}

// AuthService type declarations
declare module '@gamedin/auth' {
  export class AuthService {
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static requestPasswordReset(email: string): Promise<void>;
    static resetPassword(token: string, newPassword: string): Promise<void>;
  }
}
