import { requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile, HOST_API } from '@/utils/baseAPI';
import { getAuth } from '@/app/modules/auth/core/AuthHelpers';
import axios, { AxiosResponse } from 'axios';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IAnnualCapitalPlan,
  ISearchAnnualCapitalPlanRequest,
  ICreateAnnualCapitalPlanRequest,
  IUpdateAnnualCapitalPlanRequest,
  IProjectRegistrationsSummary,
} from '@/models/ke-hoach-von';
import { saveBlobAsFile } from '@/utils/utils';

const ENDPOINT = 'annualcapitalplans';

/**
 * Tìm kiếm danh sách kế hoạch vốn hàng năm
 */
export const searchAnnualCapitalPlans = async (
  request: ISearchAnnualCapitalPlanRequest
): Promise<IPaginationResponse<IAnnualCapitalPlan[]>> => {
  const response = await requestPOST<IPaginationResponse<IAnnualCapitalPlan[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết kế hoạch vốn hàng năm theo ID
 */
export const getAnnualCapitalPlanById = async (id: string): Promise<IAnnualCapitalPlan> => {
  const response = await requestGET<IResult<IAnnualCapitalPlan>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới kế hoạch vốn hàng năm
 */
export const createAnnualCapitalPlan = async (
  request: ICreateAnnualCapitalPlanRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật kế hoạch vốn hàng năm
 */
export const updateAnnualCapitalPlan = async (
  id: string,
  request: IUpdateAnnualCapitalPlanRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa kế hoạch vốn hàng năm
 */
export const deleteAnnualCapitalPlan = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};

/**
 * Import danh sách dự án từ Excel
 */
export const importProjectsFromExcel = async (
  planId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<IResult<number>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await requestUploadFile<IResult<number>>(
    `${ENDPOINT}/${planId}/import-projects`,
    formData,
    'private',
    onProgress
  );
  return response.data!;
};

/**
 * Export Excel danh sách đăng ký vốn
 */
export const exportProjectRegistrationsExcel = async (planId: string): Promise<void> => {
  const token = getAuth()?.token;
  const url = `${HOST_API}${ENDPOINT}/${planId}/export-registrations`;

  try {
    const response: AxiosResponse<Blob> = await axios({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });

    saveBlobAsFile(response);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};

/**
 * Lấy tổng hợp thống kê đăng ký vốn
 */
export const getProjectRegistrationsSummary = async (
  planId: string
): Promise<IProjectRegistrationsSummary> => {
  const response = await requestGET<IResult<IProjectRegistrationsSummary>>(
    `${ENDPOINT}/${planId}/registrations-summary`
  );
  return response.data!.data;
};

/**
 * Tải template Excel để import đăng ký vốn
 */
export const downloadImportTemplate = async (): Promise<void> => {
  const token = getAuth()?.token;
  const url = `${HOST_API}${ENDPOINT}/export-registrations-template`;

  try {
    const response: AxiosResponse<Blob> = await axios({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });

    saveBlobAsFile(response);
  } catch (error) {
    console.error('Error downloading template:', error);
    throw error;
  }
};
