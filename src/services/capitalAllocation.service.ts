import { requestGET, requestPOST, requestPUT, requestDELETE, HOST_API } from '@/utils/baseAPI';
import { getAuth } from '@/app/modules/auth/core/AuthHelpers';
import axios, { AxiosResponse } from 'axios';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  ICapitalAllocation,
  ISearchCapitalAllocationRequest,
  ICreateCapitalAllocationRequest,
  IUpdateCapitalAllocationRequest,
} from '@/models/ke-hoach-von';
import { saveBlobAsFile } from '@/utils/utils';

const ENDPOINT = 'capitalallocations';

/**
 * Tìm kiếm danh sách phân bổ vốn
 */
export const searchCapitalAllocations = async (
  request: ISearchCapitalAllocationRequest
): Promise<IPaginationResponse<ICapitalAllocation[]>> => {
  const response = await requestPOST<IPaginationResponse<ICapitalAllocation[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết phân bổ vốn theo ID
 */
export const getCapitalAllocationById = async (id: string): Promise<ICapitalAllocation> => {
  const response = await requestGET<IResult<ICapitalAllocation>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới phân bổ vốn
 */
export const createCapitalAllocation = async (
  request: ICreateCapitalAllocationRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật phân bổ vốn
 */
export const updateCapitalAllocation = async (
  id: string,
  request: IUpdateCapitalAllocationRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa phân bổ vốn
 */
export const deleteCapitalAllocation = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};

/**
 * Export Excel danh sách phân bổ vốn
 */
export const exportCapitalAllocationsExcel = async (annualCapitalPlanId?: string): Promise<void> => {
  const token = getAuth()?.token;
  const url = annualCapitalPlanId
    ? `${HOST_API}${ENDPOINT}/export?annualCapitalPlanId=${annualCapitalPlanId}`
    : `${HOST_API}${ENDPOINT}/export`;

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
