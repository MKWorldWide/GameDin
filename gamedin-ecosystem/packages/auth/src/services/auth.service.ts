import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '@gamedin/shared/types/user';
import { TokenService } from './token.service';
import { authConfig } from '../config/auth.config';

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  username: string;
  password: string;
  displayName?: string;
};

export class AuthService {
  // In a real application, this would be a database model
  private static users: Map<string, User> = new Map();

  static async register(data: RegisterData): Promise<{ user: User; token: string }> {
    // Check if user already exists
    if (Array.from(this.users.values()).some(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }

    if (Array.from(this.users.values()).some(u => u.username === data.username)) {
      throw new Error('Username is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, authConfig.SALT_ROUNDS);

    // Create user
    const user: User = {
      id: uuidv4(),
      email: data.email,
      username: data.username,
      displayName: data.displayName || data.username,
      password: hashedPassword,
      role: UserRole.Enum.PLAYER,
      settings: {},
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user (in-memory for this example)
    this.users.set(user.id, user);

    // Generate tokens
    const token = TokenService.generateAccessToken(user);

    return { user, token };
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = Array.from(this.users.values()).find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.users.set(user.id, user);

    // Generate tokens
    const token = TokenService.generateAccessToken(user);

    return { user, token };
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const payload = TokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const user = this.users.get(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const token = TokenService.generateAccessToken(user);

    return { token };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, authConfig.SALT_ROUNDS);
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
  }

  static async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return { resetToken: '' };
    }

    const resetToken = TokenService.generatePasswordResetToken(user.id);
    // In a real app, you would send an email with a reset link
    return { resetToken };
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = TokenService.verifyPasswordResetToken(token);
    if (!payload) {
      throw new Error('Invalid or expired reset token');
    }

    const user = this.users.get(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, authConfig.SALT_ROUNDS);
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
  }

  // Helper method for testing
  static clearUsers() {
    this.users.clear();
  }
}
