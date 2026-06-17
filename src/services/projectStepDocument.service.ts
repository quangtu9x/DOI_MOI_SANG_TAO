import { requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectStepDocument,
  ISearchProjectStepDocumentRequest,
  ICreateProjectStepDocumentRequest,
  IUpdateProjectStepDocumentRequest,
  IAttachFileToProjectStepDocumentRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectstepdocuments';

/**
 * Tìm kiếm danh sách thành phần hồ sơ
 */
export const searchProjectStepDocuments = async (
  request: ISearchProjectStepDocumentRequest
): Promise<IPaginationResponse<IProjectStepDocument[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectStepDocument[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết thành phần hồ sơ theo ID
 */
export const getProjectStepDocumentById = async (
  id: string
): Promise<IProjectStepDocument | null> => {
  const response = await requestGET<IResult<IProjectStepDocument>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Tạo mới thành phần hồ sơ
 */
export const createProjectStepDocument = async (
  request: ICreateProjectStepDocumentRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

/**
 * Cập nhật thành phần hồ sơ
 */
export const updateProjectStepDocument = async (
  id: string,
  request: IUpdateProjectStepDocumentRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

/**
 * Xóa thành phần hồ sơ
 */
export const deleteProjectStepDocument = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

/**
 * Đính kèm file cho thành phần hồ sơ
 */
export const attachFileToProjectStepDocument = async (
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
