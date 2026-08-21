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
      const linkPath = notification.link.startsWith('/') ? notification.link : `/${notification.link}`;
      navigate(linkPath);
    }
  };

  const handleToggleOpen = () => {
    setOpen(!open);
    // Request native OS notification permission on direct user interaction (fixes browser blocking)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={handleToggleOpen}
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
          className="absolute right-0 top-full mt-2 w-[400px] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 bg-white/95 backdrop-blur-xl"
          style={{ zIndex: 100 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/50">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                Notifications
              </h3>
              {/* WS Status Indicator */}
              <div className="flex items-center gap-1" title={wsConnected ? 'Live connection active' : 'Reconnecting...'}>
                {wsConnected ? (
                  <Wifi className="size-3 text-emerald-500" />
                ) : (
                  <WifiOff className="size-3 text-slate-400" />
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <CheckCheck className="size-4" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="px-5 py-2 bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500">
            Today
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="size-14 rounded-full flex items-center justify-center mb-3 bg-slate-50 border border-slate-100">
                  <Bell className="size-7 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  No notifications yet
                </p>
                <p className="text-xs mt-1 text-slate-500">
                  We'll notify you when something important happens.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left flex items-start gap-4 px-5 py-4 border-b border-slate-100 transition-colors ${
                    !notification.is_read ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'bg-transparent hover:bg-slate-50'
                  }`}
                >
                  {/* Type Icon */}
                  <div className="size-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white border border-slate-200 shadow-sm">
                    <TypeIcon type={notification.type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {!notification.is_read && (
                          <div className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <p className={`text-sm leading-tight ${!notification.is_read ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}>
                          {notification.title}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0 mt-0.5">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    {notification.from && (
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-400">
                        From {notification.from.name}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-white/50 text-left">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
