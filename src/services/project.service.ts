import { requestGET, requestPOST, requestPUT, requestDELETE, HOST_API } from '@/utils/baseAPI';
import { getAuth } from '@/app/modules/auth/core/AuthHelpers';
import axios, { AxiosResponse } from 'axios';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProject,
  ISearchProjectRequest,
  ICreateProjectRequest,
  IUpdateProjectRequest,
} from '@/models/ke-hoach-von';
import { saveBlobAsFile } from '@/utils/utils';

const ENDPOINT = 'projects';

/**
 * Tìm kiếm danh sách dự án
 */
export const searchProjects = async (
  request: ISearchProjectRequest
): Promise<IPaginationResponse<IProject[]>> => {
  const response = await requestPOST<IPaginationResponse<IProject[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết dự án theo ID
 */
export const getProjectById = async (id: string): Promise<IProject> => {
  const response = await requestGET<IResult<IProject>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới dự án
 */
export const createProject = async (request: ICreateProjectRequest): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật dự án
 */
export const updateProject = async (id: string, request: IUpdateProjectRequest): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa dự án
 */
export const deleteProject = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};

/**
 * Export Excel danh sách dự án
 */
export const exportProjectsExcel = async (
  request: ISearchProjectRequest,
  selectedColumns?: string[]
): Promise<void> => {
  const token = getAuth()?.token;
  const url = `${HOST_API}${ENDPOINT}/export`;

  try {
    const response: AxiosResponse<Blob> = await axios({
      method: 'POST',
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        ...request,
        selectedColumns,
      },
      responseType: 'blob',
    });

    saveBlobAsFile(response);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};
