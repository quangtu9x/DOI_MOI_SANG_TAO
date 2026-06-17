import { IOrganizationUnit } from '@/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ModalState {
  modalVisible: boolean;
  type: 'edit' | 'createChild' | null;
  modalData: IOrganizationUnit | null;
}

interface OrganizationUnitState {
  selectedOrganizationUnit: IOrganizationUnit | null;
  userDataModal: null;
  addUserModalVisible: boolean,
  selectUsersModalVisible: boolean,
  modalState: ModalState;

  listLoading: boolean;
  actionsLoading: boolean;
  error: string | null;
}

// Kiểu cho action payload
interface StartCallPayload {
  callType: keyof typeof callTypes;
}

interface CatchErrorPayload extends StartCallPayload {
  error: string;
}

const initialState: OrganizationUnitState = {
  selectedOrganizationUnit: null,
  userDataModal: null,
  addUserModalVisible: false,
  selectUsersModalVisible: false,
  modalState: {
    modalVisible: false,
    type: null,
    modalData: null,
  },
  listLoading: false,
  actionsLoading: false,
  error: null,
};
export const callTypes = {
  list: 'list',
  action: 'action',
};

export const organizationUnitSlice = createSlice({
  name: 'organizationUnit',
  initialState: initialState,
  reducers: {
    catchError: (state, action: PayloadAction<CatchErrorPayload>) => {
      state.error = `${action.type}: ${action.payload.error}`;
      if (action.payload.callType === callTypes.list) {
        state.listLoading = false;
      } else {
        state.actionsLoading = false;
      }
    },
    startCall: (state, action: PayloadAction<StartCallPayload>) => {
      state.error = null;
      if (action.payload.callType === callTypes.list) {
        state.listLoading = true;
      } else {
        state.actionsLoading = true;
      }
    },

    setModalVisible: (state, action: PayloadAction<ModalState>) => {
      const payload = action.payload;
      state.modalState.modalVisible = payload.modalVisible;
      state.modalState.type = payload.type;
      state.modalState.modalData = payload.modalData;
      if (!state.modalState.modalVisible) {
        state.modalState.modalData = null;
      }
    },
    setUserDataModal: (state, action) => {
      const payload = action.payload;
      state.userDataModal = payload;
    },
    setAddUserModalVisible: (state, action: PayloadAction<boolean>) => {
      state.addUserModalVisible = action.payload;
      if (!state.addUserModalVisible) {
        state.userDataModal = null;
      }
    },

    setSelectUsersModalVisible: (state, action: PayloadAction<boolean>) => {
      state.selectUsersModalVisible = action.payload;
    },

    setSelectedOrganizationUnit: (state, action: PayloadAction<IOrganizationUnit | null>) => {
      const payload = action.payload;
      state.selectedOrganizationUnit = payload;
    },
    resetData: state => {
      state.selectedOrganizationUnit = null;
      state.userDataModal = null;
      state.selectUsersModalVisible = false;
      state.modalState = {
        modalVisible: false,
        type: null,
        modalData: null,
      };
      state.addUserModalVisible = false;
    },
  },
});

export const { catchError, startCall, setModalVisible, setSelectedOrganizationUnit, resetData } = organizationUnitSlice.actions;
export default organizationUnitSlice.reducer;
