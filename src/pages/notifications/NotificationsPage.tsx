import React, { useEffect, useState } from 'react';
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
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { theme } from '@/config/theme';
import type { Notification } from '@/types/notification.types';

const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const typeIconMap: Record<
  Notification['type'],
  { icon: React.ElementType; color: string; bg: string }
> = {
  info: { icon: Info, color: theme.accent, bg: theme.accent + '12' },
  success: { icon: CheckCircle2, color: theme.success, bg: theme.success + '12' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: '#f59e0b12' },
  error: { icon: AlertCircle, color: theme.destructive, bg: theme.destructive + '12' },
};

const NotificationsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notifications
  );
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    dispatch({
      type: notificationActions.FETCH_NOTIFICATIONS,
      method: 'GET',
      endPoint: '/api/v1/notifications/',
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
    if (notification.link) {
      if (notification.link.startsWith('/')) {
        navigate(notification.link);
      } else {
        window.open(notification.link, '_blank');
      }
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Notifications
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            Stay up to date with everything happening in your workspace.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={handleMarkAllRead}
            style={{ color: theme.accent, borderColor: theme.accent + '40' }}
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-lg mb-6 w-fit"
        style={{ background: theme.surfaceMuted }}
      >
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-200"
            style={{
              background: filter === tab ? theme.surface : 'transparent',
              color:
                filter === tab ? theme.textPrimary : theme.textMuted,
              boxShadow:
                filter === tab
                  ? '0 1px 3px rgba(0,0,0,0.08)'
                  : 'none',
            }}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: theme.destructive,
                  color: '#fff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ background: theme.surface, borderColor: theme.border }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="size-8 animate-spin"
              style={{ color: theme.accent }}
            />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div
              className="size-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: theme.surfaceMuted }}
            >
              {filter === 'unread' ? (
                <Filter
                  className="size-8 opacity-40"
                  style={{ color: theme.textMuted }}
                />
              ) : (
                <Bell
                  className="size-8 opacity-40"
                  style={{ color: theme.textMuted }}
                />
              )}
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: theme.textPrimary }}
            >
              {filter === 'unread'
                ? 'All caught up!'
                : 'No notifications yet'}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              {filter === 'unread'
                ? "You've read all your notifications."
                : "We'll notify you when something important happens."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const typeInfo = typeIconMap[notification.type] || typeIconMap.info;
            const IconComponent = typeInfo.icon;

            return (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="w-full text-left flex items-start gap-4 px-5 py-4 transition-colors"
                style={{
                  background: notification.is_read
                    ? 'transparent'
                    : theme.accent + '04',
                  borderBottom:
                    index < filteredNotifications.length - 1
                      ? `1px solid ${theme.border}50`
                      : 'none',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = theme.surfaceHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = notification.is_read
                    ? 'transparent'
                    : theme.accent + '04')
                }
              >
                {/* Type Icon */}
                <div
                  className="size-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: typeInfo.bg }}
                >
                  <IconComponent
                    className="size-5"
                    style={{ color: typeInfo.color }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`text-sm leading-tight ${!notification.is_read ? 'font-bold' : 'font-medium'}`}
                        style={{ color: theme.textPrimary }}
                      >
                        {notification.title}
                      </p>
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: theme.textSecondary }}
                      >
                        {notification.message}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div
                        className="size-2.5 rounded-full shrink-0 mt-1"
                        style={{ background: theme.accent }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: theme.textMuted }}
                    >
                      {timeAgo(notification.created_at)}
                    </span>
                    {notification.link && (
                      <span
                        className="flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: theme.accent }}
                      >
                        <ExternalLink className="size-3" />
                        View
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
