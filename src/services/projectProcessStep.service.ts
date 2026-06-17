import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectProcessStep,
  ISearchProjectProcessStepRequest,
  ICreateProjectProcessStepRequest,
  IUpdateProjectProcessStepRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectprocesssteps';

/**
 * Tìm kiếm danh sách bước quy trình
 */
export const searchProjectProcessSteps = async (
  request: ISearchProjectProcessStepRequest
): Promise<IPaginationResponse<IProjectProcessStep[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectProcessStep[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết bước quy trình theo ID
 */
export const getProjectProcessStepById = async (id: string): Promise<IProjectProcessStep | null> => {
  const response = await requestGET<IResult<IProjectProcessStep>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Tạo mới bước quy trình
 */
export const createProjectProcessStep = async (
  request: ICreateProjectProcessStepRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

/**
 * Cập nhật bước quy trình
 */
export const updateProjectProcessStep = async (
  id: string,
  request: IUpdateProjectProcessStepRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

/**
 * Xóa bước quy trình
 */
export const deleteProjectProcessStep = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};
