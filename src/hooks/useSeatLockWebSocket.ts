import { useEffect, useRef, useCallback } from "react";
import { websocketService } from "@/services/websocket/websocketService";
import type { SeatLockResponse } from "@/types/showtime/seatlock.type";

interface UseSeatLockWebSocketProps {
  showtimeId: string | null;
  onSeatLockUpdate: (data: SeatLockResponse) => void;
  enabled?: boolean;
}

/**
 * Hook to manage WebSocket connection for seat lock updates
 */
export const useSeatLockWebSocket = ({
  showtimeId,
  onSeatLockUpdate,
  enabled = true,
}: UseSeatLockWebSocketProps) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isConnectingRef = useRef(false);

  const connect = useCallback(async () => {
    if (!showtimeId || !enabled || isConnectingRef.current) return;

    try {
      isConnectingRef.current = true;

      // Connect to WebSocket with showtimeId
      await websocketService.connect(showtimeId);

      // Subscribe to seat lock updates
      unsubscribeRef.current = websocketService.subscribeSeatLock(
        showtimeId,
        onSeatLockUpdate
      );
    } catch (error) {
      console.warn(
        "⚠️ WebSocket connection failed (backend may not be running):",
        error
      );
      // Don't throw error, just log warning
    } finally {
      isConnectingRef.current = false;
    }
  }, [showtimeId, onSeatLockUpdate, enabled]);

  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    // Disconnect WebSocket completely
    websocketService.disconnect();
  }, []);

  // Connect when showtimeId changes
  useEffect(() => {
    if (showtimeId && enabled) {
      connect();
    }

    // Cleanup on unmount or when showtimeId changes
    return () => {
      disconnect();
    };
  }, [showtimeId, enabled, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: websocketService.isConnected(),
  };
};
