import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectContract,
  ISearchProjectContractRequest,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { RootState } from '@/redux/RootReducer';
import { searchProjectContracts } from '@/services/projectContract.service';
import { getContractorById } from '@/services/contractor.service';

interface UseProjectContractTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useProjectContractTable = ({
  searchData,
  initialPageSize = 50,
}: UseProjectContractTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const request: ISearchProjectContractRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        projectId: searchData?.projectId as string,
        ...searchData,
      };

      const response: IPaginationResponse<IProjectContract[]> =
        await searchProjectContracts(request);

      if (response) {
        const { data: responseData, totalCount: total } = response;

        if (responseData && responseData.length > 0) {
          const enrichedData = await Promise.all(
            responseData.map(async (item) => {
              if (item.contractorId && (!item.contractorName || !item.contractorCode)) {
                try {
                  const contractor = await getContractorById(item.contractorId);
                  return {
                    ...item,
                    contractorName: contractor?.name ?? item.contractorName,
                    contractorCode: contractor?.code ?? item.contractorCode,
                  };
                } catch (error) {
                  return item;
                }
              }
              return item;
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
      console.error('Error fetching project contracts:', error);
      toast.error('Không thể tải danh sách hợp đồng. Vui lòng thử lại!');
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

