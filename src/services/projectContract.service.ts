import { requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectContract,
  ISearchProjectContractRequest,
  ICreateProjectContractRequest,
  IUpdateProjectContractRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectcontracts';

export const searchProjectContracts = async (
  request: ISearchProjectContractRequest
): Promise<IPaginationResponse<IProjectContract[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectContract[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

export const getProjectContractById = async (id: string): Promise<IProjectContract | null> => {
  const response = await requestGET<IResult<IProjectContract>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

export const getProjectContractsByProjectId = async (
  projectId: string
): Promise<IProjectContract[]> => {
  const response = await requestGET<IResult<IProjectContract[]>>(
    `projects/${projectId}/contracts`
  );
  return response.data?.data || [];
};

export const createProjectContract = async (
  request: ICreateProjectContractRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

export const updateProjectContract = async (
  id: string,
  request: IUpdateProjectContractRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

export const deleteProjectContract = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

export const attachFileToProjectContract = async (
  id: string,
  file: File
): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await requestUploadFile<IResult<string>>(
    `${ENDPOINT}/${id}/attach-file`,
    formData
  );
  return response.data?.data || null;
};

