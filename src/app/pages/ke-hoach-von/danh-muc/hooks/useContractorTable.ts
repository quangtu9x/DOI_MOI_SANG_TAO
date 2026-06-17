import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse, IResult } from '@/models/response';
import { IContractor, ISearchContractorRequest } from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { RootState } from '@/redux/Store';
import { searchContractors } from '@/services/contractor.service';

interface UseContractorTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useContractorTable = ({ searchData, initialPageSize = 50 }: UseContractorTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IContractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchContractorRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        ...searchData,
      };

      const response = await searchContractors(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;
        setData(responseData ?? []);
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
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
