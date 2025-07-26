import jwt from 'jsonwebtoken';
import { User } from '@gamedin/shared/types/user';
import { authConfig } from '../config/auth.config';

type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

export class TokenService {
  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, authConfig.JWT_SECRET, {
      expiresIn: authConfig.JWT_EXPIRES_IN,
    });
  }

  static generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, authConfig.REFRESH_TOKEN_SECRET, {
      expiresIn: authConfig.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, authConfig.JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, authConfig.REFRESH_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  static generatePasswordResetToken(userId: string): string {
    return jwt.sign({ userId }, authConfig.JWT_SECRET, {
      expiresIn: authConfig.PASSWORD_RESET_EXPIRES_IN,
    });
  }

  static verifyPasswordResetToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, authConfig.JWT_SECRET) as { userId: string };
    } catch (error) {
      return null;
    }
  }
}
