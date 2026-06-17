import { DefaultOptionType } from "antd/es/select";
import { OrganizationUnitType } from "./catalogs";

export interface IAuditTrail {
  id: string | number;
  userId: string;
  fullName?: string;
  imageUrl?: string;
  userName?: string;
  type: string;
  tableName: string;
  dateTime: string;
  oldValues?: string;
  newValues?: string;
  affectedColumns?: string;
  primaryKey?: string;
}


export interface IOrganizationUnit {
  id: string;
  parentId: string | null;
  name: string | null;
  code: string | null;
  fullCode: string | null;
  organizationUnitType: OrganizationUnitType | null;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
  readOnly?: boolean;
}

export interface IUser {
  id: string;
  parentId: string | null;
  name: string | null;
  code: string | null;
  fullCode: string | null;
  organizationUnit: DefaultOptionType | null;
  organizationUnitId: string | null;
  organizationUnitName: string | null;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}


export interface IPosition {
  id: string;
  name: string;
  code: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}