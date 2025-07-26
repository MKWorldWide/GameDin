export * from './services/auth.service';
export * from './services/token.service';
export * from './config/auth.config';

// Re-export shared types
export * from '@gamedin/shared/types/user';

// Initialize default admin user if needed in development
if (process.env.NODE_ENV !== 'production') {
  import('./services/auth.service').then(({ AuthService }) => {
    // This is just for development purposes
    if (!process.env.SKIP_DEFAULT_USER) {
      try {
        AuthService.register({
          email: 'admin@gamedin.com',
          username: 'admin',
          password: 'admin123',
          displayName: 'Admin User',
        });
        console.log('Default admin user created');
      } catch (error) {
        // User already exists or other error
        console.log('Default admin user already exists');
      }
    }
  });
}
