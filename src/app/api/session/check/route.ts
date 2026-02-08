import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session/session-manager';

/**
 * Check session status
 * GET /api/session/check
 */
export async function GET() {
  try {
    const status = await SessionManager.getStatus();

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
