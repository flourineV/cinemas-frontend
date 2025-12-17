import { useEffect, useRef, useState } from "react";

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when initialTime changes
  useEffect(() => {
    if (initialTime !== null && initialTime !== undefined) {
      setTimeLeft(initialTime);
      initialTimeRef.current = initialTime;
      startTimeRef.current = Date.now();
    }
  }, [initialTime]);

  // Sync time based on actual elapsed time
  const syncTime = () => {
    if (startTimeRef.current === null || initialTimeRef.current === null)
      return;

    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    const remaining = Math.max(0, initialTimeRef.current - elapsed);

    setTimeLeft(remaining);

    if (remaining === 0 && onExpired) {
      onExpired();
    }

    return remaining;
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enabled) {
        // Tab became visible - sync time
        console.log("🔄 [useAccurateTimer] Tab visible - syncing time");
        syncTime();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  // Main timer logic
  useEffect(() => {
    if (!enabled || timeLeft === null || timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Set start time if not set
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      initialTimeRef.current = timeLeft;
    }

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
  }, [enabled, timeLeft === null]);

  return timeLeft;
};
