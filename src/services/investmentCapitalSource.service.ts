import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IInvestmentCapitalSource,
  ISearchInvestmentCapitalSourceRequest,
  ICreateInvestmentCapitalSourceRequest,
  IUpdateInvestmentCapitalSourceRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'InvestmentCapitalSources';

/**
 * Tìm kiếm danh sách nguồn vốn đầu tư
 */
export const searchInvestmentCapitalSources = async (
  request: ISearchInvestmentCapitalSourceRequest
): Promise<IPaginationResponse<IInvestmentCapitalSource[]>> => {
  const response = await requestPOST<IPaginationResponse<IInvestmentCapitalSource[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết nguồn vốn đầu tư theo ID
 */
export const getInvestmentCapitalSourceById = async (id: string): Promise<IInvestmentCapitalSource> => {
  const response = await requestGET<IResult<IInvestmentCapitalSource>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới nguồn vốn đầu tư
 */
export const createInvestmentCapitalSource = async (
  request: ICreateInvestmentCapitalSourceRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật nguồn vốn đầu tư
 */
export const updateInvestmentCapitalSource = async (
  id: string,
  request: IUpdateInvestmentCapitalSourceRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa nguồn vốn đầu tư
 */
export const deleteInvestmentCapitalSource = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
