import { useState, useCallback, useEffect } from 'react';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux';
import { IPaginationResponse } from '@/models';
import { DatabaseNotification } from '@/types';

export const useNotificationCount = () => {
  const random = useSelector((state: RootState) => state.global.random);
  
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestPOST<IPaginationResponse<DatabaseNotification[]>>('notifications/search', {
              pageNumber: 1,
              pageSize: 1,
              isRead: false,  // Chỉ lấy thông báo chưa đọc
            });
      if (response.data) {
        setUnreadCount(response.data.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  }, [random]);

  const updateUnreadCount = useCallback((delta: number) => {
    setUnreadCount(prev => Math.max(0, prev + delta));
  }, [random]);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, random]);

  return {
    unreadCount,
    loading,
    updateUnreadCount,
    resetUnreadCount,
    refetch: fetchUnreadCount
  };
};
