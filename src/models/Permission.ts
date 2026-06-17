export interface IPermissionResponse {
  id: string | null;
  groups?: IGroupPermission[];
  name?: string;
  description?: string;
}

export interface IGroupPermission {
  section: string;
  permissions: IPermission[];
}

export interface IPermission {
  value: string;
  description?: string;
  section?: string;
  active?: boolean;
}

export interface IPermissionItem {
  id: string;
  subSystemCode?: string;
  subSystemName?: string;
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isSystem?: boolean;
}
