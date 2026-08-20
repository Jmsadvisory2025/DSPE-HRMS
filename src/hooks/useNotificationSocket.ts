import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addNotification, setWsConnected } from '@/redux/slices/notificationSlice';
import { toast } from 'sonner';

/**
 * Custom hook to manage the WebSocket connection for real-time notifications.
 * Handles auto-reconnect with exponential backoff.
 */
export const useNotificationSocket = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isUnmountedRef = useRef(false);

  const MAX_RECONNECT_DELAY = 30000; // 30 seconds cap

  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      1000 * Math.pow(2, reconnectAttemptRef.current),
      MAX_RECONNECT_DELAY
    );
    return delay;
  }, []);

  const connect = useCallback(() => {
    if (!accessToken || isUnmountedRef.current) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsBaseUrl = (import.meta.env.VITE_WS_BASE_URL || '').replace(/\/+$/, '');
    if (!wsBaseUrl) {
      console.warn('[WS] VITE_WS_BASE_URL is not configured.');
      return;
    }

    const url = `${wsBaseUrl}/ws/notifications/?token=${accessToken}`;
    console.log('[WS] Connecting to:', url.replace(/token=.*/, 'token=***'));
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('[WS] Connected to notification server');
      dispatch(setWsConnected(true));
      reconnectAttemptRef.current = 0; // Reset backoff on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] Message received:', data);

        // Backend sends "event" key (per websocket_integration_guide.md)
        const eventType = data.event || data.type;

        if (eventType === 'notification.created' && data.notification) {
          const notification = data.notification;

          // Add to Redux store
          dispatch(addNotification(notification));

          // Show toast
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
          });
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log('[WS] Disconnected:', event.code, event.reason);
      dispatch(setWsConnected(false));
      wsRef.current = null;

      // Auto-reconnect unless intentionally closed or unmounted
      if (!isUnmountedRef.current && event.code !== 1000) {
        const delay = getReconnectDelay();
        reconnectAttemptRef.current += 1;
        console.log(`[WS] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptRef.current})...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      // onclose will fire after this, which handles reconnection
    };

    wsRef.current = ws;
  }, [accessToken, dispatch, getReconnectDelay]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;

      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close connection cleanly
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }

      dispatch(setWsConnected(false));
    };
  }, [connect, dispatch]);
};
