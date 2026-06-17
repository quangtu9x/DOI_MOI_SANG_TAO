import { requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectDifficulty,
  ISearchProjectDifficultyRequest,
  ICreateProjectDifficultyRequest,
  IUpdateProjectDifficultyRequest,
  IResolveProjectDifficultyRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectdifficulties';

export const searchProjectDifficulties = async (
  request: ISearchProjectDifficultyRequest
): Promise<IPaginationResponse<IProjectDifficulty[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectDifficulty[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

export const getProjectDifficultyById = async (id: string): Promise<IProjectDifficulty | null> => {
  const response = await requestGET<IResult<IProjectDifficulty>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

export const getProjectDifficultiesByProjectId = async (
  projectId: string
): Promise<IProjectDifficulty[]> => {
  const response = await requestGET<IResult<IProjectDifficulty[]>>(
    `projects/${projectId}/difficulties`
  );
  return response.data?.data || [];
};

export const createProjectDifficulty = async (
  request: ICreateProjectDifficultyRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

export const updateProjectDifficulty = async (
  id: string,
  request: IUpdateProjectDifficultyRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

export const deleteProjectDifficulty = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

export const attachFileToProjectDifficulty = async (
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

export const resolveProjectDifficulty = async (
  request: IResolveProjectDifficultyRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(
    `${ENDPOINT}/${request.id}/resolve`,
    request
  );
  return response.data?.data || null;
};

