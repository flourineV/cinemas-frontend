import React, { useState } from "react";
import { websocketService } from "@/services/websocket/websocketService";
import type { SeatLockResponse } from "@/types/showtime/seatlock.type";

/**
 * Debug component to test WebSocket connection
 * Usage: Add <WebSocketDebug /> to your page temporarily
 */
const WebSocketDebug: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [showtimeId, setShowtimeId] = useState("");
  const [messages, setMessages] = useState<SeatLockResponse[]>([]);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  const handleConnect = async () => {
    if (!showtimeId) {
      alert("Please enter showtime ID first");
      return;
    }
    try {
      await websocketService.connect(showtimeId);
      setConnected(true);
      console.log("✅ Connected to WebSocket");
    } catch (error) {
      console.error("❌ Failed to connect:", error);
    }
  };

  const handleDisconnect = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
    websocketService.disconnect();
    setConnected(false);
    console.log("🔌 Disconnected from WebSocket");
  };

  const handleSubscribe = () => {
    if (!showtimeId) {
      alert("Please enter showtime ID");
      return;
    }

    const unsub = websocketService.subscribeSeatLock(showtimeId, (data) => {
      console.log("📨 Received message:", data);
      setMessages((prev) => [data, ...prev].slice(0, 10)); // Keep last 10 messages
    });

    setUnsubscribe(() => unsub);
  };

  const handleUnsubscribe = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
      console.log("📡 Unsubscribed");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="text-lg font-bold mb-2">WebSocket Debug</h3>

      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleConnect}
            disabled={connected}
            className="px-3 py-1 bg-green-600 rounded disabled:bg-gray-600"
          >
            Connect
          </button>
          <button
            onClick={handleDisconnect}
            disabled={!connected}
            className="px-3 py-1 bg-red-600 rounded disabled:bg-gray-600"
          >
            Disconnect
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={showtimeId}
            onChange={(e) => setShowtimeId(e.target.value)}
            placeholder="Showtime ID"
            className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubscribe}
            disabled={!connected || !!unsubscribe}
            className="px-3 py-1 bg-blue-600 rounded disabled:bg-gray-600"
          >
            Subscribe
          </button>
          <button
            onClick={handleUnsubscribe}
            disabled={!unsubscribe}
            className="px-3 py-1 bg-orange-600 rounded disabled:bg-gray-600"
          >
            Unsubscribe
          </button>
        </div>

        <div className="text-xs">
          Status:{" "}
          <span className={connected ? "text-green-400" : "text-red-400"}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {messages.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto">
            <div className="text-xs font-bold mb-1">Recent Messages:</div>
            {messages.map((msg, idx) => (
              <div key={idx} className="text-xs bg-gray-700 p-1 rounded mb-1">
                <div>Seat: {msg.seatId.substring(0, 8)}...</div>
                <div>Status: {msg.status}</div>
                <div>TTL: {msg.ttl}s</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketDebug;
