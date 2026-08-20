# WebSocket Integration Guide for Notifications

This guide explains how WebSockets work conceptually, what the backend is currently handling in your project, and exactly what needs to be implemented on the frontend side to get real-time notifications working.

## 1. How WebSockets Work (The Basics)

WebSockets provide a continuous, bidirectional communication channel between the client (frontend) and the server (backend) over a single TCP connection. 

Unlike standard HTTP where the frontend has to continuously ask the server "Are there any new notifications?" (polling), a WebSocket connection stays open. This allows the backend to instantly **push** data to the frontend the moment an event occurs.

- **Connection Phase**: The frontend initiates a connection via a `ws://` or `wss://` URL.
- **Handshake**: The server authenticates and upgrades the connection from HTTP to WebSocket.
- **Data Exchange**: Both client and server can send JSON messages back and forth in real-time.
- **Disconnection**: Either side can close the connection, or it drops due to network issues (which requires a reconnection strategy).

---

## 2. What is Handled by the Backend (RecruitOS)

Based on your current setup (`notifications/consumers.py` and `notifications/routing.py`), the backend is already configured to do the following:

### Endpoints and Routing
- **URL Route**: The WebSocket endpoint is exposed at `ws://<your-backend-domain>/ws/notifications/`.

### Authentication and Grouping
- **Authentication**: When a connection is attempted, the backend checks `self.scope.get('user')`. If the user is authenticated, it accepts the connection. If not, it drops it. 
  > [!IMPORTANT]
  > Because browser WebSockets don't allow setting custom headers (like `Authorization: Bearer <token>`), your backend middleware is likely expecting the authentication token to be passed as a query parameter (e.g., `?token=<your_jwt_token>`) or read from cookies.
- **Rooms/Groups**: Once authenticated, the backend automatically adds the user to a unique private channel group named `user_<user_id>`. This ensures they only receive their own notifications.

### Message Format
- When a notification is generated on the server, it sends a JSON payload to the frontend. The structure sent from the backend looks exactly like this:
```json
{
  "event": "notification.created",
  "notification": {
    "id": 1,
    "title": "New Application",
    "message": "John Doe applied for Python Developer",
    "is_read": false,
    "created_at": "2026-08-20T10:00:00Z"
  }
}
```

---

## 3. What Needs to be Implemented on the Frontend

The frontend needs to establish the connection, listen for messages, and update the UI (e.g., showing a toast notification and updating the notification bell counter).

### Step 1: Establish the Connection
You should connect to the WebSocket when the user logs in, and disconnect when they log out.

```javascript
// Example using standard browser WebSocket API
const token = localStorage.getItem('access_token');

// Pass the token as a query parameter (adjust based on your Django Channels auth middleware)
const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;

const socket = new WebSocket(wsUrl);

socket.onopen = () => {
    console.log("Connected to notification websocket");
};
```

### Step 2: Handle Incoming Messages
Listen for the `onmessage` event to receive the payload pushed by the backend.

```javascript
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Check if the event type is the one we expect from the backend
    if (data.event === 'notification.created') {
        const newNotification = data.notification;
        
        // 1. Show a toast or popup notification
        showToast(newNotification.title, newNotification.message);
        
        // 2. Update your global state (Redux, Context, or Component State)
        // addNotificationToStore(newNotification);
        // incrementUnreadBadgeCount();
    }
};
```

### Step 3: Handle Reconnection and Errors
WebSockets can drop due to network instability. You need to handle reconnections gracefully.

```javascript
socket.onclose = (event) => {
    console.log("WebSocket disconnected. Reconnecting in 5 seconds...");
    // Implement an exponential backoff or simple timeout reconnection
    setTimeout(() => {
        // call your connection function again
        // connectToWebSocket();
    }, 5000);
};

socket.onerror = (error) => {
    console.error("WebSocket Error:", error);
};
```

### React Implementation Tip

If you are using React, the best practice is to wrap this in a custom hook or a Context Provider at the root of your authenticated app structure so the socket stays alive regardless of page navigation.

```javascript
import { useEffect, useState } from 'react';

export const useNotificationWebSocket = (token) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!token) return;

        const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === 'notification.created') {
                // Prepend the new notification to the list
                setNotifications(prev => [data.notification, ...prev]);
            }
        };

        return () => {
            ws.close(); // Clean up on unmount
        };
    }, [token]);

    return notifications;
};
```

## Summary Checklist for Frontend Developer
- [ ] Construct the WebSocket URL pointing to `/ws/notifications/`.
- [ ] Pass the Authentication Token (via query params `?token=` or ensure auth cookies are sent).
- [ ] Parse `event.data` using `JSON.parse()`.
- [ ] Listen for `data.event === 'notification.created'`.
- [ ] Update the UI state with `data.notification` (update the dropdown list and unread badge count).
- [ ] Add auto-reconnect logic in case the connection drops.
