import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session/session-manager';

/**
 * Consume one scan credit
 * POST /api/session/consume
 */
export async function POST() {
  try {
    const updatedSession = await SessionManager.consumeScan();

    if (!updatedSession) {
      return NextResponse.json(
        { success: false, error: 'No scans remaining' },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      scansRemaining: updatedSession.scansRemaining,
    });
  } catch (error) {
    console.error('Error consuming scan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to consume scan' },
      { status: 500 }
    );
  }
}
