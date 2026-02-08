/**
 * Session Management Types
 */

export interface SessionData {
  id: string;
  scansRemaining: number;
  createdAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
}

export interface SessionStatus {
  isValid: boolean;
  scansRemaining: number;
  expiresAt: number;
  canScan: boolean;
}

export const SESSION_CONFIG = {
  MAX_SCANS: 3,
  DURATION_HOURS: 24,
  COOKIE_NAME: 'legal_analyzer_session',
} as const;
