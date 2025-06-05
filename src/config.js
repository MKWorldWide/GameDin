/**
 * Configuration file for AWS Amplify.
 * Uses environment variables for sensitive data.
 */
const config = {
  Auth: {
    region: process.env.VITE_AWS_REGION || 'us-east-1',
    userPoolId: process.env.VITE_USER_POOL_ID,
    userPoolWebClientId: process.env.VITE_USER_POOL_WEB_CLIENT_ID,
    mandatorySignIn: true,
    cookieStorage: {
      domain: process.env.VITE_COOKIE_DOMAIN || 'localhost',
      path: '/',
      expires: 365,
      secure: process.env.NODE_ENV === 'production'
    }
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: process.env.VITE_API_URL || 'http://localhost:4000'
      }
    ]
  }
};

export default config; 