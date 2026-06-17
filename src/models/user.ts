import { DefaultOptionType } from "antd/es/select";
import { Dayjs } from "dayjs";
import { Gender } from "./catalogs";

export interface IUserDetails {
  id: string;
  userName: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  phoneNumber: string | null;
  email: string | null;
  gender: Gender | null;
  dateOfBirth: string | null | Date | Dayjs;
  provinceCode: string | null;
  districtCode: string | null;
  wardCode: string | null;
  address: string | null;
  isActive: boolean;
  isVerified: boolean | null;
  refreshToken: string | null;
  refreshTokenExpiryTime: string;
  objectId: string | null;
  type: UserType | null;
  purpose: UserPurpose | null;
  isSpecial: boolean | null;
  isDev: boolean | null;
  rawPwd: string | null;
  createdOn: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  lastModifiedOn: string | null;
  deletedOn: string | null;
  deletedBy: string | null;
  permissions: string[] | null;
  officeId: string | null;
  positionId: string | null;
  positionName: string | null;
  position: DefaultOptionType | null;
  organizationUnitName: string | null;
  organizationUnitCode: string | null;
}

export enum UserType {
  Admin, // Quản trị hệ thống, lãnh đạo
  Basic, // Chuyên viên, Người NCKH
  Specialist, // Chuyên gia,
  FromPortal
}

export enum UserPurpose {
  NhiemVuKhoaHoc = 1, 
  SangKienKhoaHoc = 2, 
  DuAnCNTT = 3, 
}

export interface IUserDto {
  id: string;
  userName: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  isActive: boolean;
  isVerified: boolean | null;
  type: UserType | null;
  purpose: UserPurpose | null;
  isSpecial: boolean | null;
  isDev: boolean | null;
  createdOn: string | null;
  createdBy: string | null;
  organizationUnitName: string | null;
  positionName: string | null;
  phoneNumber: string | null;
  email: string | null;
}

export interface IUserOrganizationPositionDto {
  id: string;
  userId: string;
  userName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  email: string | null;
  phoneNumber: string | null;
  userCreatedOn: string | null;
  organizationUnitName: string | null;
  positionName: string | null;
  organizationUnitId: string;
  positionId: string;
  isMain: boolean;
  fromDate: string | null;
  toDate: string | null;
  status: UserOrgPositionStatus;
  isActive: boolean;
}

export enum UserOrgPositionStatus {
  Active = 1,
  Inactive = 2,
  Terminated = 3,
}
