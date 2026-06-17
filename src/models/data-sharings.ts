import { DefaultOptionType } from "antd/es/select";

export interface ISharingHttpRequest {
  method?: string | null;
  endpoint?: string | null;
  description?: string | null;
}

export interface ISharingParameter {
    name?: string | null;
    type?: string | null;
    required?: boolean | null;
    description?: string | null;
}

export interface IDataSharing {
  id: string;
  dataSharingTypeId?: string | null;
  dataSharingType?: DefaultOptionType | null;
  dataSharingTypeCode?: string | null;
  dataSharingTypeName?: string | null;
  httpRequest?: ISharingHttpRequest | null;
  exampleRequest?: string | null;
  headerParameters?: ISharingParameter[] | null;
  urlParameters?: ISharingParameter[] | null;
  outputDescription?: string | null;
  name: string;
  code: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}

export interface IDataSharingLog {
    id: string
    timestamp: string | null
    method: string | null
    endpoint: string | null
    statusCode: number | null
    responseTime: string | null
    requestBody: string | null
    errorMessage: string | null
}