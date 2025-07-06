/**
 * Application Configuration
 *
 * This file centralizes all configuration settings for the GameDin application.
 * It handles different environments (development, staging, production),
 * feature flags, API endpoints, and global application settings.
 *
 * Using this centralized approach makes it easier to:
 * - Manage environment-specific configurations
 * - Toggle features on/off
 * - Change API endpoints without modifying code
 * - Maintain consistent timeout and cache durations
 */

// Environment determination
const ENV = {
  DEV: process.env.NODE_ENV === 'development',
  STAGING: process.env.REACT_APP_ENV === 'staging',
  PROD: process.env.NODE_ENV === 'production' && process.env.REACT_APP_ENV !== 'staging',
};

// API URLs for different environments
const API_URLS = {
  development: 'http://localhost:3001/api',
  staging: 'https://staging-api.gamedin.app/api',
  production: 'https://api.gamedin.app/api',
};

// WebSocket URLs for different environments
const WS_URLS = {
  development: 'ws://localhost:3001/ws',
  staging: 'wss://staging-api.gamedin.app/ws',
  production: 'wss://api.gamedin.app/ws',
};

// Determine the current API base URL
const getApiBaseUrl = (): string => {
  if (ENV.DEV) return API_URLS.development;
  if (ENV.STAGING) return API_URLS.staging;
  return API_URLS.production;
};

// Determine the current WebSocket URL
const getWsUrl = (): string => {
  if (ENV.DEV) return WS_URLS.development;
  if (ENV.STAGING) return WS_URLS.staging;
  return WS_URLS.production;
};

// Feature flags - enable/disable features based on environment
const FEATURES = {
  // Core features
  OFFLINE_MODE: true,
  PWA_ENABLED: !ENV.DEV, // Enable PWA in staging and production only
  ANALYTICS: ENV.STAGING || ENV.PROD, // Enable analytics in staging and production only

  // Authentication features
  OAUTH_GOOGLE: true,
  OAUTH_DISCORD: true,
  OAUTH_FACEBOOK: true,

  // Advanced features
  AI_RECOMMENDATIONS: ENV.STAGING || ENV.PROD, // AI features only in staging and production
  REAL_TIME_CHAT: true,
  GAME_SESSIONS: true,
  NOTIFICATIONS: true,

  // Experimental features
  EXPERIMENTAL_VOICE_CHAT: ENV.DEV || ENV.STAGING, // Only in dev and staging
  EXPERIMENTAL_GROUP_EVENTS: ENV.DEV, // Only in dev
};

// Performance and caching settings
const PERFORMANCE = {
  // Caching durations (in milliseconds)
  CACHE_DURATION: {
    USER_PROFILE: 30 * 60 * 1000, // 30 minutes
    GAME_DATA: 24 * 60 * 60 * 1000, // 24 hours
    MESSAGES: 15 * 60 * 1000, // 15 minutes
    SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
  },

  // API request timeouts (in milliseconds)
  TIMEOUTS: {
    DEFAULT: 10000, // 10 seconds
    LONG: 30000, // 30 seconds for longer operations
    FILE_UPLOAD: 60000, // 60 seconds for file uploads
  },

  // Polling intervals (in milliseconds)
  POLLING: {
    NOTIFICATIONS: 60000, // 1 minute
    ONLINE_STATUS: 30000, // 30 seconds
  },

  // Rate limiting (to prevent API abuse)
  RATE_LIMITS: {
    MESSAGE_SEND: 5, // Max 5 messages per second
    SEARCH_REQUESTS: 10, // Max 10 search requests per minute
    API_REQUESTS: 100, // Max 100 API requests per minute
  },
};

// Application theme settings
const THEME = {
  // Color scheme
  COLORS: {
    PRIMARY: '#6200EA',
    SECONDARY: '#03DAC6',
    BACKGROUND: '#181818',
    SURFACE: '#2D2D2D',
    ERROR: '#CF6679',
    SUCCESS: '#00C853',
    WARNING: '#FFAB00',
    INFO: '#2196F3',
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_SECONDARY: '#B0B0B0',
  },

  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },

  // Responsive breakpoints (in pixels)
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920,
  },
};

// Authentication settings
const AUTH = {
  TOKEN_REFRESH_BEFORE_EXPIRY: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5, // Maximum login attempts before temporary lockout
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes lockout after max attempts
};

// Validation constraints
const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_LOWERCASE: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  MESSAGE: {
    MAX_LENGTH: 2000,
  },
  GAME_SESSION: {
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
  },
};

// Application metadata
const APP_META = {
  NAME: 'GameDin',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  COPYRIGHT: `© ${new Date().getFullYear()} GameDin`,
  CONTACT_EMAIL: 'support@gamedin.app',
  SOCIAL: {
    TWITTER: 'https://twitter.com/gamedin',
    DISCORD: 'https://discord.gg/gamedin',
    INSTAGRAM: 'https://instagram.com/gamedin',
  },
};

// IndexedDB configuration
const INDEXED_DB = {
  VERSION: 1,
  NAME: 'GameDinDB',
  MAX_AGE: {
    DEFAULT: 7 * 24 * 60 * 60 * 1000, // 7 days
    USER_DATA: 30 * 24 * 60 * 60 * 1000, // 30 days
    MESSAGES: 14 * 24 * 60 * 60 * 1000, // 14 days
  },
};

// Export the complete configuration object
export const config = {
  ENV,
  apiBaseUrl: getApiBaseUrl(),
  wsUrl: getWsUrl(),
  FEATURES,
  PERFORMANCE,
  THEME,
  AUTH,
  VALIDATION,
  APP_META,
  INDEXED_DB,

  // Helper method to check if a feature is enabled
  isFeatureEnabled: (featureName: keyof typeof FEATURES): boolean => {
    return FEATURES[featureName] || false;
  },

  // Helper method to get a themed value
  getThemeValue: (category: keyof typeof THEME, value: string): any => {
    return THEME[category][value];
  },

  // Helper to get environment-specific values
  getEnvValue: <T>(devValue: T, stagingValue: T, prodValue: T): T => {
    if (ENV.DEV) return devValue;
    if (ENV.STAGING) return stagingValue;
    return prodValue;
  },
};

export default config;
