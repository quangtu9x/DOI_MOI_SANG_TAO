import { requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectStepExecutionNotification,
  ISearchProjectStepExecutionNotificationRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'ProjectStepExecutionNotifications';

/**
 * Tìm kiếm danh sách thông báo
 */
export const searchProjectStepExecutionNotifications = async (
  request: ISearchProjectStepExecutionNotificationRequest
): Promise<IPaginationResponse<IProjectStepExecutionNotification[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectStepExecutionNotification[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết thông báo theo ID
 */
export const getProjectStepExecutionNotificationById = async (
  id: string
): Promise<IProjectStepExecutionNotification> => {
  const response = await requestGET<IResult<IProjectStepExecutionNotification>>(
    `${ENDPOINT}/${id}`
  );
  return response.data!.data!;
};

/**
 * Đánh dấu thông báo đã đọc
 */
export const markNotificationAsRead = async (id: string): Promise<string> => {
  const response = await requestPUT<IResult<string>>(
    `${ENDPOINT}/${id}/mark-as-read`,
    {}
  );
  return response.data!.data!;
};
