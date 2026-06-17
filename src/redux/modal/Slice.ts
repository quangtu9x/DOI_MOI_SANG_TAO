import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface ModalState {
  randomPopUp: string | null;
  dataModal: null;
  modalVisible: boolean;
  listLoading: boolean;
  actionsLoading: boolean;
  error: string | null;
  currentOrganizationUnit: null;
  modalOrganizationUnit: null;
  random: string | null;
  randomUsers: string | null;
  // Thêm các thuộc tính khác nếu cần
  dataModalCapMot: null;
  modalVisibleCapMot: boolean;
  dataModalCapHai: null;
  modalVisibleCapHai: boolean;
  dataModalCapBa: null;
  modalVisibleCapBa: boolean;
  dataModalCapBon: null;
  modalVisibleCapBon: boolean;
  dataModalViewStepExecution: null;
  modalVisibleViewStepExecution: boolean;
  dataModalViewDecision: null;
  modalVisibleViewDecision: boolean;
  dataModalViewDifficulty: null;
  modalVisibleViewDifficulty: boolean;
  dataModalViewOperationMaintenance: null;
  modalVisibleViewOperationMaintenance: boolean;
  configModalVisible: boolean;
  searchData: unknown;
  columnConfigModalVisible: boolean;
}

// Kiểu cho action payload
interface StartCallPayload {
  callType: keyof typeof callTypes;
}

interface CatchErrorPayload extends StartCallPayload {
  error: string;
}

const initialState: ModalState = {
  randomPopUp: null,
  dataModal: null,
  modalVisible: false,
  listLoading: false,
  actionsLoading: false,
  error: null,
  currentOrganizationUnit: null,
  modalOrganizationUnit: null,
  random: null,
  randomUsers: null,
  // Thêm các thuộc tính khác nếu cần
  dataModalCapMot: null,
  modalVisibleCapMot: false,
  dataModalCapHai: null,
  modalVisibleCapHai: false,
  dataModalCapBa: null,
  modalVisibleCapBa: false,
  dataModalCapBon: null,
  modalVisibleCapBon: false,
  dataModalViewStepExecution: null,
  modalVisibleViewStepExecution: false,
  dataModalViewDecision: null,
  modalVisibleViewDecision: false,
  dataModalViewDifficulty: null,
  modalVisibleViewDifficulty: false,
  dataModalViewOperationMaintenance: null,
  modalVisibleViewOperationMaintenance: false,
  configModalVisible: false,
  searchData: undefined,
  columnConfigModalVisible: false,
};
export const callTypes = {
  list: 'list',
  action: 'action',
};

export const modalSlice = createSlice({
  name: 'modal',
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

    setModalVisible: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisible = payload;
      if (!state.modalVisible) {
        state.dataModal = null;
      }
    },


    setDataModal: (state, action) => {
      const payload = action.payload;
      state.dataModal = payload;
    },

    resetData: (state, action) => {
      state = initialState;
    },

    setCurrentOrganizationUnit: (state, action) => {
      const payload = action.payload;
      state.currentOrganizationUnit = payload;
    },

    setModalOrganizationUnit: (state, action) => {
      const payload = action.payload;
      state.modalOrganizationUnit = payload;
      if (!state.modalOrganizationUnit) {
        state.currentOrganizationUnit = null;
      }
    },


    setRandom: (state, action) => {
      state.random = Math.random().toString(32);
    },

    setRandomUsers: (state, action) => {
      state.randomUsers = Math.random().toString(32);
    },
    setRandomPopup: state => {
      state.randomPopUp = Math.random().toString(32);
    },


    setDataModalCapMot: (state, action) => {
      const payload = action.payload;
      state.dataModalCapMot = payload;
    },

    setModalVisibleCapMot: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleCapMot = payload;
      if (!state.modalVisibleCapMot) {
        state.dataModalCapMot = null;
      }
    },

    setDataModalCapHai: (state, action) => {
      const payload = action.payload;
      state.dataModalCapHai = payload;
    },

    setModalVisibleCapHai: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleCapHai = payload;
      if (!state.modalVisibleCapHai) {
        state.dataModalCapHai = null;
      }
    },

    setDataModalCapBa: (state, action) => {
      const payload = action.payload;
      state.dataModalCapBa = payload;
    },

    setModalVisibleCapBa: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleCapBa = payload;
      if (!state.modalVisibleCapBa) {
        state.dataModalCapBa = null;
      }
    },

    setDataModalCapBon: (state, action) => {
      const payload = action.payload;
      state.dataModalCapBon = payload;
    },

    setModalVisibleCapBon: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleCapBon = payload;
      if (!state.modalVisibleCapBon) {
        state.dataModalCapBon = null;
      }
    },

    setConfigModalVisible: (state, action: PayloadAction<boolean>) => {
      state.configModalVisible = action.payload;
    },

    setSearchData: (state, action) => {
      state.searchData = action.payload;
    },

    setColumnConfigModalVisible: (state, action: PayloadAction<boolean>) => {
      state.columnConfigModalVisible = action.payload;
    },

    setDataModalViewStepExecution: (state, action) => {
      const payload = action.payload;
      state.dataModalViewStepExecution = payload;
    },

    setModalVisibleViewStepExecution: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleViewStepExecution = payload;
      if (!state.modalVisibleViewStepExecution) {
        state.dataModalViewStepExecution = null;
      }
    },

    setDataModalViewDecision: (state, action) => {
      const payload = action.payload;
      state.dataModalViewDecision = payload;
    },

    setModalVisibleViewDecision: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleViewDecision = payload;
      if (!state.modalVisibleViewDecision) {
        state.dataModalViewDecision = null;
      }
    },

    setDataModalViewDifficulty: (state, action) => {
      const payload = action.payload;
      state.dataModalViewDifficulty = payload;
    },

    setModalVisibleViewDifficulty: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleViewDifficulty = payload;
      if (!state.modalVisibleViewDifficulty) {
        state.dataModalViewDifficulty = null;
      }
    },

    setDataModalViewOperationMaintenance: (state, action) => {
      const payload = action.payload;
      state.dataModalViewOperationMaintenance = payload;
    },

    setModalVisibleViewOperationMaintenance: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.modalVisibleViewOperationMaintenance = payload;
      if (!state.modalVisibleViewOperationMaintenance) {
        state.dataModalViewOperationMaintenance = null;
      }
    },
  },
});

export const { catchError, startCall, setModalVisible } = modalSlice.actions;
export default modalSlice.reducer;
