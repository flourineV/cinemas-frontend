// Native WebSocket implementation (no STOMP/SockJS)
const GATEWAY_URL =
  import.meta.env.VITE_GATEWAY_URL || "http://localhost:8099/api";
const WS_BASE_URL = GATEWAY_URL.replace(/^http/, "ws").replace(/\/api$/, "");

export class WebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private currentShowtimeId: string | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(showtimeId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.currentShowtimeId = showtimeId;
        resolve();
        return;
      }

      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
      }

      this.currentShowtimeId = showtimeId;
      const wsUrl = `${WS_BASE_URL}/ws/showtime/${showtimeId}`;
      console.log("🔌 Connecting to WebSocket:", wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected to:", wsUrl);
        console.log("📊 Current subscriptions:", this.subscriptions.size);
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 WebSocket message received:", data);
          console.log("📊 Notifying subscribers for showtime:", showtimeId);
          console.log(
            "📊 Number of callbacks:",
            this.subscriptions.get(showtimeId)?.size || 0
          );
          this.notifySubscribers(showtimeId, data);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        reject(error);
      };

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        this.handleReconnect();
      };
    });
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.currentShowtimeId
    ) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      this.reconnectTimer = setTimeout(() => {
        if (this.currentShowtimeId) {
          this.connect(this.currentShowtimeId).catch((error) => {
            console.error("Failed to reconnect:", error);
          });
        }
      }, this.reconnectDelay);
    } else {
      console.log("❌ Max reconnect attempts reached");
    }
  }

  /**
   * Disconnect from WebSocket server
   * Only disconnect if no more subscribers
   */
  disconnect(): void {
    // Check if there are still active subscribers
    const hasSubscribers = Array.from(this.subscriptions.values()).some(
      (callbacks) => callbacks.size > 0
    );

    if (hasSubscribers) {
      console.log("⚠️ WebSocket has active subscribers, not disconnecting");
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.currentShowtimeId = null;
    this.reconnectAttempts = 0;
    console.log("🔌 WebSocket disconnected");
  }

  /**
   * Subscribe to seat lock updates for a showtime
   */
  subscribeSeatLock(
    showtimeId: string,
    callback: (message: any) => void
  ): () => void {
    if (!this.subscriptions.has(showtimeId)) {
      this.subscriptions.set(showtimeId, new Set());
    }

    this.subscriptions.get(showtimeId)!.add(callback);
    console.log(`📡 Subscribed to showtime ${showtimeId}`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(showtimeId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(showtimeId);
        }
      }
      console.log(`📡 Unsubscribed from showtime ${showtimeId}`);
    };
  }

  /**
   * Notify all subscribers for a showtime
   */
  private notifySubscribers(showtimeId: string, data: any): void {
    const callbacks = this.subscriptions.get(showtimeId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send message through WebSocket
   */
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
