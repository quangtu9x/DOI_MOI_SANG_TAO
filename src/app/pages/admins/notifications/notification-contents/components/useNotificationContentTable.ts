import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, INotificationContent } from '@/models';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';

interface UseNotificationContentTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useNotificationContentTable = ({ searchData, initialPageSize = 50 }: UseNotificationContentTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<INotificationContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestPOST<IPaginationResponse<INotificationContent[]>>('NotificationContents/search', {
        pageNumber: currentPage,
        pageSize,
        ...searchData,
      });

      if (response.data) {
        const { data: responseData, totalCount: total } = response.data;
        setData(responseData ?? []);
        setTotalCount(total);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching notification contents:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, random]);

  return {
    data,
    loading,
    totalCount,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    refresh: fetchData,
  };
};
