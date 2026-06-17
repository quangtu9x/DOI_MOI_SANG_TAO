import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectOperationMaintenance,
  ISearchProjectOperationMaintenanceRequest,
  ICreateProjectOperationMaintenanceRequest,
  IUpdateProjectOperationMaintenanceRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectoperationmaintenances';

export const searchProjectOperationMaintenances = async (
  request: ISearchProjectOperationMaintenanceRequest
): Promise<IPaginationResponse<IProjectOperationMaintenance[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectOperationMaintenance[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

export const getProjectOperationMaintenanceById = async (
  id: string
): Promise<IProjectOperationMaintenance | null> => {
  const response = await requestGET<IResult<IProjectOperationMaintenance>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

export const getProjectOperationMaintenancesByProjectId = async (
  projectId: string
): Promise<IProjectOperationMaintenance[]> => {
  const response = await requestGET<IResult<IProjectOperationMaintenance[]>>(
    `projects/${projectId}/operation-maintenances`
  );
  return response.data?.data || [];
};

export const createProjectOperationMaintenance = async (
  request: ICreateProjectOperationMaintenanceRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

export const updateProjectOperationMaintenance = async (
  id: string,
  request: IUpdateProjectOperationMaintenanceRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

export const deleteProjectOperationMaintenance = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};
