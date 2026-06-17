import { modalSlice, callTypes } from './Slice';
import { AppDispatch } from '../Store'; // Giả sử bạn có định nghĩa kiểu `AppDispatch` trong store

const { actions } = modalSlice;

export const setModalVisible = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisible(data));
};

export const setDataModal = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModal(data));
};

export const resetData = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.resetData(data));
};

export const setCurrentOrganizationUnit = data => dispatch => {
  dispatch(actions.setCurrentOrganizationUnit(data));
};

export const setModalOrganizationUnit = data => dispatch => {
  dispatch(actions.setModalOrganizationUnit(data));
};

export const setRandom = data => dispatch => {
  dispatch(actions.setRandom(data));
};
export const setRandomUsers = data => dispatch => {
  dispatch(actions.setRandomUsers(data));
};
export const setRandomPopup = () => (dispatch: AppDispatch) => {
  dispatch(actions.setRandomPopup());
};

// thêm các action khác nếu cần
export const setDataModalCapMot = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalCapMot(data));
};

export const setModalVisibleCapMot = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleCapMot(data));
};

export const setDataModalCapHai = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalCapHai(data));
};

export const setModalVisibleCapHai = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleCapHai(data));
};

export const setDataModalCapBa = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalCapBa(data));
};

export const setModalVisibleCapBa = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleCapBa(data));
};

export const setDataModalCapBon = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalCapBon(data));
};

export const setModalVisibleCapBon = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleCapBon(data));
};

export const setConfigModalVisible = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setConfigModalVisible(data));
};

export const setSearchData = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setSearchData(data));
};

export const setColumnConfigModalVisible = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setColumnConfigModalVisible(data));
};

export const setDataModalViewStepExecution = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalViewStepExecution(data));
};

export const setModalVisibleViewStepExecution = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleViewStepExecution(data));
};

export const setDataModalViewDecision = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalViewDecision(data));
};

export const setModalVisibleViewDecision = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleViewDecision(data));
};

export const setDataModalViewDifficulty = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalViewDifficulty(data));
};

export const setModalVisibleViewDifficulty = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleViewDifficulty(data));
};

export const setDataModalViewOperationMaintenance = (data: unknown) => (dispatch: AppDispatch) => {
  dispatch(actions.setDataModalViewOperationMaintenance(data));
};

export const setModalVisibleViewOperationMaintenance = (data: boolean) => (dispatch: AppDispatch) => {
  dispatch(actions.setModalVisibleViewOperationMaintenance(data));
};