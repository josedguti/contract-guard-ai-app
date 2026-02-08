'use client';

import { useState, useEffect, useCallback } from 'react';
import { SessionStatus } from '@/types/session';

export function useSession() {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/session/check');
      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
      } else {
        setError(data.error || 'Failed to fetch session status');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching session status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/session/init', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        await fetchStatus();
      } else {
        setError(data.error || 'Failed to initialize session');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error initializing session:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refreshStatus: fetchStatus,
    initSession,
  };
}
