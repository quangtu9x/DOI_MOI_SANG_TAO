import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IContractor,
  ISearchContractorRequest,
  ICreateContractorRequest,
  IUpdateContractorRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'Contractors';

/**
 * Tìm kiếm danh sách nhà thầu
 */
export const searchContractors = async (
  request: ISearchContractorRequest
): Promise<IPaginationResponse<IContractor[]>> => {
  const response = await requestPOST<IPaginationResponse<IContractor[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết nhà thầu theo ID
 */
export const getContractorById = async (id: string): Promise<IContractor> => {
  const response = await requestGET<IResult<IContractor>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới nhà thầu
 */
export const createContractor = async (
  request: ICreateContractorRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật nhà thầu
 */
export const updateContractor = async (
  id: string,
  request: IUpdateContractorRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa nhà thầu
 */
export const deleteContractor = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
