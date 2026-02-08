import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionData, SessionStatus, SESSION_CONFIG } from '@/types/session';

/**
 * Session Manager
 * Handles JWT-based session tracking for scan limits
 * Sessions last 24 hours and allow 3 scans per session
 */
export class SessionManager {
  private static readonly SECRET = new TextEncoder().encode(
    process.env.SESSION_SECRET || 'fallback-secret-min-32-chars-long'
  );

  /**
   * Create a new session with 3 available scans
   */
  static async createSession(): Promise<SessionData> {
    const now = Date.now();
    const sessionData: SessionData = {
      id: crypto.randomUUID(),
      scansRemaining: SESSION_CONFIG.MAX_SCANS,
      createdAt: now,
      expiresAt: now + SESSION_CONFIG.DURATION_HOURS * 60 * 60 * 1000,
    };

    // Create JWT
    const token = await new SignJWT({ ...sessionData } as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_CONFIG.DURATION_HOURS}h`)
      .sign(this.SECRET);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_CONFIG.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_CONFIG.DURATION_HOURS * 60 * 60,
      path: '/',
    });

    return sessionData;
  }

  /**
   * Get current session data
   */
  static async getSession(): Promise<SessionData | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;

      if (!token) {
        return null;
      }

      const verified = await jwtVerify(token, this.SECRET);
      const sessionData = verified.payload as unknown as SessionData;

      // Check if session is expired
      if (sessionData.expiresAt < Date.now()) {
        await this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Consume one scan from the session
   */
  static async consumeScan(): Promise<SessionData | null> {
    const session = await this.getSession();

    if (!session || session.scansRemaining <= 0) {
      return null;
    }

    // Decrement scans
    const updatedSession: SessionData = {
      ...session,
      scansRemaining: session.scansRemaining - 1,
    };

    // Create new JWT with updated data
    const token = await new SignJWT({ ...updatedSession } as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_CONFIG.DURATION_HOURS}h`)
      .sign(this.SECRET);

    // Update cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_CONFIG.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_CONFIG.DURATION_HOURS * 60 * 60,
      path: '/',
    });

    return updatedSession;
  }

  /**
   * Check if session has scans remaining
   */
  static async checkLimit(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null && session.scansRemaining > 0;
  }

  /**
   * Get session status
   */
  static async getStatus(): Promise<SessionStatus> {
    const session = await this.getSession();

    if (!session) {
      return {
        isValid: false,
        scansRemaining: 0,
        expiresAt: 0,
        canScan: false,
      };
    }

    return {
      isValid: true,
      scansRemaining: session.scansRemaining,
      expiresAt: session.expiresAt,
      canScan: session.scansRemaining > 0,
    };
  }

  /**
   * Clear session cookie
   */
  static async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
  }
}
