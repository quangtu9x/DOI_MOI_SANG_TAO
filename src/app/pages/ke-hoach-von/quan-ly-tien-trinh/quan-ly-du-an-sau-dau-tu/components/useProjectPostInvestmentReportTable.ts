import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectPostInvestmentReport,
  ISearchProjectPostInvestmentReportRequest,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { RootState } from '@/redux/RootReducer';
import { searchProjectPostInvestmentReports } from '@/services/projectPostInvestmentReport.service';

interface UseProjectPostInvestmentReportTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useProjectPostInvestmentReportTable = ({
  searchData,
  initialPageSize = 50,
}: UseProjectPostInvestmentReportTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectPostInvestmentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const request: ISearchProjectPostInvestmentReportRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: (searchData?.keyword as string) || undefined,
        projectId: (searchData?.projectId as string) || undefined,
        type: searchData?.type as any,
        reportDateFrom: searchData?.reportDateFrom as string,
        reportDateTo: searchData?.reportDateTo as string,
      };

      const response: IPaginationResponse<IProjectPostInvestmentReport[]> =
        await searchProjectPostInvestmentReports(request);

      if (response) {
        const { data: responseData, totalCount: total } = response;
        setData(responseData ?? []);
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching post investment reports:', error);
      toast.error('Không thể tải danh sách báo cáo sau đầu tư. Vui lòng thử lại!');
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

