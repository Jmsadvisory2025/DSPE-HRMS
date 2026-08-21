import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Notification, NotificationState } from "@/types/notification.types";

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  wsConnected: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action: PayloadAction<string[]>) {
      const ids = new Set(action.payload);
      state.notifications = state.notifications.map((n) =>
        ids.has(n.id) ? { ...n, is_read: true } : n
      );
      state.unreadCount = state.notifications.filter((n) => !n.is_read).length;
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        is_read: true,
      }));
      state.unreadCount = 0;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setWsConnected(state, action: PayloadAction<boolean>) {
      state.wsConnected = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  setUnreadCount,
  setLoading,
  setWsConnected,
} = notificationSlice.actions;
export default notificationSlice.reducer;
