import { requestGET, requestPOST, requestPUT, requestDELETE } from '@/utils/baseAPI';
import { IResult, IPaginationResponse } from '@/models/response';
import {
  IProjectPostInvestmentReport,
  ISearchProjectPostInvestmentReportRequest,
  ICreateProjectPostInvestmentReportRequest,
  IUpdateProjectPostInvestmentReportRequest,
} from '@/models/ke-hoach-von';

const ENDPOINT = 'projectpostinvestmentreports';

export const searchProjectPostInvestmentReports = async (
  request: ISearchProjectPostInvestmentReportRequest
): Promise<IPaginationResponse<IProjectPostInvestmentReport[]>> => {
  const response = await requestPOST<IPaginationResponse<IProjectPostInvestmentReport[]>>(
    `${ENDPOINT}/search`,
    request
  );
  return response.data!;
};

export const getProjectPostInvestmentReportById = async (
  id: string
): Promise<IProjectPostInvestmentReport | null> => {
  const response = await requestGET<IResult<IProjectPostInvestmentReport>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

export const getProjectPostInvestmentReportsByProjectId = async (
  projectId: string
): Promise<IProjectPostInvestmentReport[]> => {
  const response = await requestGET<IResult<IProjectPostInvestmentReport[]>>(
    `projects/${projectId}/post-investment-reports`
  );
  return response.data?.data || [];
};

export const createProjectPostInvestmentReport = async (
  request: ICreateProjectPostInvestmentReportRequest
): Promise<string | null> => {
  const response = await requestPOST<IResult<string>>(ENDPOINT, request);
  return response.data?.data || null;
};

export const updateProjectPostInvestmentReport = async (
  id: string,
  request: IUpdateProjectPostInvestmentReportRequest
): Promise<string | null> => {
  const response = await requestPUT<IResult<string>>(`${ENDPOINT}/${id}`, request);
  return response.data?.data || null;
};

export const deleteProjectPostInvestmentReport = async (id: string): Promise<string | null> => {
  const response = await requestDELETE<IResult<string>>(`${ENDPOINT}/${id}`);
  return response.data?.data || null;
};

