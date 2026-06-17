import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse, IPermissionItem } from '@/models';
import { RootState } from '@/redux/Store';
import { SearchData } from '@/types';
import { requestPOST } from '@/utils/baseAPI';

interface UseDataTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const usePermissionTable = ({ searchData, initialPageSize = 50 }: UseDataTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IPermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestPOST<IPaginationResponse<IPermissionItem[]>>('Permissions/search', {
        pageNumber: currentPage,
        pageSize,
        ...searchData,
      });

      if (response.data) {
        setData(response.data.data ?? []);
        setTotalCount(response.data.totalCount);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
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
