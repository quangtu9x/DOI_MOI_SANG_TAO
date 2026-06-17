import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { getAuth } from '@/app/modules/auth/core/AuthHelpers';

export const API_URL = import.meta.env.VITE_APP_API_URL;

export const HOST_API = `${API_URL}/api/v1/`;
export const HOST_PUBLIC_API = `${API_URL}/api/public/v1/`;
export const HOST_NEUTRAL_API = `${API_URL}/api/`;
export const FILE_URL = `${import.meta.env.VITE_APP_FILE_URL}/`;

// Types
export type HostType = 'private' | 'public' | 'neutral'
type ApiResponse<T = unknown> = {
  data?: T;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
};

// Common headers
const commonHeaders = {
  'Content-Type': 'application/json',
};

interface UploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

const getHostUrl = (hostType: HostType): string => {
  switch (hostType) {
    case 'public':
      return HOST_PUBLIC_API
    case 'neutral':
      return HOST_NEUTRAL_API
    default:
      return HOST_API
  }
}


export const requestApi = async <T = any, D = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: D,
  hostType: HostType = 'private',
): Promise<ApiResponse<T>> => {
  const token = getAuth()?.token
  const baseUrl = getHostUrl(hostType)

  const config: AxiosRequestConfig = {
    method,
    url: `${baseUrl}${endpoint}`,
    headers: {
      ...commonHeaders,
      ...(token && hostType === 'private' ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  if (data) config.data = data

  try {
    const res = await axios<T>(config)
    return {
      data: res.data,
      status: res.status,
      statusText: res.statusText,
    }
  } catch (error) {
    const err = error as AxiosError<T>
    if (err.response) {
      return {
        data: err.response.data,
        status: err.response.status,
        statusText: err.response.statusText,
      }
    }
    return {
      data: null as T,
      status: 500,
      statusText: err.message,
    }
  }
}


// ------------------ Shorthand Helpers ------------------
export const requestGET = <T>(endpoint: string, hostType: HostType = 'private') =>
  requestApi<T>('GET', endpoint, undefined, hostType)

export const requestPOST = <T, D = unknown>(endpoint: string, data: D, hostType: HostType = 'private') =>
  requestApi<T, D>('POST', endpoint, data, hostType)

export const requestPUT = <T, D = unknown>(endpoint: string, data: D, hostType: HostType = 'private') =>
  requestApi<T, D>('PUT', endpoint, data, hostType)

export const requestDELETE = <T>(endpoint: string, hostType: HostType = 'private') =>
  requestApi<T>('DELETE', endpoint, undefined, hostType)


export const requestUploadFile = async <T = UploadResponse>(
  endpoint: string,
  data: FormData,
  hostType: HostType = 'neutral',
  onProgress?: (progress: number) => void,
): Promise<ApiResponse<T>> => {
  const token = getAuth()?.token
  const baseUrl = getHostUrl(hostType)

  try {
    const res = await axios<T>({
      method: 'POST',
      url: `${baseUrl}${endpoint}`,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && hostType === 'private' ? { Authorization: `Bearer ${token}` } : {}),
      },
      data,
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return { data: res.data, status: res.status, statusText: res.statusText }
  } catch (error) {
    const err = error as AxiosError<T>
    if (err.response) {
      return {
        data: err.response.data,
        status: err.response.status,
        statusText: err.response.statusText,
      }
    }
    return { data: null as T, status: 500, statusText: err.message }
  }
}

export const requestDownloadFile = async (
  endpoint: string,
  data: any,
  hostType: HostType = 'private'
) => {
  const token = getAuth()?.token;
  const baseUrl = getHostUrl(hostType);

  try {
    const res = await axios({
      method: 'POST',
      url: `${baseUrl}${endpoint}`,
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        tenant: 'root',
        ...(token && hostType === 'private' ? { Authorization: `Bearer ${token}` } : {}),
      },
      data,
    });
    return res;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
};



