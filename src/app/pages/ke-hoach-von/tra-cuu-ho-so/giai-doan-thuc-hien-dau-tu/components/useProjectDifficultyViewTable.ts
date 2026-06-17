import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectDifficulty,
  ISearchProjectDifficultyRequest,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { RootState } from '@/redux/Store';
import { searchProjectDifficulties } from '@/services/projectDifficulty.service';

interface UseProjectDifficultyViewTableProps {
  searchData?: SearchData;
  projectId?: string;
  initialPageSize?: number;
}

export const useProjectDifficultyViewTable = ({
  searchData,
  projectId,
  initialPageSize = 50,
}: UseProjectDifficultyViewTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectDifficulty[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const request: ISearchProjectDifficultyRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        projectId: projectId || (searchData?.projectId as string),
        ...searchData,
      };

      const response: IPaginationResponse<IProjectDifficulty[]> =
        await searchProjectDifficulties(request);

      if (response) {
        const { data: responseData, totalCount: total } = response;
        setData(responseData ?? []);
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching project difficulties:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchData, projectId]);

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
