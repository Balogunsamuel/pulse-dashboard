import { useEffect, useRef, useCallback } from 'react';

interface UseSessionTimeoutOptions {
  timeout?: number; // in milliseconds
  onTimeout: () => void;
  enabled?: boolean;
}

export function useSessionTimeout({
  timeout = 30 * 60 * 1000, // 30 minutes default
  onTimeout,
  enabled = true,
}: UseSessionTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Activity events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Reset timer on any activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [resetTimer, enabled]);

  return { resetTimer };
}
