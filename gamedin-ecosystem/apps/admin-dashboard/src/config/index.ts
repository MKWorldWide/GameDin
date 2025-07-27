// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// MKWW Studio Integration
export const MKWW_STUDIO_CONFIG = {
  BASE_URL: process.env.REACT_APP_MKWW_STUDIO_URL || 'https://mkww.studio',
  API_PREFIX: '/api/v1',
  AUTH_HEADER: 'X-MKWW-API-Key',
  ENDPOINTS: {
    VERIFY_TOKEN: '/auth/verify',
    USER_PROFILE: '/users/me',
    SYNC_USERS: '/sync/users',
    SYNC_ANALYTICS: '/sync/analytics',
  },
};

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'gamedin_admin_token',
  REFRESH_TOKEN_KEY: 'gamedin_admin_refresh_token',
  TOKEN_EXPIRY_KEY: 'gamedin_admin_token_expiry',
  USER_KEY: 'gamedin_admin_user',
};

// Default date format
// Default date format
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM d, yyyy';
export const DISPLAY_DATE_TIME_FORMAT = 'MMM d, yyyy h:mm a';

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

// Roles and Permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPPORT: 'support',
  ANALYST: 'analyst',
};

export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',
  
  // System Settings
  MANAGE_SETTINGS: 'manage_settings',
  
  // Content Management
  MANAGE_CONTENT: 'manage_content',
};

// Role to Permissions Mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.MANAGE_CONTENT,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_CONTENT,
  ],
  [ROLES.SUPPORT]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
  ],
  [ROLES.ANALYST]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
  ],
};

// Default theme settings
export const DEFAULT_THEME = {
  palette: {
    primary: {
      main: '#6C63FF',
      light: '#9C94FF',
      dark: '#4A42CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6584',
      light: '#FF95A8',
      dark: '#CC4F69',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
      disabled: '#A0AEC0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.06),0px 1px 1px 0px rgba(0,0,0,0.042),0px 1px 3px 0px rgba(0,0,0,0.036)',
    '0px 3px 1px -2px rgba(0,0,0,0.06),0px 2px 2px 0px rgba(0,0,0,0.042),0px 1px 5px 0px rgba(0,0,0,0.036)',
    // Add more shadow variants as needed
  ],
};
