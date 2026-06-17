import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  ISearchOrganizationUnitRequest,
  IGetTreeOrganizationUnitRequest,
  ICreateOrganizationUnitRequest,
  IUpdateOrganizationUnitRequest,
} from '@/models/ke-hoach-von';
import { IOrganizationUnit } from '@/models';
import { OrganizationUnitNode } from '@/app/components/OrganizationUnitTreeSelect';

const ENDPOINT = 'OrganizationUnits';

/**
 * Tìm kiếm danh sách cơ quan đơn vị
 */
export const searchOrganizationUnits = async (
  request: ISearchOrganizationUnitRequest
): Promise<IPaginationResponse<IOrganizationUnit[]>> => {
  const response = await requestPOST<IPaginationResponse<IOrganizationUnit[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

export const searchPublicOrganizationUnits = async (
  request: ISearchOrganizationUnitRequest
): Promise<IPaginationResponse<OrganizationUnitNode[]>> => {
  const response = await requestPOST<IPaginationResponse<OrganizationUnitNode[]>>(
    `${ENDPOINT}/search`,
    request,
    'public'
  );
  return response.data!;
};


/**
 * Tìm kiếm dạng cây cơ quan đơn vị
 */
export const getTreeOrganizationUnits = async (
  request: IGetTreeOrganizationUnitRequest
): Promise<IPaginationResponse<IOrganizationUnit[]>> => {
  const response = await requestPOST<IPaginationResponse<IOrganizationUnit[]>>(
    `${ENDPOINT}/gettree/search`,
    request
  );
  return response.data!;
};

/**
 * Lấy chi tiết cơ quan đơn vị theo ID
 */
export const getOrganizationUnitById = async (id: string): Promise<IOrganizationUnit> => {
  const response = await requestGET<IResult<IOrganizationUnit>>(`${ENDPOINT}/${id}`);
  return response.data!.data;
};

/**
 * Tạo mới cơ quan đơn vị
 */
export const createOrganizationUnit = async (
  request: ICreateOrganizationUnitRequest
): Promise<string> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data!.data;
};

/**
 * Cập nhật cơ quan đơn vị
 */
export const updateOrganizationUnit = async (
  id: string,
  request: IUpdateOrganizationUnitRequest
): Promise<void> => {
  await requestPUT<IResult<void>>(`${ENDPOINT}/${id}`, request);
};

/**
 * Xóa cơ quan đơn vị
 */
export const deleteOrganizationUnit = async (id: string): Promise<void> => {
  await requestDELETE<IResult<void>>(`${ENDPOINT}/${id}`);
};
