import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addNotification, setWsConnected } from '@/redux/slices/notificationSlice';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { theme } from '@/config/theme';

/**
 * Custom hook to manage the WebSocket connection for real-time notifications.
 * Handles auto-reconnect with exponential backoff.
 */
export const useNotificationSocket = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [activePopup, setActivePopup] = useState<any>(null); // Use any or Notification based on your type
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

          // Display in center modal if visible
          if (document.visibilityState === 'visible') {
            setActivePopup(notification);
            
            // Auto dismiss after 6 seconds
            setTimeout(() => {
              setActivePopup((current: any) => current?.id === notification.id ? null : current);
            }, 6000);
          } else if ('Notification' in window && Notification.permission === 'granted') {
            // Trigger a native OS desktop notification if the user is on another tab/app
            const osTitle = notification.from ? `${notification.from.name} sent you a notification` : notification.title;
            const osBody = notification.from ? `${notification.title}\n\n${notification.message}` : notification.message;
            new Notification(osTitle, {
              body: osBody,
            });
          }
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
    // Request desktop notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }

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

  const RealtimeNotificationModal = () => {
    if (!activePopup) return null;

    let IconComponent = Info;
    let iconColor: string = theme.accent;

    switch (activePopup.type) {
      case 'success':
        IconComponent = CheckCircle2;
        iconColor = theme.success;
        break;
      case 'warning':
        IconComponent = AlertTriangle;
        iconColor = '#f59e0b';
        break;
      case 'error':
        IconComponent = AlertCircle;
        iconColor = theme.destructive;
        break;
    }

    return (
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setActivePopup(null)}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (activePopup.link) {
              navigate(activePopup.link);
            }
            setActivePopup(null);
          }}
          className="w-[90%] sm:w-[450px] text-left flex items-start gap-4 p-6 rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.2)] border border-white/60 bg-white/95 backdrop-blur-xl relative animate-in zoom-in-95 duration-300 hover:bg-white transition-colors cursor-pointer"
        >
          <div className="size-14 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100 bg-white">
            <IconComponent className="size-7" style={{ color: iconColor }} />
          </div>
          <div className="flex-1 min-w-0 pr-6 mt-1">
            {activePopup.from && (
              <span className="text-xs font-bold uppercase tracking-wider mb-1 block text-slate-500">
                From {activePopup.from.name}
              </span>
            )}
            <p className="text-lg font-bold leading-tight mb-2 text-slate-800">
              {activePopup.title}
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              {activePopup.message}
            </p>
          </div>
          <div 
            onClick={(e) => {
              e.stopPropagation(); // prevent card click
              setActivePopup(null);
            }}
            className="absolute top-5 right-5 p-2 rounded-full transition-all opacity-40 hover:opacity-100 hover:bg-slate-100 cursor-pointer"
          >
            <X className="size-5 text-slate-500" />
          </div>
        </button>
      </div>
    );
  };

  return { RealtimeNotificationModal };
};
