import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { redisStorage } from '../storage/redis.storage';
import { authConfig } from '../config/auth.config';
import { TokenService } from '@gamedin/auth';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import ejs from 'ejs';

const readFile = promisify(fs.readFile);

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesDir: string;
  private static instance: EmailService;

  private constructor() {
    // In production, you would configure this with your email provider
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });

    // Path to email templates
    this.templatesDir = path.join(__dirname, '../../templates/emails');
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send an email using a template
   */
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, template, context = {} } = options;
      
      // Load email template
      const templateContent = await this.loadTemplate(template, context);
      
      // Send email
      const info = await this.transporter.sendMail({
        from: `"GameDin" <${process.env.EMAIL_FROM || 'noreply@gamedin.gg'}>`,
        to,
        subject: subject || templateContent.subject,
        html: templateContent.html,
        text: templateContent.text,
      });

      console.log('Message sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send email verification email
   */
  public async sendVerificationEmail(userId: string, email: string, username: string): Promise<boolean> {
    try {
      // Generate verification token
      const token = TokenService.generateVerificationToken(userId);
      
      // Store token in Redis with 24h expiry
      await redisStorage.setVerificationToken(userId, token);
      
      // Send verification email
      return this.sendEmail({
        to: email,
        subject: 'Verify your GameDin account',
        template: 'verify-email',
        context: {
          username,
          verificationLink: `${authConfig.APP_URL}/verify-email?token=${token}`,
          token,
        },
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(userId: string, email: string, username: string): Promise<boolean> {
    try {
      // Generate password reset token
      const token = TokenService.generatePasswordResetToken(userId);
      
      // Store token in Redis with 1h expiry
      await redisStorage.setPasswordResetToken(userId, token);
      
      // Send password reset email
      return this.sendEmail({
        to: email,
        subject: 'Reset your GameDin password',
        template: 'reset-password',
        context: {
          username,
          resetLink: `${authConfig.APP_URL}/reset-password?token=${token}`,
          token,
        },
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  public async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to GameDin!',
      template: 'welcome',
      context: {
        username,
        appName: 'GameDin',
        supportEmail: 'support@gamedin.gg',
      },
    });
  }

  /**
   * Load and compile email template
   */
  private async loadTemplate(templateName: string, context: Record<string, any> = {}): Promise<EmailTemplate> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
      const template = await readFile(templatePath, 'utf8');
      
      // Compile template with context
      const html = ejs.render(template, {
        ...context,
        year: new Date().getFullYear(),
        appName: 'GameDin',
        appUrl: authConfig.APP_URL,
      });
      
      // Generate plain text version (simple HTML to text conversion)
      const text = html
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
      
      // Extract subject from template if available
      const subjectMatch = html.match(/<title>(.*?)<\/title>/i);
      const subject = subjectMatch ? subjectMatch[1] : `Message from GameDin`;
      
      return { subject, html, text };
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
