import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectProcessExecution,
  ISearchProjectProcessExecutionRequest,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';
import { searchProjectProcessExecutions } from '@/services/projectProcessExecution.service';
import { searchProjects } from '@/services/project.service';
import { searchProjectProcesses } from '@/services/projectProcess.service';

interface UseProjectProcessExecutionTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useProjectProcessExecutionTable = ({
  searchData,
  initialPageSize = 50,
}: UseProjectProcessExecutionTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectProcessExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchProjectProcessExecutionRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        ...searchData,
      };

      const response = await searchProjectProcessExecutions(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;

        // Fetch thêm thông tin project và projectProcess để lấy tên
        if (responseData && responseData.length > 0) {
          const enrichedData = await Promise.all(
            responseData.map(async (item) => {
              const enrichedItem = { ...item };

              // Fetch project name
              if (item.projectId) {
                try {
                  const projectRes = await searchProjects({
                    pageNumber: 1,
                    pageSize: 10000,
                  });
                  const project = projectRes.data?.find((p) => p.id === item.projectId);
                  if (project) {
                    enrichedItem.projectName = project.name;
                    enrichedItem.projectCode = project.code;
                  }
                } catch (error) {
                  console.error('Error fetching project:', error);
                }
              }

              // Fetch projectProcess name
              if (item.projectProcessId) {
                try {
                  const processRes = await searchProjectProcesses({
                    pageNumber: 1,
                    pageSize: 10000,
                  });
                  const process = processRes.data?.find((p) => p.id === item.projectProcessId);
                  if (process) {
                    enrichedItem.projectProcessName = process.name;
                    enrichedItem.projectProcessCode = process.code;
                  }
                } catch (error) {
                  console.error('Error fetching project process:', error);
                }
              }

              return enrichedItem;
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
      console.error('Error fetching project process executions:', error);
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
