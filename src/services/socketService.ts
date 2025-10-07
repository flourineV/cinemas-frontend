import { Client, over } from "stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;
const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL + "/ws";

export const socketService = {
  connect(onConnected?: () => void) {
    if (stompClient && stompClient.connected) {
      console.log("[WebSocket] Already connected");
      onConnected?.();
      return;
    }

    const socket = new SockJS(SOCKET_URL);
    stompClient = over(socket);

    stompClient.connect(
      {},
      () => {
        console.log("[WebSocket] Connected");
        onConnected?.();
      },
      (error) => {
        console.error("[WebSocket] Connection error:", error);
      }
    );
  },

  subscribe(topic: string, onMessage: (msg: any) => void) {
    if (!stompClient) return;
    stompClient.subscribe(topic, (message) => {
      const body = JSON.parse(message.body);
      onMessage(body);
    });
  },

  send(destination: string, payload: any) {
    if (!stompClient || !stompClient.connected) {
      console.warn("[WebSocket] Cannot send, not connected");
      return;
    }
    stompClient.send(destination, {}, JSON.stringify(payload));
  },

  disconnect() {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => console.log("[WebSocket] Disconnected"));
      stompClient = null;
    } else {
      console.warn("[WebSocket] Disconnect called but not connected");
    }
  },
};
