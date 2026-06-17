import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { requestGET, requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IUserUpdateLog } from '@/models';
import { SearchData } from '@/types';
import { RootState } from '@/redux/Store';

interface UserUpdateLogProps {
  searchData?: SearchData;
  userId?: string;
  initialPageSize?: number;
}

export const useUserUpdateLogTable = ({ searchData, userId, initialPageSize = 50 }: UserUpdateLogProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IUserUpdateLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Nếu có filter hoặc không có userId thì dùng POST
      const hasFilters = searchData?.fromDate || searchData?.toDate || searchData?.actionType || !userId;
      
      const response = await requestPOST<IPaginationResponse<IUserUpdateLog[]>>('users/update-logs', {
              pageNumber: currentPage,
              pageSize,
              ...searchData,
            }, 'neutral');


      if (response.data) {
        const { data: responseData, totalCount: total } = response.data;
        setData(responseData ?? []);
        setTotalCount(total);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching user update logs:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchData, userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchData, userId]);

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
