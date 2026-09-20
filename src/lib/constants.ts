/**
 * @module constants
 * @description Centralized application constants.
 * Eliminates magic strings and numbers throughout the codebase.
 */

/** Navigation route definitions */
export const ROUTES = {
  SPOOL: '#/spool',
  PULSE: '#/pulse',
  BOARD: '#/board',
  CASE_FILES: '#/case-files',
} as const;

/** Route labels for navigation UI */
export const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.SPOOL]: 'Spool',
  [ROUTES.PULSE]: 'Pulse',
  [ROUTES.BOARD]: 'Board',
  [ROUTES.CASE_FILES]: 'Case Files',
};

/** Year boundaries of the dataset */
export const YEAR_MIN = 2013;
export const YEAR_MAX = 2024;

/** CSS breakpoint values (px) — mirrors index.css media queries */
export const BREAKPOINTS = {
  SM: 480,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

/** Virtualizer configuration */
export const VIRTUAL_CONFIG = {
  RECEIPT_HEIGHT: 130,
  OVERSCAN: 10,
} as const;

/** Application metadata */
export const APP_META = {
  TITLE: 'Paper Trail',
  SUBTITLE: 'Your Life, In Receipts',
  DESCRIPTION: 'An interactive data story visualising 152,000+ digital life receipts spanning 12 years of Spotify plays and household transactions.',
} as const;
