import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectGroup,
  ISearchProjectGroupRequest,
  ICreateProjectGroupRequest,
  IUpdateProjectGroupRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'ProjectGroups';

/**
 * Tìm kiếm danh sách nhóm dự án
 */
export const searchProjectGroups = async (
  request: ISearchProjectGroupRequest
): Promise<IPaginationResponse<IProjectGroup[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectGroup[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết nhóm dự án theo ID
 */
export const getProjectGroupById = async (id: string): Promise<IProjectGroup> => {
  const response = await requestGET<IResult<IProjectGroup>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới nhóm dự án
 */
export const createProjectGroup = async (
  request: ICreateProjectGroupRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật nhóm dự án
 */
export const updateProjectGroup = async (
  id: string,
  request: IUpdateProjectGroupRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa nhóm dự án
 */
export const deleteProjectGroup = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
