import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectDifficulty,
  ISearchProjectDifficultyRequest,
  ResolutionStatus,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { RootState } from '@/redux/RootReducer';
import { searchProjectDifficulties } from '@/services/projectDifficulty.service';

export type ProjectDifficultyMode = 'list' | 'resolve';

interface UseProjectDifficultyTableProps {
  searchData?: SearchData;
  mode?: ProjectDifficultyMode;
  initialPageSize?: number;
}

export const useProjectDifficultyTable = ({
  searchData,
  mode = 'list',
  initialPageSize = 50,
}: UseProjectDifficultyTableProps) => {
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
        projectId: searchData?.projectId as string,
        ...searchData,
      };

      if (mode === 'resolve') {
        request.resolutionStatus = ResolutionStatus.InProgress;
      }

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
      // comment: xử lý lỗi khi tải danh sách khó khăn, vướng mắc
      console.error('Error fetching project difficulties:', error);
      toast.error('Không thể tải danh sách khó khăn, vướng mắc. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchData, mode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchData, mode]);

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

