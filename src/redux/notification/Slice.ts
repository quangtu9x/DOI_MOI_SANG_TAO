// redux/notification/Slice.ts - Notification Redux slice
import { BasicNotification, DatabaseNotification, NotificationState } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


const initialState: NotificationState = {
  // Database notifications
  databaseNotifications: [],
  unreadCount: 0,
  isLoadingNotifications: false,

  // Connection status
  isConnected: false,

  // Pagination
  currentPage: 1,
  totalPages: 0,
  hasNextPage: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Database notification actions
    setDatabaseNotifications: (state, action: PayloadAction<DatabaseNotification[]>) => {
      state.databaseNotifications = action.payload;
    },
    appendDatabaseNotifications: (state, action: PayloadAction<DatabaseNotification[]>) => {
      state.databaseNotifications.push(...action.payload);
    },
    updateNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.databaseNotifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.databaseNotifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.databaseNotifications.findIndex(n => n.id === action.payload);
      if (index > -1) {
        const notification = state.databaseNotifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.databaseNotifications.splice(index, 1);
      }
    },

    // Loading and count actions
    setLoadingNotifications: (state, action: PayloadAction<boolean>) => {
      state.isLoadingNotifications = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    // Connection status
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    // Pagination actions
    setPagination: (state, action: PayloadAction<{
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
    }>) => {
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.hasNextPage = action.payload.hasNextPage;
    },
  },
});

export const {
  setDatabaseNotifications,
  appendDatabaseNotifications,
  updateNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  setLoadingNotifications,
  setUnreadCount,
  setConnectionStatus,
  setPagination,
} = notificationSlice.actions;

export default notificationSlice.reducer;
