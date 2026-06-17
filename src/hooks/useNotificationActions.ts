import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../redux/RootReducer';
import { 
  loadNotifications,
  loadMoreNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  refreshUnreadCount,
  searchNotifications,
  filterByReadStatus,
} from '../redux/notification/Actions';
import { setConnectionStatus } from '../redux/notification/Slice';
import { BasicNotification, LabelType } from '../types/notifications';
import { SearchData } from '../types/commons';
import { AppDispatch } from '@/redux/Store';

export interface NotificationActions {
  // Real-time toast actions (using react-toastify)
  showToastNotification: (notification: BasicNotification) => void;

  // Database actions
  loadNotifications: (params?: SearchData & { pageNumber?: number; pageSize?: number; isRead?: boolean }) => Promise<any>;
  loadMoreNotifications: () => Promise<any>;
  markAsRead: (notificationId: string) => Promise<any>;
  markAllAsRead: () => Promise<any>;
  deleteNotification: (notificationId: string) => Promise<any>;
  refreshUnreadCount: () => Promise<any>;

  // Search & filter
  searchNotifications: (keyword: string) => Promise<any>;
  filterByReadStatus: (isRead?: boolean) => Promise<any>;
}

export const useNotificationActions = (): NotificationActions => {
  const dispatch = useDispatch() as any;

  // Use react-toastify for real-time notifications
  const showToastNotificationAction = useCallback((notification: BasicNotification) => {
    const message = notification.message;
    const title = notification.title;
    const displayMessage = title ? `${title}: ${message}` : message;
    
    switch (notification.label) {
      case LabelType.Success:
        toast.success(displayMessage, {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case LabelType.Warning:
        toast.warning(displayMessage, {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case LabelType.Error:
        toast.error(displayMessage, {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case LabelType.Information:
      default:
        toast.info(displayMessage, {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
    }
    
  }, []);

  const loadNotificationsAction = useCallback((params?: SearchData & { pageNumber?: number; pageSize?: number; isRead?: boolean }) => {
    return dispatch(loadNotifications(params || {}));
  }, [dispatch]);

  const loadMoreNotificationsAction = useCallback(() => {
    return dispatch(loadMoreNotifications({}));
  }, [dispatch]);

  const markAsReadAction = useCallback((notificationId: string) => {
    return dispatch(markAsRead(notificationId));
  }, [dispatch]);

  const markAllAsReadAction = useCallback(() => {
    return dispatch(markAllAsRead());
  }, [dispatch]);

  const deleteNotificationAction = useCallback((notificationId: string) => {
    return dispatch(deleteNotification(notificationId));
  }, [dispatch]);

  const refreshUnreadCountAction = useCallback(() => {
    return dispatch(refreshUnreadCount());
  }, [dispatch]);

  const searchNotificationsAction = useCallback((keyword: string) => {
    return dispatch(searchNotifications(keyword));
  }, [dispatch]);

  const filterByReadStatusAction = useCallback((isRead?: boolean) => {
    return dispatch(filterByReadStatus(isRead));
  }, [dispatch]);

  return {
    showToastNotification: showToastNotificationAction,
    loadNotifications: loadNotificationsAction,
    loadMoreNotifications: loadMoreNotificationsAction,
    markAsRead: markAsReadAction,
    markAllAsRead: markAllAsReadAction,
    deleteNotification: deleteNotificationAction,
    refreshUnreadCount: refreshUnreadCountAction,
    searchNotifications: searchNotificationsAction,
    filterByReadStatus: filterByReadStatusAction,
  };
};

export const useNotificationState = () => {
  return useSelector((state: RootState) => state.notification);
};

export const useNotificationConnection = () => {
  const dispatch: AppDispatch = useDispatch();
  
  const setConnectionStatusAction = useCallback((connected: boolean) => {
    dispatch(setConnectionStatus(connected));
  }, [dispatch]);

  return {
    setConnectionStatus: setConnectionStatusAction,
  };
};
