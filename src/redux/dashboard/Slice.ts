import { IOrganizationUnit } from '@/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';

interface DashboardState {
  selectedOrganizationUnit: IOrganizationUnit | null;
  loaiThoiGian: string;
  thoiGian: Dayjs | null;
  thoiGianFrom: Dayjs | null;
  thoiGianTo: Dayjs | null;
}

const initialState: DashboardState = {
  selectedOrganizationUnit: null,
  loaiThoiGian: 'nam',
  thoiGian: null,
  thoiGianFrom: dayjs().startOf('year'),
  thoiGianTo: dayjs().endOf('year'),
};
export const callTypes = {
  list: 'list',
  action: 'action',
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: initialState,
  reducers: {
    setSelectedOrganizationUnit: (state, action: PayloadAction<IOrganizationUnit | null>) => {
      const payload = action.payload;
      state.selectedOrganizationUnit = payload;
    },
    setLoaiThoiGian: (state, action: PayloadAction<string>) => {
      const payload = action.payload;
      state.loaiThoiGian = payload;
    },
    setThoiGian: (state, action: PayloadAction<Dayjs | null>) => {
      const payload = action.payload;
      state.thoiGian = payload;
    },
    setThoiGianFrom: (state, action: PayloadAction<Dayjs | null>) => {
      state.thoiGianFrom = action.payload;
    },
    setThoiGianTo: (state, action: PayloadAction<Dayjs | null>) => {
      state.thoiGianTo = action.payload;
    },
  },
});

export const { setSelectedOrganizationUnit, setLoaiThoiGian } = dashboardSlice.actions;
export default dashboardSlice.reducer;
