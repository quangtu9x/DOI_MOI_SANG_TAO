import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProvinceCity,
  ISearchProvinceCityRequest,
  ICreateProvinceCityRequest,
  IUpdateProvinceCityRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'ProvinceCities';

/**
 * Tìm kiếm danh sách tỉnh thành phố
 */
export const searchProvinces = async (
  request: ISearchProvinceCityRequest
): Promise<IPaginationResponse<IProvinceCity[]>> => {
  const response = await requestPOST<IPaginationResponse<IProvinceCity[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết tỉnh thành phố theo ID
 */
export const getProvinceById = async (id: string): Promise<IProvinceCity> => {
  const response = await requestGET<IResult<IProvinceCity>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới tỉnh thành phố
 */
export const createProvince = async (
  request: ICreateProvinceCityRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật tỉnh thành phố
 */
export const updateProvince = async (
  id: string,
  request: IUpdateProvinceCityRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa tỉnh thành phố
 */
export const deleteProvince = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
