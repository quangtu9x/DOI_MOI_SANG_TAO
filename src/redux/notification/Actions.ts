// redux/notification/Actions.ts - Notification Redux actions
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setDatabaseNotifications,
  appendDatabaseNotifications,
  setLoadingNotifications,
  setUnreadCount,
  setPagination,
  updateNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} from './Slice';
import { IPaginationResponse } from '@/models';
import { SearchData, DatabaseNotification } from '@/types';
import { requestGET, requestPOST, requestDELETE } from '@/utils/baseAPI';

// Load notifications
export const loadNotifications = createAsyncThunk(
  'notification/loadNotifications',
  async (params: SearchData & { pageNumber?: number; pageSize?: number; isRead?: boolean } = {}, { dispatch }) => {
    try {
      dispatch(setLoadingNotifications(true));
      
      const queryParams = new URLSearchParams();
      if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
      if (params.isRead !== undefined) queryParams.append('IsRead', params.isRead.toString());
      if (params.keyword) queryParams.append('Keyword', params.keyword);

      const url = `notifications?${queryParams.toString()}`;
      const response = await requestGET<IPaginationResponse<DatabaseNotification[]>>(url);

      if (response.status === 200 && response.data) {
        dispatch(setDatabaseNotifications(response.data.data));
        dispatch(setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          hasNextPage: response.data.hasNextPage,
        }));
        return response.data;
      } else {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      throw error;
    } finally {
      dispatch(setLoadingNotifications(false));
    }
  }
);

// Load more notifications (for pagination)
export const loadMoreNotifications = createAsyncThunk(
  'notification/loadMoreNotifications',
  async (params: SearchData & { pageSize?: number; isRead?: boolean } = {}, { dispatch, getState }) => {
    try {
      const state = getState() as any;
      const nextPage = state.notification.currentPage + 1;
      
      const queryParams = new URLSearchParams();
      queryParams.append('PageNumber', nextPage.toString());
      if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
      if (params.isRead !== undefined) queryParams.append('IsRead', params.isRead.toString());
      if (params.keyword) queryParams.append('Keyword', params.keyword);

      const url = `notifications?${queryParams.toString()}`;
      const response = await requestGET<IPaginationResponse<DatabaseNotification[]>>(url);

      if (response.status === 200 && response.data) {
        dispatch(appendDatabaseNotifications(response.data.data));
        dispatch(setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          hasNextPage: response.data.hasNextPage,
        }));
        return response.data;
      } else {
        throw new Error(`Failed to load more notifications: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading more notifications:', error);
      throw error;
    }
  }
);

// Refresh unread count
export const refreshUnreadCount = createAsyncThunk(
  'notification/refreshUnreadCount',
  async (_, { dispatch }) => {
    try {
      const response = await requestGET<{ count: number }>('notifications/unread-count');
      if (response.status === 200 && response.data) {
        const count = response.data.count || 0;
        dispatch(setUnreadCount(count));
        return count;
      } else {
        throw new Error(`Failed to get unread count: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error refreshing unread count:', error);
      throw error;
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string, { dispatch }) => {
    try {
      const response = await requestPOST(`notifications/${notificationId}/mark-read`, {});
      if (response.status === 200) {
        dispatch(updateNotificationAsRead(notificationId));
      } else {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { dispatch }) => {
    try {
      const response = await requestPOST('notifications/mark-all-read', {});
      if (response.status === 200) {
        dispatch(markAllNotificationsAsRead());
      } else {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId: string, { dispatch }) => {
    try {
      const response = await requestDELETE(`notifications/${notificationId}`);
      if (response.status === 200) {
        dispatch(removeNotification(notificationId));
      } else {
        throw new Error(`Failed to delete notification: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
);

// Search notifications
export const searchNotifications = createAsyncThunk(
  'notification/searchNotifications',
  async (keyword: string, { dispatch }) => {
    return dispatch(loadNotifications({ keyword }));
  }
);

// Filter by read status
export const filterByReadStatus = createAsyncThunk(
  'notification/filterByReadStatus',
  async (isRead: boolean | undefined, { dispatch }) => {
    return dispatch(loadNotifications({ isRead }));
  }
);
