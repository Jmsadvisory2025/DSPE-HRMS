import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { notificationActions } from '@/redux/actions';
import {
  setNotifications,
  setUnreadCount,
  setLoading,
  markAsRead,
  markAllAsRead,
} from '@/redux/slices/notificationSlice';
import {
  Bell,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { theme } from '@/config/theme';
import type { Notification } from '@/types/notification.types';

/** Returns a human-friendly relative time string */
const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

/** Icon for notification type */
const TypeIcon = ({ type }: { type: Notification['type'] }) => {
  const iconProps = { className: 'size-4 shrink-0' };
  switch (type) {
    case 'success':
      return <CheckCircle2 {...iconProps} style={{ color: theme.success }} />;
    case 'warning':
      return <AlertTriangle {...iconProps} style={{ color: '#f59e0b' }} />;
    case 'error':
      return <AlertCircle {...iconProps} style={{ color: theme.destructive }} />;
    default:
      return <Info {...iconProps} style={{ color: theme.accent }} />;
  }
};

const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, wsConnected } = useAppSelector(
    (state) => state.notifications
  );
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Fetch initial notifications on mount
  useEffect(() => {
    dispatch({
      type: notificationActions.FETCH_NOTIFICATIONS,
      method: 'GET',
      endPoint: '/api/v1/notifications/?limit=20',
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: any) => {
        const results = data.results || data || [];
        dispatch(setNotifications(results));
        const unread = results.filter((n: Notification) => !n.is_read).length;
        dispatch(setUnreadCount(unread));
      },
      getError: (err: any) => console.error('Failed to fetch notifications:', err),
    });
  }, [dispatch]);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllRead = () => {
    dispatch({
      type: notificationActions.MARK_ALL_NOTIFICATIONS_READ,
      method: 'POST',
      endPoint: '/api/v1/notifications/mark-all-read/',
      auth: true,
      getResponse: () => dispatch(markAllAsRead()),
      getError: (err: any) => console.error('Failed to mark all read:', err),
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      dispatch({
        type: notificationActions.MARK_NOTIFICATIONS_READ,
        method: 'PATCH',
        endPoint: '/api/v1/notifications/mark-read/',
        auth: true,
        body: { ids: [notification.id], is_read: true },
        getResponse: () => dispatch(markAsRead([notification.id])),
        getError: (err: any) => console.error('Failed to mark read:', err),
      });
    }

    // Navigate if link is present
    if (notification.link) {
      setOpen(false);
      // If it's an internal link, use navigate; otherwise open external
      if (notification.link.startsWith('/')) {
        navigate(notification.link);
      } else {
        window.open(notification.link, '_blank');
      }
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center size-10 rounded-full transition-all duration-200"
        style={{
          background: open ? theme.surface : 'transparent',
          border: `1px solid ${open ? theme.border : 'transparent'}`,
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = theme.surfaceHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <Bell className="size-5" style={{ color: theme.textSecondary }} />
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold animate-in zoom-in-50 duration-200"
            style={{
              background: theme.destructive,
              color: '#fff',
              boxShadow: `0 0 0 2px ${theme.background}`,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[380px] rounded-xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            background: theme.surface,
            borderColor: theme.borderStrong,
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: theme.border, background: theme.surfaceMuted }}
          >
            <div className="flex items-center gap-2">
              <h3
                className="text-sm font-bold"
                style={{ color: theme.textPrimary }}
              >
                Notifications
              </h3>
              {/* WS Status Indicator */}
              <div className="flex items-center gap-1" title={wsConnected ? 'Live connection active' : 'Reconnecting...'}>
                {wsConnected ? (
                  <Wifi className="size-3" style={{ color: theme.success }} />
                ) : (
                  <WifiOff className="size-3" style={{ color: theme.textMuted }} />
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors"
                style={{ color: theme.accent }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = theme.accent + '12')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <CheckCheck className="size-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className="size-6 animate-spin"
                  style={{ color: theme.accent }}
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div
                  className="size-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: theme.surfaceMuted }}
                >
                  <Bell
                    className="size-7 opacity-40"
                    style={{ color: theme.textMuted }}
                  />
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: theme.textPrimary }}
                >
                  No notifications yet
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.textMuted }}
                >
                  We'll notify you when something important happens.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 border-b transition-colors"
                  style={{
                    borderColor: theme.border + '50',
                    background: notification.is_read
                      ? 'transparent'
                      : theme.accent + '06',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = theme.surfaceHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notification.is_read
                      ? 'transparent'
                      : theme.accent + '06')
                  }
                >
                  {/* Type Icon */}
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: theme.surfaceMuted }}
                  >
                    <TypeIcon type={notification.type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm leading-tight ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}
                        style={{ color: theme.textPrimary }}
                      >
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div
                          className="size-2 rounded-full shrink-0 mt-1.5"
                          style={{ background: theme.accent }}
                        />
                      )}
                    </div>
                    <p
                      className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
                      style={{ color: theme.textSecondary }}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: theme.textMuted }}
                      >
                        {timeAgo(notification.created_at)}
                      </span>
                      {notification.link && (
                        <ExternalLink
                          className="size-3"
                          style={{ color: theme.textMuted }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-2.5 border-t text-center"
              style={{ borderColor: theme.border, background: theme.surfaceMuted }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
                className="text-xs font-semibold transition-colors"
                style={{ color: theme.accent }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = '0.8')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = '1')
                }
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
