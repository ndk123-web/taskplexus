// Application constants
export const APP_NAME = 'TaskPlexus';
export const VERSION = '1.0.0';

// API Constants
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080';
export const API_TIMEOUT = 10000;

// UI Constants
export const DRAWER_WIDTH = 240;
export const HEADER_HEIGHT = 64;

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  SETTINGS: '/settings',
  FLOWCHART: '/flowchart',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;