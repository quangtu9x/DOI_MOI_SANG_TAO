import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IResult } from '@/models/response';
import { IProjectDecision, ISearchProjectDecisionRequest, DecisionType } from '@/models';
import { SearchData } from '@/types';
import { RootState } from '@/redux/Store';
import { searchProjectDecisions } from '@/services/projectDecision.service';
import { requestGET } from '@/utils/baseAPI';

interface UseQuyetDinhDauTuDuAnTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useQuyetDinhDauTuDuAnTable = ({
  searchData,
  initialPageSize = 50,
}: UseQuyetDinhDauTuDuAnTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectDecision[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchProjectDecisionRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        type: DecisionType.InvestmentDecision,
        ...searchData,
      };

      const response = await searchProjectDecisions(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;

        if (responseData && responseData.length > 0) {
          const enrichedData = await Promise.all(
            responseData.map(async (item) => {
              const enriched: IProjectDecision = { ...item };

              if (item.projectId) {
                try {
                  const projectResponse = await requestGET<IResult<any>>(
                    `projects/${item.projectId}`
                  );
                  if (projectResponse?.data?.data) {
                    enriched.projectCode = projectResponse.data.data.code;
                    enriched.projectName = projectResponse.data.data.name;
                  }
                } catch (error) {
                  // Silent fail
                }
              }

              return enriched;
            })
          );

          setData(enrichedData);
        } else {
          setData([]);
        }
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching project decisions:', error);
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

