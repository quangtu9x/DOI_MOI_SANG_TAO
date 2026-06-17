import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IInvestor,
  ISearchInvestorRequest,
  ICreateInvestorRequest,
  IUpdateInvestorRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'Investors';

/**
 * Tìm kiếm danh sách chủ đầu tư
 */
export const searchInvestors = async (
  request: ISearchInvestorRequest
): Promise<IPaginationResponse<IInvestor[]>> => {
  const response = await requestPOST<IPaginationResponse<IInvestor[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết chủ đầu tư theo ID
 */
export const getInvestorById = async (id: string): Promise<IInvestor> => {
  const response = await requestGET<IResult<IInvestor>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới chủ đầu tư
 */
export const createInvestor = async (
  request: ICreateInvestorRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật chủ đầu tư
 */
export const updateInvestor = async (
  id: string,
  request: IUpdateInvestorRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa chủ đầu tư
 */
export const deleteInvestor = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
