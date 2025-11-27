// src/hooks/useSeatLockWebSocket.ts
import { useEffect, useRef } from "react";
import { websocketService } from "@/services/websocket/websocketService";
import type { SeatLockResponse } from "@/types/showtime/seatlock.type";

interface UseSeatLockWebSocketProps {
  showtimeId: string | null;
  onSeatLockUpdate: (data: SeatLockResponse) => void;
  enabled?: boolean;
}

export const useSeatLockWebSocket = ({
  showtimeId,
  onSeatLockUpdate,
  enabled = true,
}: UseSeatLockWebSocketProps) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isConnectingRef = useRef(false);
  const callbackRef = useRef(onSeatLockUpdate);

  // Update callback ref without triggering reconnect
  useEffect(() => {
    callbackRef.current = onSeatLockUpdate;
  }, [onSeatLockUpdate]);

  useEffect(() => {
    if (!enabled || !showtimeId || isConnectingRef.current) return;

    const connectAndSubscribe = async () => {
      try {
        isConnectingRef.current = true;

        // Connect if not already connected
        if (!websocketService.isConnected()) {
          console.log("🔌 [Hook] Connecting WebSocket...");
          await websocketService.connect(showtimeId);
        }

        // Subscribe with stable callback
        unsubscribeRef.current = websocketService.subscribeSeatLock(
          showtimeId,
          (data) => callbackRef.current(data)
        );

        console.log("📡 [Hook] Subscribed to showtime:", showtimeId);
      } catch (err) {
        console.warn("⚠️ [Hook] WebSocket connection failed:", err);
      } finally {
        isConnectingRef.current = false;
      }
    };

    connectAndSubscribe();

    return () => {
      // Unsubscribe on cleanup
      if (unsubscribeRef.current) {
        console.log("📡 [Hook] Unsubscribing...");
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [showtimeId, enabled]);

  return {
    isConnected: websocketService.isConnected(),
  };
};
