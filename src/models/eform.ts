import { Dayjs } from 'dayjs';

export type EformFieldType = 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'combobox' | 'listbox' | 'textarea';

export interface IEform {
  id: string;
  tieuDe: string;
  logo?: string;
  background?: string;
  isNhapThongTin: boolean;
  isTen: boolean;
  isEmail: boolean;
  isDienThoai: boolean;
  isNamSinh: boolean;
  isDiaChi: boolean;
  isGioiTinh: boolean;
  thoiGianBatDau?: Dayjs;
  thoiGianKetThuc?: Dayjs;
  isCongKhai: boolean;
  isActive: boolean;
  dinhKem?: string;
}

export interface IEformField {
  id?: string;
  eformId?: string;
  eformTieuDe?: string;
  label: string;
  type: EformFieldType;
  required: boolean;
  placeholder?: string;
  options?: string; // JSON string of array for select/combobox/listbox
  defaultValue?: string;
  sortOrder: number;
  isActive?: boolean;
}

export interface IEformFieldOption {
  label: string;
  value: string;
}

export interface IEformFieldRequest {
  id?: string;
  eformId: string;
  label: string;
  type: EformFieldType;
  required: boolean;
  placeholder?: string;
  options?: string;
  defaultValue?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IResultUserEform {
  id: string;
  eformFieldId: string;
  result: string;
  userId: string;
  eformId: string;
}
