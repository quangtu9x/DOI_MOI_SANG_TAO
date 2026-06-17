import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { requestPOST, requestGET } from '@/utils/baseAPI';
import { IPaginationResponse, IProjectUpdateHistory, IResult, IUserDto } from '@/models';
import { SearchData } from '@/types';
import { RootState } from '@/redux/Store';
import { getProjectById } from '@/services/project.service';

interface ProjectUpdateHistoryTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useProjectUpdateHistoryTable = ({ searchData, initialPageSize = 50 }: ProjectUpdateHistoryTableProps) => {
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectUpdateHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await requestPOST<IPaginationResponse<IProjectUpdateHistory[]>>(
        'projectupdatehistories/search',
        {
          pageNumber: currentPage,
          pageSize,
          keyword: searchData?.keyword || undefined,
          projectId: searchData?.projectId || undefined,
          projectProcessStepExecutionId: searchData?.projectProcessStepExecutionId || undefined,
          updateType: searchData?.updateType !== undefined ? Number(searchData.updateType) : undefined,
          updatedByUserId: searchData?.updatedByUserId || undefined,
          updateDateFrom: searchData?.fromDate ? `${searchData.fromDate}T00:00:00` : undefined,
          updateDateTo: searchData?.toDate ? `${searchData.toDate}T23:59:59` : undefined,
          fieldName: searchData?.fieldName || undefined,
        }
      );

      if (response.data) {
        const { data: responseData, totalCount: total } = response.data;
        
        // Lấy danh sách unique projectIds và userIds cần fetch
        const projectIds = new Set<string>();
        const userIds = new Set<string>();
        
        (responseData ?? []).forEach((item) => {
          if (item.projectId && !item.projectName) {
            projectIds.add(item.projectId);
          }
          if (item.updatedByUserId && !item.updatedByUserName) {
            userIds.add(item.updatedByUserId);
          }
        });
        
        // Fetch tất cả projects và users một lần
        const projectMap = new Map<string, { name?: string | null; code?: string | null }>();
        const userMap = new Map<string, { userName?: string | null; fullName?: string | null }>();
        
        await Promise.all([
          ...Array.from(projectIds).map(async (projectId) => {
            try {
              const project = await getProjectById(projectId);
              projectMap.set(projectId, {
                name: project.name,
                code: project.code,
              });
            } catch (error) {
              console.error(`Error loading project ${projectId}:`, error);
            }
          }),
          ...Array.from(userIds).map(async (userId) => {
            try {
              const userResponse = await requestGET<IResult<IUserDto>>(`users/${userId}`);
              if (userResponse.data?.data) {
                const user = userResponse.data.data;
                userMap.set(userId, {
                  userName: user.userName,
                  fullName: user.fullName,
                });
              }
            } catch (error) {
              console.error(`Error loading user ${userId}:`, error);
            }
          }),
        ]);
        
        // Map thông tin vào data
        const enrichedData = (responseData ?? []).map((item) => {
          const enriched: IProjectUpdateHistory = { ...item };
          
          if (item.projectId && !item.projectName) {
            const projectInfo = projectMap.get(item.projectId);
            if (projectInfo) {
              enriched.projectName = projectInfo.name ?? undefined;
              enriched.projectCode = projectInfo.code ?? undefined;
            }
          }
          
          if (item.updatedByUserId && !item.updatedByUserName) {
            const userInfo = userMap.get(item.updatedByUserId);
            if (userInfo) {
              enriched.updatedByUserName = userInfo.userName ?? undefined;
              enriched.updatedByUserFullName = userInfo.fullName ?? undefined;
            }
          }
          
          return enriched;
        });
        
        setData(enrichedData);
        setTotalCount(total);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching project update history:', error);
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
