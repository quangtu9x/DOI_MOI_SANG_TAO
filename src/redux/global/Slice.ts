import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GlobalState {
  random: string | null;
  loginModalVisible: boolean;
  forgotPasswordModalVisible: boolean;
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

const initialState: GlobalState = {
  random: null,
  listLoading: false,
  actionsLoading: false,
  loginModalVisible: false,
  forgotPasswordModalVisible: false,
  error: null,
};
export const callTypes = {
  list: 'list',
  action: 'action',
};

export const globalSlice = createSlice({
  name: 'global',
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

    setRandom: state => {
      state.random = Math.random().toString(32);
    },
    setLoginModalVisible: (state, action: PayloadAction<boolean>) => {
      const payload = action.payload;
      state.loginModalVisible = payload;
    },
  },
});

export const { catchError, startCall, setRandom, setLoginModalVisible } = globalSlice.actions;
export default globalSlice.reducer;
