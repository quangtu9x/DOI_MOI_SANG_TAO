import { globalSlice, callTypes } from './Slice';
import { AppDispatch } from '../Store'; // Giả sử bạn có định nghĩa kiểu `AppDispatch` trong store
// import { IAppSetting, ICourseOffline } from '@/utils/models';

const { actions } = globalSlice;

export const setRandom = () => (dispatch: AppDispatch) => {
  dispatch(actions.setRandom());
};

export const setLoginModalVisible = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setLoginModalVisible(data));
};
