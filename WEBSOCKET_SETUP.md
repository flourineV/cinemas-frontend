# WebSocket Setup Guide

## Lỗi WebSocket Connection Failed

Nếu bạn thấy lỗi này trong console:

```
⚠️ WebSocket connection failed (backend may not be running)
```

**Nguyên nhân:**

- Backend WebSocket server chưa chạy
- Gateway chưa route WebSocket đúng
- Port không đúng

## Kiểm tra Backend

### 1. Đảm bảo Gateway đang chạy (port 8099)

```bash
# Check if gateway is running
curl http://localhost:8099/actuator/health
```

### 2. Đảm bảo Showtime Service đang chạy (port 8082)

```bash
# Check if showtime service is running
curl http://localhost:8082/actuator/health
```

### 3. Test WebSocket endpoint

Mở browser console và test:

```javascript
const ws = new WebSocket("ws://localhost:8099/ws/showtime/test-id");
ws.onopen = () => console.log("✅ Connected");
ws.onerror = (e) => console.error("❌ Error:", e);
```

## Cấu hình Backend

### Gateway WebSocket Config

```yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: showtime-websocket
          uri: ws://localhost:8082
          predicates:
            - Path=/ws/showtime/**
```

### Showtime Service WebSocket Handler

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(seatLockWebSocketHandler(), "/ws/showtime/{showtimeId}")
                .setAllowedOrigins("*");
    }
}
```

## Frontend Config

### Environment Variables

```env
# .env
VITE_GATEWAY_URL=http://localhost:8099/api
```

### WebSocket URL

Frontend sẽ tự động connect tới:

```
ws://localhost:8099/ws/showtime/{showtimeId}
```

## Troubleshooting

### Lỗi: Connection refused

- ✅ Check Gateway đang chạy
- ✅ Check port 8099 không bị block
- ✅ Check firewall settings

### Lỗi: 404 Not Found

- ✅ Check Gateway route config
- ✅ Check WebSocket path: `/ws/showtime/{showtimeId}`

### Lỗi: CORS

- ✅ Check `setAllowedOrigins("*")` trong WebSocket config
- ✅ Check Gateway CORS config

### Lỗi: Cannot read properties of undefined

- ✅ Check `localStorage` có `accessToken` và `user`
- ✅ Check guest session được tạo đúng

## Testing

### 1. Test với WebSocketDebug component

```tsx
import WebSocketDebug from "@/components/debug/WebSocketDebug";

// Add to your page temporarily
<WebSocketDebug />;
```

### 2. Test manual trong console

```javascript
// Test connection
const ws = new WebSocket("ws://localhost:8099/ws/showtime/YOUR_SHOWTIME_ID");

ws.onopen = () => {
  console.log("✅ WebSocket connected");
};

ws.onmessage = (event) => {
  console.log("📨 Message:", JSON.parse(event.data));
};

ws.onerror = (error) => {
  console.error("❌ Error:", error);
};

ws.onclose = () => {
  console.log("🔌 WebSocket closed");
};
```

## Notes

- WebSocket connection là **optional** - app vẫn hoạt động nếu WebSocket fail
- Chỉ hiển thị warning trong console, không crash app
- Auto reconnect 5 lần nếu connection bị mất
- Mỗi reconnect cách nhau 3 giây
