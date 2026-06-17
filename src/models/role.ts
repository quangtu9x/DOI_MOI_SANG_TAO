import { IGroupPermission } from "./Permission";

export interface IRole {
  id: string;
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface IRoleWithPermissionGroup {
  id: string;
  name: string;
  description?: string;
  groups?: IGroupPermission[];
  isUse?: boolean;
}

export interface IUserRole {
  roleId?: string;
  roleName?: string;
  description?: string;
  enabled: boolean;
}
