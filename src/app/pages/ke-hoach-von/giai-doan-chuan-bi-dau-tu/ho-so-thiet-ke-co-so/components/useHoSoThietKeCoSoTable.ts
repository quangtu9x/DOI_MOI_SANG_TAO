import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { IPaginationResponse } from '@/models/response';
import {
  IProjectProcessStepExecution,
  ISearchProjectProcessStepExecutionRequest,
  StepType,
  ProjectPhase,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';
import { searchProjectProcessStepExecutions } from '@/services/projectProcessStepExecution.service';
import { searchProjectProcessSteps } from '@/services/projectProcessStep.service';
import { requestPOST } from '@/utils/baseAPI';

interface UseHoSoThietKeCoSoTableProps {
  searchData?: SearchData;
  projectProcessExecutionId?: string;
  initialPageSize?: number;
}

export const useHoSoThietKeCoSoTable = ({
  searchData,
  projectProcessExecutionId,
  initialPageSize = 50,
}: UseHoSoThietKeCoSoTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IProjectProcessStepExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const searchRequest: ISearchProjectProcessStepExecutionRequest = {
        pageNumber: currentPage,
        pageSize,
        keyword: searchData?.keyword as string,
        projectProcessExecutionId: projectProcessExecutionId || (searchData?.projectProcessExecutionId as string),
        stepTypes: [StepType.BasicDesignPreparation, StepType.BasicDesignAppraisal], // Filter theo hồ sơ thiết kế cơ sở (Lập hồ sơ và Thẩm định)
        phase: ProjectPhase.Preparation,         // Filter theo giai đoạn chuẩn bị đầu tư
        ...searchData,
      };

      const response = await searchProjectProcessStepExecutions(searchRequest);

      if (response) {
        const { data: responseData, totalCount: total } = response;

        // Enrich data với step name và user name
        if (responseData && responseData.length > 0) {
          const uniqueStepIds = [...new Set(responseData.map((item) => item.projectProcessStepId).filter(Boolean))];
          const uniqueUserIds = [...new Set(responseData.map((item) => item.assignedUserId).filter(Boolean))];
          let stepMap = new Map<string, { name?: string; code?: string }>();
          if (uniqueStepIds.length > 0) {
            try {
              const stepRes = await searchProjectProcessSteps({
                pageNumber: 1,
                pageSize: 10000,
                stepTypes: [StepType.BasicDesignPreparation, StepType.BasicDesignAppraisal],
              });
              stepRes.data?.forEach((step) => {
                if (step.id) {
                  stepMap.set(step.id, {
                    name: step.name,
                    code: step.code,
                  });
                }
              });
            } catch (error) {
              console.error('[useHoSoThietKeCoSoTable] Error fetching steps:', error);
            }
          }

          // Fetch tất cả Users một lần
          let userMap = new Map<string, { fullName?: string; userName?: string }>();
          if (uniqueUserIds.length > 0) {
            try {
              const userRes = await requestPOST<IPaginationResponse<any[]>>(
                'users/search',
                {
                  pageNumber: 1,
                  pageSize: 10000,
                },
                'neutral'
              );
              userRes.data?.data?.forEach((user) => {
                if (user.id) {
                  userMap.set(user.id, {
                    fullName: user.fullName,
                    userName: user.userName,
                  });
                }
              });
            } catch (error) {
              console.error('[useHoSoThietKeCoSoTable] Error fetching users:', error);
            }
          }

          // Enrich data với step name và user name
          const enrichedData = responseData.map((item) => {
            const enrichedItem = { ...item };
            
            // Enrich step name
            if (item.projectProcessStepId) {
              const step = stepMap.get(item.projectProcessStepId);
              if (step) {
                enrichedItem.projectProcessStepName = step.name;
                enrichedItem.projectProcessStepCode = step.code;
              } else {
                console.warn(`[useHoSoThietKeCoSoTable] Step not found for ID: ${item.projectProcessStepId}`);
              }
            }
            
            // Enrich user name
            if (item.assignedUserId) {
              const user = userMap.get(item.assignedUserId);
              if (user) {
                enrichedItem.assignedUserFullName = user.fullName;
                enrichedItem.assignedUserName = user.userName;
              } else {
                console.warn(`[useHoSoThietKeCoSoTable] User not found for ID: ${item.assignedUserId}`);
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
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchData, projectProcessExecutionId]);

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
