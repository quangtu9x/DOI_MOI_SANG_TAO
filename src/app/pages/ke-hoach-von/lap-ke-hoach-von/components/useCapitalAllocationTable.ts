import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse, IResult } from '@/models/response';
import { ICapitalAllocation, ISearchCapitalAllocationRequest } from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { RootState } from '@/redux/Store';
import { searchCapitalAllocations } from '@/services/capitalAllocation.service';
import { requestGET } from '@/utils/baseAPI';

interface UseCapitalAllocationTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useCapitalAllocationTable = ({ searchData, initialPageSize = 50 }: UseCapitalAllocationTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<ICapitalAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchCapitalAllocationRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        ...searchData,
      };

      const response = await searchCapitalAllocations(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;
        
        // Fetch thêm thông tin tên cho từng record
        if (responseData && responseData.length > 0) {
          const enrichedData = await Promise.all(
            responseData.map(async (item) => {
              const enriched: ICapitalAllocation = { ...item };
              
              // Fetch thông tin kế hoạch vốn nếu có ID
              if (item.annualCapitalPlanId) {
                try {
                  const planResponse = await requestGET<IResult<any>>(
                    `annualcapitalplans/${item.annualCapitalPlanId}`
                  );
                  if (planResponse?.data?.data) {
                    enriched.annualCapitalPlanCode = planResponse.data.data.code;
                    enriched.annualCapitalPlanName = planResponse.data.data.name;
                  }
                } catch (error) {
                  // Silent fail
                }
              }
              
              // Fetch thông tin dự án nếu có ID
              if (item.projectId) {
                try {
                  const projectResponse = await requestGET<IResult<any>>(
                    `projects/${item.projectId}`
                  );
                  if (projectResponse?.data?.data) {
                    enriched.projectCode = projectResponse.data.data.code;
                    enriched.projectName = projectResponse.data.data.name;
                    // Fetch thông tin chủ đầu tư (Investor) nếu có
                    if (projectResponse.data.data.investorId) {
                      try {
                        const investorResponse = await requestGET<IResult<any>>(
                          `investors/${projectResponse.data.data.investorId}`
                        );
                        if (investorResponse?.data?.data) {
                          enriched.projectOwnerName = investorResponse.data.data.name;
                        }
                      } catch (error) {
                        // Silent fail
                      }
                    }
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
