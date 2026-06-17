import { useState, useCallback, useEffect } from 'react';
import { requestPOST } from '@/utils/baseAPI';
import { toast } from 'react-toastify';
import { IPaginationResponse } from '@/models';
import { IUserOrganizationPositionDto } from '@/models';

interface UseOrganizationUsersProps {
  organizationUnitId: string | null;
  initialPageSize?: number;
}

export const useOrganizationUsers = ({ organizationUnitId, initialPageSize = 10 }: UseOrganizationUsersProps) => {
  const [data, setData] = useState<IUserOrganizationPositionDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!organizationUnitId) {
      setData([]);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await requestPOST<IPaginationResponse<IUserOrganizationPositionDto[]>>(
        'users/search',
        {
          organizationUnitId,
          keyword: searchKeyword || null,
          pageNumber: currentPage,
          pageSize,
        },
        'neutral'
      );

      if (response.data) {
        const { data: responseData, totalCount: total } = response.data;
        setData(responseData ?? []);
        setTotalCount(total);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching organization users:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [organizationUnitId, currentPage, pageSize, searchKeyword]);

  // Reset to first page when search keyword or organization changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, organizationUnitId]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    totalCount,
    loading,
    currentPage,
    pageSize,
    searchKeyword,
    setCurrentPage,
    setPageSize,
    setSearchKeyword,
    refresh,
  };
};
