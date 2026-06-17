import { UploadFile } from 'antd/es/upload/interface';

export interface TDUploadFile extends UploadFile {
  name: string;
  type: string;
  url: string;
  size: number;
  path?: string | null;
  thumbUrl?: string; // For preview in Ant Design Upload
  status?: 'uploading' | 'done' | 'error' | 'removed';
  response?: any; // For upload response data
  percent?: number; // Upload progress percentage
}
