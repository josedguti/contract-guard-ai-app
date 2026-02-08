import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session/session-manager';

/**
 * Initialize new session
 * POST /api/session/init
 */
export async function POST() {
  try {
    const session = await SessionManager.createSession();

    return NextResponse.json({
      success: true,
      session: {
        scansRemaining: session.scansRemaining,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
