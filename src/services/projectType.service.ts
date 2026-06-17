import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectType,
  ISearchProjectTypeRequest,
  ICreateProjectTypeRequest,
  IUpdateProjectTypeRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'ProjectTypes';

/**
 * Tìm kiếm danh sách loại dự án
 */
export const searchProjectTypes = async (
  request: ISearchProjectTypeRequest
): Promise<IPaginationResponse<IProjectType[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectType[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết loại dự án theo ID
 */
export const getProjectTypeById = async (id: string): Promise<IProjectType> => {
  const response = await requestGET<IResult<IProjectType>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới loại dự án
 */
export const createProjectType = async (
  request: ICreateProjectTypeRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật loại dự án
 */
export const updateProjectType = async (
  id: string,
  request: IUpdateProjectTypeRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa loại dự án
 */
export const deleteProjectType = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
