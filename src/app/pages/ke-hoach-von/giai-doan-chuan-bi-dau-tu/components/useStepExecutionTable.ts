import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectProcessStepExecution,
  ISearchProjectProcessStepExecutionRequest,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';
import { searchProjectProcessStepExecutions } from '@/services/projectProcessStepExecution.service';

interface UseStepExecutionTableProps {
  searchData?: SearchData;
  projectProcessExecutionId?: string;
  initialPageSize?: number;
}

export const useStepExecutionTable = ({
  searchData,
  projectProcessExecutionId,
  initialPageSize = 50,
}: UseStepExecutionTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectProcessStepExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchProjectProcessStepExecutionRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        projectProcessExecutionId: projectProcessExecutionId || (searchData?.projectProcessExecutionId as string),
        ...searchData,
      };

      const response = await searchProjectProcessStepExecutions(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;
        setData(responseData ?? []);
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching step executions:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchData, projectProcessExecutionId]);

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
