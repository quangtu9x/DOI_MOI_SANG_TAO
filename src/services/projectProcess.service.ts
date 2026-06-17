import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectProcess,
  ISearchProjectProcessRequest,
  ICreateProjectProcessRequest,
  IUpdateProjectProcessRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectprocesses';

/**
 * Tìm kiếm danh sách quy trình
 */
export const searchProjectProcesses = async (
  request: ISearchProjectProcessRequest
): Promise<IPaginationResponse<IProjectProcess[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectProcess[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết quy trình theo ID
 */
export const getProjectProcessById = async (id: string): Promise<IProjectProcess | null> => {
  const response = await requestGET<IResult<IProjectProcess>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Tạo mới quy trình
 */
export const createProjectProcess = async (
  request: ICreateProjectProcessRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

/**
 * Cập nhật quy trình
 */
export const updateProjectProcess = async (
  id: string,
  request: IUpdateProjectProcessRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

/**
 * Xóa quy trình
 */
export const deleteProjectProcess = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};
