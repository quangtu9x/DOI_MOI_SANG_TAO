import { dashboardSlice, callTypes } from './Slice';
import { AppDispatch } from '../Store'; // Giả sử bạn có định nghĩa kiểu `AppDispatch` trong store
import { IOrganizationUnit } from '@/models';
import { Dayjs } from 'dayjs';

const { actions } = dashboardSlice;

export const setSelectedOrganizationUnit = (data: IOrganizationUnit | null) => (dispatch: AppDispatch) => {
  dispatch(actions.setSelectedOrganizationUnit(data));
};

export const setLoaiThoiGian = (data: string) => (dispatch: AppDispatch) => {
  dispatch(actions.setLoaiThoiGian(data));
};

export const setThoiGian = (data: Dayjs | null) => (dispatch: AppDispatch) => {
  dispatch(actions.setThoiGian(data));
};
export const setThoiGianFrom = (data: Dayjs | null) => (dispatch: AppDispatch) => {
  dispatch(actions.setThoiGianFrom(data));
};
export const setThoiGianTo = (data: Dayjs | null) => (dispatch: AppDispatch) => {
  dispatch(actions.setThoiGianTo(data));
};
