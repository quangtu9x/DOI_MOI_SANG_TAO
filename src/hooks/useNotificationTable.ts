// hooks/useNotificationTable.ts - Custom hook for notification table data management
import { IPaginationResponse } from '@/models';
import { RootState } from '@/redux';
import { AppDispatch } from '@/redux/Store';
import { SearchData, DatabaseNotification } from '@/types';
import { requestGET, requestPOST, requestDELETE, requestPUT } from '@/utils/baseAPI';
import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as actionsGlobal from '@/redux/global/Actions';


interface UseNotificationTableProps {
  searchData?: SearchData & { isRead?: boolean };
  initialPageSize?: number;
}

export const useNotificationTable = ({ searchData, initialPageSize = 5 }: UseNotificationTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Chuẩn bị search params
      const searchParams = {
        pageNumber: currentPage,
        pageSize,
        ...(searchData && Object.keys(searchData).length > 0 ? searchData : {}),
      };
      
      
      const response = await requestPOST<IPaginationResponse<DatabaseNotification[]>>('notifications/search', searchParams);

      if (response.data) {
        const { data: responseData, totalCount: total } = response.data;
        
        // Nếu currentPage > 1, append data thay vì replace
        if (currentPage > 1) {
          setData(prevData => [...prevData, ...(responseData ?? [])]);
        } else {
          setData(responseData ?? []);
        }
        
        setTotalCount(total);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, JSON.stringify(searchData)]); // Fix: serialize searchData


  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await requestPUT(`notifications/read`, {
        id: notificationId,
      });
      if (response.status === 200) {
        // Update local data
        setData(prevData => 
          prevData.map(item => 
            item.id === notificationId ? { ...item, isRead: true } : item
          )
        );
        dispatch(actionsGlobal.setRandom());
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [dispatch]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await requestPOST('notifications/mark-all-read', {});
      if (response.status === 200) {
        // Update local data
        setData(prevData => 
          prevData.map(item => ({ ...item, isRead: true }))
        );
        dispatch(actionsGlobal.setRandom());
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      dispatch(actionsGlobal.setRandom());
    }
  }, [dispatch]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await requestDELETE(`notifications/${notificationId}`);
      if (response.status === 200) {
        // Update local data
        setData(prevData => prevData.filter(item => item.id !== notificationId));
        setTotalCount(prev => prev - 1);
        toast.success('Đã xóa thông báo');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo. Vui lòng thử lại!');
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setData([]); // Reset data khi searchData thay đổi
  }, [JSON.stringify(searchData)]); // Fix: serialize searchData

  useEffect(() => {
    fetchData();
  }, [fetchData, random]);

  // Remove unread count fetching - handled by separate hook

  return {
    data,
    loading,
    totalCount,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    refresh: fetchData,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
