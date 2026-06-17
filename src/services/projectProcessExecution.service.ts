import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectProcessExecution,
  ISearchProjectProcessExecutionRequest,
  ICreateProjectProcessExecutionRequest,
  IUpdateProjectProcessExecutionRequest,
  IApplyProjectProcessRequest,
  IInheritProjectProcessRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectprocessexecutions';

/**
 * Tìm kiếm danh sách áp dụng quy trình cho dự án
 */
export const searchProjectProcessExecutions = async (
  request: ISearchProjectProcessExecutionRequest
): Promise<IPaginationResponse<IProjectProcessExecution[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectProcessExecution[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết áp dụng quy trình theo ID
 */
export const getProjectProcessExecutionById = async (
  id: string
): Promise<IProjectProcessExecution | null> => {
  const response = await requestGET<IResult<IProjectProcessExecution>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Tạo mới áp dụng quy trình cho dự án
 */
export const createProjectProcessExecution = async (
  request: ICreateProjectProcessExecutionRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

/**
 * Cập nhật áp dụng quy trình
 */
export const updateProjectProcessExecution = async (
  id: string,
  request: IUpdateProjectProcessExecutionRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

/**
 * Xóa áp dụng quy trình
 */
export const deleteProjectProcessExecution = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Áp dụng quy trình cho dự án (tự động tạo các bước thực hiện)
 */
export const applyProjectProcessExecution = async (
  request: IApplyProjectProcessRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(`${ENDPOINT}/apply`, request);
  return response.data?.data || null;
};

/**
 * Kế thừa quy trình từ dự án nguồn
 */
export const inheritProjectProcessExecution = async (
  request: IInheritProjectProcessRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(`${ENDPOINT}/inherit`, request);
  return response.data?.data || null;
};
