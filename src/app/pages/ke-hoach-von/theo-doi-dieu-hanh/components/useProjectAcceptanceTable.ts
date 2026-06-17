import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import { IProject, ISearchProjectRequest, ProjectStatus, ProjectPhase } from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';
import { searchProjects } from '@/services/project.service';

interface UseDataTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useProjectAcceptanceTable = ({ searchData, initialPageSize = 50 }: UseDataTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchProjectRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        code: searchData?.code as string,
        projectTypeId: searchData?.projectTypeId as string,
        projectGroupId: searchData?.projectGroupId as string,
        investorId: searchData?.investorId as string,
        organizationUnitId: searchData?.organizationUnitId as string,
        contractorId: searchData?.contractorId as string,
        // Cố định filter: status = 3 (Testing - Giai đoạn nghiệm thu hoàn thành) và currentPhase = 2 (Completion)
        status: 3 as ProjectStatus,
        currentPhase: ProjectPhase.Completion,
      };

      const response = await searchProjects(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;
        setData(responseData ?? []);
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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
