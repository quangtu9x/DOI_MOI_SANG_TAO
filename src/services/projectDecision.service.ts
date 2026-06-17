import { requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectDecision,
  ISearchProjectDecisionRequest,
  ICreateProjectDecisionRequest,
  IUpdateProjectDecisionRequest,
  IAttachFileToProjectDecisionRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectdecisions';

/**
 * Tìm kiếm danh sách quyết định
 */
export const searchProjectDecisions = async (
  request: ISearchProjectDecisionRequest
): Promise<IPaginationResponse<IProjectDecision[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectDecision[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết quyết định theo ID
 */
export const getProjectDecisionById = async (id: string): Promise<IProjectDecision | null> => {
  const response = await requestGET<IResult<IProjectDecision>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Lấy danh sách quyết định theo Project ID
 */
export const getProjectDecisionsByProjectId = async (
  projectId: string
): Promise<IProjectDecision[]> => {
  const response = await requestGET<IResult<IProjectDecision[]>>(
    `projects/${projectId}/decisions`
  );
  return response.data?.data || [];
};

/**
 * Tạo mới quyết định
 */
export const createProjectDecision = async (
  request: ICreateProjectDecisionRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

/**
 * Cập nhật quyết định
 */
export const updateProjectDecision = async (
  id: string,
  request: IUpdateProjectDecisionRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

/**
 * Xóa quyết định
 */
export const deleteProjectDecision = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Đính kèm file cho quyết định
 */
export const attachFileToProjectDecision = async (
  id: string,
  file: File
): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await requestUploadFile<IResult<string>>(
    `${ENDPOINT}/${id}/attach-file`,
    formData
  );
  return response.data?.data || null;
};
