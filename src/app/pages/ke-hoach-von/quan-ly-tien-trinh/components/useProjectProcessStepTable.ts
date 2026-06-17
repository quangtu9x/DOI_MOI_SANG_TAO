import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import { IProjectProcessStep, ISearchProjectProcessStepRequest } from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';
import { searchProjectProcessSteps } from '@/services/projectProcessStep.service';
import { searchProjectProcesses } from '@/services/projectProcess.service';

interface UseProjectProcessStepTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useProjectProcessStepTable = ({
  searchData,
  initialPageSize = 50,
}: UseProjectProcessStepTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectProcessStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchProjectProcessStepRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        ...searchData,
      };

      const response = await searchProjectProcessSteps(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;

        // Fetch thêm thông tin projectProcess để lấy tên
        if (responseData && responseData.length > 0) {
          // Lấy danh sách các projectProcessId duy nhất
          const uniqueProcessIds = [...new Set(responseData.map((item) => item.projectProcessId).filter(Boolean))];

          // Fetch tất cả projectProcesses một lần
          let processMap = new Map();
          if (uniqueProcessIds.length > 0) {
            try {
              const processRes = await searchProjectProcesses({
                pageNumber: 1,
                pageSize: 10000,
              });
              processRes.data?.forEach((process) => {
                processMap.set(process.id, process);
              });
            } catch (error) {
              console.error('Error fetching project processes:', error);
            }
          }

          // Enrich data với projectProcess name
          const enrichedData = responseData.map((item) => {
            const enrichedItem = { ...item };
            if (item.projectProcessId) {
              const process = processMap.get(item.projectProcessId);
              if (process) {
                enrichedItem.projectProcessName = process.name;
                enrichedItem.projectProcessCode = process.code;
              }
            }
            return enrichedItem;
          });

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
      console.error('Error fetching project process steps:', error);
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
