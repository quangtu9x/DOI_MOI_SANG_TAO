import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IWardCommune,
  ISearchWardCommuneRequest,
  ICreateWardCommuneRequest,
  IUpdateWardCommuneRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'WardCommunes';

/**
 * Tìm kiếm danh sách phường xã
 */
export const searchWards = async (
  request: ISearchWardCommuneRequest
): Promise<IPaginationResponse<IWardCommune[]>> => {
  const response = await requestPOST<IPaginationResponse<IWardCommune[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết phường xã theo ID
 */
export const getWardById = async (id: string): Promise<IWardCommune> => {
  const response = await requestGET<IResult<IWardCommune>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới phường xã
 */
export const createWard = async (
  request: ICreateWardCommuneRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật phường xã
 */
export const updateWard = async (
  id: string,
  request: IUpdateWardCommuneRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa phường xã
 */
export const deleteWard = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
