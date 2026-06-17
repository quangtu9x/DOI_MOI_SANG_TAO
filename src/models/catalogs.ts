import { DefaultOptionType } from "antd/es/select";

export enum Gender {
  female,
  male
}

export enum OrganizationUnitType {
  organization,
  department,
  team
}

export enum TemplateFileType {
  word,
  excel
}

export interface TreeNode {
  value: string;
  title: string | null;
  children: TreeNode[];
}

// This file contains the TypeScript interfaces for the Catalogs module.
export interface IAdministrativeUnit {
  id: string;
  name: string;
  code: string;
  parentCode: string | null;
  nameEn: string | null;
  type: string | null;
  level: number;
  path: string | null;
  pathWithType: string | null;
  nameWithType: string | null;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
}

export interface IGeoCoordinate {
  latitude: number | null;
  longitude: number | null;
}




export interface ICategoryGroup {
  id: string;
  readOnly?: boolean;
  name: string;
  code: string;
  description: string | null;
  sortOrder: number | null;
  isSystem: boolean | null;
  isActive: boolean | null;
}

export interface ICategory {
  id: string;
  readOnly?: boolean;
  categoryGroup: DefaultOptionType | null;
  categoryGroupId: string | null;
  categoryGroupCode: string | null;
  categoryGroupName: string | null;
  name: string;
  code: string | null;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}

export interface ILoginLog {
  id: string;
  userName: string;
  fullName: string;
  imageUrl: string;
  userId: string;
  ip: string;
  userAgent: string;
  browserName: string;
  operatingSystem: string;
  type?: string;
  createdOn: string;
}

export enum UserUpdateActionType {
  ProfileUpdated = 'ProfileUpdated',
  PasswordChanged = 'PasswordChanged',
  PermissionsUpdated = 'PermissionsUpdated',
  RolesUpdated = 'RolesUpdated'
}

export interface IUserUpdateLog {
  id: string;
  userId: string;
  userName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  actionType: string;
  description: string | null;
  oldValues: string | null;
  newValues: string | null;
  createdBy: string | null;
  createdByName: string | null;
  createdOn: string;
}

export interface INotificationContent {
  id: string;
  title: string;
  content: string;
  code: string;
  description: string | null;
  attachments: string | null;
  attachmentList: string[];
  sortOrder: number;
  isActive: boolean;
}

export enum ReminderActionEnum {
  Scroll = 0,
  Redirect = 1
}


export interface IReminder {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  sortOrder: number | null;
  days: number | null;
  isActive: boolean | null;
  action: ReminderActionEnum | null;
  dist: string | null;
}

export interface ITemplateFile {
  id: string;
  readOnly?: boolean;
  name: string;
  code: string;
  templateFileTypes: TemplateFileType[] | null;
  extension: string | null;
  description: string | null;
  attachment: string | null;
  isActive: boolean | null;
}


export interface IAppConfig {
  id: string;
  readOnly?: boolean;
  key: string;
  value: string | null;
  description: string | null;
  isActivePortal: boolean | null;
  data: IAppConfig[];
  [key: string]: any;
}

