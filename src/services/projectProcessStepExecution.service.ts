import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectProcessStepExecution,
  ISearchProjectProcessStepExecutionRequest,
  ICreateProjectProcessStepExecutionRequest,
  IUpdateProjectProcessStepExecutionRequest,
  IAssignStepExecutionRequest,
  IGetMyAssignedStepExecutionsRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectprocessstepexecutions';

/**
 * Tìm kiếm danh sách thực hiện bước quy trình
 */
export const searchProjectProcessStepExecutions = async (
  request: ISearchProjectProcessStepExecutionRequest
): Promise<IPaginationResponse<IProjectProcessStepExecution[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectProcessStepExecution[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết thực hiện bước quy trình theo ID
 */
export const getProjectProcessStepExecutionById = async (
  id: string
): Promise<IProjectProcessStepExecution | null> => {
  const response = await requestGET<IResult<IProjectProcessStepExecution>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Tạo mới thực hiện bước quy trình
 * Response mới trả về DTO đầy đủ bao gồm documents
 */
export const createProjectProcessStepExecution = async (
  request: ICreateProjectProcessStepExecutionRequest
): Promise<IProjectProcessStepExecution | null> => {
  const response = await requestPOST<IResult<IProjectProcessStepExecution>>(ENDPOINT, request);
  return response.data?.data || null;
};

/**
 * Cập nhật thực hiện bước quy trình
 * Response mới trả về DTO đầy đủ bao gồm documents
 */
export const updateProjectProcessStepExecution = async (
  id: string,
  request: IUpdateProjectProcessStepExecutionRequest
): Promise<IProjectProcessStepExecution | null> => {
  const response = await requestPUT<IResult<IProjectProcessStepExecution>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

/**
 * Xóa thực hiện bước quy trình
 */
export const deleteProjectProcessStepExecution = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Phân công cán bộ phụ trách bước thực hiện
 */
export const assignProjectProcessStepExecution = async (
  id: string,
  request: IAssignStepExecutionRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(`${ENDPOINT}/${id}/assign`, request);
  return response.data?.data || null;
};

/**
 * Danh sách bước được giao cho người dùng hiện tại
 */
export const getMyAssignedStepExecutions = async (
  request: IGetMyAssignedStepExecutionsRequest
): Promise<IPaginationResponse<IProjectProcessStepExecution[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectProcessStepExecution[]>>(
    `${ENDPOINT}/my-assigned`,
    request
  );
  return response.data!;
};
