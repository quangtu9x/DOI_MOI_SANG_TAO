import { organizationUnitSlice, callTypes, ModalState } from './Slice';
import { AppDispatch } from '../Store'; // Giả sử bạn có định nghĩa kiểu `AppDispatch` trong store
import { IOrganizationUnit } from '@/models';

const { actions } = organizationUnitSlice;

export const setModalVisible = (data: ModalState) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisible(data));
};

export const setSelectedOrganizationUnit = (data: IOrganizationUnit | null) => (dispatch: AppDispatch) => {
  dispatch(actions.setSelectedOrganizationUnit(data));
};

//#region User Actions
export const setUserDataModal = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setUserDataModal(data));
};

export const setAddUserModalVisible = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setAddUserModalVisible(data));
};

export const setSelectUsersModalVisible = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setSelectUsersModalVisible(data));
};
//#endregion

export const resetData = () => (dispatch: AppDispatch) => {
  dispatch(actions.resetData());
};
