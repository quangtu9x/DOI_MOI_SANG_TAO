import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectOperationMaintenance,
  ISearchProjectOperationMaintenanceRequest,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';
import { searchProjectOperationMaintenances } from '@/services/projectOperationMaintenance.service';
import { getProjectById } from '@/services/project.service';

interface UseProjectOperationMaintenanceTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useProjectOperationMaintenanceTable = ({
  searchData,
  initialPageSize = 50,
}: UseProjectOperationMaintenanceTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectOperationMaintenance[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchProjectOperationMaintenanceRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        projectId: searchData?.projectId as string,
        type: searchData?.type as any,
        ...searchData,
      };

      const response = await searchProjectOperationMaintenances(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;
        
        // Nếu API không trả về projectName/projectCode, load từ API riêng
        const enrichedData = await Promise.all(
          (responseData ?? []).map(async (item) => {
            // Nếu đã có projectName thì không cần load lại
            if (item.projectName) {
              return item;
            }
            
            // Nếu có projectId nhưng không có projectName, load project info
            if (item.projectId) {
              try {
                const project = await getProjectById(item.projectId);
                return {
                  ...item,
                  projectName: project.name,
                  projectCode: project.code,
                };
              } catch (error) {
                console.error(`Error loading project ${item.projectId}:`, error);
                return item;
              }
            }
            
            return item;
          })
        );
        
        setData(enrichedData);
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching project operation maintenances:', error);
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
