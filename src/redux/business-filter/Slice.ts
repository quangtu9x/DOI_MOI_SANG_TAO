import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBusiness } from '@/models';

export interface BusinessState {
  currentBusiness: IBusiness | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BusinessState = {
  currentBusiness: null,
  isLoading: false,
  error: null,
};

export const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setCurrentBusiness: (state, action: PayloadAction<IBusiness | null>) => {
      state.currentBusiness = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearBusiness: (state) => {
      state.currentBusiness = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setCurrentBusiness, setLoading, setError, clearBusiness } = businessSlice.actions;
export default businessSlice.reducer;