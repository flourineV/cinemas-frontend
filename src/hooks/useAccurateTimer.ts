import { useEffect, useRef, useState, useCallback } from "react";

interface UseAccurateTimerOptions {
  initialTime: number | null;
  onExpired?: () => void;
  enabled?: boolean;
}

export const useAccurateTimer = ({
  initialTime,
  onExpired,
  enabled = true,
}: UseAccurateTimerOptions) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(initialTime);
  const startTimeRef = useRef<number | null>(null);
  const initialTimeRef = useRef<number | null>(initialTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpiredRef = useRef(onExpired);
  const hasExpiredRef = useRef(false);

  // Keep onExpired ref updated
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Update refs when initialTime changes
  useEffect(() => {
    if (initialTime !== null && initialTime !== undefined) {
      setTimeLeft(initialTime);
      initialTimeRef.current = initialTime;
      startTimeRef.current = Date.now();
      hasExpiredRef.current = false;
    }
  }, [initialTime]);

  // Sync time based on actual elapsed time
  const syncTime = useCallback(() => {
    if (startTimeRef.current === null || initialTimeRef.current === null)
      return null;

    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    const remaining = Math.max(0, initialTimeRef.current - elapsed);

    setTimeLeft(remaining);

    if (remaining === 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      if (onExpiredRef.current) {
        onExpiredRef.current();
      }
    }

    return remaining;
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enabled) {
        syncTime();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, syncTime]);

  // Main timer logic - only run once when enabled and initialTime is set
  useEffect(() => {
    if (!enabled || initialTime === null || initialTime <= 0) {
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Set start time
    startTimeRef.current = Date.now();
    initialTimeRef.current = initialTime;
    hasExpiredRef.current = false;

    // Start interval - runs every 1 second
    timerRef.current = setInterval(() => {
      const remaining = syncTime();
      if (remaining === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, initialTime, syncTime]);

  return timeLeft;
};
