declare module '@gamedin/auth' {
  export const authConfig: {
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
  };

  export class AuthService {
    static generateToken(userId: string, roles: string[]): string;
    static verifyToken(token: string): { userId: string; roles: string[] };
  }
}
